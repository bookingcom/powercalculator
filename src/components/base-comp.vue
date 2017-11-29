<template id="base-comp">
    <div class="pc-block pc-block--base" :class="{'pc-block-focused': focusedblock == 'base'}">

        <pc-svg-chain v-bind:calculateprop="calculateprop" v-bind:fieldfromblock="fieldfromblock"></pc-svg-chain>

        <div class="pc-header" v-if="testtype == 'gTest'">
            Base Rate
        </div>
        <div class="pc-header" v-else>
            Base Average
        </div>

        <ul class="pc-inputs">
            <li class="pc-input-item pc-input-left">
                <label>
                    <span class="pc-input-title">{{testtype == 'gTest' ? 'Base Rate' : 'Base Average'}} <small class="pc-input-sub-title">conversion</small></span>

                    <pc-block-field
                        fieldprop="baseRate"
                        :suffix="testtype == 'gTest' ? '%' : ''"

                        v-bind:fieldvalue="baseRate"
                        v-bind:testtype="testtype"
                        v-bind:isreadonly="isReadOnly"
                        v-bind:isblockfocused="isblockfocused"
                        v-bind:enableedit="enableedit"

                        v-on:field:change="updateFields"
                        v-on:update:focus="updateFocus"></pc-block-field>
                </label>
            </li>

            <li class="pc-input-item pc-input-right">
                <label>
                    <span class="pc-input-title">Metric Totals<small class="pc-input-sub-title">visitors reached goal</small></span>

                    <pc-block-field
                        fieldprop="visitorsWithGoals"
                        v-bind:fieldvalue="visitorsWithGoals"
                        v-bind:testtype="testtype"
                        v-bind:fieldfromblock="fieldfromblock"
                        v-bind:isblockfocused="isblockfocused"
                        v-bind:isreadonly="isReadOnly"
                        v-bind:enableedit="enableedit && this.calculateprop != 'sample'"

                        v-on:field:change="updateFields"
                        v-on:update:focus="updateFocus"></pc-block-field>
                </label>
            </li>

            <li class="pc-input-item pc-input-sd-rate" v-if="testtype == 'tTest'">
                <label>
                    <pc-block-field
                        prefix="±"
                        fieldprop="sdRate"
                        fieldfromblock="base"

                        v-bind:fieldvalue="view.sdRate"
                        v-bind:testtype="testtype"
                        v-bind:isreadonly="isReadOnly"
                        v-bind:isblockfocused="isblockfocused"
                        v-bind:enableedit="enableedit"

                        v-on:field:change="updateFields"
                        v-on:update:focus="updateFocus"></pc-block-field>
                    <span class="pc-input-details">Base Standard deviation</span>
                </label>
            </li>
        </ul>
    </div>
</template>

<script>
import pcBlock from './pc-block.vue'
import statFormulas from '../js/math.js'

export default {
    props: ['testtype', 'enableedit', 'view', 'calculateprop', 'fieldfromblock', 'isblockfocused'],
    extends: pcBlock,
    template: '#base-comp',
    data () {
        return {
            visitorsWithGoals: this.computeVisitors({init: true}),
            enableEdit: false,
            focusedBlock: '',
            baseRate: this.view.base
        }
    },
    computed: {
        isReadOnly () {
            return this.calculateprop == 'base'
        },
        base () {
            return this.view.base
        },
        sample () {
            return this.view.sample
        }
    },
    watch: {
        base (newValue) {
            this.baseRate = newValue;
        },
        sample () {
            if (this.focusedBlock != this.fieldfromblock) {
                this.visitorsWithGoals = this.computeVisitors();
            }
        },
        baseRate () {
            if (this.focusedBlock != this.fieldfromblock) {
                this.visitorsWithGoals = this.computeVisitors();
            }
        },
    },
    methods: {
        computeVisitors (config) {
            let result = statFormulas.getVisitorsWithGoals({
                    total_sample_size: this.extractValue('sample', this.view.sample),
                    base_rate: this.extractValue('base', config && config.init ? this.view.base : this.baseRate)
                })

            return this.displayValue('metricTotals', result)
        },
        enableInput () {
            this.$emit('edit:update', {prop: 'base'})
        },
        updateFields ({prop, value}) {

            let result = 0;
            let shouldUpdateBaseRate = prop == 'baseRate' || prop == 'visitorsWithGoals';

            if (prop == 'baseRate') {
                result = value;
            } else if (prop == 'visitorsWithGoals') {
                result = this.displayValue(
                    'base',
                    statFormulas.getBaseRate({
                        total_sample_size: this.extractValue('sample', this.sample),
                        visitors_with_goals: value
                    })
                );
            } else if (prop == 'sdRate') {
                this.$emit('field:change', {
                    prop: 'sdRate',
                    value: value
                })
            }

            if (shouldUpdateBaseRate) {
                this.baseRate = window.parseInt(result || 0);

                this.$emit('field:change', {
                    prop: 'base',
                    value: result
                })
            }
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
.pc-input-sd-rate {
    margin-top: -10px;
    z-index: 1;
    position: relative;
    text-align: center;
}

.pc-field-sdRate {
    width: 90%;
    display: inline-block;
}
</style>

<style scoped>
    .pc-input-left {
        position: relative;
        z-index: 2;
    }
</style>
