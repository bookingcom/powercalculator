<template>
  <div class="power-calculator">
    <form action="." class="pc-form">
      <div class="pc-main-header">
        <div class="pc-controls-left">
          <div class="pc-test-type">
            <pc-tooltip class="pc-test-type-tooltip-wrapper">
              <label class="pc-test-type-labels" slot="text">
                <input
                  type="radio"
                  name="test-mode"
                  v-model="testType"
                  :value="TEST_TYPE.BINOMIAL"
                />
                Binomial Metric
              </label>
              <span slot="tooltip">
                A binomial metric is one that can be only two values like 0 or
                1, yes or no, converted or not converted
              </span>
            </pc-tooltip>

            <pc-tooltip class="pc-test-type-tooltip-wrapper">
              <label class="pc-test-type-labels" slot="text">
                <input
                  type="radio"
                  name="test-mode"
                  v-model="testType"
                  :value="TEST_TYPE.CONTINUOUS"
                />
                Continuous Metric
              </label>
              <span slot="tooltip">
                A continuous metric is one that can be any number like time on
                site or the number of rooms sold
              </span>
            </pc-tooltip>
          </div>

          <div class="pc-traffic-mode">
            <label class="pc-traffic-mode-labels" slot="text">
              <input
                type="radio"
                name="traffic-mode"
                v-model="trafficMode"
                :value="TRAFFIC_MODE.DAILY"
                checked
              />
              Daily traffic
            </label>
            <label class="pc-traffic-mode-labels" slot="text">
              <input
                type="radio"
                name="traffic-mode"
                v-model="trafficMode"
                :value="TRAFFIC_MODE.TOTAL"
              />
              Total traffic
            </label>
          </div>

          <non-inferiority></non-inferiority>

          <div class="pc-comparison-mode">
            <label class="pc-comparison-mode-labels" slot="text">
              <input
                type="radio"
                name="comparison-mode"
                v-model="comparisonMode"
                :value="COMPARISON_MODE.ALL"
              />
              Base vs All variants
            </label>
            <label class="pc-traffic-mode-labels" slot="text">
              <input
                type="radio"
                name="comparison-mode"
                v-model="comparisonMode"
                :value="COMPARISON_MODE.ONE"
              />
              Base vs One variant
            </label>
          </div>
        </div>

        <div class="pc-title">
          Power Calculator <sup style="color: #f00; font-size: 11px">BETA</sup>
        </div>

        <div class="pc-controls-right">
          <label class="pc-variants">
            <pc-block-field
              class="pc-variants-input"
              fieldProp="variants"
              prefix="base + "
              :fieldValue.sync="variants"
              enableEdit="true"
            ></pc-block-field>
            variant{{ variants > 1 ? 's' : '' }}
          </label>

          <label class="pc-false-positive">
            <pc-block-field
              class="pc-false-positive-input"
              :class="{ 'pc-top-fields-error': falsePositiveRate > 10 }"
              suffix="%"
              fieldProp="falsePositiveRate"
              :fieldValue.sync="falsePositiveRate"
              enableEdit="true"
            ></pc-block-field>
            false positive rate
          </label>

          <label class="pc-power">
            <pc-block-field
              class="pc-power-input"
              suffix="%"
              :class="{ 'pc-top-fields-error': power < 80 }"
              fieldProp="power"
              :fieldValue.sync="power"
              enableEdit="true"
            ></pc-block-field>
            power
          </label>
        </div>
      </div>

      <div
        class="pc-blocks-wrapper"
        :class="{ 'pc-blocks-wrapper-ttest': testType == 'tTest' }"
      >
        <base-comp
          fieldFromBlock="base"
          :isBlockFocused="focusedBlock == FOCUS.SAMPLE"
          v-bind:enableEdit="enabledMainInputs.base"
          v-on:update:focus="updateFocus"
        >
        </base-comp>

        <sample-comp
          fieldFromBlock="sample"
          v-bind:enableEdit="enabledMainInputs.sample"
          v-bind:isBlockFocused="focusedBlock === FOCUS.SAMPLE"
          v-on:update:focus="updateFocus"
        >
        </sample-comp>

        <impact-comp
          v-if="!isNonInferiority"
          fieldFromBlock="impact"
          v-bind:enableEdit="enabledMainInputs.impact"
          v-bind:isBlockFocused="focusedBlock == FOCUS.IMPACT"
          v-on:update:focus="updateFocus"
        >
        </impact-comp>

        <non-inferiority-comp
          v-if="isNonInferiority"
          fieldFromBlock="non-inferiority"
          v-bind:enableEdit="enabledMainInputs['non-inferiority']"
          v-bind:isBlockFocused="focusedBlock == 'non-inferiority'"
          v-on:update:focus="updateFocus"
        >
        </non-inferiority-comp>

        <!-- <svg-graph></svg-graph> -->
      </div>
    </form>
  </div>
</template>

<script>
import baseComp from './components/base-comp.vue'
import impactComp from './components/impact-comp.vue'
import nonInferiority from './components/non-inferiority.vue'
import nonInferiorityComp from './components/non-inferiority-comp.vue'
import pcBlockField from './components/pc-block-field.vue'
import pcTooltip from './components/pc-tooltip.vue'
import sampleComp from './components/sample-comp.vue'
import svgGraph from './components/svg-graph.vue'

import {
  TEST_TYPE,
  TRAFFIC_MODE,
  COMPARISON_MODE,
} from './store/modules/calculator'

const FOCUS = Object.freeze({
  SAMPLE: 'sample',
  IMPACT: 'impact'
})

export default {
  props: ['parentmetricdata'],
  data() {
    // values if parent component sends them
    let importedData = this.parentmetricdata || {}

    const data = {
      focusedBlock: FOCUS.SAMPLE,

      // false means the editable ones are the secondary mode (metric totals, days&daily trials and absolute impact)
      enabledMainInputs: {
        base: true,
        sample: true,
        impact: true,
        power: true,
        'non-inferiority': true,
      },
    }

    // mergeComponentData has no array support for now
    return this.mergeComponentData(
      data,
      JSON.parse(JSON.stringify(importedData))
    )
  },
  computed: {
    // Constants
    TEST_TYPE: () => TEST_TYPE,
    TRAFFIC_MODE: () => TRAFFIC_MODE,
    COMPARISON_MODE: () => COMPARISON_MODE,
    FOCUS: () => FOCUS,

    // in case parent component needs this information
    metricData() {
      let result = {
        testType: this.testType,
        calculateProp: this.calculateProp,
        view: this.view,
        lockedField: this.lockedField,
        // nonInferiority: this.nonInferiority,
        comparisonMode: this.comparisonMode,
      }
      return JSON.parse(JSON.stringify(result))
    },
    isNonInferiority() {
      return this.$store.getters.isNonInferiority
    },
    falsePositiveRate: {
      get() {
        return this.$store.getters.falsePositiveRate
      },
      set(val) {
        this.$store.commit('SET_FALSE_POSITIVE_RATE', val)
      },
    },
    power: {
      get() {
        return this.$store.getters.targetPower
      },
      set(val) {
        this.$store.commit('SET_TARGET_POWER', val)
      },
    },
    variants: {
      get() {
        return this.$store.getters.variants
      },
      set(val) {
        this.$store.commit('SET_VARIANTS', val)
      },
    },
    testType: {
      get() {
        return this.$store.getters.testType
      },
      set(val) {
        this.$store.commit('SET_TEST_TYPE', val)
      },
    },
    comparisonMode: {
      get() {
        return this.$store.getters.comparisonMode
      },
      set(val) {
        this.$store.commit('SET_COMPARISON_MODE', val)
      },
    },
    trafficMode: {
      get() {
        return this.$store.getters.trafficMode
      },
      set(val) {
        this.$store.commit('SET_TRAFFIC_MODE', val)
      },
    },
  },
  methods: {
    updateFocus({ fieldProp, value }) {
      if (this.focusedBlock == fieldProp && value === false) {
        this.focusedBlock = ''
      } else if (value === true) {
        this.focusedBlock = fieldProp
      }
    },
    mergeComponentData(base, toClone) {
      // merges default data with imported one from parent component
      let result = recursive(base, toClone)

      // no array support for now
      function recursive(baseRef, cloneRef) {
        Object.keys(cloneRef).forEach((prop) => {
          if (typeof cloneRef[prop] == 'object') {
            baseRef[prop] = recursive(baseRef[prop], cloneRef[prop])
          } else {
            baseRef[prop] = cloneRef[prop]
          }
        })

        return baseRef
      }

      return result
    },
  },
  watch: {
    // in case parent component needs this information
    metricData() {
      this.$emit('update:metricdata', this.metricData)
    },
  },
  components: {
    'svg-graph': svgGraph,
    'pc-block-field': pcBlockField,
    'pc-tooltip': pcTooltip,
    'sample-comp': sampleComp,
    'impact-comp': impactComp,
    'base-comp': baseComp,
    'non-inferiority': nonInferiority,
    'non-inferiority-comp': nonInferiorityComp
  },
}
</script>

<style>
/* application styles */

/* colors */

.power-calculator {
  --white: #fff;
  --black: #000;

  --gray: #b5b5b5;
  --light-gray: #f0f0f0;
  --dark-gray: #525252;

  --light-blue: #c1cfd8;
  --pale-blue: #7898ae;
  --blue: #155eab;
  --dark-blue: #3d78df;

  --light-yellow: #fef1cb;
  --dark-yellow: #e2b634;
  --fade-black: rgba(0, 0, 0, 0.3);

  --red: #f00;
}

/* layout */

.pc-main-header {
  display: grid;
  grid-template-columns: 33.33% 33.33% 33.33%;
  grid-template-rows: auto;
  grid-template-areas: 'controls-left title controls-right';
  align-items: center;

  margin: 25px 10px;
}

.pc-controls-left {
  grid-area: controls-left;
  display: grid;
  grid-template-columns: min-content min-content min-content;
  grid-template-rows: 2;
  grid-template-areas:
    'calc-options calc-options calc-options'
    'test-type traffic comparison';
  align-items: center;
}

.pc-controls-right {
  grid-area: controls-right;
  display: grid;
  grid-template-columns: auto min-content min-content;
  grid-template-rows: auto;
  grid-template-areas: 'variants false-positive power';
  align-items: center;
  justify-items: end;
}

.pc-title {
  grid-area: title;
  font-size: 30px;
  text-align: center;
}

.pc-traffic-mode {
  grid-area: traffic;
}

.pc-non-inf-label,
.pc-test-type,
.pc-false-positive,
.pc-power,
.pc-traffic-mode,
.pc-variants,
.pc-comparison-mode {
  font-size: 0.8em;
}

.pc-test-type {
  grid-area: test-type;
}

.pc-non-inferiority {
  grid-area: calc-options;
  margin-bottom: 8px;
}

.pc-comparison-mode {
  grid-area: comparison;
}

.pc-test-type-labels,
.pc-traffic-mode-labels,
.pc-non-inf-label,
.pc-comparison-mode-label {
  white-space: nowrap;
}

.pc-non-inferiority,
.pc-test-type,
.pc-traffic-mode,
.pc-comparison-mode {
  margin-left: 15px;
}

.pc-test-type-tooltip-wrapper {
  display: inline-block;
}

.pc-variants {
  grid-area: variants;
  white-space: nowrap;
  align-self: end;
}

.pc-false-positive {
  grid-area: false-positive;
  margin-left: 15px;
  white-space: nowrap;
  align-self: end;
}

.pc-power {
  grid-area: power;
  margin-left: 15px;
  margin-right: 15px;
  white-space: nowrap;
  align-self: end;
}

.pc-blocks-wrapper {
  grid-area: pc-blocks-wrapper;
  display: grid;
  grid-template-columns: 33% 33% 33%;
  grid-template-rows: auto;
  grid-template-areas:
    'block-base block-sample block-impact'
    'block-graph block-graph block-graph';
  grid-template-rows: auto;
  grid-column-gap: 8px;
  grid-row-gap: 8px;
}

.pc-block--base {
  grid-area: block-base;
}

.pc-block--sample {
  grid-area: block-sample;
}

.pc-block--impact {
  grid-area: block-impact;
}

.pc-block--graph {
  grid-area: block-graph;
}

/* blocks */

.pc-block {
  background: var(--light-gray);
}

.pc-header {
  color: var(--white);
  text-align: center;
  font-size: 28px;
  line-height: 80px;
  height: 80px;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.29);
  background: var(--pale-blue);
  margin-bottom: 25px;
}

.pc-calculate {
  display: inline-block;
  margin-bottom: 25px;
  font-weight: bold;
  font-size: 0.8em;
}

.pc-value {
  display: block;
  margin-bottom: 25px;
}

/* block to calculate override rules*/

.pc-block-to-calculate {
  background: var(--light-yellow);
}

.pc-block-to-calculate .pc-header {
  background: var(--dark-yellow);
}

.pc-hidden {
  display: none !important;
}
</style>
