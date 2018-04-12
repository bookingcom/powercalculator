<template id="svg-graph">
    <div class="pc-block pc-block--graph">
        <div class="pc-graph-controls">

            <svgGraphTabItem
                v-for="graph in graphList"
                v-bind:key="graph.graphX + '-' + graph.graphY"
                v-bind:graphX="graph.graphX"
                v-bind:graphY="graph.graphY"
                v-bind:getMetricDisplayName="getMetricDisplayName"
                v-bind:graphType.sync="graphType"
            >
            </svgGraphTabItem>

        </div>
        <div class="pc-graph" ref="pc-graph-size">
            <div v-bind:style="style" ref="pc-graph-wrapper">
                <div ref="pc-graph"></div>
            </div>
        </div>
    </div>
</template>


<script>
/*global c3*/
/*eslint no-undef: "error"*/

import graphDataMixin from '../js/graph-data-mixin.js'
import svgGraphTabItem from './svg-graph-tab-item.vue'

let dataDefault = [
        ['x', 0, 0, 0, 0, 0, 0],
        ['Sample', 0, 0, 0, 0, 0],
        ['Current', null, null, 50]
    ];

let style = document.createElement('style');

style.innerHTML = `
    .pc-graph .c3-axis-y-label {
        pointer-events: none;
    }

    .pc-graph .c3-axis {
        font-size: 16px;
    }
`;

document.querySelector('head').appendChild(style);



export default {
    mixins: [graphDataMixin],
    props: [],
    data () {
        return {
            width: 100,
            height: 100,
            data:  this.dataDefault,
            graphType: this.getDefaultGraphOption() // x, y
            // graphX: 'sample' // computed
            // graphY: 'power' // computed
        }
    },
    computed: {
        style () {
            let { width, height } = this;

            return {
                width: `${width}px`,
                height: `${height}px`
            }
        },
        graphX () {
            // 'sample'
            return this.graphType.split('-')[0]
        },
        graphY () {
            // 'power'
            return this.graphType.split('-')[1]
        },
        math () {
            return this.$store.getters.formulaToSolveProp
        },
        isNonInferiorityEnabled () {
            return this.$store.state.nonInferiority.enabled
        },
        sample () {
            return this.$store.state.attributes.sample
        },
        impact () {
            return this.$store.state.attributes.impact
        },
        power () {
            return this.$store.state.attributes.power
        },
        base () {
            return this.$store.state.attributes.base
        },
        falsePosRate () {
            return this.$store.state.attributes.falsePosRate
        },
        sdRate () {
            return this.$store.state.attributes.sdRate
        },
        runtime () {
            return this.$store.state.attributes.runtime
        },
        graphList() {

            let list = [
                {
                    name: 'days-incrementalTrialsPerDay',
                    cond: !this.isNonInferiorityEnabled
                },
                {
                    name: 'samplePerDay-incrementalTrials',
                    cond: !this.isNonInferiorityEnabled
                },
                {
                    name: 'sample-impact',
                    cond: !this.isNonInferiorityEnabled
                },
                {
                    name: 'sample-threshold',
                    cond: this.isNonInferiorityEnabled
                },
                {
                    name: 'sample-power',
                    cond: true
                },
                {
                    name: 'samplePerDay-power',
                    cond: true
                },
                {
                    name: 'impact-power',
                    cond: !this.isNonInferiorityEnabled
                },
            ];

            return list.filter((obj) => {return obj.cond == true}).map((obj) => {
                    let [graphX, graphY] = obj.name.split('-');
                    return {
                        graphX,
                        graphY
                    }
                })
        }
    },
    methods: {
        getDefaultGraphOption () {
            let result = 'days-incrementalTrialsPerDay';
            if (this.$store.state.nonInferiority.enabled) {
                result = 'sample-threshold'
            }
            return result
        },
        resize () {
            let {width, paddingLeft, paddingRight} = window.getComputedStyle(this.$refs['pc-graph-size']);

            // update svg size
            this.width = window.parseInt(width) - window.parseInt(paddingLeft) - window.parseInt(paddingRight);
            this.height = 220;
        },
        createYList ({ amount, rate = 10, cur }) { //rate of 10 and amount of 10 will reach from 0 to 100
            let result = [];

            for (let i = 0; i <= amount; i += 1) {
                let y = rate * i,
                    nextY = rate * (i + 1);

                result.push(y);

                if (cur > y && cur < nextY) {
                    result.push(cur);
                }
            }

            return result;
        },
        trimInvalidSamples (newData) {
            let result = newData[0].reduce((prevArr, xValue, i) => {

                if (i == 0) {
                    prevArr[0] = [];
                    prevArr[1] = [];
                    prevArr[2] = [];
                }

                // i == 0 is the name of the dataset
                if (i == 0 || (!isNaN(xValue) && isFinite(xValue))) {
                    prevArr[0].push(newData[0][i]);
                    prevArr[1].push(newData[1][i]);
                    prevArr[2].push(newData[2][i]);
                }

                return prevArr;
            }, [])
            return result;
        },
        updateGraphData () {

            let clonedValues = this.deepCloneObject(this.$store.getters.convertDisplayedValues),
                newData = this.deepCloneObject(dataDefault),
                yList = this.getGraphYDataSet({amount: 10}),
                curY = this.getCurrentYValue();

            // erase previous values but keep names of datasets
            newData[0].length = 1;
            newData[1].length = 1;
            newData[2].length = 1;

            yList.forEach((yValue, i) => {

                clonedValues = this.updateClonedValues(clonedValues, yValue);

                let xValues = this.getGraphXValueForClonedValues(clonedValues, yValue);

                 newData[0][i + 1] = xValues; // x
                 newData[1][i + 1] = yValue; // line
                 newData[2][i + 1] = yValue == curY ? yValue : null; // current power dot
            })

            newData = this.trimInvalidSamples(newData);

            this.chart.axis.labels({x: this.updateXLabel(), y: this.updateYLabel()});

            this.chart.load({
                columns: newData
            })
        },
        deepCloneObject (obj) {
            return JSON.parse(JSON.stringify(obj))
        },
        createTooltip (V) {

            return {
                grouped: false,
                contents ([{x = 0, value = 0, id = ''}]) {

                    let {graphX, graphY, getMetricDisplayName, getGraphXTicksFormatted, getGraphYTicksFormatted} = V,
                        th = getMetricDisplayName(graphX),
                        name = getMetricDisplayName(graphY),
                        xFormatted = getGraphXTicksFormatted(x),
                        yFormatted = getGraphYTicksFormatted(value);

                    return `
                        <table class="c3-tooltip">
                            <tbody>
                                <tr>
                                    <th colspan="2">${th}: ${xFormatted}</th>
                                </tr>
                                <tr class="c3-tooltip-name--Current">
                                    <td class="name">
                                        <span style="background-color:#ff7f0e">
                                        </span>
                                        ${name}
                                    </td>
                                    <td class="value">${yFormatted}</td>
                                </tr>
                            </tbody>
                        </table>
                    `
                }
            }
        },
        updateYLabel () {
            return this.getMetricDisplayName(this.graphY)
        },
        updateXLabel () {
            return this.getMetricDisplayName(this.graphX)
        },
        getMetricDisplayName (metric) {
            return {
                sample: 'Sample',
                impact: 'Impact',
                power: 'Power',
                base: 'Base',
                falseposrate: 'False Positive Rate',
                sdrate: 'Base Standard deviation',

                samplePerDay: 'Daily Visitors',
                incrementalTrials: 'Incremental Trials',

                days: '# of days',
                incrementalTrialsPerDay: 'Inc. Trials per day',
                threshold: 'Non Inf. Threshold',
            }[metric] || ''
        }
    },
    watch: {
        sample () {
            this.updateGraphData();
        },
        impact () {
            this.updateGraphData();
        },
        power () {
            this.updateGraphData();
        },
        graphY () {
            this.updateGraphData();
        },
        graphX () {
            this.updateGraphData();
        },
        runtime () {
            this.updateGraphData();
        },
        isNonInferiorityEnabled (bool) {
            if (this.graphList.indexOf(this.graphType) == -1) {
                let { graphX, graphY } = this.graphList[0];
                this.graphType = `${graphX}-${graphY}`;
            }
        }
    },
    mounted () {
        let {resize, createTooltip} = this,
            vueInstance = this;
        resize();

        this.dataDefault = dataDefault;

        this.chart = c3.generate({
            bindto: this.$refs['pc-graph'],
            size: {
                width: this.width,
                height: this.height
            },
            legend: {
                show: false
            },
            data: {
                x: 'x',
                columns: this.dataDefault,
                type: 'area'
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            axis: {
                x: {
                    label:  this.updateXLabel(),
                    tick: {
                        values (minMax) {
                            let [min, max] = minMax.map((num) => {return window.parseInt(num)}),
                                amount = 7,
                                ratio = (max - min) / amount,
                                result = new Array(amount + 1);

                            // create the values
                            result = Array.from(result).map((undef, i) => {
                                return (min + (ratio * i)).toFixed(2)
                            })

                            return result
                        },
                        format (x) {
                            return vueInstance.getGraphXTicksFormatted(x)
                        }
                    }
                },
                y: {
                    label: this.updateYLabel(),
                    tick: {
                        values () {
                            return vueInstance.getGraphYTicks()
                        },
                        format (y) {
                            return vueInstance.getGraphYTicksFormatted(y)
                        }
                    }
                }
            },
            padding: {
                top: 20,
                left: 70,
                right: 20
            },
            tooltip: createTooltip(this)
        });

        this.updateGraphData()
    },
    components: {
        svgGraphTabItem
    }
}

</script>

<style>

/* graph radio styles */
.pc-graph-controls {
    display: flex;
    flex-direction: row;
    padding: 30px 0 0 60px;
    margin-bottom: 5px;
    border-bottom: 1px solid var(--blue);
}

.pc-graph-radio-label {
    position: relative;
    font-size: 13px;
    color: var(--blue);
    margin-right: 20px;
}

.pc-graph-radio-input {
    position: absolute;
    visibility: hidden;
}

.pc-graph-radio-text {
    display: block;
    padding: 0 5px 15px;
    position: relative;
}

.pc-graph-radio-input:checked + .pc-graph-radio-text::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 4px;
    background: var(--blue);
}

/* graph layout */

.pc-graph {
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
}
</style>
