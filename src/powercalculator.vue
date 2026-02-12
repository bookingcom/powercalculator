<template>
  <div class="power-calculator">
    <form action="." class="pc-form">
      <div class="pc-main-header">
        <div class="pc-controls-left">
          <div class="pc-test-type">
            <pc-tooltip class="pc-test-type-tooltip-wrapper">
              <label class="pc-test-type-labels" slot="text">
                <input
                  :value="TEST_TYPE.BINOMIAL"
                  name="test-mode"
                  tabindex="-1"
                  type="radio"
                  v-model="testType"
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
                  :value="TEST_TYPE.CONTINUOUS"
                  name="test-mode"
                  tabindex="-1"
                  type="radio"
                  v-model="testType"
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
                :value="TRAFFIC_MODE.DAILY"
                checked
                name="traffic-mode"
                tabindex="-1"
                type="radio"
                v-model="trafficMode"
              />
              Daily traffic
            </label>
            <label class="pc-traffic-mode-labels" slot="text">
              <input
                :value="TRAFFIC_MODE.TOTAL"
                name="traffic-mode"
                tabindex="-1"
                type="radio"
                v-model="trafficMode"
              />
              Total traffic
            </label>
          </div>

          <div class="pc-non-inferiority">
            <label class="pc-non-inf-label">
              <input type="checkbox" v-model="isNonInferiority" tabindex="-1" />
              Use non inferiority test
            </label>
          </div>

          <div class="pc-comparison-mode">
            <label class="pc-comparison-mode-labels" slot="text">
              <input
                :value="COMPARISON_MODE.ALL"
                name="comparison-mode"
                tabindex="-1"
                type="radio"
                v-model="comparisonMode"
              />
              Base vs All variants
            </label>
            <label class="pc-traffic-mode-labels" slot="text">
              <input
                :value="COMPARISON_MODE.ONE"
                name="comparison-mode"
                tabindex="-1"
                type="radio"
                v-model="comparisonMode"
              />
              Base vs One variant
            </label>
          </div>
        </div>

        <div class="pc-title">
          Power Calculator <sup style="color: #f00; font-size: 11px">β</sup>
        </div>

        <div class="pc-controls-right">
          <label class="pc-variants">
            <pc-block-field
              :enableEdit="true"
              :fieldValue.sync="variants"
              class="pc-variants-input"
              fieldProp="variants"
              prefix="base + "
              tabindex="-1"
            ></pc-block-field>
            variant{{ variants > 1 ? 's' : '' }}
          </label>

          <label class="pc-false-positive">
            <pc-block-field
              :class="{ 'pc-top-fields-error': falsePositiveRate > 10 }"
              :enableEdit="true"
              :fieldValue.sync="falsePositiveRate"
              class="pc-false-positive-input"
              fieldProp="falsePositiveRate"
              suffix="%"
              tabindex="-1"
            ></pc-block-field>
            <div class="double-row">
              <span>false positive rate</span>
              <small>({{ isNonInferiority ? "one" : "two" }}-sided)</small></div>
          </label>

          <label class="pc-power">
            <pc-block-field
              :class="{ 'pc-top-fields-error': power < 80 }"
              :enableEdit="true"
              :fieldValue.sync="power"
              class="pc-power-input"
              fieldProp="power"
              suffix="%"
              tabindex="-1"
            ></pc-block-field>
            power
          </label>
        </div>
      </div>

      <div
        class="pc-blocks-wrapper"
        :class="{ 'pc-blocks-wrapper-ttest': testType === 'tTest' }"
      >
        <base-comp
          :blockName="FOCUS.BASE"
          :focusedBlock="focusedBlock"
          :lockedField="lockedField"
        >
        </base-comp>

        <sample-comp
          :blockName="FOCUS.SAMPLE"
          :focusedBlock.sync="focusedBlock"
          :lockedField.sync="lockedField"
        >
        </sample-comp>

        <impact-comp
          v-if="!isNonInferiority"
          :blockName="FOCUS.IMPACT"
          :focusedBlock.sync="focusedBlock"
          @update:selected="selected = $event"
          :lockedField="lockedField"
        >
        </impact-comp>

        <non-inferiority-comp
          v-if="isNonInferiority"
          :blockName="FOCUS.IMPACT"
          :focusedBlock.sync="focusedBlock"
          @update:selected="selected = $event"
          :lockedField="lockedField"
        >
        </non-inferiority-comp>
      </div>
    </form>
  </div>
</template>

<script>
import baseComp from './components/base-comp.vue'
import impactComp from './components/impact-comp.vue'
import nonInferiorityComp from './components/non-inferiority-comp.vue'
import pcBlockField from './components/pc-block-field.vue'
import pcTooltip from './components/pc-tooltip.vue'
import sampleComp from './components/sample-comp.vue'

import {
  TEST_TYPE,
  TRAFFIC_MODE,
  COMPARISON_MODE,
  SELECTED,
  FOCUS,
  BLOCKED,
} from './store/modules/calculator'

export default {
  props: ['parentmetricdata'],
  data() {
    // values if parent component sends them
    const importedData = JSON.parse(JSON.stringify(this.parentmetricdata || {}))
    const data = {
      focusedBlock: importedData.calculateProp || FOCUS.SAMPLE,
      lockedField: importedData.lockedField || BLOCKED.DAYS,
      selected: importedData.selected || SELECTED.RELATIVE,
    }

    return data
  },
  created() {
    const importedData = JSON.parse(JSON.stringify(this.parentmetricdata || {}))

    if (
      importedData.lockedField &&
      Object.values(BLOCKED).includes(importedData.lockedField)
    ) {
      this.lockedField = importedData.lockedField
    }

    if (
      importedData.focusedBlock &&
      Object.values(FOCUS).includes(importedData.focusedBlock)
    ) {
      this.focusedBlock = importedData.focusedBlock
    }

    if (
      importedData.selected &&
      Object.values(SELECTED).includes(importedData.selected)
    ) {
      this.selected = importedData.selected
    }

    // Import the metrics.
    this.$store.commit('SET_IMPORTED_METRICS', importedData)
    // Recalculate possible missing values.
    this.refreshValues()
    // Trigger the update event.
    this.updateMetrics()
    this.$store.subscribe(() => {
      this.updateMetrics()
    })
  },

  computed: {
    // Constants
    TEST_TYPE: () => TEST_TYPE,
    TRAFFIC_MODE: () => TRAFFIC_MODE,
    COMPARISON_MODE: () => COMPARISON_MODE,
    FOCUS: () => FOCUS,

    // Getters
    isNonInferiority: {
      get() {
        return this.$store.getters.isNonInferiority
      },
      set(val) {
        this.$store.commit('SET_IS_NON_INFERIORITY', val)
        this.refreshValues()
        this.updateMetrics()
      },
    },
    falsePositiveRate: {
      get() {
        return this.$store.getters.falsePositiveRate
      },
      set(val) {
        this.$store.commit('SET_FALSE_POSITIVE_RATE', val)
        this.refreshValues()
        this.updateMetrics()
      },
    },
    power: {
      get() {
        return this.$store.getters.targetPower
      },
      set(val) {
        this.$store.commit('SET_TARGET_POWER', val)
        this.refreshValues()
        this.updateMetrics()
      },
    },
    variants: {
      get() {
        return this.$store.getters.variants
      },
      set(val) {
        this.$store.commit('SET_VARIANTS', val)
        this.refreshValues()
        this.updateMetrics()
      },
    },
    testType: {
      get() {
        return this.$store.getters.testType
      },
      set(val) {
        this.$store.commit('SET_TEST_TYPE', {
          testType: val,
          focused: this.focusedBlock,
          lockedField: this.lockedField,
        })
        this.updateMetrics()
      },
    },
    comparisonMode: {
      get() {
        return this.$store.getters.comparisonMode
      },
      set(val) {
        this.$store.commit('SET_COMPARISON_MODE', val)
        this.refreshValues()
        this.updateMetrics()
      },
    },
    trafficMode: {
      get() {
        return this.$store.getters.trafficMode
      },
      set(val) {
        this.$store.commit('SET_TRAFFIC_MODE', val)
        this.refreshValues()
        this.updateMetrics()
      },
    },
  },
  methods: {
    refreshValues() {
      this.$store.commit('SET_BASE_RATE', {
        baseRate: this.$store.getters.baseRate,
        lockedField: this.lockedField,
        focusedBlock: this.focusedBlock,
      })
    },
    updateMetrics() {
      this.$emit('update:metricdata', {
        testType: this.$store.getters.testType,
        focusedBlock: this.focusedBlock,
        sample: this.$store.getters.sample,
        baseRate: this.$store.getters.baseRate,
        impact: this.$store.getters.relativeImpact(!this.$store.getters.isNonInferiority &&
            this.focusedBlock !== FOCUS.IMPACT),
        relativeImpact: this.$store.getters.relativeImpact(!this.$store.getters.isNonInferiority &&
            this.focusedBlock !== FOCUS.IMPACT),
        absoluteImpact: this.$store.getters.absoluteImpact(!this.$store.getters.isNonInferiority &&
            this.focusedBlock !== FOCUS.IMPACT),
        targetPower: this.$store.getters.targetPower,
        falsePositiveRate: this.$store.getters.falsePositiveRate,
        standardDeviation: this.$store.getters.standardDeviation,
        runtime: this.$store.getters.runtime,
        visitorsPerDay: this.$store.getters.visitorsPerDay,
        threshold: this.$store.getters.relativeThreshold(this.$store.getters.isNonInferiority &&
            this.focusedBlock !== FOCUS.IMPACT),
        absoluteThreshold: this.$store.getters.absoluteThreshold(this.$store.getters.isNonInferiority &&
            this.focusedBlock !== FOCUS.IMPACT),
        relativeThreshold: this.$store.getters.relativeThreshold(this.$store.getters.isNonInferiority &&
            this.focusedBlock !== FOCUS.IMPACT),
        variants: this.$store.getters.variants,
        comparisonMode: this.$store.getters.comparisonMode,
        trafficMode: this.$store.getters.trafficMode,
        lockedField: this.lockedField,
        selected: this.selected,
        isNonInferiority: this.$store.getters.isNonInferiority,
        // expId:              'exp_id',
      })
    },
  },

  components: {
    'pc-block-field': pcBlockField,
    'pc-tooltip': pcTooltip,
    'sample-comp': sampleComp,
    'impact-comp': impactComp,
    'base-comp': baseComp,
    'non-inferiority-comp': nonInferiorityComp,
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

.pc-false-positive {
  display: flex;
  gap: 5px;
}

.pc-false-positive .double-row {
  display: flex;
  flex-flow: column;
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

.pc-non-inf-label {
  white-space: nowrap;
}

.pc-non-inf-treshold {
  display: flex;
  align-items: center;
}

.pc-non-inf-treshold-input {
  margin-left: 5px;
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
