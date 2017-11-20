<template id="sample-comp">
    <div>
        <label class="pc-switch-mode">
            Switch input mode to

            <input type="button" class="pc-switch-button" :value="enableedit ? 'Sample Size' : 'Days & Daily Trials'" v-on:click="enableInput">
        </label>

        <ul class="pc-list">
            <li>
                <pc-block-field
                        fieldprop="visitorsPerDay"
                        prefix=""
                        suffix=" visitors / day"
                        v-bind:fieldvalue="visitorsPerDay"
                        v-bind:testtype="testtype"
                        v-bind:isreadonly="false"
                        v-bind:isblockfocused="isblockfocused"
                        v-bind:enableedit="enableedit"
                        v-bind:lockedfield="lockedField"
                        v-bind:lock.sync="lockedField"

                        v-on:field:change="updateFields"
                        v-on:update:focus="updateFocus"
                        aria-label="Visitors per Day"></pc-block-field>
            </li>
            <li>
                <pc-block-field
                        fieldprop="days"
                        prefix=""
                        suffix=" days"
                        v-bind:fieldvalue="days"
                        v-bind:testtype="testtype"
                        v-bind:isreadonly="false"
                        v-bind:isblockfocused="isblockfocused"
                        v-bind:enableedit="enableedit"
                        v-bind:lockedfield="lockedField"
                        v-bind:lock.sync="lockedField"

                        v-on:field:change="updateFields"
                        v-on:update:focus="updateFocus"
                        aria-label="Days"></pc-block-field>
            </li>
        </ul>
    </div>
</template>

<script>
import pcBlockField from './pc-block-field.vue'
import valueTransformationMixin from '../js/value-transformation-mixin.js'

export default {
    props: ['runtime', 'testtype', 'enableedit', 'isblockfocused', 'sample', 'calculateprop', 'fieldfromblock'],
    template: '#sample-comp',
    mixins: [valueTransformationMixin],
    data () {
        let initialDaysValue = 14;
        return {
            days: initialDaysValue,
            visitorsPerDay: this.calculateVisitorsPerDay(this.sample, initialDaysValue),
            variants: 2,
            enableEdit: false,
            focusedBlock: '',
            lockedField: 'days'
        }
    },
    methods: {
        calculateVisitorsPerDay (sample, days) {
            let result =  Math.floor(window.parseInt(sample) / days)
            return isNaN(result) ? '-' : result;
        },
        calculateDays(sample, newValue) {
            let result =  Math.ceil(window.parseInt(sample) / newValue)
            return isNaN(result) ? '-' : result;
        },
        enableInput () {
            this.$emit('edit:update', {prop: 'sample'})
        },
        updateFields ({prop, value}) {
            this[prop] = window.parseInt(value || 0);
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
        updateSampleMainField () {
            this.$emit('field:change', {
                prop: 'sample',
                value: this.displayValue('sample', this.visitorsPerDay * this.days)
            })
        }
    },
    watch: {
        sample (newValue) {
            if (this.lockedField == 'days') {
                this.visitorsPerDay = this.calculateVisitorsPerDay(newValue, this.days)
            } else {
                this.days = this.calculateDays(newValue, this.visitorsPerDay)
            }
        },
        days (newValue) {
            if (this.focusedBlock == 'days') {
                if (this.calculateprop != 'sample') {
                    this.updateSampleMainField();
                } else {
                    this.visitorsPerDay = this.calculateVisitorsPerDay(this.sample, newValue)
                }
            }
            this.$emit('update:runtime', newValue)
        },
        visitorsPerDay (newValue) {
            if (this.focusedBlock == 'visitorsPerDay') {
                if (this.calculateprop != 'sample') {
                    this.updateSampleMainField();
                } else {
                    this.days = this.calculateDays(this.sample, newValue)
                }
            }
        },
        variants (newValue) {
            if (this.focusedBlock == 'variants') {

            }
        }
    },
    components: {
        'pc-block-field': pcBlockField
    }
}

</script>
