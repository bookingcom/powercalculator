<template id="base-comp">
  <div
    class="pc-block pc-block--base"
    :class="{ 'pc-block-focused': focusedBlock === fieldFromBlock }"
  >
    <pc-svg-chain
      :fieldFromBlock="blockName"
      :focusedBlock="focusedBlock"
    ></pc-svg-chain>

    <div class="pc-header" v-if="testType == 'gTest'">Base Rate</div>
    <div class="pc-header" v-else>Base Average</div>

    <ul class="pc-inputs">
      <li class="pc-input-item pc-input-left">
        <label>
          <span class="pc-input-title"
            >{{ testType == 'gTest' ? 'Base Rate' : 'Base Average' }}
            <small class="pc-input-sub-title">conversion</small></span
          >

          <pc-block-field
            fieldProp="base"
            :suffix="testType === TEST_TYPE.BINOMIAL ? '%' : ''"
            :fieldValue.sync="base"
            :isReadOnly="isReadOnly"
            :isBlockFocused="isBlockFocused"
            enableEdit="true"
          ></pc-block-field>
        </label>
      </li>

      <li class="pc-input-item pc-input-right">
        <label>
          <span class="pc-input-title"
            >Metric Totals<small class="pc-input-sub-title"
              >visitors reached goal</small
            ></span
          >

          <pc-block-field
            fieldProp="visitorsWithGoals"
            :fieldValue.sync="visitorsWithGoals"
            :fieldFromBlock="fieldFromBlock"
            :isBlockFocused="isBlockFocused"
            :isReadOnly="isReadOnly"
            :enableEdit="this.focusedBlock != 'sample'"
          ></pc-block-field>
        </label>
      </li>

      <li class="pc-input-item pc-input-sd-rate" v-if="testType == 'tTest'">
        <label>
          <pc-block-field
            prefix="±"
            fieldProp="sdRate"
            fieldFromBlock="base"
            :fieldValue.sync="sdRate"
            :isReadOnly="isReadOnly"
            :isBlockFocused="isBlockFocused"
            enableEdit="true"
          ></pc-block-field>
          <span class="pc-input-details">Base Standard deviation</span>
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import pcBlock from './pc-block.vue'
import { TEST_TYPE, BLOCKED, FOCUS } from '../store/modules/calculator'

const DEBOUNCE = 500

export default {
  props: ['focusedBlock', 'blockName', 'lockedField'],
  extends: pcBlock,
  template: '#base-comp',
  data() {
    return {
      baseDebouncer: null,
      sdRateDebouncer: null,
    }
  },
  computed: {
    TEST_TYPE: () => TEST_TYPE,
    isBlockFocused() {
      return this.focusedBlock === this.blockName
    },
    isReadOnly() {
      return this.calculateProp == this.blockName
    },
    base: {
      get() {
        return this.$store.getters.baseRate
      },
      set(val) {
        if (this.baseDebouncer != null) {
          clearTimeout(this.baseDebouncer)
        }
        this.baseDebouncer = setTimeout(() => {
          if (this.$store.getters.baseRate !== val) {
            if (this.focusedBlock !== FOCUS.SAMPLE) {
              this.$store.commit('SET_BASE_RATE_AND_IMPACT_BY_SAMPLE', val)
            } else {
              if (this.lockedField === BLOCKED.VISITORS_PER_DAY) {
                this.$store.commit(
                  'SET_BASE_RATE_VISITORS_PER_DAY_AND_SAMPLE_BY_IMPACT',
                  val
                )
              } else {
                this.$store.commit(
                  'SET_BASE_RATE_RUNTIME_AND_SAMPLE_BY_IMPACT',
                  val
                )
              }
            }
          }
        }, DEBOUNCE)
      },
    },
    sdRate: {
      get() {
        return this.$store.getters.standardDeviation
      },
      set(val) {
        if (this.sdRateDebouncer != null) {
          clearTimeout(this.sdRateDebouncer)
        }
        this.sdRateDebouncer = setTimeout(() => {
          this.$store.commit('SET_STANDARD_DEVIATION', val)
        }, DEBOUNCE)
      },
    },
    visitorsWithGoals: {
      get() {
        return this.$store.getters.metricTotal
      },
      set(val) {
        if (this.$store.getters.isNonInferiority) return
        if (this.focusedBlock === FOCUS.IMPACT) {
          if (val !== this.$store.getters.metricTotal) {
            this.$store.commit('SET_BASE_RATE_BY_METRIC_TOTAL_WITH_IMPACT', val)
          }
        }
      },
    },
    sample() {
      return this.$store.getters.sample
    },
    testType() {
      return this.$store.getters.testType
    },
  },
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
