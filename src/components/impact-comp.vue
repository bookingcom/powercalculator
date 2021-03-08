<template id="impact-comp">
  <div
    class="pc-block pc-block--impact"
    :class="{
      'pc-block-focused': focusedBlock == blockName,
      'pc-block-to-calculate': focusedBlock === blockName,
    }"
  >
    <pc-svg-chain
      :focusedBlock="focusedBlock"
      :fieldFromBlock="blockName"
    ></pc-svg-chain>

    <label
      slot="text"
      class="pc-calc-radio pc-calc-radio--impact"
      :class="{ 'pc-calc-radio--active': focusedBlock === blockName }"
    >
      <input type="radio" v-model="isSelected" :value="blockName" />
      {{ focusedBlock === blockName ? 'Calculating' : 'Calculate' }}
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
            :prefix="isNonInferiority ? '' : '±'"
            suffix="%"
            fieldProp="impact"
            :fieldValue.sync="relativeImpact"
            :testType="testType"
            v-bind:isReadOnly="focusedBlock === blockName"
            v-bind:isBlockFocused="focusedBlock === blockName"
            enableEdit="true"
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
            v-bind:fieldValue="absoluteImpact"
            v-bind:testType="testType"
            v-bind:isReadOnly="focusedBlock === blockName"
            v-bind:isBlockFocused="focusedBlock === blockName"
            enableEdit="true"
            aria-label="visitors with goals"
          ></pc-block-field>
          <span class="pc-input-details">
            going from {{ addPercentToString(baseRate) }} to either
            {{ addPercentToString(minAbsoluteImpact) }} or
            {{ addPercentToString(maxAbsoluteImpact) }}
          </span>
        </label>
      </li>
      <li class="pc-input-item pc-input-bottom-left">
        <label>
          <pc-block-field
            class="pc-input-field"
            fieldProp="impactByVisitors"
            v-bind:fieldValue="absoluteImpactPerVisitor"
            v-bind:testType="testType"
            isReadOnly="true"
            v-bind:isBlockFocused="focusedBlock === blockName"
            enableEdit="false"
          ></pc-block-field>
          <span class="pc-input-details">
            {{
              testType == 'gTest'
                ? ' Incremental units'
                : ' Incremental change in the metric'
            }}
          </span>
        </label>
      </li>
      <li class="pc-input-item pc-input-bottom-right" v-if="!onlyTotalVisitors">
        <label>
          <pc-block-field
            fieldProp="impactByVisitorsPerDay"
            :fieldValue="absoluteImpactPerVisitorPerDay"
            v-bind:testType="testType"
            isReadOnly="true"
            :isBlockFocused="focusedBlock === blockName"
            enableEdit="false"
          ></pc-block-field>
          <span class="pc-input-details">
            {{
              testType == 'gTest'
                ? ' Incremental units per day'
                : ' Incremental change in the metric per day'
            }}
          </span>
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import pcBlock from './pc-block.vue'
import { TRAFFIC_MODE, TEST_TYPE } from '../store/modules/calculator'

export default {
  extends: pcBlock,
  template: '#impact-comp',
  props: ['focusedBlock', 'blockName'],
  data() {
    return {
    }
  },
  computed: {
    isSelected: {
      get() {
        return this.focusedBlock
      },
      set(val) {
        if (val === this.blockName) {
          this.$emit('update:focusedBlock', this.blockName)
        }
      },
    },
    enableEdit() {
      return this.focusedBlock === this.blockName
    },
    isNonInferiority() {
      return this.$store.getters.isNonInferiority
    },
    relativeImpact: {
      get() {
        return this.$store.getters.relativeImpact
      }, 
      set(val) {
        if (this.focusedBlock !== this.blockName) {
          this.$store.commit('SET_RELATIVE_IMPACT', val)
          // SET_SAMPLE_SIZE
        }
      }
    },
    baseRate() {
      return this.$store.getters.baseRate
    },
    absoluteImpact() {
      return this.$store.getters.absoluteImpact
    },
    minAbsoluteImpact() {
      return this.$store.getters.minAbsoluteImpact
    },
    maxAbsoluteImpact() {
      return this.$store.getters.maxAbsoluteImpact
    },
    absoluteImpactPerVisitor() {
      return this.$store.getters.absoluteImpactPerVisitor
    },
    absoluteImpactPerVisitorPerDay() {
      return this.$store.getters.absoluteImpactPerVisitorPerDay
    },
    testType() {
      return this.$store.getters.testType
    },
    onlyTotalVisitors() {
      return this.$store.getters.trafficMode === TRAFFIC_MODE.TOTAL
    },
  },
  methods: {
    addPercentToString(str) {
      let result = str
      if (this.testType === TEST_TYPE.BINOMIAL) {
        result += '%'
      }
      return result
    }
  }
  // TODO: Add a watcher on the changes of the sample size to calculate the right one
}
</script>

<style></style>
