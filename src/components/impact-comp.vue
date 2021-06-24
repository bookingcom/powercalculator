<template id="impact-comp">
  <div
    class="pc-block pc-block--impact"
    :class="{
      'pc-block-focused': isBlockFocused,
      'pc-block-to-calculate': isBlockFocused,
    }"
  >
    <pc-svg-chain :isBlockFocused="isBlockFocused"></pc-svg-chain>

    <label
      slot="text"
      class="pc-calc-radio pc-calc-radio--impact"
      :class="{ 'pc-calc-radio--active': isBlockFocused }"
    >
      <input type="radio" v-model="isFocused" :value="blockName" />
      {{ isBlockFocused ? 'Calculating' : 'Calculate' }}
    </label>

    <div class="pc-header">Impact</div>

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
            :isReadOnly="isBlockFocused"
            :isBlockFocused="isBlockFocused"
            :enableEdit="true"
          ></pc-block-field>
        </label>
      </li>
      <li class="pc-input-item pc-input-right">
        <label>
          <span class="pc-input-title">Absolute</span>

          <pc-block-field
            class="pc-input-field"
            fieldProp="impactByMetricValue"
            :suffix="isBinomial ? '%' : ''"
            :fieldValue.sync="absoluteImpact"
            :isReadOnly="isBlockFocused"
            :isBlockFocused="isBlockFocused"
            :enableEdit="true"
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
            :fieldValue="absoluteImpactPerVisitor"
            :isReadOnly="true"
            :isBlockFocused="isBlockFocused"
            :enableEdit="false"
          ></pc-block-field>
          <span class="pc-input-details">
            {{
              isBinomial
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
            isReadOnly="true"
            :isBlockFocused="isBlockFocused"
            :enableEdit="false"
          ></pc-block-field>
          <span class="pc-input-details">
            {{
              isBinomial
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
import {
  TRAFFIC_MODE,
  TEST_TYPE,
  FOCUS,
  SELECTED,
} from '../store/modules/calculator'

const DEBOUNCE = 500

export default {
  extends: pcBlock,
  template: '#impact-comp',
  data: () => ({
    absoluteImpactDebouncer: null,
    relativeImpactDebouncer: null,
  }),
  computed: {
    isFocused: {
      get() {
        return this.focusedBlock
      },
      set(val) {
        if (val === this.blockName) {
          this.$emit('update:focusedBlock', this.blockName)
        }
      },
    },
    isNonInferiority() {
      return this.$store.getters.isNonInferiority
    },
    relativeImpact: {
      get() {
        return this.$store.getters.relativeImpact
      },
      set(val) {
        if (this.focusedBlock === FOCUS.SAMPLE) {
          if (this.relativeImpactDebouncer != null) {
            clearTimeout(this.relativeImpactDebouncer)
          }
          this.relativeImpactDebouncer = setTimeout(() => {
            this.$emit('update:selected', SELECTED.RELATIVE)
            this.$store.commit('SET_IMPACT', {
              impact: val,
              isAbsolute: false,
              lockedField: this.lockedField,
            })
          }, DEBOUNCE)
        }
      },
    },
    baseRate() {
      return this.$store.getters.baseRate
    },
    absoluteImpact: {
      get() {
        return this.$store.getters.absoluteImpact
      },
      set(val) {
        if (this.focusedBlock === FOCUS.SAMPLE) {
          if (this.absoluteImpactDebouncer != null) {
            clearTimeout(this.absoluteImpactDebouncer)
          }
          this.absoluteImpactDebouncer = setTimeout(() => {
            this.$emit('update:selected', SELECTED.ABSOLUTE)
            this.$store.commit('SET_IMPACT', {
              impact: val,
              isAbsolute: true,
              lockedField: this.lockedField,
            })
          }, DEBOUNCE)
        }
      },
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
    },
  },
}
</script>

<style></style>
