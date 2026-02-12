import Vue from 'vue'
import Vuex from 'vuex'
import Store, {
  COMPARISON_MODE,
  TRAFFIC_MODE,
  TEST_TYPE,
  FOCUS,
  BLOCKED,
} from '../../src/store/modules/calculator'

Vue.config.productionTip = false

Vue.use(Vuex)

const store = new Vuex.Store(Store)

function resetStore(obj = {}) {
  const resetObj = {
    baseRate: 10,
    relativeImpact: 2,
    targetPower: 80,
    falsePositiveRate: 10,
    standardDeviation: 10,
    variants: 1,
    runtime: 14,
    visitorsPerDay: 40098,
    sample: 561364,
    isNonInferiority: true,
    comparisonMode: COMPARISON_MODE.ALL,
    trafficMode: TRAFFIC_MODE.DAILY,
    testType: TEST_TYPE.CONTINUOUS,
    ...obj,
  }
  store.commit('SET_IMPORTED_METRICS', resetObj)
  // Reset thresholds to zero since SET_IMPORTED_METRICS
  // doesn't handle zero thresholds (falsy check skips assignment)
  store.state.relativeThreshold = 0
  store.state.absoluteThreshold = 0
}

function init() {
  test('Expected sample to be indeterminate when threshold is zero', () => {
    resetStore()

    expect(store.state.isNonInferiority).toBe(true)
    expect(store.getters.sample).toBe('-')
    expect(store.getters.runtime).toBe('-')
    expect(store.getters.visitorsPerDay).toBe(40098)
  })

  test('Expected SET_IS_NON_INFERIORITY to halve false positive rate', () => {
    resetStore()
    store.state.isNonInferiority = false

    expect(store.state.falsePositiveRate).toBe(0.1)

    store.commit('SET_IS_NON_INFERIORITY', true)

    expect(store.state.isNonInferiority).toBe(true)
    expect(store.state.falsePositiveRate).toBe(0.05)

    store.commit('SET_IS_NON_INFERIORITY', false)

    expect(store.state.isNonInferiority).toBe(false)
    expect(store.state.falsePositiveRate).toBe(0.1)
  })

  test('Expected sample when relative threshold is set', () => {
    resetStore()

    store.commit('SET_THRESHOLD', {
      threshold: 10,
      isAbsolute: false,
      lockedField: BLOCKED.DAYS,
    })

    // threshold
    expect(store.getters.relativeThreshold()).toBe('10')

    // sample
    expect(store.getters.sample).toBe(1804)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(1)

    // base
    expect(store.getters.metricTotal).toBe('18040')
  })

  test('Expected sample when absolute threshold is set', () => {
    resetStore()

    store.commit('SET_THRESHOLD', {
      threshold: 100,
      isAbsolute: true,
      lockedField: BLOCKED.DAYS,
    })

    // threshold
    expect(store.getters.absoluteThreshold()).toBe('100')

    // sample
    expect(store.getters.sample).toBe(289918614)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7231)

    // base
    expect(store.getters.metricTotal).toBe('2899186140')
  })

  test('Expected runtime change recalculates visitors per day with relative threshold', () => {
    resetStore()

    store.commit('SET_THRESHOLD', {
      threshold: 10,
      isAbsolute: false,
      lockedField: BLOCKED.DAYS,
    })

    const sampleAfterThreshold = store.getters.sample

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // sample should stay the same, visitors per day recalculated
    expect(store.getters.sample).toBe(sampleAfterThreshold)
    expect(store.getters.runtime).toBe(7)
    expect(store.getters.visitorsPerDay).toBe(258)
  })

  test('Expected runtime change recalculates visitors per day with absolute threshold', () => {
    resetStore()

    store.commit('SET_THRESHOLD', {
      threshold: 100,
      isAbsolute: true,
      lockedField: BLOCKED.DAYS,
    })

    const sampleAfterThreshold = store.getters.sample

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    expect(store.getters.sample).toBe(sampleAfterThreshold)
    expect(store.getters.runtime).toBe(7)
    expect(store.getters.visitorsPerDay).toBe(41416945)
  })

  test('Expected sample when false positive rate changes with relative threshold', () => {
    resetStore()

    store.commit('SET_FALSE_POSITIVE_RATE', 5)
    store.commit('SET_THRESHOLD', {
      threshold: 10,
      isAbsolute: false,
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.falsePositiveRate).toBe('5')
    expect(store.getters.sample).toBe(2474)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(1)
  })

  test('Expected sample when power changes with relative threshold', () => {
    resetStore()

    store.commit('SET_TARGET_POWER', 60)
    store.commit('SET_THRESHOLD', {
      threshold: 10,
      isAbsolute: false,
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.targetPower).toBe('60')
    expect(store.getters.sample).toBe(944)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(1)
  })

  test('Expected sample when base rate changes with relative threshold', () => {
    resetStore()

    store.commit('SET_THRESHOLD', {
      threshold: 10,
      isAbsolute: false,
      lockedField: BLOCKED.DAYS,
    })

    store.commit('SET_BASE_RATE', {
      baseRate: 15,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.baseRate).toBe(15)
    expect(store.getters.sample).toBe(802)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(1)
  })

  test('Expected sample when standard deviation changes with relative threshold', () => {
    resetStore()

    store.commit('SET_STANDARD_DEVIATION', 15)
    store.commit('SET_THRESHOLD', {
      threshold: 10,
      isAbsolute: false,
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.standardDeviation).toBe(15)
    expect(store.getters.sample).toBe(4058)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(1)
  })
}

export default {
  init,
}
