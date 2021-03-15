import math from '../../js/math'

export const TEST_TYPE = Object.freeze({
  CONTINUOUS: 'tTest',
  BINOMIAL: 'gTest'
})

export const TRAFFIC_MODE = Object.freeze({
  DAILY: 'daily',
  TOTAL: 'total'
})

export const COMPARISON_MODE = Object.freeze({
  ALL: 'all',
  ONE: 'one'
})

export const VALUE_TYPE = Object.freeze({
  ABSOLUTE: 'absolute',
  IMPACT: 'impact',
  RELATIVE: 'relative'
})

export const FOCUS = Object.freeze({
  SAMPLE: 'sample',
  IMPACT: 'impact',
  BASE: 'base'
})

export const BLOCKED = Object.freeze({
  VISITORS_PER_DAY: 'visitorsPerDay',
  DAYS: 'days'
})

export const CHANGE = Object.freeze({
  NO_CHANGE: 'nochange',
  DEGRADATION: 'degradation',
  IMPROVEMENT: 'improvement'
})

function displayValue(value, type = 'int') {
  const alternativeToNaN = val => (isNaN(val) || !isFinite(val) ? '-' : val)

  switch (type) {
    case 'float':
      return alternativeToNaN(parseFloat(value))
    case 'percentage':
      return alternativeToNaN(+(parseFloat(value) * 100).toFixed(2))
    case 'int':
    default:
      return alternativeToNaN(parseInt(value))
  }
}

const getAlternative = isNonInferiority =>
  isNonInferiority ? 'greater' : 'two-sided'

export const calculator = {
  state: () => ({
    // Metrics
    baseRate: 0.1, // [0..1]
    confidenceLevel: 0.9, // [0..1]
    falsePositiveRate: 0.1, // [0..1]
    targetPower: 0.8, // [0..1]
    runtime: 14,
    sample: 561364,
    standardDeviation: 0.1,
    // It would make sense to store it as variants + 1 but everywhere it uses
    // this format.
    variants: 1, // A/A = 0, A/B = 1...
    impact: 0.02, // [0..1]
    threshold: 0,

    // Configuration
    isNonInferiority: false,
    comparisonMode: COMPARISON_MODE.ALL,
    trafficMode: TRAFFIC_MODE.DAILY,
    testType: TEST_TYPE.BINOMIAL
  }),
  mutations: {
    // Configuration
    SET_VARIANTS(state, amount) {
      if (Number.isInteger(amount) && amount >= 0) state.variants = amount
      else state.variants = state.variants
    },
    // We can choose between compare the base vs one variant or vs all.
    SET_COMPARISON_MODE(state, val) {
      if (Object.values(COMPARISON_MODE).includes(val))
        state.comparisonMode = val
      else state.comparisonMode = state.comparisonMode
    },
    SET_TRAFFIC_MODE(state, val) {
      if (Object.values(TRAFFIC_MODE).includes(val)) state.trafficMode = val
      else state.trafficMode = state.trafficMode
    },
    // In the UI is [0,100], in the store is [0,1]
    SET_FALSE_POSITIVE_RATE(state, rate) {
      if (rate >= 0 && rate <= 100) state.falsePositiveRate = rate / 100
      else state.falsePositiveRate = state.falsePositiveRate
    },
    // In the UI is [0,100], in the store is [0,1]
    SET_TARGET_POWER(state, power) {
      if (!isNaN(power) && power >= 0 && power <= 100)
        state.targetPower = power / 100
      else state.targetPower = state.targetPower
    },
    SET_STANDARD_DEVIATION(state, stddev) {
      if (stddev >= 0) state.standardDeviation = stddev / 100
      else state.standardDeviation = state.standardDeviation
    },
    SET_IS_NON_INFERIORITY(state, flag) {
      state.isNonInferiority = !!flag
    },
    SET_TEST_TYPE(state, { type, focused, locked }) {
      if (!Object.values(TEST_TYPE).includes(type)) {
        state.testType = state.testType
        return
      }

      // We need to recalculate based on the selected fields.
      // the result will be something like [tTest/gTest][impact/sample]
      const formula = math[type][focused]
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate
      if (focused === FOCUS.SAMPLE) {
        const sample = formula({
          base_rate: state.baseRate,
          effect_size: state.impact,
          sd_rate: state.standardDeviation,
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative({ type }),
          mu: 0, // if it isn't non-inferiority, it is always 0
          opts: {} // emtpy if it isn't non-inferiority
        })

        if (locked === BLOCKED.DAYS) {
          const currentVisitorsPerDay = Math.ceil(state.sample / state.runtime)
          const newRuntime = sample / currentVisitorsPerDay

          state.runtime = newRuntime
        }
        state.sample = sample
      } else {
        const impact = formula({
          // It is totally unclear when the current engine rounds up and when it
          // doesnt.
          total_sample_size: state.sample,
          base_rate: state.baseRate, // It uses the displayed value
          sd_rate: state.standardDeviation,
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative({ type }),
          mu: 0 // if it isn't non-inferiority, it is always 0
        })
        state.impact = impact
      }

      state.testType = type
    },

    // == BASE ==
    // In the UI is [0,100], in the store is [0,1]
    SET_BASE_RATE_AND_IMPACT_BY_SAMPLE(state, baseRate) {
      if (baseRate < 0 || baseRate > 100) {
        state.baseRate = state.baseRate
      }

      const newBaseRate = baseRate / 100

      const type = state.testType
      const impactFormula = math[type].impact
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const impact = impactFormula({
        // It is totally unclear when the current engine rounds up and when it
        // doesnt.
        total_sample_size: state.sample,
        base_rate: newBaseRate, // It uses the displayed value
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0 // if it isn't non-inferiority, it is always 0
      })

      state.impact = impact
      state.baseRate = newBaseRate
    },
    SET_BASE_RATE_VISITORS_PER_DAY_AND_SAMPLE_BY_IMPACT(state, baseRate) {
      if (baseRate < 0 || baseRate > 100) {
        state.baseRate = state.baseRate
      }

      const newBaseRate = baseRate / 100

      const type = state.testType
      const sampleFormula = math[type].sample
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const sample = sampleFormula({
        base_rate: newBaseRate,
        effect_size: state.impact,
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0, // if it isn't non-inferiority, it is always 0
        opts: {} // emtpy if it isn't non-inferiority
      })

      state.sample = sample
      state.baseRate = newBaseRate
    },

    SET_BASE_RATE_RUNTIME_AND_SAMPLE_BY_IMPACT(state, baseRate) {
      if (baseRate < 0 || baseRate > 100) {
        state.baseRate = state.baseRate
      }

      const newBaseRate = baseRate / 100

      const type = state.testType
      const sampleFormula = math[type].sample
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const sample = sampleFormula({
        base_rate: newBaseRate,
        effect_size: state.impact,
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0, // if it isn't non-inferiority, it is always 0
        opts: {} // emtpy if it isn't non-inferiority
      })

      const currentVisitorsPerDay = Math.ceil(state.sample / state.runtime)
      const newRuntime = sample / currentVisitorsPerDay
      state.sample = sample
      state.baseRate = newBaseRate
      state.runtime = newRuntime
    },

    // BaseRate = MetricTotal / Sample. Only when calculating impact.
    SET_BASE_RATE_BY_METRIC_TOTAL_WITH_IMPACT(state, total) {
      if (total < 0) {
        return
      }
      const newBaseRate = total / state.sample

      state.baseRate = newBaseRate

      const type = state.testType
      const impactFormula = math[type].impact
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const impact = impactFormula({
        // It is totally unclear when the current engine rounds up and when it
        // doesnt.
        total_sample_size: state.sample,
        base_rate: newBaseRate, // It uses the displayed value
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0 // if it isn't non-inferiority, it is always 0
      })

      state.impact = impact
    },

    // == SAMPLE ==
    // Mutations when calculating the sample size (fixed sample size, variable
    // runtime, visitors per day and impact)
    SET_RUNTIME_AND_VISITORS_PER_DAY_BY_FIXED_SAMPLE(state, runtime) {
      state.runtime = runtime
    },
    SET_VISITORS_PER_DAY_AND_RUNTIME_BY_FIXED_SAMPLE(state, visitorsPerDay) {
      const currentSample = state.sample
      const days = currentSample / visitorsPerDay

      state.runtime = days
    },

    SET_RELATIVE_IMPACT_SAMPLE_AND_RUNTIME(state, { impact, isAbsolute }) {
      const newImpact =
        (isAbsolute
          ? math.getRelativeImpactFromAbsolute({
              base_rate: state.baseRate,
              absolute_effect_size: impact
            })
          : impact) / 100

      const type = state.testType
      const sampleFormula = math[type].sample
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const sample = sampleFormula({
        base_rate: state.baseRate,
        effect_size: newImpact,
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0, // if it isn't non-inferiority, it is always 0
        opts: {} // emtpy if it isn't non-inferiority
      })

      const currentVisitorsPerDay = Math.ceil(state.sample / state.runtime)
      const newRuntime = sample / currentVisitorsPerDay

      state.impact = newImpact
      state.sample = sample
      state.runtime = newRuntime
    },
    SET_RELATIVE_IMPACT_SAMPLE_AND_VISITORS_PER_DAY(
      state,
      { impact, isAbsolute }
    ) {
      const newImpact =
        (isAbsolute
          ? math.getRelativeImpactFromAbsolute({
              base_rate: state.baseRate,
              absolute_effect_size: impact
            })
          : impact) / 100

      const type = state.testType
      const sampleFormula = math[type].sample
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const sample = sampleFormula({
        base_rate: state.baseRate,
        effect_size: newImpact,
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0, // if it isn't non-inferiority, it is always 0
        opts: {} // emtpy if it isn't non-inferiority
      })

      state.impact = newImpact
      state.sample = sample
    },

    // == IMPACT ==
    SET_RUNTIME_AND_SAMPLE_WITH_IMPACT_BY_FIXED_VISITORS_PER_DAY(
      state,
      runtime
    ) {
      if (runtime < 0) {
        state.runtime = state.runtime
        return
      }
      // In the current version it uses the already rounded up value that it
      // parses from the UI. In order to get the same values, we need the round
      // up the values, but the correct right approach would be without rounding
      // up.
      const currentVisitorsPerDay = Math.ceil(state.sample / state.runtime)
      const newSample = Math.ceil(runtime * currentVisitorsPerDay)
      state.runtime = runtime
      state.sample = newSample

      const type = state.testType
      const impactFormula = math[type].impact
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const impact = impactFormula({
        // It is totally unclear when the current engine rounds up and when it
        // doesnt.
        total_sample_size: newSample,
        base_rate: state.baseRate,
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0 // if it isn't non-inferiority, it is always 0
      })

      state.impact = impact
    },
    SET_VISITORS_PER_DAY_AND_SAMPLE_WITH_IMPACT_BY_FIXED_RUNTIME(
      state,
      visitorsPerDay
    ) {
      if (visitorsPerDay < 0) {
        return
      }
      // In the current version it uses the already rounded up value that it
      // parses from the UI. In order to get the same values, we need the round
      // up the values, but the correct right approach would be without rounding
      // up.
      const newSample = Math.ceil(state.runtime * visitorsPerDay)
      state.sample = newSample

      const type = state.testType
      const impactFormula = math[type].impact
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const impact = impactFormula({
        // It is totally unclear when the current engine rounds up and when it
        // doesnt.
        total_sample_size: newSample,
        base_rate: state.baseRate,
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0 // if it isn't non-inferiority, it is always 0
      })

      state.impact = impact
    },
    SET_SAMPLE_AND_VISITORS_PER_DAY_WITH_IMPACT_BY_FIXED_RUNTIME(
      state,
      sample
    ) {
      if (sample < 0) {
        state.sample = state.sample
        return
      }
      state.sample = sample

      const type = state.testType
      const impactFormula = math[type].impact
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const impact = impactFormula({
        // It is totally unclear when the current engine rounds up and when it
        // doesnt.
        total_sample_size: sample,
        base_rate: state.baseRate,
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0 // if it isn't non-inferiority, it is always 0
      })

      state.impact = impact
    },

    SET_SAMPLE_AND_RUNTIME_WITH_IMPACT_BY_FIXED_VISITORS_PER_DAY(
      state,
      sample
    ) {
      if (sample < 0) {
        state.sample = state.sample
        return
      }
      const currentVisitorsPerDay = Math.ceil(state.sample / state.runtime)
      const newRuntime = sample / currentVisitorsPerDay
      state.sample = sample
      state.runtime = newRuntime

      const type = state.testType
      const impactFormula = math[type].impact
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const impact = impactFormula({
        // It is totally unclear when the current engine rounds up and when it
        // doesnt.
        total_sample_size: sample,
        base_rate: state.baseRate,
        sd_rate: state.standardDeviation,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu: 0 // if it isn't non-inferiority, it is always 0
      })

      state.impact = impact
    },

    // This is only triggered when non-inferity == true and focusedBlock === sample
    SET_THRESHOLD(state, { threshold, isAbsolute, expectedChange, lockedField }) {
      if (threshold < 0) {
        state.threshold = threshold
        return
      }

      const baseRate = state.baseRate
      const visitorsPerDay = Math.ceil(state.sample / state.runtime)
      const relativeThreshold = isAbsolute
        ? threshold / (baseRate * visitorsPerDay)
        : threshold / 100

      let impact = 0
      switch (expectedChange) {
        case CHANGE.DEGRADATION:
          impact = -relativeThreshold / 2
          break
        case CHANGE.IMPROVEMENT:
          impact = relativeThreshold
          break
        case CHANGE.NO_CHANGE:
        default:
          impact = 0
          break
      }

      const mu = math.getMuFromRelativeDifference({
        threshold: -relativeThreshold,
        runtime: state.runtime,
        base_rate: baseRate,
        visitors_per_day: visitorsPerDay
      })

      const type = state.testType
      const sampleFormula = math[type].sample
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const sample = sampleFormula({
        base_rate: baseRate,
        effect_size: impact,
        sd_rate: state.standardDeviation * 100,
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative({ type }),
        mu,
        opts: {
          type: 'relative',
          alternative: getAlternative(state.isNonInferiority),
          calculating: lockedField,
          runtime: state.runtime,
          threshold: -relativeThreshold,
          visitors_per_day: visitorsPerDay,
          base_rate: baseRate
        }
      })

      if (lockedField === BLOCKED.DAYS) {
        const newRuntime = sample / visitorsPerDay
        state.runtime = newRuntime
      } 

      state.sample = sample
      state.threshold = relativeThreshold
    }
  },
  getters: {
    // UI getters
    // Configuration
    variants: state => state.variants,
    falsePositiveRate: state =>
      displayValue(state.falsePositiveRate, 'percentage'),
    targetPower: state => displayValue(state.targetPower, 'percentage'),
    isNonInferiority: state => state.isNonInferiority,
    testType: state => state.testType,
    comparisonMode: state => state.comparisonMode,
    trafficMode: state => state.trafficMode,

    // Base rate
    baseRate: state => displayValue(state.baseRate, 'percentage'),
    standardDeviation: state =>
      displayValue(state.standardDeviation * 100, 'float'),
    metricTotal: state => {
      if (state.isNonInferiority) {
        return '-'
      }

      const multiplier = state.testType === TEST_TYPE.BINOMIAL ? 1 : 100
      return (state.sample * state.baseRate * multiplier).toFixed(0)
    },

    // Sample
    visitorsPerDay: state =>
      displayValue(Math.ceil(state.sample / state.runtime), 'int'),
    sample: state => displayValue(state.sample, 'int'),
    runtime: state => displayValue(Math.ceil(state.runtime), 'int'),

    // Impact
    relativeImpact: state => displayValue(state.impact, 'percentage'),
    absoluteImpact: state => {
      const { value } = math.getAbsoluteImpactInMetricHash({
        base_rate: state.baseRate,
        effect_size: state.impact
      })
      return displayValue(value, 'percentage')
    },
    minAbsoluteImpact: state => {
      const { min } = math.getAbsoluteImpactInMetricHash({
        base_rate: state.baseRate,
        effect_size: state.impact
      })
      return displayValue(min, 'percentage')
    },
    maxAbsoluteImpact: state => {
      const { max } = math.getAbsoluteImpactInMetricHash({
        base_rate: state.baseRate,
        effect_size: state.impact
      })
      return displayValue(max, 'percentage')
    },
    absoluteImpactPerVisitor: state => {
      const impactPerVisitor = math.getAbsoluteImpactInVisitors({
        base_rate: state.baseRate,
        effect_size: state.impact,
        total_sample_size: state.sample
      })

      return displayValue(impactPerVisitor, 'int')
    },
    absoluteImpactPerVisitorPerDay: state => {
      const impactPerVisitor = math.getAbsoluteImpactInVisitors({
        base_rate: state.baseRate,
        effect_size: state.impact,
        total_sample_size: state.sample
      })
      // We need to use the parsed display value for consistency
      return displayValue(
        Math.floor(impactPerVisitor / Math.ceil(state.runtime)),
        'int'
      )
    },

    // THRESHOLD
    thresholdRelative: state => displayValue(state.threshold, 'percentage'),
    thresholdAbsolute: state => {
      const visitorsPerDay = Math.ceil(state.sample / state.runtime)
      const baseRate = state.baseRate
      const thresholdRelative = state.threshold

      const absoluteThreshold = thresholdRelative * baseRate * visitorsPerDay
      return isNaN(absoluteThreshold)
        ? 0
        : displayValue(absoluteThreshold, 'float')
    }
  }
}

export default calculator
