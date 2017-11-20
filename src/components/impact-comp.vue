<template id="impact-comp">
    <div>
        <label class="pc-switch-mode">
            Switch input mode to
            <input type="button" class="pc-switch-button" :value="enableedit ? 'Relative Impact' : 'Absolute Impact'" v-on:click="enableInput">
        </label>
        <ul class="pc-list">
            <li>
                <pc-block-field
                    fieldprop="impactByMetricValue"
                    prefix=""
                    :suffix="` going from ${impactByMetricMinDisplay} to ${impactByMetricMaxDisplay}%`"
                    v-bind:fieldvalue="impactByMetricDisplay"
                    v-bind:testtype="testtype"
                    v-bind:isreadonly="isReadOnly"
                    v-bind:isblockfocused="isblockfocused"
                    v-bind:enableedit="enableedit"

                    v-on:field:change="updateFields"
                    v-on:update:focus="updateFocus"
                    aria-label="visitors with goals"></pc-block-field>
            </li>
            <li>
                <pc-block-field
                    fieldprop="impactByVisitors"
                    prefix=""
                    :suffix="testtype == 'gTest' ? ' Incremental trials': ' Incremental change in the metric'"
                    v-bind:fieldvalue="impactByVisitorsDisplay"
                    v-bind:testtype="testtype"
                    v-bind:isreadonly="isReadOnly"
                    v-bind:isblockfocused="isblockfocused"
                    v-bind:enableedit="enableedit && calculateprop != 'sample'"

                    v-on:field:change="updateFields"
                    v-on:update:focus="updateFocus"
                    aria-label="testtype == 'gTest' ? ' Incremental trials': ' Incremental change in the metric'"></pc-block-field>
            </li>
            <li>
                <pc-block-field
                    fieldprop="impactByVisitorsPerDay"
                    prefix=""
                    :suffix="testtype == 'gTest' ? ' Incremental trials per day': ' Incremental change in the metric per day'"
                    v-bind:fieldvalue="impactByVisitorsPerDayDisplay"
                    v-bind:testtype="testtype"
                    v-bind:isreadonly="isReadOnly"
                    v-bind:isblockfocused="isblockfocused"
                    v-bind:enableedit="enableedit && calculateprop != 'sample'"

                    v-on:field:change="updateFields"
                    v-on:update:focus="updateFocus"
                    aria-label="testtype == 'gTest' ? ' Incremental trials per day': ' Incremental change in the metric per day'"></pc-block-field>
            </li>
        </ul>
    </div>
</template>

<script>
import pcBlockField from './pc-block-field.vue'
import valueTransformationMixin from '../js/value-transformation-mixin.js'
import statFormulas from '../js/math.js'

export default {
    mixins: [valueTransformationMixin],
    template: '#impact-comp',
    props: ['days', 'testtype', 'enableedit', 'impact', 'base', 'sample', 'calculateprop', 'fieldfromblock', 'isblockfocused', 'testtype'],
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
            focusedBlock: ''
        }
    },
    computed: {
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
            this.updateData();
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
        },
    },
    methods: {
        getImpactByMetric (prop = 'value') {
            let impactByMetricObj = statFormulas.getAbsoluteImpactInMetricHash({
                base_rate: this.extractValue('base', this.base),
                effect_size: this.extractValue('impact', this.impact)
            })

            return impactByMetricObj[prop];
        },
        getImpactByVisitor () {
            return statFormulas.getAbsoluteImpactInVisitors({
                total_sample_size: this.extractValue('sample', this.sample),
                base_rate: this.extractValue('base', this.base),
                effect_size: this.extractValue('impact', this.impact)
            })
        },
        getImpactByVisitorsPerDay () {
            return this.getImpactByVisitor() / this.days
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
    },
    components: {
        'pc-block-field': pcBlockField
    }
}
</script>
