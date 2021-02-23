export const TEST_TYPE = Object.freeze({
  CONTINUOS: 'tTest',
  BINOMIAL: 'gTest'
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
    testType: TEST_TYPE.BINOMIAL
  }),
  mutations: {
    // Variants are reflected in the UI as 1 + amount. We store them all
    // together.
    setVariants(state, amount) {
      state.variant = amount + 1
    },
    // In the UI is [0,100], in the store is [0,1]
    setFalsePositiveRate(state, rate) {
      state.falsePositiveRate = rate / 100
    },
    // In the UI is [0,100], in the store is [0,1]
    setTargetPower(state, power) {
      state.targetPower = power / 100
    },
    // In the UI is [0,100], in the store is [0,1]
    setBaseRate(state, baseRate) {
      state.baseRate = baseRate / 100
    },
    setIsNonInferiority(state, flag) {
      state.isNonInferiority = !!flag
    },
    setTestType(state, type) {
      if (TEST_TYPES.includes(type)) state.testType = type
    },
    // BaseRate = MetricTotal / Sample
    setBaseRateByMetricTotal(state, total) {
      state.baseRate = total / state.sample
    },
    setSampleByTotal(state, total) {
      state.sample = total
    },
    setSampleByFixedRuntime(state, visitorsPerDay) {},
    setSampleByFixedVisitorsPerDay(state, runtime) {},
    setRuntimeByFixedSample(state, visitorsPerDay) {},
    setRuntimeByFixedVisitorsPerDay(state, total) {}
  },
  getters: {
    // UI getters
    // Configuration
    variants: state => state.variants - 1,
    flasePositiveRate: state => state.falsePositiveRate * 100,
    targetPower: state => state.targetPower * 100,
    isNonInferiority: state => state.isNonInferiority,
    testType: state => state.testType,

    // Base rate
    baseRate: state => state.baseRate * 100,
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
        const percentageVariant = (1 - percentageBase) / comparions
        base = state.sample * percentageBase
        variant = state.sample * percentageVariant
      }

      const stddev2 = state.stddev ** 2
      return Math.sqrt(stdev2 / base + stdev2 / variant)
    }
  },
  actions: {
    calculatePower({ state, getters }) {},
    calculateSample({ state, getters }) {},
    calculateEffectSize({ state, getters }) {}
  }
}

export default calculator
