<template id="sample-comp">
  <div
    class="pc-block pc-block--sample"
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
      class="pc-calc-radio pc-calc-radio--sample"
      :class="{ 'pc-calc-radio--active': focusedBlock === blockName }"
    >
      <input type="radio" :value="blockName" v-model="isSelected" />
      {{ focusedBlock === blockName ? 'Calculating' : 'Calculate' }}
    </label>

    <div class="pc-header">Sample Size</div>

    <ul class="pc-inputs" :class="{ 'pc-inputs-no-grid': onlyTotalVisitors }">
      <li class="pc-input-item pc-input-left">
        <label>
          <span class="pc-input-title"
            >Total #
            <small class="pc-input-sub-title">of new visitors</small></span
          >

          <pc-block-field
            fieldProp="sample"
            :fieldValue.sync="sample"
            :isReadOnly="focusedBlock === blockName"
            enableEdit="true"
          ></pc-block-field>
        </label>
      </li>
      <li
        class="pc-input-item pc-input-right pc-value-field--lockable"
        :class="[
          getLockedStateClass(BLOCKED.VISITORS_PER_DAY),
          { 'pc-hidden': onlyTotalVisitors },
        ]"
      >
        <label>
          <span class="pc-input-title"
            >Daily #
            <small class="pc-input-sub-title">of new visitors</small></span
          >

          <pc-block-field
            fieldProp="visitorsPerDay"
            :fieldValue.sync="visitorsPerDay"
            :isReadOnly="lockedField === BLOCKED.VISITORS_PER_DAY"
            :isBlockFocused="focusedBlock === blockName"
            enableEdit="true"
            v-bind:lockedField="lockedField"
          ></pc-block-field>
        </label>

        <button
          type="button"
          class="pc-swap-button"
          v-on:click="switchLockedField"
        >
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 20 20"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
          >
            <desc>
              Lock
              {{
                lockedField === BLOCKED.DAYS
                  ? 'number of days'
                  : 'visitors per day'
              }}
            </desc>
            <defs>
              <circle id="path-1" cx="13" cy="13" r="10"></circle>
              <filter
                x="-5.0%"
                y="-5.0%"
                width="110.0%"
                height="110.0%"
                filterUnits="objectBoundingBox"
                id="filter-2"
              >
                <feGaussianBlur
                  stdDeviation="0.5"
                  in="SourceAlpha"
                  result="shadowBlurInner1"
                ></feGaussianBlur>
                <feOffset
                  dx="0"
                  dy="1"
                  in="shadowBlurInner1"
                  result="shadowOffsetInner1"
                ></feOffset>
                <feComposite
                  in="shadowOffsetInner1"
                  in2="SourceAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
                  result="shadowInnerInner1"
                ></feComposite>
                <feColorMatrix
                  values="0 0 0 0 0.489716199   0 0 0 0 0.489716199   0 0 0 0 0.489716199  0 0 0 0.5 0"
                  type="matrix"
                  in="shadowInnerInner1"
                ></feColorMatrix>
              </filter>
            </defs>
            <g
              id="Page-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <g
                id="Power-Calculator"
                transform="translate(-550.000000, -522.000000)"
              >
                <g id="Switcher" transform="translate(547.000000, 519.000000)">
                  <g id="Oval-3">
                    <use
                      fill="#EFEFEF"
                      fill-rule="evenodd"
                      xlink:href="#path-1"
                    ></use>
                    <use
                      fill="black"
                      fill-opacity="1"
                      filter="url(#filter-2)"
                      xlink:href="#path-1"
                    ></use>
                  </g>
                  <g
                    id="Group"
                    stroke-width="1"
                    fill-rule="evenodd"
                    transform="translate(7.000000, 7.000000)"
                    fill="#155EAB"
                  >
                    <path
                      d="M4.5,4.20404051 L4.5,9.9127641 L2.5,9.9127641 L2.5,4.20404051 L0.5,4.20404051 L3.5,0.70872359 L6.5,4.20404051 L4.5,4.20404051 Z"
                      id="Combined-Shape"
                    ></path>
                    <path
                      d="M9.5,5.49531692 L9.5,11.2040405 L7.5,11.2040405 L7.5,5.49531692 L5.5,5.49531692 L8.5,2 L11.5,5.49531692 L9.5,5.49531692 Z"
                      id="Combined-Shape"
                      transform="translate(8.500000, 6.602020) scale(1, -1) translate(-8.500000, -6.602020) "
                    ></path>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </button>
      </li>
      <li
        class="pc-input-item pc-input-right-swap pc-value-field--lockable"
        :class="[
          getLockedStateClass(BLOCKED.DAYS),
          { 'pc-hidden': onlyTotalVisitors },
        ]"
      >
        <label>
          <pc-block-field
            fieldProp="runtime"
            prefix=""
            suffix=" days"
            :fieldValue.sync="runtime"
            v-bind:isReadOnly="lockedField === BLOCKED.DAYS"
            v-bind:isBlockFocused="focusedBlock === blockName"
            enableEdit="true"
            v-bind:lockedField="lockedField"
            aria-label="Days"
          ></pc-block-field>
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import pcBlock from './pc-block.vue'
import { TRAFFIC_MODE } from '../store/modules/calculator'

const BLOCKED = Object.freeze({
  VISITORS_PER_DAY: 'visitorsPerDay',
  DAYS: 'days',
})

const DEBOUNCE = 500

export default {
  props: ['focusedBlock', 'blockName'],
  template: '#sample-comp',
  extends: pcBlock,
  data() {
    return {
      lockedField: BLOCKED.DAYS,
      runtimeDebouncer: null,
      visitorsPerDayDebouncer: null,
      sampleDebouncer: null,
    }
  },
  computed: {
    BLOCKED: () => BLOCKED,
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
    sample: {
      get() {
        return this.$store.getters.sample
      },
      set(val) {
        if (this.sampleDebouncer != null) {
          clearTimeout(this.visitorsPerDay)
        }
        setTimeout(() => {
          if (
            this.focusedBlock !== this.blockName &&
            val !== this.$store.getters.sample
          ) {
            if (this.lockedField === BLOCKED.DAYS) {
              this.$store.commit(
                'SET_SAMPLE_AND_RUNTIME_WITH_IMPACT_BY_FIXED_VISITORS_PER_DAY',
                val
              )
            } else {
              this.$store.commit(
                'SET_SAMPLE_AND_VISITORS_PER_DAY_WITH_IMPACT_BY_FIXED_RUNTIME',
                val
              )
            }
          }
        }, DEBOUNCE)
      },
    },
    visitorsPerDay: {
      get() {
        return this.$store.getters.visitorsPerDay
      },
      set(val) {
        if (this.visitorsPerDayDebouncer != null) {
          clearTimeout(this.visitorsPerDayDebouncer)
        }
        setTimeout(() => {
          // Calculating sample
          if (
            this.lockedField === BLOCKED.DAYS &&
            val !== this.$store.getters.visitorsPerDay
          ) {
            if (this.focusedBlock === this.blockName) {
              this.$store.commit(
                'SET_VISITORS_PER_DAY_AND_RUNTIME_BY_FIXED_SAMPLE',
                val
              )
              // Calculating impact
            } else {
              this.$store.commit(
                'SET_VISITORS_PER_DAY_AND_SAMPLE_WITH_IMPACT_BY_FIXED_RUNTIME',
                val
              )
            }
          }
        }, DEBOUNCE)
      },
    },
    runtime: {
      get() {
        return this.$store.getters.runtime
      },
      set(val) {
        if (this.runtimeDebouncer != null) {
          clearTimeout(this.runtimeDebouncer)
        }

        this.runtimeDebouncer = setTimeout(() => {
          if (
            this.lockedField === BLOCKED.VISITORS_PER_DAY &&
            val !== this.$store.getters.runtime
          ) {
            // Calculating this block (sample)
            if (this.focusedBlock === this.blockName) {
              this.$store.commit(
                'SET_RUNTIME_AND_VISITORS_PER_DAY_BY_FIXED_SAMPLE',
                val
              )
              // Calculating some other block (impact/non-inf)
            } else {
              this.$store.commit(
                'SET_RUNTIME_AND_SAMPLE_WITH_IMPACT_BY_FIXED_VISITORS_PER_DAY',
                val
              )
            }
          }
        }, DEBOUNCE)
      },
    },
    onlyTotalVisitors() {
      return this.$store.getters.trafficMode === TRAFFIC_MODE.TOTAL
    },
  },
  methods: {
    switchLockedField() {
      if (this.lockedField === BLOCKED.DAYS) {
        this.lockedField = BLOCKED.VISITORS_PER_DAY
      } else {
        this.lockedField = BLOCKED.DAYS
      }
    },
    getLockedStateClass(param) {
      return this.lockedField == param
        ? 'pc-value-field--locked'
        : 'pc-value-field--unlocked'
    },
  },
}
</script>

<style>
.pc-swap-button {
  -webkit-appearance: none;
  background: none;
  border: 0;
  margin: 0;
  padding: 0;
  position: absolute;
  top: calc(100% - 10px);
  left: 5px;
  z-index: 5;
}

.pc-value-field--unlocked .pc-value-field-wrapper {
  z-index: 1;
}

.pc-block-to-calculate .pc-value-field--locked .pc-value-formatting:before,
.pc-block-to-calculate .pc-value-field--locked .pc-value-formatting:after,
.pc-value-field--locked .pc-value-formatting:before,
.pc-value-field--locked .pc-value-formatting:after,
.pc-value-field--locked .pc-value-field-wrapper {
  color: var(--dark-gray);
}
</style>

<style scoped>
.pc-inputs {
  grid-template-areas:
    'pc-input-left pc-input-right'
    'pc-input-left-swap pc-input-right-swap';
}

.pc-input-right-swap,
.pc-input-right {
  position: relative;
}

.pc-input-right-swap {
  grid-area: pc-input-right-swap;
  margin-top: -10px;
  filter: drop-shadow(0 4px 2px rgba(0, 0, 0, 0.1))
    drop-shadow(0 -4px 2px rgba(0, 0, 0, 0.1));
}

.pc-input-right-swap .pc-value-field-wrapper {
  filter: none;
}

.pc-value-formatting:after {
  font-size: 14px;
}

.pc-block-to-calculate .pc-field-visitorsPerDay,
.pc-block-to-calculate .pc-field-runtime {
  background: var(--white);
}

.pc-value-field--lockable.pc-value-field--locked .pc-value-field-wrapper {
  background: linear-gradient(0deg, var(--light-gray) 0%, var(--white) 100%);
}

.pc-inputs-no-grid {
  display: block;
}
</style>
