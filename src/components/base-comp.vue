<template id="base-comp">
    <div>
        <label class="pc-switch-mode">
            Switch input mode to
            <input type="button" class="pc-switch-button" :value="enableedit ? 'Base rate' : 'Metric totals'" v-on:click="enableInput">
        </label>

        <ul class="pc-list">
            <li>
                <pc-block-field
                        fieldprop="visitorsWithGoals"
                        prefix=""
                        suffix=" Metric total"
                        v-bind:fieldvalue="visitorsWithGoals"
                        v-bind:testtype="testtype"
                        v-bind:fieldfromblock="fieldfromblock"
                        v-bind:isblockfocused="isblockfocused"
                        v-bind:isreadonly="isReadOnly"
                        v-bind:enableedit="enableedit"
                        v-on:field:change="updateFields"
                        v-on:update:focus="updateFocus"
                        aria-label="visitors with goals"></pc-block-field>
            </li>
        </ul>
    </div>
</template>

<script>
import pcBlockField from './pc-block-field.vue'
import valueTransformationMixin from '../js/value-transformation-mixin.js'
import statFormulas from '../js/math.js'

export default {
    props: ['testtype', 'enableedit', 'base', 'sample', 'calculateprop', 'fieldfromblock', 'isblockfocused', 'apptesttype'],
    mixins: [valueTransformationMixin],
    template: '#base-comp',
    data () {
        return {
            visitorsWithGoals: this.computeVisitors(),
            enableEdit: false,
            focusedBlock: '',
            testType: this.apptesttype
        }
    },
    computed: {
        isReadOnly () {
            return this.calculateprop == 'base'
        },
        baseRealValue () {
            return this.extractValue('base', this.base)
        },
        sampleRealValue () {
            return this.extractValue('sample', this.sample)
        }
    },
    watch: {
        baseRealValue () {
            if (this.focusedBlock != this.fieldfromblock) {
                this.visitorsWithGoals = this.computeVisitors();
            }
        },
        sampleRealValue () {
            if (this.focusedBlock != this.fieldfromblock) {
                this.visitorsWithGoals = this.computeVisitors();
            }
        },
        apptesttype (newValue) {
            this.testType = newValue;
        }
    },
    methods: {
        computeVisitors () {
            let result = statFormulas.getVisitorsWithGoals({
                    total_sample_size: this.extractValue('sample', this.sample),
                    base_rate: this.extractValue('base', this.base)
                })

            return this.displayValue('metricTotals', result)
        },
        enableInput () {
            this.$emit('edit:update', {prop: 'base'})
        },
        updateFields ({prop, value}) {
            this[prop] = window.parseInt(value || 0);

            this.updateBaseRateMainField();
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
        },
        updateBaseRateMainField () {
            if (this.calculateprop != 'base') {
                return
            }
            let baseToDisplay = this.displayValue(
                    'base',
                    statFormulas.getBaseRate({
                        total_sample_size: this.sampleRealValue,
                        visitors_with_goals: this.visitorsWithGoals
                    })
                );

            this.$emit('field:change', {
                prop: 'base',
                value: baseToDisplay
            })
        }

    },
    components: {
        'pc-block-field': pcBlockField
    }
}
</script>
