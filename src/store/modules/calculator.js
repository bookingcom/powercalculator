import math from '../../js/math'

export const TEST_TYPE = Object.freeze({
  CONTINUOUS: 'tTest',
  BINOMIAL: 'gTest',
})

export const TRAFFIC_MODE = Object.freeze({
  DAILY: 'daily',
  TOTAL: 'total',
})

export const COMPARISON_MODE = Object.freeze({
  ALL: 'all',
  ONE: 'one',
})

export const VALUE_TYPE = Object.freeze({
  ABSOLUTE: 'absolute',
  IMPACT: 'impact',
  RELATIVE: 'relative',
})

export const FOCUS = Object.freeze({
  SAMPLE: 'sample',
  IMPACT: 'impact',
  BASE: 'base',
})

export const BLOCKED = Object.freeze({
  VISITORS_PER_DAY: 'visitorsPerDay',
  DAYS: 'days',
})

export const CHANGE = Object.freeze({
  NO_CHANGE: 'nochange',
  DEGRADATION: 'degradation',
  IMPROVEMENT: 'improvement',
})

function displayValue(value, type = 'int') {
  const alternativeToNaN = (val) =>
    !Number.isInteger(val) || !isFinite(val) ? '-' : val

  switch (type) {
    case 'float':
      return alternativeToNaN(parseFloat(value).toFixed(2))
    case 'percentage':
      return alternativeToNaN(+(parseFloat(value) * 100).toFixed(2))
    case 'int':
    default:
      return alternativeToNaN(parseInt(value))
  }
}

const getAlternative = (isNonInferiority) =>
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
    testType: TEST_TYPE.BINOMIAL,
  }),
  mutations: {
    // Initial update
    SET_IMPORTED_METRICS(state, props) {
      if (props.testType && Object.values(TEST_TYPE).includes(props.testType))
        state.testType = props.testType
      // skipping calculateProp
      if (props.sample) state.sample = props.sample
      if (props.baseRate) state.baseRate = props.baseRate / 100
      if (props.impact) state.impact = props.impact / 100
      if (props.targetPower) state.targetPower = props.targetPower / 100
      if (props.falsePositiveRate)
        state.falsePositiveRate = props.falsePositiveRate / 100
      if (props.standardDeviation)
        state.standardDeviation = props.standardDeviation / 100
      if (props.runtime) state.runtime = props.runtime
      if (props.threshold) state.threshold = props.threshold / 100
      if (props.variants) state.variants = props.variants
      if (
        props.comparisonMode &&
        Object.values(COMPARISON_MODE).includes(props.comparisonMode)
      )
        state.comparisonMode = props.comparisonMode
      if (
        props.trafficMode &&
        Object.values(TRAFFIC_MODE).includes(props.trafficMode)
      )
        state.trafficMode = props.trafficMode
      if (props.isNonInferiority)
        state.isNonInferiority =
          typeof props.isNonInferiority === 'boolean'
            ? props.isNonInferiority
            : props.isNonInferiority === 'true'
    },
    // Configuration
    SET_VARIANTS(state, amount) {
      if (!isNaN(amount) && amount >= 0) state.variants = amount
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
      if (!isNaN(rate) && rate >= 0 && rate <= 100)
        state.falsePositiveRate = rate / 100
      else state.falsePositiveRate = state.falsePositiveRate
    },
    // In the UI is [0,100], in the store is [0,1]
    SET_TARGET_POWER(state, power) {
      if (!isNaN(power) && power >= 0 && power <= 100)
        state.targetPower = power / 100
      else state.targetPower = state.targetPower
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
          alternative: getAlternative(state.isNonInferiority),
          mu: 0, // if it isn't non-inferiority, it is always 0
          opts: {}, // emtpy if it isn't non-inferiority
        })

        if (locked === BLOCKED.DAYS) {
          const currentVisitorsPerDay = state.sample / state.runtime
          const newRuntime = Math.ceil(sample / currentVisitorsPerDay)

          state.runtime = newRuntime
        }
        state.sample = Math.ceil(sample)
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
          alternative: getAlternative(state.isNonInferiority),
          mu: 0, // if it isn't non-inferiority, it is always 0
        })
        state.impact = impact
      }

      state.testType = type
    },

    // == BASE ==
    SET_BASE_RATE(
      state,
      { baseRate, lockedField, focusedBlock, expectedChange }
    ) {
      if (isNaN(baseRate) || baseRate < 0 || baseRate > 100) {
        state.baseRate = state.baseRate
        return
      }

      const newBaseRate = baseRate / 100

      const currentVisitorsPerDay = Math.ceil(state.sample / state.runtime)

      // We use relative threshold = 0 when we are calculating the impact.
      const relativeThreshold =
        focusedBlock === FOCUS.SAMPLE ? state.threshold : 0

      let impact = state.impact
      if (state.isNonInferiority) {
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
      }

      const opts = state.isNonInferiority
        ? {
            type: 'relative',
            alternative: getAlternative(state.isNonInferiority),
            calculating: lockedField,
            runtime: state.runtime,
            threshold: -relativeThreshold,
            visitors_per_day: currentVisitorsPerDay,
            base_rate: newBaseRate,
          }
        : {}

      const mu = state.isNonInferiority
        ? math.getMuFromRelativeDifference(opts)
        : 0

      const type = state.testType
      const formula = math[type][focusedBlock]
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      if (focusedBlock === FOCUS.SAMPLE) {
        const sample = formula({
          base_rate: newBaseRate,
          effect_size: impact,
          sd_rate: state.standardDeviation,
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        })

        if (lockedField === BLOCKED.DAYS) {
          const newRuntime = Math.ceil(sample / currentVisitorsPerDay)
          state.runtime = newRuntime
        }
        state.sample = Math.ceil(sample)
      } else {
        const impact = formula({
          // It is totally unclear when the current engine rounds up and when it
          // doesnt.
          total_sample_size: state.sample,
          base_rate: newBaseRate, // It uses the displayed value
          sd_rate: state.standardDeviation,
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        })
        state.impact = impact
      }

      state.baseRate = newBaseRate
    },
    SET_STANDARD_DEVIATION(state, stddev) {
      if (!isNaN(stddev) && stddev >= 0) state.standardDeviation = stddev / 100
      else state.standardDeviation = state.standardDeviation
    },

    // == SAMPLE ==
    SET_SAMPLE(state, { sample, lockedField }) {
      if (isNaN(sample) || sample < 0) {
        state.sample = state.sample
        return
      }

      const visitorsPerDay = sample / state.runtime

      // To achieve consistency, we assume relativeThreshold = 0
      const opts = state.isNonInferiority
        ? {
            type: 'relative',
            alternative: getAlternative(state.isNonInferiority),
            calculating: lockedField,
            runtime: state.runtime,
            threshold: 0,
            visitors_per_day: visitorsPerDay,
            base_rate: state.baseRate,
          }
        : {}

      const mu = state.isNonInferiority
        ? math.getMuFromRelativeDifference(opts)
        : 0

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
        alternative: getAlternative(state.isNonInferiority),
        mu,
        opts,
      })

      if (lockedField === BLOCKED.DAYS) {
        const currentVisitorsPerDay = state.sample / state.runtime
        const newRuntime = Math.ceil(sample / currentVisitorsPerDay)
        state.runtime = newRuntime
      }

      if (state.isNonInferiority) {
        state.threshold = impact
      } else {
        state.impact = impact
      }

      state.sample = Math.ceil(sample)
    },
    SET_RUNTIME(state, { runtime, focusedBlock }) {
      if (isNaN(runtime) || runtime <= 0) {
        state.runtime = state.runtime
        return
      }

      const newRuntime = Math.ceil(runtime)

      if (focusedBlock !== FOCUS.SAMPLE) {
        const currentVisitorsPerDay = state.sample / state.runtime
        const newSample = Math.ceil(runtime * currentVisitorsPerDay)

        // To achieve consistency, we assume relativeThreshold = 0
        const opts = state.isNonInferiority
          ? {
              type: 'relative',
              alternative: getAlternative(state.isNonInferiority),
              calculating: BLOCKED.VISITORS_PER_DAY,
              runtime: newRuntime,
              threshold: 0,
              visitors_per_day: currentVisitorsPerDay,
              base_rate: state.baseRate,
            }
          : {}

        const mu = state.isNonInferiority
          ? math.getMuFromRelativeDifference(opts)
          : 0

        const type = state.testType
        const impactFormula = math[type].impact
        const alpha =
          state.comparisonMode === COMPARISON_MODE.ALL
            ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
            : state.falsePositiveRate

        const impact = impactFormula({
          total_sample_size: newSample,
          base_rate: state.baseRate,
          sd_rate: state.standardDeviation,
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        })

        if (state.isNonInferiority) {
          state.threshold = impact
        } else {
          state.impact = impact
        }
        state.sample = newSample
      }

      state.runtime = newRuntime
    },

    SET_VISITORS_PER_DAY(state, { visitorsPerDay, focusedBlock }) {
      if (isNaN(visitorsPerDay) || visitorsPerDay < 0) {
        return
      }

      if (focusedBlock === FOCUS.SAMPLE) {
        const currentSample = state.sample
        const newRuntime = Math.ceil(currentSample / visitorsPerDay)

        state.runtime = newRuntime
      } else {
        const newSample = Math.ceil(state.runtime * visitorsPerDay)

        // To achieve consistency, we assume relativeThreshold = 0
        const opts = state.isNonInferiority
          ? {
              type: 'relative',
              alternative: getAlternative(state.isNonInferiority),
              calculating: BLOCKED.DAYS,
              runtime: state.runtime,
              threshold: 0,
              visitors_per_day: visitorsPerDay,
              base_rate: state.baseRate,
            }
          : {}

        const mu = state.isNonInferiority
          ? math.getMuFromRelativeDifference(opts)
          : 0

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
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        })

        if (state.isNonInferiority) {
          state.threshold = impact
        } else {
          state.impact = impact
        }

        state.sample = newSample
      }
    },
    // == IMPACT ==
    SET_IMPACT(state, { impact, isAbsolute, lockedField }) {
      if (isNaN(impact) || impact < 0) {
        state.impact = state.impact
        return
      }
      const newImpact =
        (isAbsolute
          ? math.getRelativeImpactFromAbsolute({
              base_rate: state.baseRate,
              absolute_effect_size: impact,
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
        alternative: getAlternative(state.isNonInferiority),
        mu: 0, // if it isn't non-inferiority, it is always 0
        opts: {}, // emtpy if it isn't non-inferiority
      })

      if (lockedField === BLOCKED.DAYS) {
        const currentVisitorsPerDay = state.sample / state.runtime
        const newRuntime = Math.ceil(sample / currentVisitorsPerDay)
        state.runtime = newRuntime
      }

      state.impact = newImpact
      state.sample = Math.ceil(sample)
    },

    // This is only triggered when non-inferity == true and focusedBlock === sample
    SET_THRESHOLD(
      state,
      { threshold, isAbsolute, expectedChange, lockedField }
    ) {
      if (isNaN(threshold) || threshold < 0) {
        state.threshold = state.threshold
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

      const opts = {
        type: 'relative',
        alternative: getAlternative(state.isNonInferiority),
        calculating: lockedField,
        runtime: state.runtime,
        threshold: -relativeThreshold,
        visitors_per_day: visitorsPerDay,
        base_rate: baseRate,
      }

      console.log(relativeThreshold, opts)

      const mu = math.getMuFromRelativeDifference(opts)

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
        alternative: getAlternative(state.isNonInferiority),
        mu,
        opts,
      })

      if (lockedField === BLOCKED.DAYS) {
        const newRuntime = sample / visitorsPerDay
        state.runtime = newRuntime
      }

      state.sample = Math.ceil(sample)
      state.threshold = relativeThreshold
    },
  },
  getters: {
    // UI getters
    // Configuration
    variants: (state) => state.variants,
    falsePositiveRate: (state) =>
      displayValue(state.falsePositiveRate, 'percentage'),
    targetPower: (state) => displayValue(state.targetPower, 'percentage'),
    isNonInferiority: (state) => state.isNonInferiority,
    testType: (state) => state.testType,
    comparisonMode: (state) => state.comparisonMode,
    trafficMode: (state) => state.trafficMode,

    // Base rate
    baseRate: (state) => displayValue(state.baseRate, 'percentage'),
    standardDeviation: (state) =>
      displayValue(state.standardDeviation * 100, 'int'),
    metricTotal: (state) => {
      const multiplier = state.testType === TEST_TYPE.BINOMIAL ? 1 : 100
      return (state.sample * state.baseRate * multiplier).toFixed(0)
    },

    // Sample
    visitorsPerDay: (state) =>
      displayValue(Math.floor(state.sample / state.runtime), 'int'),
    sample: (state) => displayValue(Math.ceil(state.sample), 'int'),
    runtime: (state) => displayValue(Math.ceil(state.runtime), 'int'),

    // Impact
    relativeImpact: (state) => displayValue(state.impact, 'percentage'),
    absoluteImpact: (state) => {
      const { value } = math.getAbsoluteImpactInMetricHash({
        base_rate: state.baseRate,
        effect_size: state.impact,
      })
      return displayValue(value, 'percentage')
    },
    minAbsoluteImpact: (state) => {
      const { min } = math.getAbsoluteImpactInMetricHash({
        base_rate: state.baseRate,
        effect_size: state.impact,
      })
      return displayValue(min, 'percentage')
    },
    maxAbsoluteImpact: (state) => {
      const { max } = math.getAbsoluteImpactInMetricHash({
        base_rate: state.baseRate,
        effect_size: state.impact,
      })
      return displayValue(max, 'percentage')
    },
    absoluteImpactPerVisitor: (state) => {
      const impactPerVisitor = math.getAbsoluteImpactInVisitors({
        base_rate: state.baseRate,
        effect_size: state.impact,
        total_sample_size: state.sample,
      })

      return displayValue(impactPerVisitor, 'int')
    },
    absoluteImpactPerVisitorPerDay: (state) => {
      const impactPerVisitor = math.getAbsoluteImpactInVisitors({
        base_rate: state.baseRate,
        effect_size: state.impact,
        total_sample_size: state.sample,
      })
      // We need to use the parsed display value for consistency
      return displayValue(
        Math.floor(impactPerVisitor / Math.ceil(state.runtime)),
        'int'
      )
    },

    // THRESHOLD
    thresholdRelative: (state) => displayValue(state.threshold, 'percentage'),
    thresholdAbsolute: (state) => {
      const visitorsPerDay = Math.ceil(state.sample / state.runtime)
      const baseRate = state.baseRate
      const thresholdRelative = state.threshold

      const absoluteThreshold = thresholdRelative * baseRate * visitorsPerDay
      return isNaN(absoluteThreshold)
        ? 0
        : displayValue(absoluteThreshold, 'float')
    },
  },
}

export default calculator
