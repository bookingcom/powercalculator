<template id="base-comp">
  <div
    class="pc-block pc-block--base"
    :class="{ 'pc-block-focused': isBlockFocused }"
  >
    <pc-svg-chain :isBlockFocused="isBlockFocused"></pc-svg-chain>

    <div class="pc-header" v-if="isBinomial">Base Rate</div>
    <div class="pc-header" v-else>Base Average</div>

    <ul class="pc-inputs">
      <li class="pc-input-item pc-input-left">
        <label>
          <span class="pc-input-title"
            >{{ isBinomial ? 'Base Rate' : 'Base Average' }}
            <small class="pc-input-sub-title">conversion</small></span
          >

          <pc-block-field
            fieldProp="base"
            :suffix="isBinomial ? '%' : ''"
            :fieldValue.sync="base"
            :isReadOnly="isReadOnly"
            :isBlockFocused="isBlockFocused"
            :enableEdit="true"
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
            :fieldValue="visitorsWithGoals"
            :isBlockFocused="isBlockFocused"
            :isReadOnly="true"
            :enableEdit="false"
          ></pc-block-field>
        </label>
      </li>

      <li class="pc-input-item pc-input-sd-rate" v-if="!isBinomial">
        <label>
          <pc-block-field
            prefix="±"
            fieldProp="sdRate"
            :fieldValue.sync="sdRate"
            :isReadOnly="isReadOnly"
            :isBlockFocused="isBlockFocused"
            :enableEdit="true"
          ></pc-block-field>
          <span class="pc-input-details">Base Standard deviation</span>
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import pcBlock from './pc-block.vue'
import { TEST_TYPE } from '../store/modules/calculator'

const DEBOUNCE = 500

export default {
  extends: pcBlock,
  template: '#base-comp',
  data: () => ({
    baseDebouncer: null,
    sdRateDebouncer: null,
  }),
  computed: {
    TEST_TYPE: () => TEST_TYPE,
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
            this.$store.commit('SET_BASE_RATE', {
              baseRate: val,
              lockedField: this.lockedField,
              focusedBlock: this.focusedBlock,
            })
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
          // Little hack to not rewrite everything again.
          this.$store.commit('SET_BASE_RATE', {
            baseRate: this.base,
            lockedField: this.lockedField,
            focusedBlock: this.focusedBlock,
          })
        }, DEBOUNCE)
      },
    },
    visitorsWithGoals() {
      return this.$store.getters.metricTotal
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
