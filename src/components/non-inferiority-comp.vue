<template id="noninferiority-comp">
  <div
    class="pc-block pc-block--noninferiority"
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

    <div class="pc-header">Acceptable Cost</div>

    <ul class="pc-inputs">
      <li class="pc-input-item pc-input-left">
        <label>
          <span class="pc-input-title"
            >Relative <small class="pc-input-sub-title">change</small></span
          >

          <pc-block-field
            class="pc-input-field"
            fieldProp="thresholdRelative"
            suffix="%"
            :fieldValue.sync="thresholdRelative"
            :fieldFromBlock="fieldFromBlock"
            :isBlockFocused="isBlockFocused"
            :isReadOnly="isBlockFocused"
            enableEdit="true"
          ></pc-block-field>
        </label>
      </li>

      <li class="pc-input-item pc-input-right">
        <label>
          <span class="pc-input-title"
            >Absolute
            <small v-if="!onlyTotalVisitors" class="pc-input-sub-title"
              >impact per day</small
            ></span
          >

          <pc-block-field
            class="pc-input-field"
            fieldProp="thresholdAbsolute"
            suffix=""
            :fieldValue.sync="thresholdAbsolute"
            :fieldFromBlock="fieldFromBlock"
            :isBlockFocused="isBlockFocused"
            :isReadOnly="isBlockFocused"
            enableEdit="true"
          ></pc-block-field>
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import pcBlock from './pc-block.vue'
import { TRAFFIC_MODE, FOCUS, SELECTED } from '../store/modules/calculator'

const DEBOUNCE = 500

export default {
  extends: pcBlock,
  template: '#base-comp',
  data: () => ({
    relativeDebouncer: null,
    absoluteDebouncer: null,
  }),
  computed: {
    CHANGE: () => CHANGE,
    FOCUS: () => FOCUS,
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
    enabled() {
      return this.$store.getters.isNonInferiority
    },
    thresholdRelative: {
      get() {
        return this.$store.getters.relativeThreshold
      },
      set(threshold) {
        if (this.focusedBlock === FOCUS.SAMPLE) {
          if (this.relativeDebouncer != null)
            clearTimeout(this.relativeDebouncer)
          this.relativeDebouncer = setTimeout(() => {
            this.$emit('update:selected', SELECTED.RELATIVE)
            this.$store.commit('SET_THRESHOLD', {
              threshold,
              isAbsolute: false,
              lockedField: this.lockedField,
            })
          }, DEBOUNCE)
        }
      },
    },
    thresholdAbsolute: {
      get() {
        return this.$store.getters.absoluteThreshold
      },
      set(threshold) {
        if (this.focusedBlock === FOCUS.SAMPLE) {
          if (this.absoluteDebouncer != null)
            clearTimeout(this.absoluteDebouncer)
          this.absoluteDebouncer = setTimeout(() => {
            this.$emit('update:selected', SELECTED.ABSOLUTE)
            this.$store.commit('SET_THRESHOLD', {
              threshold,
              isAbsolute: true,
              lockedField: this.lockedField,
            })
          }, DEBOUNCE)
        }
      },
    },
    onlyTotalVisitors() {
      return this.$store.getters.trafficMode === TRAFFIC_MODE.TOTAL
    },
    testType() {
      return this.$store.getters.testType
    },
  },
}
</script>

<style>
.pc-non-inf-select {
  --base-padding: 5px;
  font-size: inherit;
  line-height: 28px;
  border: none;
  display: block;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  filter: drop-shadow(0 4px 2px rgba(0, 0, 0, 0.1));
  border-radius: 5px;
  background: var(--white);
  padding: var(--base-padding);

  overflow: hidden;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.pc-non-inf-select:focus {
  outline: 0;
  box-shadow: inset 0 0 0 1px var(--dark-blue);
}

.pc-non-inf-select-wrapper {
  position: relative;
}

.pc-non-inf-select-wrapper:after {
  --border-size: 7px;
  content: '';
  position: absolute;
  right: 5px;
  bottom: 0;
  pointer-events: none;
  border: var(--border-size) solid transparent;
  border-top: var(--border-size) solid var(--gray);
  transform: translateY(calc(-50% - var(--border-size) / 2));
}

.no-sub-title {
  margin: 15px 0 10px 0;
}
</style>
