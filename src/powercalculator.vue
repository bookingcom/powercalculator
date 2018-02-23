<template>
    <div class="power-calculator">
        <form action="." class="pc-form">
            <div class="pc-main-header">
                <div class="pc-test-type">

                    <pc-tooltip class="pc-test-type-tooltip-wrapper">
                        <label class="pc-test-type-labels" slot="text">
                            <input type="radio" name="test-mode" v-model="testType" value="gTest" checked>
                            Binary Metric
                        </label>
                        <span slot="tooltip">
                            A binary metric is one that can be only two values like 0 or 1, yes or no, converted or not converted
                        </span>
                    </pc-tooltip>


                    <pc-tooltip class="pc-test-type-tooltip-wrapper">
                        <label class="pc-test-type-labels" slot="text">
                            <input type="radio" name="test-mode" v-model="testType" value="tTest">
                            Continuous Metric
                        </label>
                        <span slot="tooltip">
                            A continuous metric is one that can be any number like time on site or the number of rooms sold
                        </span>
                    </pc-tooltip>

                </div>

                <non-inferiority
                    v-bind:thresholdProp="view.nonInfThreshold"
                    v-bind:enabledProp.sync="nonInferiority.enabled"
                    v-bind:selectedProp.sync="nonInferiority.selected"

                    v-bind:readOnlyVisitorsPerDay="readOnlyVisitorsPerDay"

                    v-bind:view="view"
                    v-bind:extractValue="extractValue"
                    v-bind:lockedField="lockedField"

                    v-on:update:noninf="updateNonInf"
                    v-on:field:change="updateFields"
                >
                </non-inferiority>

                <div class="pc-title">Power Calculator <sup style="color: #F00; font-size: 11px;">BETA</sup> </div>

                <label class="pc-false-positive">
                    <pc-block-field
                        class="pc-false-positive-input"
                        :class="{ 'pc-top-fields-error': view.falsePosRate > 10 }"
                        suffix="%"
                        fieldprop="falsePosRate"
                        v-bind:fieldvalue="view.falsePosRate"
                        v-bind:testtype="testType"
                        v-bind:enableedit="true"
                        v-on:field:change="updateFields"></pc-block-field>
                    false positive rate
                </label>

                <label class="pc-power">
                    <pc-block-field
                        class="pc-power-input"
                        suffix="%"
                        :class="{ 'pc-top-fields-error': view.power < 80 }"
                        fieldprop="power"
                        v-bind:fieldvalue="view.power"
                        v-bind:testtype="testType"
                        v-bind:enableedit="true"
                        v-on:field:change="updateFields"></pc-block-field>
                    power
                </label>
            </div>

            <div class="pc-blocks-wrapper" :class="{'pc-blocks-wrapper-ttest': testType == 'tTest'}">
                <base-comp
                    fieldfromblock="base"

                    v-bind:view="view"
                    v-bind:calculateprop="calculateProp"
                    v-bind:isblockfocused="focusedBlock == 'base'"
                    v-bind:testtype="testType"
                    v-bind:enableedit="enabledMainInputs.base"

                    v-on:update:focus="updateFocus"
                    v-on:field:change="updateFields">
                </base-comp>

                <sample-comp
                    fieldfromblock="sample"
                    v-bind:testtype="testType"
                    v-bind:sample="view.sample"
                    v-bind:runtime.sync="view.runtime"
                    v-bind:lockedfield.sync="lockedField"
                    v-bind:calculateprop="calculateProp"
                    v-bind:enableedit="enabledMainInputs.sample"
                    v-bind:isblockfocused="focusedBlock == 'sample'"

                    v-on:update:calculateprop="updateCalculateProp"
                    v-on:field:change="updateFields"
                    v-on:update:focus="updateFocus"
                    v-on:readonly:visitorsPerDay="updateVisitorsPerDay">

                </sample-comp>


                <impact-comp
                    fieldfromblock="impact"
                    v-bind:view="view"
                    v-bind:isblockfocused="focusedBlock == 'impact'"
                    v-bind:testtype="testType"
                    v-bind:enableedit="enabledMainInputs.impact"
                    v-bind:calculateprop="calculateProp"

                    v-bind:isnoninferiority="nonInferiority.enabled"

                    v-on:update:calculateprop="updateCalculateProp"
                    v-on:field:change="updateFields"
                    v-on:update:focus="updateFocus">
                </impact-comp>

                <svg-graph
                    v-bind:power="view.power"
                    v-bind:impact="view.impact"
                    v-bind:base="view.base"
                    v-bind:sample="view.sample"
                    v-bind:sdrate="view.sdRate"
                    v-bind:falseposrate="view.falsePosRate"
                    v-bind:runtime="view.runtime"

                    v-bind:noninferiority="nonInferiority"
                    v-bind:testtype="testType"></svg-graph>
            </div>
        </form>
    </div>
</template>

<script>
import svgGraph from './components/svg-graph.vue'
import pcBlockField from './components/pc-block-field.vue'
import sampleComp from './components/sample-comp.vue'
import impactComp from './components/impact-comp.vue'
import baseComp from './components/base-comp.vue'
import pcTooltip from './components/pc-tooltip.vue'
import nonInferiority from './components/non-inferiority.vue'

import statFormulas from './js/math.js'
import valueTransformationMixin from './js/value-transformation-mixin.js'


export default {
    mixins: [valueTransformationMixin],
    props: ['parentmetricdata'],
    data () {
        // values if parent component sends them
        let importedData = this.parentmetricdata || {};

        let data = {
            testType: 'gTest',
            calculateProp: 'sample', // power, impact, base, sample
            focusedBlock: '',
            view: {
                sample: 561372,
                base: 10,
                impact: 2,
                power: 80,
                falsePosRate: 10,
                sdRate: 10,

                runtime: 14, //days

                nonInfThreshold: 0
            },

            nonInferiority: {
                enabled: false,
                selected: 'relative',
                mu: 0,
                alternative: '',
                opts: false,
            },

            // this is used for sample size but we also want to make it shareable
            lockedField: 'days',

            // false means the editable ones are the secondary mode (metric totals, days&daily trials and absolute impact)
            enabledMainInputs: {
                base: true,
                sample: true,
                impact: true,
                power: true
            },
            readOnlyVisitorsPerDay: 0
        };

        // mergeComponentData has no array support for now
        return this.mergeComponentData(data, JSON.parse(JSON.stringify(importedData)));
    },
    computed: {
        math () {
            return statFormulas[this.testType]
        },
        disableBaseSecondaryInput () {
            // only metric total is available and as it depends on sample this
            // creates a circular dependency
            // this also forces main input back
            return this.calculateProp == 'sample'
        },

        // in case parent component needs this information
        metricData () {
            let result =  {
                    testType: this.testType,
                    calculateProp: this.calculateProp,
                    view: this.view,
                    lockedField: this.lockedField,
                };
            return JSON.parse(JSON.stringify(result))
        },

        nonInferiorityEnabled () {
            return this.nonInferiority.enabled;
        },

        nonInferioritySelected () {
            return this.nonInferiority.selected;
        }
    },
    methods: {
        updateFields ({prop, value}) {
            this.view[prop] = value;

            // will be a function for each maybe?
            this.formulas();

        },
        formulas () {
            // apply formulas
            let {math, solveFor, calculateProp} = this,
                result = 0;

            result = math[calculateProp](this.convertDisplayedValues());
            this.view[calculateProp] = this.displayValue(calculateProp, result);

        },
        convertDisplayedValues () {
            let { view, extractValue, nonInferiority } = this,
                { sample, base, impact, falsePosRate, power, sdRate } = view,
                { mu, opts, alternative } = nonInferiority;

            return {
                mu,
                opts,
                alternative,
                total_sample_size: extractValue('sample', sample),
                base_rate: extractValue('base', base),
                effect_size: extractValue('impact', impact),
                alpha: extractValue('falsePosRate', falsePosRate),
                beta: 1 - extractValue('power', power), // power of 80%, beta is actually 20%
                sd_rate: extractValue('sdRate', sdRate)
            }
        },
        updateFocus ({fieldProp, value}) {
            if (this.focusedBlock == fieldProp && value === false) {
                this.focusedBlock = ''
            } else if (value === true) {
                this.focusedBlock = fieldProp
            }
        },
        updateCalculateProp (newProp) {
            this.calculateProp = newProp;
        },
        mergeComponentData (base, toClone) {
            // merges default data with imported one from parent component
            let result = recursive(base, toClone);

            // no array support for now
            function recursive (baseRef, cloneRef) {
                Object.keys(cloneRef).forEach((prop) => {
                    if (typeof cloneRef[prop] == 'object') {
                        baseRef[prop] = recursive(baseRef[prop], cloneRef[prop]);
                    } else {
                        baseRef[prop] = cloneRef[prop];
                    }
                })

                return baseRef;
            };

            return result;
        },
        updateVisitorsPerDay (newValue) {
            this.readOnlyVisitorsPerDay = newValue;
        },
        updateNonInf ({ mu, alternative, opts }) {

            this.nonInferiority.mu = mu;
            this.nonInferiority.alternative = alternative;
            this.nonInferiority.opts = opts;

            this.formulas();
        }
    },
    watch: {
        testType () {
            this.formulas();
        },
        nonInferiorityEnabled () {
            this.formulas();
        },

        nonInferioritySelected () {
            this.formulas();
        },
        // in case parent component needs this information
        metricData () {
            this.$emit('update:metricdata', this.metricData)
        }
    },
    components: {
        'svg-graph': svgGraph,
        'pc-block-field': pcBlockField,
        'pc-tooltip': pcTooltip,
        'sample-comp': sampleComp,
        'impact-comp' : impactComp,
        'base-comp': baseComp,
        'non-inferiority': nonInferiority

    }
}
</script>

<style>
/* application styles */

/* colors */

.power-calculator {

    --white: #FFF;
    --black: #000;

    --gray: #B5B5B5;
    --light-gray: #F0F0F0;
    --dark-gray: #525252;

    --light-blue: #C1CFD8;
    --pale-blue: #7898AE;
    --blue: #155EAB;
    --dark-blue: #3d78df;

    --light-yellow: #FEF1CB;
    --dark-yellow: #E2B634;
    --fade-black: rgba(0, 0, 0, 0.3);

    --red: #F00;

}

/* layout */

.pc-main-header {
    display: grid;
    grid-template-columns: min-content  min-content auto min-content min-content;
    grid-template-rows: auto;
    grid-template-areas:
        "test-type calc-options title false-positive power";
    align-items: center;

    margin: 25px 0 25px 10px;
}

.pc-title {
    grid-area: title;
    font-size: 30px;
    text-align: center;
}

.pc-non-inferiority,
.pc-test-type,
.pc-false-positive,
.pc-power {
    font-size: 0.8em;
}

.pc-test-type {
    grid-area: test-type;
}

.pc-non-inferiority {
    grid-area: calc-options;
}

.pc-test-type-tooltip-wrapper {
    display: inline-block;
}

.pc-test-type-labels {
    margin: 0 20px;
    white-space: nowrap;
}

.pc-false-positive {
    grid-area: false-positive;
    white-space: nowrap;
}

.pc-power {
    grid-area: power;
    margin-left: 10px;
    white-space: nowrap;
}

.pc-blocks-wrapper {
    grid-area: pc-blocks-wrapper;
    display: grid;
    grid-template-columns: 33% 33% 33%;
    grid-template-rows: auto;
    grid-template-areas:
        "block-base block-sample block-impact"
        "block-graph block-graph block-graph"
    ;
    grid-template-rows: auto;
    grid-column-gap: 8px;
    grid-row-gap: 8px;
}

.pc-block--base {
    grid-area: block-base;
}

.pc-block--sample {
    grid-area: block-sample;
}

.pc-block--impact {
    grid-area: block-impact;
}

.pc-block--graph {
    grid-area: block-graph;
}


/* blocks */

.pc-block {
    background: var(--light-gray);
}

.pc-header {
    color: var(--white);
    text-align: center;
    font-size: 28px;
    line-height: 80px;
    height: 80px;
    text-shadow: 0 1px 1px rgba(0,0,0,0.29);
    background: var(--pale-blue);
    margin-bottom: 25px;
}

.pc-calculate {
    display: inline-block;
    margin-bottom: 25px;
    font-weight: bold;
    font-size: 0.8em;
}

.pc-value {
    display: block;
    margin-bottom: 25px;
}

/* block to calculate override rules*/

.pc-block-to-calculate {
    background: var(--light-yellow);
}

.pc-block-to-calculate .pc-header {
    background: var(--dark-yellow);
}
</style>
