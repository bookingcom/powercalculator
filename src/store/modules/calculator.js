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

export const SELECTED = Object.freeze({
  RELATIVE: 'relative',
  ABSOLUTE: 'absolute',
})

const CALCULATING = Object.freeze({
  EFFECT_SIZE: 'impact',
  POWER: 'power',
  SAMPLE: 'sample',
})

function displayValue(value, { type = 'int', userInput = false }) {
  const alternativeToNaN = (val) => (!Number.isInteger(val) && !isFinite(val) ? '-' : val)

  let num = parseFloat(value)
  switch (type) {
    case 'float':
      if (!userInput) {
        num = num.toFixed(2)
      }
      return alternativeToNaN(num)
    case 'percentage':
      num *= 100
      if (!userInput) {
        num = num.toFixed(2)
        if (num.endsWith('.00')) {
          num = num.slice(0, -3)
        }
      }
      return alternativeToNaN(num)
    case 'int':
    default:
      return alternativeToNaN(parseInt(value, 10))
  }
}

function getAlternative(isNonInferiority) {
  return isNonInferiority ? 'greater' : 'two-sided'
}

function getAbsoluteImpact(baseRate, impactRelative) {
  const { value } = math.getAbsoluteImpactInMetricHash({
    base_rate: baseRate,
    effect_size: impactRelative,
  })
  return value
}

function getRelativeImpact(baseRate, absoluteImpact) {
  return math.getRelativeImpactFromAbsolute({
    base_rate: baseRate,
    absolute_effect_size: absoluteImpact,
  })
}

function getAbsoluteThreshold(state) {
  const visitorsPerDay = state.visitorsPerDay
  const baseRate = state.baseRate
  const runtime = state.runtime
  const relativeThreshold = +state.relativeThreshold

  let absoluteThreshold = relativeThreshold * baseRate * visitorsPerDay

  if (state.trafficMode === TRAFFIC_MODE.TOTAL) {
    absoluteThreshold = absoluteThreshold * runtime
  }

  return isNaN(absoluteThreshold)
    ? 0
    : displayValue(absoluteThreshold, { type: 'float' })
}

function getRelativeThreshold(state) {
  const visitorsPerDay = +state.visitorsPerDay
  const baseRate = +state.baseRate
  const runtime = +state.runtime
  const absoluteThreshold = +state.absoluteThreshold

  let relativeThreshold = absoluteThreshold / (baseRate * visitorsPerDay)

  if (state.trafficMode === TRAFFIC_MODE.TOTAL) {
    relativeThreshold = relativeThreshold / runtime
  }

  return isNaN(relativeThreshold) ? 0 : relativeThreshold
}

function getFormula(state, calculating) {
  if (!Object.values(CALCULATING).includes(calculating)) {
    throw new Error(`${calculating} is not a valid value. Valid values: ${Object.values(CALCULATING).join(',')}`)
  }

  const { testType, isNonInferiority } = state
  // Special case. We want to use tTest for binomial non-inferiority.
  if (isNonInferiority && testType === TEST_TYPE.BINOMIAL) {
    return math.tTest[calculating]
  }
  return math[testType][calculating]
}

// Sometimes we need the standard deviation with binomial distributions. This
// means that we need to calculate it as the one we have stored is the one for
// continuous distributions, we need to calculate it. This calculation has been
// validated with real life distributions.
function getStandardDeviation(state) {
  if (state.testType === TEST_TYPE.CONTINUOUS) {
    return state.standardDeviation
  }
  return Math.sqrt(state.baseRate * (1 - state.baseRate))
}

export const calculator = {
  state: () => ({
    // Metrics
    baseRate: 0.1, // [0..1]
    confidenceLevel: 0.9, // [0..1]
    falsePositiveRate: 0.1, // [0..1]
    targetPower: 0.8, // [0..1]
    runtime: 14,
    visitorsPerDay: 40098,
    sample: 561364,
    standardDeviation: 10,
    // It would make sense to store it as variants + 1 but everywhere it uses
    // this format.
    variants: 1, // A/A = 0, A/B = 1...
    relativeImpact: 0.02, // [0..1]
    absoluteImpact: 0.2,
    relativeThreshold: 0.02,
    absoluteThreshold: 80.2,

    // Configuration
    isNonInferiority: false,
    comparisonMode: COMPARISON_MODE.ALL,
    trafficMode: TRAFFIC_MODE.DAILY,
    testType: TEST_TYPE.BINOMIAL,
  }),
  mutations: {
    // Initial update
    // eslint-disable-next-line complexity
    SET_IMPORTED_METRICS(state, props) {
      // Test setup
      if (props.testType && Object.values(TEST_TYPE).includes(props.testType)) {
        state.testType = props.testType
      }

      if (
        props.comparisonMode &&
        Object.values(COMPARISON_MODE).includes(props.comparisonMode)
      ) {
        state.comparisonMode = props.comparisonMode
      }

      if (
        props.trafficMode &&
        Object.values(TRAFFIC_MODE).includes(props.trafficMode)
      ) {
        state.trafficMode = props.trafficMode
      }

      if (props.isNonInferiority) {
        state.isNonInferiority =
          typeof props.isNonInferiority === 'boolean'
            ? props.isNonInferiority
            : props.isNonInferiority === 'true'
      }

      // Configuration values
      if (props.targetPower) {
        state.targetPower = props.targetPower / 100
      }

      if (props.falsePositiveRate) {
        state.falsePositiveRate = props.falsePositiveRate / 100
      }

      if (props.variants) {
        state.variants = +props.variants
      }

      // Base Rate
      if (props.baseRate) {
        state.baseRate =
          props.testType === TEST_TYPE.BINOMIAL
            ? props.baseRate / 100
            : +props.baseRate
      }

      if (props.standardDeviation) {
        state.standardDeviation = +props.standardDeviation
      }

      // Sample
      if (props.sample) {
        state.sample = +props.sample
      }
      if (props.runtime) {
        state.runtime = +props.runtime
      }
      if (props.visitorsPerDay) {
        state.visitorsPerDay = +props.visitorsPerDay
      }

      // Impact
      // non-inferiority
      if (props.relativeThreshold && props.absoluteThreshold) {
        state.relativeThreshold = props.relativeThreshold / 100
        state.absoluteThreshold = +props.absoluteThreshold
      } else if (props.absoluteThreshold) {
        state.absoluteThreshold = +props.absoluteThreshold
        state.relativeThreshold = getRelativeThreshold(props)
      } else if (props.relativeThreshold) {
        state.relativeThreshold = props.relativeThreshold / 100
        state.absoluteThreshold = getAbsoluteThreshold(props)
      }

      // comparative
      // Ideal case
      if (props.relativeImpact && props.absoluteImpact) {
        state.relativeImpact = props.relativeImpact / 100
        state.absoluteImpact = +props.absoluteImpact
        // Backwards compatibility (1)
      } else if (props.relativeImpact && props.baseRate) {
        state.relativeImpact = props.relativeImpact / 100
        state.absoluteImpact = getAbsoluteImpact(
          props.baseRate,
          props.relativeImpact / 100
        )
        if (props.trafficMode === TRAFFIC_MODE.DAILY) {
          state.absoluteImpact = state.absoluteImpact / 100
        }
        // Necessary for backwards compatibility (2)
      } else if (props.absoluteImpact && props.baseRate) {
        state.absoluteImpact = props.absoluteImpact
        state.realativeImpact = getRelativeImpact(
          props.baseRate,
          props.absoluteImpact
        )
      }
    },
    // Configuration
    SET_VARIANTS(state, amount) {
      if (!isNaN(amount) && amount >= 0) {
        state.variants = amount
      }
    },
    // We can choose between compare the base vs one variant or vs all.
    SET_COMPARISON_MODE(state, val) {
      if (Object.values(COMPARISON_MODE).includes(val)) {
        state.comparisonMode = val
      }
    },
    SET_TRAFFIC_MODE(state, val) {
      if (Object.values(TRAFFIC_MODE).includes(val)) {
        state.trafficMode = val
      }
    },
    // In the UI is [0,100], in the store is [0,1]
    SET_FALSE_POSITIVE_RATE(state, rate) {
      if (!isNaN(rate) && rate >= 0 && rate <= 100) {
        state.falsePositiveRate = rate / 100
      }
    },
    // In the UI is [0,100], in the store is [0,1]
    SET_TARGET_POWER(state, power) {
      if (!isNaN(power) && power >= 0 && power <= 100) {
        state.targetPower = power / 100
      }
    },

    SET_IS_NON_INFERIORITY(state, flag) {
      state.isNonInferiority = !!flag
    },

    SET_TEST_TYPE(state, { testType, focused, lockedField }) {
      if (!Object.values(TEST_TYPE).includes(testType)) {
        return
      }

      // If the new type is a gTest, it means that before it was in 0 -> 100
      // scale, which means we need to move it ot 0 -> 1 scale. If the new type
      // is tTest, it means that it was in 0 -> 1 and we need to move it to 0 ->
      // 100
      const newBaseRate =
        testType === TEST_TYPE.BINOMIAL
          ? state.baseRate / 100
          : state.baseRate * 100

      state.baseRate = newBaseRate
      state.testType = testType

      // We need to recalculate based on the selected fields.
      // the result will be something like [tTest/gTest][impact/sample]
      const formula = getFormula(state, focused)
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const impact = state.isNonInferiority ? 0 : state.relativeImpact
      const opts = state.isNonInferiority
        ? {
            type: 'relative',
            alternative: getAlternative(state.isNonInferiority),
            calculating: lockedField,
            days: state.runtime,
            // The current threshold is invalid as it is the result of a
            // different test. Also, it would turn the calculation stateful
            threshold: 0,
            visitors_per_day: state.visitorsPerDay,
            base_rate: state.baseRate,
          }
        : {}

      const mu = state.isNonInferiority
        ? math.getMuFromRelativeDifference(opts)
        : 0

      if (focused === FOCUS.SAMPLE) {
        const sample = Math.ceil(formula({
            base_rate: newBaseRate,
            effect_size: impact,
            sd_rate: getStandardDeviation(state),
            alpha,
            beta: 1 - state.targetPower,
            variants: state.variants,
            alternative: getAlternative(state.isNonInferiority),
            mu,
            opts,
          }))

        if (lockedField === BLOCKED.DAYS) {
          state.runtime = Math.ceil(sample / state.visitorsPerDay)
        } else {
          state.visitorsPerDay = Math.ceil(sample / state.runtime)
        }

        if (state.isNonInferiority) {
          state.absoluteThreshold = getAbsoluteThreshold(state)
        } else {
          state.absoluteImpact = getAbsoluteImpact(newBaseRate, impact)
        }
        state.sample = sample
      } else {
        const effect = formula({
          total_sample_size: state.sample,
          base_rate: newBaseRate,
          sd_rate: getStandardDeviation(state),
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        })

        if (state.isNonInferiority) {
          state.relativeThreshold = effect
          state.absoluteThreshold = getAbsoluteThreshold({
            ...state,
            relativeThreshold: effect,
          })
        } else {
          state.relativeImpact = effect
          state.absoluteImpact = getAbsoluteImpact(newBaseRate, effect)
        }
      }
    },

    // == BASE ==
    SET_BASE_RATE(state, { baseRate, lockedField, focusedBlock }) {
      if (
        // Do not allow not numbers
        isNaN(baseRate) ||
        // gTest (percentage) -- 0 < base rate < 100
        (state.testType === TEST_TYPE.BINOMIAL &&
          (baseRate >= 100 || baseRate <= 0)) ||
        // tTest (amount) -- 0 <= base rate
        (state.testType === TEST_TYPE.CONTINUOUS && baseRate <= 0)
      ) {
        return
      }

      // If it is binomial, it is a percentage. If it is continuos, it is a
      // float. Therefore, we need to divide by 100 if it is a gTest.
      const newBaseRate =
        state.testType === TEST_TYPE.BINOMIAL ? baseRate / 100 : baseRate

      // We use relative threshold = 0 when we are calculating the impact.
      const relativeThreshold =
        focusedBlock === FOCUS.SAMPLE ? state.relativeThreshold : 0

      const impact = state.isNonInferiority ? 0 : state.relativeImpact
      const opts = state.isNonInferiority
        ? {
            type: 'relative',
            alternative: getAlternative(state.isNonInferiority),
            calculating: lockedField,
            days: state.runtime,
            threshold: -relativeThreshold,
            visitors_per_day: state.visitorsPerDay,
            base_rate: newBaseRate,
          }
        : {}

      const mu = state.isNonInferiority
        ? math.getMuFromRelativeDifference(opts)
        : 0

      const formula = getFormula(state, focusedBlock)
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      if (focusedBlock === FOCUS.SAMPLE) {
        const sample = Math.ceil(formula({
            base_rate: newBaseRate,
            effect_size: impact,
            sd_rate: getStandardDeviation(state),
            alpha,
            beta: 1 - state.targetPower,
            variants: state.variants,
            alternative: getAlternative(state.isNonInferiority),
            mu,
            opts,
          }))

        if (lockedField === BLOCKED.DAYS) {
          state.runtime = Math.ceil(sample / state.visitorsPerDay)
        } else {
          state.visitorsPerDay = Math.ceil(sample / state.runtime)
        }

        if (state.isNonInferiority) {
          state.absoluteThreshold = getAbsoluteThreshold({
            ...state,
            baseRate: newBaseRate,
          })
        } else {
          state.absoluteImpact = getAbsoluteImpact(
            newBaseRate,
            state.relativeImpact
          )
        }

        state.sample = sample
      } else {
        const effect = formula({
          total_sample_size: state.sample,
          base_rate: newBaseRate, // It uses the displayed value
          sd_rate: getStandardDeviation(state),
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        })

        if (state.isNonInferiority) {
          state.relativeThreshold = effect
          state.absoluteThreshold = getAbsoluteThreshold({
            ...state,
            baseRate: newBaseRate,
            relativeThreshold: effect,
          })
        } else {
          state.relativeImpact = effect
          state.absoluteImpact = getAbsoluteImpact(newBaseRate, effect)
        }
      }

      state.baseRate = newBaseRate
    },

    SET_STANDARD_DEVIATION(state, stddev) {
      if (isNaN(stddev) || stddev < 0) {
        return
      }
      state.standardDeviation = stddev
    },

    // == SAMPLE ==
    SET_SAMPLE(state, { sample, lockedField, focusedBlock }) {
      if (isNaN(sample) || sample < 0) {
        return
      }

      const newSample = Math.ceil(sample)

      // We use relative threshold = 0 when we are calculating the impact.
      const relativeThreshold =
        focusedBlock === FOCUS.SAMPLE ? state.relativeThreshold : 0

      const impact = state.isNonInferiority ? 0 : state.relativeImpact
      const opts = state.isNonInferiority
        ? {
            type: 'relative',
            alternative: getAlternative(state.isNonInferiority),
            calculating: lockedField,
            days: state.runtime,
            threshold: relativeThreshold,
            visitors_per_day: state.visitorsPerDay,
            base_rate: state.baseRate,
          }
        : {}

      const mu = state.isNonInferiority
        ? math.getMuFromRelativeDifference(opts)
        : 0

      const impactFormula = getFormula(state, CALCULATING.EFFECT_SIZE)
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const newImpact = impactFormula({
        // It is totally unclear when the current engine rounds up and when it
        // doesnt.
        total_sample_size: newSample,
        base_rate: state.baseRate,
        sd_rate: getStandardDeviation(state),
        alpha,
        beta: 1 - state.targetPower,
        variants: state.variants,
        alternative: getAlternative(state.isNonInferiority),
        mu,
        opts,
      })

      if (lockedField === BLOCKED.DAYS) {
        state.runtime = Math.ceil(newSample / state.visitorsPerDay)
      } else {
        state.visitorsPerDay = Math.ceil(newSample / state.runtime)
      }

      if (state.isNonInferiority) {
        state.relativeThreshold = newImpact
        state.absoluteThreshold = getAbsoluteThreshold({
          ...state,
          sample: newSample,
          relativeThreshold: newImpact,
        })
      } else {
        state.relativeImpact = impact
        state.absoluteImpact = getAbsoluteImpact(state.baseRate, newImpact)
      }

      state.sample = newSample
    },
    SET_RUNTIME(state, { runtime, lockedField, focusedBlock }) {
      if (isNaN(runtime) || runtime <= 0) {
        return
      }

      const newRuntime = Math.ceil(runtime)

      if (focusedBlock === FOCUS.SAMPLE) {
        state.visitorsPerDay = Math.ceil(state.sample / newRuntime)
      } else {
        const newSample = Math.ceil(newRuntime * state.visitorsPerDay)

        // We use relative threshold = 0 when we are calculating the impact.
        const relativeThreshold =
          focusedBlock === FOCUS.SAMPLE ? state.relativeThreshold : 0

        const opts = state.isNonInferiority
          ? {
              type: 'relative',
              alternative: getAlternative(state.isNonInferiority),
              calculating: BLOCKED.VISITORS_PER_DAY,
              runtime: newRuntime,
              threshold: relativeThreshold,
              visitors_per_day: state.visitorsPerDay,
              base_rate: state.baseRate,
            }
          : {}

        const mu = state.isNonInferiority
          ? math.getMuFromRelativeDifference(opts)
          : 0

        const impactFormula = getFormula(state, CALCULATING.EFFECT_SIZE)
        const alpha =
          state.comparisonMode === COMPARISON_MODE.ALL
            ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
            : state.falsePositiveRate

        const newImpact = impactFormula({
          total_sample_size: newSample,
          base_rate: state.baseRate,
          sd_rate: getStandardDeviation(state),
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        })

        if (state.isNonInferiority) {
          state.relativeThreshold = newImpact
          state.absoluteThreshold = getAbsoluteThreshold({
            ...state,
            sample: newSample,
            runtime: newRuntime,
            relativeThreshold: newImpact,
          })
        } else {
          state.relativeImpact = newImpact
          state.absoluteImpact = getAbsoluteImpact(state.baseRate, newImpact)
        }
        state.sample = newSample
      }

      state.runtime = newRuntime
    },

    SET_VISITORS_PER_DAY(state, { visitorsPerDay, lockedField, focusedBlock }) {
      if (isNaN(visitorsPerDay) || visitorsPerDay < 0) {
        return
      }

      const newVisitorsPerDay = Math.ceil(visitorsPerDay)
      if (focusedBlock === FOCUS.SAMPLE) {
        state.runtime = Math.ceil(state.sample / newVisitorsPerDay)
      } else {
        const newSample = Math.ceil(state.runtime * newVisitorsPerDay)

        // We use relative threshold = 0 when we are calculating the impact.
        const relativeThreshold =
          focusedBlock === FOCUS.SAMPLE ? state.relativeThreshold : 0

        const opts = state.isNonInferiority
          ? {
              type: 'relative',
              alternative: getAlternative(state.isNonInferiority),
              calculating: BLOCKED.DAYS,
              days: state.runtime,
              threshold: relativeThreshold,
              visitors_per_day: newVisitorsPerDay,
              base_rate: state.baseRate,
            }
          : {}

        const mu = state.isNonInferiority
          ? math.getMuFromRelativeDifference(opts)
          : 0

        const impactFormula = getFormula(state, CALCULATING.EFFECT_SIZE)
        const alpha =
          state.comparisonMode === COMPARISON_MODE.ALL
            ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
            : state.falsePositiveRate

        const newImpact = impactFormula({
          // It is totally unclear when the current engine rounds up and when it
          // doesnt.
          total_sample_size: newSample,
          base_rate: state.baseRate,
          sd_rate: getStandardDeviation(state),
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        })

        if (state.isNonInferiority) {
          state.relativeThreshold = newImpact
          state.absoluteThreshold = getAbsoluteThreshold({
            ...state,
            relativeThreshold: newImpact,
          })
        } else {
          state.relativeImpact = newImpact
          state.absoluteImpact = getAbsoluteImpact(state.baseRate, newImpact)
        }

        state.sample = newSample
      }
      state.visitorsPerDay = newVisitorsPerDay
    },

    // == IMPACT ==
    SET_IMPACT(state, { impact, isAbsolute, lockedField }) {
      if (
        // Do not allow not numbers
        isNaN(impact) ||
        // No percetages or values less than 0
        impact <= 0 ||
        // If it is not absolute, do not allow percentages higher or equal than 100
        (!isAbsolute && impact >= 100) ||
        // If it is absolute, do not allow percentages higher or equal than 100
        // when it is binomial
        (isAbsolute && state.testType === TEST_TYPE.BINOMIAL && impact >= 100)
      ) {
        return
      }
      const newImpact =
        (isAbsolute
          ? math.getRelativeImpactFromAbsolute({
              base_rate: state.baseRate,
              absolute_effect_size: impact,
            })
          : impact) / 100

      const sampleFormula = getFormula(state, CALCULATING.SAMPLE)
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const sample = Math.ceil(sampleFormula({
          base_rate: state.baseRate,
          effect_size: newImpact,
          sd_rate: getStandardDeviation(state),
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu: 0, // if it isn't non-inferiority, it is always 0
          opts: {}, // emtpy if it isn't non-inferiority
        }))

      if (lockedField === BLOCKED.DAYS) {
        state.runtime = Math.ceil(sample / state.visitorsPerDay)
      } else {
        state.visitorsPerDay = Math.ceil(sample / state.runtime)
      }

      state.relativeImpact = newImpact
      state.absoluteImpact = getAbsoluteImpact(state.baseRate, newImpact)
      state.sample = sample
    },

    // This is only triggered when non-inferity == true and focusedBlock === sample
    SET_THRESHOLD(state, { threshold, isAbsolute, lockedField }) {
      if (
        // Disallow not numbers
        isNaN(threshold) ||
        // Not values lower than 0 in general
        threshold <= 0 ||
        // If it is relative, do not allow 100 or more.
        (!isAbsolute && threshold >= 100)
      ) {
        return
      }

      const baseRate = state.baseRate
      const visitorsPerDay = state.visitorsPerDay

      // eslint-disable-next-line no-nested-ternary
      const normaliseThreshold = isAbsolute
        ? state.trafficMode === TRAFFIC_MODE.TOTAL
          ? threshold / state.runtime
          : threshold
        : threshold / 100

      const impact = state.isNonInferiority ? 0 : state.relativeImpact
      const opts = {
        type: isAbsolute ? 'absolutePerDay' : 'relative',
        alternative: getAlternative(state.isNonInferiority),
        calculating: lockedField,
        days: state.runtime,
        threshold: -normaliseThreshold,
        visitors_per_day: visitorsPerDay,
        base_rate: baseRate,
      }

      const mu = isAbsolute
        ? math.getMuFromAbsolutePerDay(opts)
        : math.getMuFromRelativeDifference(opts)

      const sampleFormula = getFormula(state, CALCULATING.SAMPLE)
      const alpha =
        state.comparisonMode === COMPARISON_MODE.ALL
          ? math.getCorrectedAlpha(state.falsePositiveRate, state.variants)
          : state.falsePositiveRate

      const sample = Math.ceil(sampleFormula({
          base_rate: baseRate,
          effect_size: impact,
          sd_rate: getStandardDeviation(state),
          alpha,
          beta: 1 - state.targetPower,
          variants: state.variants,
          alternative: getAlternative(state.isNonInferiority),
          mu,
          opts,
        }))

      if (lockedField === BLOCKED.DAYS) {
        state.runtime = Math.ceil(sample / visitorsPerDay)
      } else {
        state.visitorsPerDay = Math.ceil(sample / state.runtime)
      }

      state.sample = sample

      if (isAbsolute) {
        state.absoluteThreshold = threshold
        state.relativeThreshold = getRelativeThreshold({
          ...state,
          sample,
          absoluteThreshold: threshold,
        })
      } else {
        state.relativeThreshold = normaliseThreshold
        state.absoluteThreshold = getAbsoluteThreshold({
          ...state,
          sample,
          relativeThreshold: normaliseThreshold,
        })
      }
    },
  },
  getters: {
    // UI getters
    // Configuration
    variants: (state) => state.variants,
    falsePositiveRate: (state) => displayValue(state.falsePositiveRate, { type: 'percentage' }),
    targetPower: (state) => displayValue(state.targetPower, { type: 'percentage' }),
    isNonInferiority: (state) => state.isNonInferiority,
    testType: (state) => state.testType,
    comparisonMode: (state) => state.comparisonMode,
    trafficMode: (state) => state.trafficMode,

    // Base rate
    baseRate: (state) => displayValue(state.baseRate, {
        type: state.testType === TEST_TYPE.BINOMIAL ? 'percentage' : 'float',
        userInput: true,
      }),
    standardDeviation: (state) => displayValue(state.standardDeviation, { type: 'float', userInput: true }),
    metricTotal: (state) => (state.sample * state.baseRate).toFixed(0),

    // Sample
    visitorsPerDay: (state) => displayValue(state.visitorsPerDay, { type: 'int' }),
    sample: (state) => {
      if (
        (state.isNonInferiority && state.relativeThreshold === 0) ||
        (!state.isNonInferiority && state.relativeImpact === 0)
      ) {
        return '-'
      }
      return displayValue(Math.ceil(state.sample), {
        type: 'int',
      })
    },
    runtime: (state) => {
      if (
        (state.isNonInferiority && state.relativeThreshold === 0) ||
        (!state.isNonInferiority && state.relativeImpact === 0)
      ) {
        return '-'
      }
      return displayValue(Math.ceil(state.runtime), { type: 'int' })
    },

    // Impact
    relativeImpact: (state) => (userInput = false) => displayValue(state.relativeImpact, { type: 'percentage', userInput }),
    absoluteImpact: (state) => (userInput = false) => displayValue(state.absoluteImpact, { type: 'percentage', userInput }),

    minAbsoluteImpact: (state) => {
      const { min } = math.getAbsoluteImpactInMetricHash({
        base_rate: state.baseRate,
        effect_size: state.relativeImpact,
      })
      return displayValue(min, { type: 'percentage' })
    },
    maxAbsoluteImpact: (state) => {
      const { max } = math.getAbsoluteImpactInMetricHash({
        base_rate: state.baseRate,
        effect_size: state.relativeImpact,
      })
      return displayValue(max, { type: 'percentage' })
    },
    absoluteImpactPerVisitor: (state) => {
      const impactPerVisitor = math.getAbsoluteImpactInVisitors({
        base_rate: state.baseRate,
        effect_size: state.relativeImpact,
        total_sample_size: state.sample,
      })

      return displayValue(impactPerVisitor, { type: 'int' })
    },
    absoluteImpactPerVisitorPerDay: (state) => {
      const impactPerVisitor = math.getAbsoluteImpactInVisitors({
        base_rate: state.baseRate,
        effect_size: state.relativeImpact,
        total_sample_size: state.sample,
      })
      // We need to use the parsed display value for consistency
      return displayValue(Math.floor(impactPerVisitor / state.runtime), {
        type: 'int',
      })
    },

    // THRESHOLD
    relativeThreshold: (state) => (userInput) => displayValue(state.relativeThreshold, { type: 'percentage', userInput }),
    absoluteThreshold: (state) => (userInput) => displayValue(state.absoluteThreshold, { type: 'float', userInput }),
  },
}

export default calculator
