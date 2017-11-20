<template id="impact-comp">
    <div class="pc-block pc-block--impact" :class="{'pc-block-focused': isblockfocused, 'pc-block-to-calculate': calculateprop == 'impact'}">

        <pc-svg-chain v-bind:calculateprop="calculateprop" v-bind:fieldfromblock="fieldfromblock"></pc-svg-chain>

        <label slot="text" class="pc-calc-radio pc-calc-radio--impact" :class="{'pc-calc-radio--active': isCalculated}">
            <input type="radio" v-model="isCalculated" :value="true" >
                {{ isCalculated ? 'Calculating' : 'Calculate' }}
        </label>

        <div class="pc-header">
            Impact
        </div>

        <ul class="pc-inputs">
            <li class="pc-input-item pc-input-left">
                <label>
                    <span class="pc-input-title">Relative</span>

                    <pc-block-field
                        class="pc-input-field"
                        prefix="±"
                        suffix="%"
                        fieldprop="relativeImpact"

                        v-bind:fieldvalue="relativeImpact"
                        v-bind:testtype="testType"
                        v-bind:isreadonly="calculateprop == 'impact'"
                        v-bind:isblockfocused="isblockfocused"
                        v-bind:enableedit="enableedit"

                        v-on:field:change="updateFields"
                        v-on:update:focus="updateFocus"
                        ></pc-block-field>
                </label>
            </li>
            <li class="pc-input-item pc-input-right">
                <label>
                    <span class="pc-input-title">Absolute</span>

                    <pc-block-field
                        class="pc-input-field"
                        fieldprop="impactByMetricValue"
                        v-bind:fieldvalue="impactByMetricDisplay"
                        v-bind:testtype="testtype"
                        v-bind:isreadonly="isReadOnly"
                        v-bind:isblockfocused="isblockfocused"
                        v-bind:enableedit="enableedit"

                        v-on:field:change="updateFields"
                        v-on:update:focus="updateFocus"
                        aria-label="visitors with goals"></pc-block-field>
                        <span class="pc-input-details">
                            going from {{impactByMetricMinDisplay}} to {{impactByMetricMaxDisplay}}%
                        </span>
                </label>
            </li>
            <li class="pc-input-item pc-input-bottom-left">
                <label>

                <pc-block-field
                    class="pc-input-field"
                    fieldprop="impactByVisitors"
                    v-bind:fieldvalue="impactByVisitorsDisplay"
                    v-bind:testtype="testtype"
                    v-bind:isreadonly="isReadOnly"
                    v-bind:isblockfocused="isblockfocused"
                    v-bind:enableedit="enableedit && calculateprop != 'sample'"

                    v-on:field:change="updateFields"
                    v-on:update:focus="updateFocus"
                    ></pc-block-field>
                    <span class="pc-input-details">
                        {{ testtype == 'gTest' ? ' Incremental trials': ' Incremental change in the metric' }}
                    </span>
                </label>
            </li>
            <li class="pc-input-item pc-input-bottom-right">
                <label>

                <pc-block-field
                    fieldprop="impactByVisitorsPerDay"
                    v-bind:fieldvalue="impactByVisitorsPerDayDisplay"
                    v-bind:testtype="testtype"
                    v-bind:isreadonly="isReadOnly"
                    v-bind:isblockfocused="isblockfocused"
                    v-bind:enableedit="enableedit && calculateprop != 'sample'"

                    v-on:field:change="updateFields"
                    v-on:update:focus="updateFocus"
                    ></pc-block-field>
                    <span class="pc-input-details">
                        {{ testtype == 'gTest' ? ' Incremental trials per day': ' Incremental change in the metric per day' }}
                    </span>
            </li>
        </ul>
    </div>
</template>

<script>
import pcBlock from './pc-block.vue'
import statFormulas from '../js/math.js'

export default {
    extends: pcBlock,
    template: '#impact-comp',
    props: ['view', 'testtype', 'enableedit', 'calculateprop', 'fieldfromblock', 'isblockfocused', 'testtype'],
    data () {
        return {
            // impactByMetric: {
            //     value: 0.75,
            //     min: 18,
            //     max: 50
            // }
            impactByMetricMin: this.getImpactByMetric('min'),
            impactByMetricMax: this.getImpactByMetric('max'),
            impactByMetricValue: this.getImpactByMetric(),
            impactByVisitors: this.getImpactByVisitor(),
            impactByVisitorsPerDay: this.getImpactByVisitorsPerDay(),
            enableEdit: false,
            focusedBlock: '',
            relativeImpact: this.view.impact
        }
    },
    computed: {
        days () {
            return this.view.runtime
        },
        base () {
            return this.view.base
        },
        sample () {
            return this.view.sample
        },
        impact () {
            return this.view.impact
        },

        isReadOnly () {
            return this.calculateprop == 'impact'
        },
        impactByMetricDisplay () {
            return this.displayValue('impactByMetricValue', this.impactByMetricValue);
        },
        impactByMetricMinDisplay () {
            return this.displayValue('impactByMetricValue', this.impactByMetricMin);
        },
        impactByMetricMaxDisplay () {
            return this.displayValue('impactByMetricValue', this.impactByMetricMax);
        },
        impactByVisitorsDisplay () {
            return this.displayValue('impactByVisitors', this.impactByVisitors)
        },
        impactByVisitorsPerDayDisplay () {
            return this.displayValue('impactByVisitorsPerDay', this.impactByVisitorsPerDay)
        }
    },
    watch: {
        isReadOnly () {
            return this.calculateprop == 'impact'
        },
        base () {
            this.updateData();
        },
        impact () {
            this.relativeImpact = this.impact;
        },
        sample () {
            this.updateData();
        },
        days () {
            this.impactByVisitorsPerDay = this.getImpactByVisitorsPerDay();
        },
        impactByMetricValue () {
            // keeping all math related stuff in statFormulas
            let impactByMetricObj = statFormulas.getAbsoluteImpactInMetricHash({
                base_rate: this.extractValue('base', this.base),
                effect_size: this.extractValue('impact', this.impact)
            })

            // this needs to be consistent;
            // they should never be changes manually;
            this.impactByMetricMin = impactByMetricObj.min;
            this.impactByMetricMax = impactByMetricObj.max;
        }
    },
    methods: {
        getImpactByMetric (prop = 'value') {
            let impactByMetricObj = statFormulas.getAbsoluteImpactInMetricHash({
                base_rate: this.extractValue('base', this.view.base),
                effect_size: this.extractValue('impact', this.view.impact)
            })

            return impactByMetricObj[prop];
        },
        getImpactByVisitor () {
            return statFormulas.getAbsoluteImpactInVisitors({
                total_sample_size: this.extractValue('sample', this.view.sample),
                base_rate: this.extractValue('base', this.view.base),
                effect_size: this.extractValue('impact', this.view.impact)
            })
        },
        getImpactByVisitorsPerDay () {
            return this.getImpactByVisitor() / this.view.runtime
        },
        updateData () {
            this.impactByMetricValue = this.getImpactByMetric();
            this.impactByVisitors = this.getImpactByVisitor();
            this.impactByVisitorsPerDay = this.getImpactByVisitorsPerDay();
        },
        enableInput () {
            this.$emit('edit:update', {prop: 'impact'})
        },
        updateFields ({prop, value}) {

            if (isNaN(value)) {
                return;
            }

            this[prop] = this.extractValue(prop, value);

            let {impact, base, sample} = this,
                realValue = this[prop],

                relative;

            if (prop == 'impactByMetricValue') {
                // this.impactByVisitors = this.getImpactByVisitor();
                relative = statFormulas.getRelativeImpactFromAbsolute({
                        base_rate: this.extractValue('base', this.base),
                        absolute_effect_size: realValue
                });
            } else if (prop == 'impactByVisitors') {
                // this.impactByMetricValue = this.getImpactByMetric();
                relative = statFormulas.getRelativeImpactFromVisitors({
                        total_sample_size: sample,
                        base_rate: this.extractValue('base', this.base),
                        visitors: realValue
                });
            } else if (prop == 'relativeImpact') {
                relative = this.extractValue('impact', value);
            }

            if (!relative) {
                return;
            }

            this.$emit('field:change', {
                prop: 'impact',
                value: this.displayValue('impact', relative)
            })
        },
        updateFocus ({fieldProp, value}) {
            if (this.focusedBlock == fieldProp && value === false) {
                this.focusedBlock = ''
            } else if (value === true) {
                this.focusedBlock = fieldProp
            }

            this.$emit('update:focus', {
                fieldProp: this.fieldfromblock,
                value: value
            })
        }
    }
}
</script>

<style>
.pc-inputs {
    grid-template-areas:
        "pc-input-left pc-input-right"
    ;
}

</style>
