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
      if (baseRate > 0 && baseRate < 100) state.baseRate = baseRate / 100
      else state.baseRate = state.baseRate
    },
    SET_STANDARD_DEVIATION(state, stddev) {
      if (stddev > 0) state.standardDevation = stddev
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
    SET_SAMPLE_BY_FIXED_RUNTIME(state, visitorsPerDay) {},
    SET_SAMPLE_BY_FIXED_VISITORS_PER_DAY(state, runtime) {},
    SET_RUNTIME_BY_FIXED_SAMPLE(state, visitorsPerDay) {},
    SET_RUNTIME_BY_FIXED_VISITORS_PER_DAY(state, total) {}
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
    standardDeviation: state => state.standardDevation,
    metricTotal: state => state.sample * state.baseRate,

    // Sample
    visitorsPerDay: state => Math.ceil(state.sample / state.runtime),
    sample: state => state.sample,
    runtime: state => state.runtime,

    // Calculated fields
    mu: (state, getters) => valueType => {
      if (!state.isNonInferiority) return 0
      switch (valueType) {
        case VALUE_TYPE.ABSOLUTE:
          return state.expectedEffect
        case VALUE_TYPE.RELATIVE:
          return state.expectedEffect * state.baseRate
        case VALUE_TYPE.IMPACT:
          if (getters.visitorsPerDay === 0) return null
          return state.expectedEffect / getters.visitorsPerDay
      }
    },
    // aka. impact / threshold
    effectSize: (state, getters) => valueType => {
      const value = state.isNonInferiority
        ? state.acceptableCost
        : state.expectedEffect

      switch (valueType) {
        case VALUE_TYPE.ABSOLUTE:
          return value
        case VALUE_TYPE.RELATIVE:
          return value * state.baseRate
        case VALUE_TYPE.IMPACT:
          if (getters.visitorsPerDay === 0) return null
          return value / getters.visitorsPerDay
      }
    },
    alpha: state => {
      const comparisons = state.variants - 1
      // (1 - (x/100) ^ 0) = 0
      if (comparisons === 0) return 0

      const alpha = 1 - (state.confidenceLevel / 100) ** (1 / comparisons)
      return state.isNonInferiority ? alpha / 2 : alpha
    },
    beta: state => 1 - state.targetPower / 100,
    stderr: (state, getters) => {
      const comparisons = state.variants - 1

      let base = null
      let variant = null
      // When the traffic is split evenly, the base is stored as 0
      if (state.baseRate === 0) {
        const even = state.sample * (1 / state.variants)
        base = even
        base = even
      } else {
        const percentageBase = (1 - state.baseRate) / comparisons
        const percentageVariant = (1 - percentageBase) / comparisons
        base = state.sample * percentageBase
        variant = state.sample * percentageVariant
      }

      const stddev2 = state.stddev ** 2
      return Math.sqrt(stddev2 / base + stddev2 / variant)
    }
  },
  actions: {
    calculatePower({ state, getters }) {},
    calculateSample({ state, getters }) {},
    calculateEffectSize({ state, getters }) {}
  }
}

export default calculator
