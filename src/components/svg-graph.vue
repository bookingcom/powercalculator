<template id="svg-graph">
    <div class="pc-block pc-block--graph">
        <div class="pc-graph-controls">
            <label class="pc-graph-radio-label" v-show="!isNonInferiorityEnabled">
                <input type="radio" class="pc-graph-radio-input" name="graph-x" value="days-incrementalTrialsPerDay" v-model="graphType">
                <span class="pc-graph-radio-text" :class="{'pc-graph-radio-selected': graphType == 'days-incrementalTrialsPerDay'}">{{getMetricDisplayName('incrementalTrialsPerDay')}} / {{getMetricDisplayName('days')}}</span>
            </label>
            <label class="pc-graph-radio-label" v-show="!isNonInferiorityEnabled">
                <input type="radio" class="pc-graph-radio-input" name="graph-x" value="samplePerDay-incrementalTrials" v-model="graphType">
                <span class="pc-graph-radio-text" :class="{'pc-graph-radio-selected': graphType == 'samplePerDay-incrementalTrials'}">{{getMetricDisplayName('incrementalTrials')}} / {{getMetricDisplayName('samplePerDay')}}</span>
            </label>
            <label class="pc-graph-radio-label" v-show="!isNonInferiorityEnabled">
                <input type="radio" class="pc-graph-radio-input" name="graph-x" value="sample-impact" v-model="graphType">
                <span class="pc-graph-radio-text" :class="{'pc-graph-radio-selected': graphType == 'sample-impact'}">{{getMetricDisplayName('impact')}} / {{getMetricDisplayName('sample')}}</span>
            </label>
            <label class="pc-graph-radio-label">
                <input type="radio" class="pc-graph-radio-input" name="graph-x" value="sample-power" v-model="graphType">
                <span class="pc-graph-radio-text" :class="{'pc-graph-radio-selected': graphType == 'sample-power'}">{{getMetricDisplayName('power')}} / {{getMetricDisplayName('sample')}}</span>
            </label>
            <label class="pc-graph-radio-label">
                <input type="radio" class="pc-graph-radio-input" name="graph-x" value="samplePerDay-power" v-model="graphType">
                <span class="pc-graph-radio-text" :class="{'pc-graph-radio-selected': graphType == 'samplePerDay-power'}">{{getMetricDisplayName('power')}} / {{getMetricDisplayName('samplePerDay')}}</span>
            </label>
            <label class="pc-graph-radio-label" v-show="!isNonInferiorityEnabled">
                <input type="radio" class="pc-graph-radio-input" name="graph-x" value="impact-power" v-model="graphType">
                <span class="pc-graph-radio-text" :class="{'pc-graph-radio-selected': graphType == 'impact-power'}">{{getMetricDisplayName('power')}} / {{getMetricDisplayName('impact')}}</span>
            </label>
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
    template: '#svg-graph',
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
        }
    },
    methods: {
        getDefaultGraphOption () {
            let result = 'days-incrementalTrialsPerDay';
            if (this.$store.state.nonInferiority.enabled) {
                result = 'sample-power'
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
            if (bool) {
                this.graphType = 'sample-power'
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
