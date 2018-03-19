<template id="impact-comp">
    <div class="pc-block pc-block--impact" :class="{'pc-block-focused': isBlockFocused, 'pc-block-to-calculate': calculateProp == 'impact'}">

        <pc-svg-chain v-bind:calculateProp="calculateProp" v-bind:fieldFromBlock="fieldFromBlock"></pc-svg-chain>

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
                        :prefix="isnoninferiority ? '' : '±'"
                        suffix="%"
                        fieldProp="impact"

                        v-bind:fieldValue="impact"
                        v-bind:testType="testType"
                        v-bind:isReadOnly="calculateProp == 'impact'"
                        v-bind:isBlockFocused="isBlockFocused"
                        v-bind:enableEdit="enableEdit"

                        v-on:update:focus="updateFocus"
                        ></pc-block-field>
                </label>
            </li>
            <li class="pc-input-item pc-input-right">
                <label>
                    <span class="pc-input-title">Absolute</span>

                    <pc-block-field
                        class="pc-input-field"
                        fieldProp="impactByMetricValue"

                        :suffix="testType == 'gTest' ? '%' : ''"

                        v-bind:fieldValue="impactByMetricDisplay"
                        v-bind:testType="testType"
                        v-bind:isReadOnly="isReadOnly"
                        v-bind:isBlockFocused="isBlockFocused"
                        v-bind:enableEdit="enableEdit"

                        v-on:update:focus="updateFocus"
                        aria-label="visitors with goals"></pc-block-field>
                        <span class="pc-input-details">
                            going from {{ addPercentToString(base) }} to
                            either {{ addPercentToString(impactByMetricMinDisplay) }} or
                            {{ addPercentToString(impactByMetricMaxDisplay) }}
                        </span>
                </label>
            </li>
            <li class="pc-input-item pc-input-bottom-left">
                <label>

                <pc-block-field
                    class="pc-input-field"
                    fieldProp="impactByVisitors"
                    v-bind:fieldValue="impactByVisitorsDisplay"
                    v-bind:testType="testType"
                    v-bind:isReadOnly="isReadOnly"
                    v-bind:isBlockFocused="isBlockFocused"
                    v-bind:enableEdit="enableEdit && calculateProp != 'sample'"

                    v-on:update:focus="updateFocus"
                    ></pc-block-field>
                    <span class="pc-input-details">
                        {{ testType == 'gTest' ? ' Incremental trials': ' Incremental change in the metric' }}
                    </span>
                </label>
            </li>
            <li class="pc-input-item pc-input-bottom-right">
                <label>

                <pc-block-field
                    fieldProp="impactByVisitorsPerDay"
                    v-bind:fieldValue="impactByVisitorsPerDayDisplay"
                    v-bind:testType="testType"
                    v-bind:isReadOnly="isReadOnly"
                    v-bind:isBlockFocused="isBlockFocused"
                    v-bind:enableEdit="enableEdit && calculateProp != 'sample'"

                    v-on:update:focus="updateFocus"
                    ></pc-block-field>
                    <span class="pc-input-details">
                        {{ testType == 'gTest' ? ' Incremental trials per day': ' Incremental change in the metric per day' }}
                    </span>
            </li>
        </ul>
    </div>
</template>

<script>
import pcBlock from './pc-block.vue'

export default {
    extends: pcBlock,
    template: '#impact-comp',
    props: ['enableEdit', 'fieldFromBlock', 'isBlockFocused', 'isnoninferiority'],
    data () {
        return {
            focusedBlock: ''
        }
    },
    computed: {
        days () {
            return this.$store.state.attributes.runtime
        },
        base () {
            return this.$store.state.attributes.base
        },
        sample () {
            return this.$store.state.attributes.sample
        },
        impact () {
            return this.$store.state.attributes.impact
        },
        testType () {
            return this.$store.state.attributes.testType
        },
        isReadOnly () {
            return this.calculateProp == 'impact'
        },
        impactByMetricDisplay () {
            return this.$store.getters.impactByMetricDisplay
        },
        impactByMetricMinDisplay () {
            return this.$store.getters.impactByMetricMinDisplay
        },
        impactByMetricMaxDisplay () {
            return this.$store.getters.impactByMetricMaxDisplay
        },
        impactByVisitorsDisplay () {
            return this.$store.getters.impactByVisitorsDisplay
        },
        impactByVisitorsPerDayDisplay () {
            return this.$store.getters.impactByVisitorsPerDayDisplay
        }
    },
    watch: {
        isReadOnly () {
            return this.calculateProp == 'impact'
        }
    },
    methods: {
        updateFocus ({fieldProp, value}) {
            if (this.focusedBlock == fieldProp && value === false) {
                this.focusedBlock = ''
            } else if (value === true) {
                this.focusedBlock = fieldProp
            }

            this.$emit('update:focus', {
                fieldProp: this.fieldFromBlock,
                value: value
            })
        },
        addPercentToString (str) {
            let result = str;
            if (this.testType == 'gTest') {
                result += '%'
            }

            return result
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
