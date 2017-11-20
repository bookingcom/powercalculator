<template>
    <div class="power-calculator">
        <form action="." class="pc-form">
            <div class="pc-main-header">
                <div class="pc-title">Power Calculator <sup style="color: #F00; font-size: 11px;">BETA</sup> </div>
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
                    False Positive Rate
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
                    Power
                </label>
            </div>

            <div class="pc-blocks-wrapper" :class="{'pc-blocks-wrapper-ttest': testType == 'tTest'}">
                <label slot="text" class="pc-calc-radio--sample">
                    <input type="radio" v-model="calculateProp" value="sample" >
                    Calculate sample size
                </label>
                <label slot="text" class="pc-calc-radio--impact">
                    <input type="radio" v-model="calculateProp" value="impact" >
                    Calculate impact
                </label>

                <div class="pc-block pc-block--base pc-block--rounded-left" :class="{'pc-block-focused': focusedBlock == 'base'}">
                    <div class="pc-header" v-if="testType == 'gTest'">
                        Base Rate
                        <span class="pc-desc">
                            e.g. Goal Conversion
                        </span>
                    </div>
                    <div class="pc-header" v-else>
                        Base Average
                        <span class="pc-desc">
                            e.g. average number of bookings
                        </span>
                    </div>

                    <label class="pc-value">
                        <pc-block-field
                            fieldprop="base"
                            :suffix="testType == 'gTest' ? '%' : ''"

                            v-bind:fieldvalue="view.base"
                            v-bind:testtype="testType"
                            v-bind:isreadonly="calculateProp == 'base'"
                            v-bind:isblockfocused="focusedBlock == 'base'"
                            v-bind:enableedit="enabledMainInputs.base"

                            v-on:field:change="updateFields"
                            v-on:update:focus="updateFocus"

                            aria-label="Base rate value"></pc-block-field>
                    </label>

                    <label class="pc-value" v-if="testType == 'tTest'">
                        Base Standard deviation
                        <pc-block-field
                            prefix="±"
                            fieldprop="sdRate"
                            fieldfromblock="base"

                            v-bind:fieldvalue="view.sdRate"
                            v-bind:testtype="testType"
                            v-bind:isreadonly="calculateProp == 'base'"
                            v-bind:isblockfocused="focusedBlock == 'base'"
                            v-bind:enableedit="enabledMainInputs.base"

                            v-on:field:change="updateFields"
                            v-on:update:focus="updateFocus"></pc-block-field>
                    </label>

                    <base-comp
                        fieldfromblock="base"

                        v-bind:sample="view.sample"
                        v-bind:base="view.base"
                        v-bind:calculateprop="calculateProp"
                        v-bind:isblockfocused="focusedBlock == 'base'"
                        v-bind:testtype="testType"
                        v-bind:enableedit="!enabledMainInputs.base"

                        v-on:update:focus="updateFocus"
                        v-on:edit:update="editUpdate"
                        v-on:field:change="updateFields">
                    </base-comp>
                </div>
                <div class="pc-block pc-block--impact" :class="{'pc-block-focused': focusedBlock == 'impact', 'pc-block-to-calculate': calculateProp == 'impact'}">
                    <div class="pc-header">
                        Impact
                        <span class="pc-desc">
                            Relative impact
                        </span>
                    </div>

                    <label class="pc-value">
                        <pc-block-field
                            prefix="±"
                            suffix="%"
                            fieldprop="impact"

                            v-bind:fieldvalue="view.impact"
                            v-bind:testtype="testType"
                            v-bind:isreadonly="calculateProp == 'impact'"
                            v-bind:isblockfocused="focusedBlock == 'impact'"
                            v-bind:enableedit="enabledMainInputs.impact"

                            v-on:field:change="updateFields"
                            v-on:update:focus="updateFocus"

                            aria-label="Impact value"></pc-block-field>
                    </label>

                    <impact-comp
                        fieldfromblock="impact"
                        v-bind:impact="view.impact"
                        v-bind:base="view.base"
                        v-bind:days="view.runtime"
                        v-bind:sample="view.sample"
                        v-bind:isblockfocused="focusedBlock == 'impact'"
                        v-bind:calculateprop="calculateProp"
                        v-bind:testtype="testType"
                        v-bind:enableedit="!enabledMainInputs.impact"

                        v-on:field:change="updateFields"
                        v-on:edit:update="editUpdate"
                        v-on:update:focus="updateFocus">
                    </impact-comp>
                </div>
                <div class="pc-block pc-block--sample pc-block--rounded-right" :class="{'pc-block-focused': focusedBlock == 'sample', 'pc-block-to-calculate': calculateProp == 'sample'}">
                    <div class="pc-header">
                        Sample Size
                        <span class="pc-desc">
                            Total number of visitors in all variants
                        </span>
                    </div>

                    <label class="pc-value">
                        <pc-block-field
                            fieldprop="sample"

                            v-bind:fieldvalue="view.sample"
                            v-bind:testtype="testType"
                            v-bind:isreadonly="calculateProp == 'sample'"
                            v-bind:enableedit="enabledMainInputs.sample"

                            v-on:field:change="updateFields"
                            v-on:update:focus="updateFocus"

                            aria-label="Sample size value"></pc-block-field>
                    </label>

                    <sample-comp
                        fieldfromblock="sample"
                        v-bind:sample="view.sample"
                        v-bind:runtime.sync="view.runtime"
                        v-bind:calculateprop="calculateProp"
                        v-bind:enableedit="!enabledMainInputs.sample"
                        v-bind:isblockfocused="focusedBlock == 'sample'"

                        v-on:field:change="updateFields"
                        v-on:edit:update="editUpdate"
                        v-on:update:focus="updateFocus"></sample-comp>
                </div>
                <div class="pc-block pc-block--graph" :class="{'pc-block-focused': focusedBlock == 'power', 'pc-block-to-calculate': calculateProp == 'power'}">
                    <div class="pc-header">
                        Graph
                        <span class="pc-desc">
                            &nbsp;
                        </span>
                    </div>

                    <ul class="pc-list">
                        <li>
                            <svg-graph
                                v-bind:sample="view.sample"
                                v-bind:power="view.power"
                                v-bind:impact="view.impact"
                                v-bind:base="view.base"
                                v-bind:sdrate="view.sdRate"
                                v-bind:falseposrate="view.falsePosRate"
                                v-bind:testtype="testType"></svg-graph>
                        </li>
                    </ul>
                </div>
            </div>
        </form>

        <pc-overlay v-bind:isoverlayopen.sync="isOverlayOpened"></pc-overlay>
    </div>
</template>

<script>
import svgGraph from './components/svg-graph.vue'
import pcBlockField from './components/pc-block-field.vue'
import sampleComp from './components/sample-comp.vue'
import impactComp from './components/impact-comp.vue'
import baseComp from './components/base-comp.vue'
import pcTooltip from './components/pc-tooltip.vue'

import statFormulas from './js/math.js'
import valueTransformationMixin from './js/value-transformation-mixin.js'


export default {
    mixins: [valueTransformationMixin],
    data: {
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

            runtime: 14 //days
        },

        // false means the editable ones are the secondary mode (metric totals, days&daily trials and absolute impact)
        enabledMainInputs: {
            base: true,
            sample: true,
            impact: true,
            power: true
        },

        isOverlayOpened: false
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
            let { view, extractValue } = this,
                { sample, base, impact, falsePosRate, power, sdRate } = view;

            return {
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
        editUpdate ({prop}) {
            let {calculateProp, disableBaseSecondaryInput} = this,
                enableEdit = false;

            if (prop == 'base' && disableBaseSecondaryInput) {
                enableEdit = false
                this.enabledMainInputs[prop] = true;
            } else if(calculateProp == 'sample' || calculateProp != prop) {
                enableEdit = true
            }

            if (enableEdit) {
                this.enabledMainInputs[prop] = !this.enabledMainInputs[prop];
            }
        }
    },
    watch: {
        testType () {
            this.formulas();
        },
        calculateProp () {
            if (this.disableBaseSecondaryInput) {
                this.editUpdate({prop: 'base'})
            }
        }
    },
    components: {
        'svg-graph': svgGraph,
        'pc-block-field': pcBlockField,
        'pc-tooltip': pcTooltip,
        'sample-comp': sampleComp,
        'impact-comp' : impactComp,
        'base-comp': baseComp

    }
}
</script>

<style>
/* application styles */

/* colors */

.power-calculator {
    --light-blue: #c0e3ff;
    --blue: #3d78df;
    --dark-blue: #3d78df;
    --light-gray: #e2e6eb;
    --gray: #8f9194;
    --dark-gray: #5d5f63;
    --light-yellow: #fbf2cb;
    --yellow: #f9e699;
    --dark-yellow: #e1b735;
    --white: #FFF;
    --black: #000;
    --fade-black: rgba(0, 0, 0, 0.3);
    --red: #F00;
}

/* layout */

.pc-main-header {
    display: grid;
    grid-template-columns: auto min-content min-content min-content;
    grid-template-rows: auto;
    grid-template-areas:
        "title test-type false-positive power";
    align-items: center;

    margin: 25px 0 25px 10px;
}

.pc-title {
    grid-area: title;
    font-weight: bold;
    font-size: 1.2em;
}

.pc-test-type,
.pc-false-positive,
.pc-power {
    font-size: 0.8em;
}

.pc-test-type {
    grid-area: test-type;
    white-space: nowrap;
}

.pc-test-type-tooltip-wrapper {
    display: inline-block;
}

.pc-test-type-labels {
    margin: 0 20px;
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
    grid-template-columns: 25% 25% 25% 25%;
    grid-template-rows: auto;
    grid-template-areas:
        "radio-base radio-impact radio-sample radio-graph"
        "block-base block-impact block-sample block-graph"
    ;
    grid-template-rows: auto;
    grid-column-gap: 1px;
}

.pc-calc-radio--sample {
    grid-area: radio-sample;
}
.pc-calc-radio--impact {
    grid-area: radio-impact;
}
.pc-calc-radio--power {
    grid-area: radio-power;
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
    --border-radius: 15px;

    padding: 5%;
    background: var(--light-gray);
}

.pc-block--rounded-left {
    border-radius: var(--border-radius) 0 0 var(--border-radius);
}

.pc-block--rounded-right {
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
}

.pc-block--graph {
    background: none;
}

.pc-block.pc-block-focused {
    background: var(--light-blue);
}

.pc-header {
    font-weight: bold;
    margin-bottom: 25px;
}

.pc-desc {
    font-weight: normal;
    font-size: 0.8em;
    display: block;
    min-height: 1em;
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

.pc-switch-mode {
    display: block;
    margin-bottom: 10px;
    color: var(--gray);
    font-size: 0.7em;
}

.pc-switch-button {
    display: block;
    font-size: inherit;
    padding: 0;
    background: none;
    border: none;
    -webkit-appearance: none;
    color: var(--blue);
    font-size: 1.2em;
}

.pc-list {
    display: block;
    margin: 0;
}

/* block to calculate override rules*/

.pc-block.pc-block-to-calculate {
    --gradient-middle: 43%;
    background: linear-gradient(var(--dark-yellow) var(--gradient-middle), var(--light-yellow) calc(var(--gradient-middle) + 1px));
}

.pc-block-to-calculate .pc-value-field-wrapper {
    background: var(--yellow);
}

.pc-block-to-calculate .pc-value .pc-value-formatting:before {
    content: "=" attr(data-prefix);
    color: var(--dark-yellow);
}

.pc-block-to-calculate .pc-value-formatting:after {
    color: var(--black);
}

/* list */

.pc-list {
    font-size: 0.8em;
    color: var(--gray);
    padding: 0;
    list-style-type: none;
}

.pc-list strong {
    color: var(--dark-gray);
}

</style>
