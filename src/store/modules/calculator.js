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

function displayValue(value, type = 'int') {
  const alternativeToNaN = val => isNaN(val) || !isFinite(val) ? '-' : val

  switch (type) {
    case 'float':
      return alternativeToNaN(parseFloat(value))
    case 'percentage':
      return alternativeToNaN(+((parseFloat(value) * 100).toFixed(2)))
    case 'int':
    default:
      return alternativeToNaN(parseInt(value))
  }
}

export const calculator = {
  state: () => ({
    // Metrics
    baseRate: 0.1, // [0..1]
    confidenceLevel: 0.9, // [0..1]
    falsePositiveRate: 0.1, // [0..1]
    targetPower: 0.8, // [0..1]
    runtime: 14,
    sample: 561364,
    standardDevation: 0.1, // [0..1]
    variants: 2, // A/A = 1, A/B = 2...
    impact: 0.02, // [0..1]

    // Optional metrics
    expectedEffect: 0,
    acceptableCost: 0,

    // Configuration
    isNonInferiority: false,
    comparisonMode: COMPARISON_MODE.ALL,
    trafficMode: TRAFFIC_MODE.DAILY,
    testType: TEST_TYPE.BINOMIAL
  }),
  mutations: {
    // Variants are reflected in the UI as 1 + amount. We store them all
    // together.
    SET_VARIANTS(state, amount) {
      if (Number.isInteger(amount) && amount >= 0) state.variants = amount + 1
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
      if (!isNaN(power) && power >= 0 && power <= 100) state.targetPower = power / 100
      else state.targetPower = state.targetPower
    },
    // In the UI is [0,100], in the store is [0,1]
    SET_BASE_RATE(state, baseRate) {
      if (baseRate > 0 && baseRate <= 100) state.baseRate = baseRate / 100
      else state.baseRate = state.baseRate
    },
    SET_STANDARD_DEVIATION(state, stddev) {
      if (stddev >= 0) state.standardDevation = stddev / 100
      else state.standardDevation = state.standardDevation
    },
    SET_IS_NON_INFERIORITY(state, flag) {
      state.isNonInferiority = !!flag
    },
    SET_TEST_TYPE(state, type) {
      if (Object.values(TEST_TYPE).includes(type)) state.testType = type
      else state.testType = state.testType
    },
    // BaseRate = MetricTotal / Sample
    SET_BASE_RATE_BY_METRIC_TOTAL(state, total) {
      state.baseRate = total / state.sample
    },
    SET_SAMPLE_BY_TOTAL(state, total) {
      state.sample = total
    },
    SET_RUNTIME(state, runtime) {
      if (runtime > 0) state.runtime = runtime
      else state.runtime = state.runtime
    },
    
    // Mutations when calculating the sample size (fixed sample size, variable
    // runtime and visitors per day)
    SET_RUNTIME_AND_VISITORS_PER_DAY_BY_FIXED_SAMPLE(state, runtime) {
      state.runtime = runtime
    },
    SET_VISITORS_PER_DAY_AND_RUNTIME_BY_FIXED_SAMPLE(state, visitorsPerDay) {
      const currentSample = state.sample
      const days = Math.ceil(currentSample/visitorsPerDay)

      state.runtime = days
    },

    // IMPACT
    SET_RELATIVE_IMPACT(state, impact) {
      state.impact = impact / 100
      // TODO: Needs to calculate the new sample
    },

    SET_ABSOLUTE_IMPACT(state, impact) {
      // TODO
    }
  },
  getters: {
    // UI getters
    // Configuration
    variants: state => state.variants - 1,
    falsePositiveRate: state => state.falsePositiveRate * 100,
    targetPower: state => state.targetPower * 100,
    isNonInferiority: state => state.isNonInferiority,
    testType: state => state.testType,
    comparisonMode: state => state.comparisonMode,
    trafficMode: state => state.trafficMode,

    // Base rate
    baseRate: state => state.baseRate * 100,
    standardDeviation: state => state.standardDevation * 100,
    metricTotal: state  => {
      if (state.isNonInferiority) {
        return '-'
      }
      
      const multiplier = state.testType === TEST_TYPE.BINOMIAL ? 1 : 100
      return (state.sample * state.baseRate * multiplier).toFixed(0)
    },

    // Sample
    visitorsPerDay: state => Math.ceil(state.sample / state.runtime),
    sample: state => state.sample,
    runtime: state => state.runtime,

    // Impact
    relativeImpact: state => state.impact * 100,
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
      return displayValue(Math.floor(impactPerVisitor / state.runtime), 'int') 
    }
  },
  actions: {
    calculatePower({ state, getters }) {},
    calculateSample({ state, getters }) {},
    calculateEffectSize({ state, getters }) {}
  }
}

export default calculator
