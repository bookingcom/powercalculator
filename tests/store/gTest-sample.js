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

function refreshValues(customState) {
  store.commit('SET_BASE_RATE', {
    ...store.getters,
    focusedBlock: FOCUS.SAMPLE,
    lockedField: BLOCKED.VISITORS_PER_DAY,
    ...customState,
  })
}

function resetStore() {
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

    isNonInferiority: false,
    comparisonMode: COMPARISON_MODE.ALL,
    trafficMode: TRAFFIC_MODE.DAILY,
    testType: TEST_TYPE.BINOMIAL,
  }

  store.commit('SET_IMPORTED_METRICS', resetObj)
}

function init() {
  test('Expected initial calculated value of sample', () => {
    resetStore()

    expect(store.getters.sample).toBe(561364)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.state.runtime).toBe(14)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    expect(store.getters.sample).toBe(561364)
    expect(store.getters.visitorsPerDay).toBe(80195)
    expect(store.getters.runtime).toBe(7)
    expect(store.state.baseRate).toBe(0.1)

    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(160)
  })

  test('Expected changes when Visitors per Day changes', () => {
    resetStore()

    store.commit('SET_VISITORS_PER_DAY', {
      visitorsPerDay: 30098,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    expect(store.getters.sample).toBe(561364)
    expect(store.getters.visitorsPerDay).toBe(30098)
    expect(store.getters.runtime).toBe(19)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    expect(store.getters.sample).toBe(561364)
    expect(store.getters.visitorsPerDay).toBe(80195)
    expect(store.getters.runtime).toBe(7)

    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(160)
  })

  test('Expected changes when False Positive Rate changes', () => {
    resetStore()

    store.commit('SET_FALSE_POSITIVE_RATE', 5)
    refreshValues({
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.falsePositiveRate).toBe('5')
    expect(store.state.falsePositiveRate).toBe(0.05)
    expect(store.state.baseRate).toBe(0.1)

    // base block
    expect(store.getters.metricTotal).toBe('71266')

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1425)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(79)

    expect(store.getters.sample).toBe(712664)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(18)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    expect(store.getters.sample).toBe(712664)
    expect(store.getters.visitorsPerDay).toBe(101810)
    expect(store.getters.runtime).toBe(7)
  })

  test('Expected changes when Power changes', () => {
    resetStore()

    store.commit('SET_TARGET_POWER', 60)
    refreshValues({
      lockedField: BLOCKED.DAYS,
    })
    expect(store.getters.targetPower).toBe('60')

    // base block
    expect(store.getters.metricTotal).toBe('32716')

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(654)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(72)

    expect(store.getters.sample).toBe(327162)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(9)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    expect(store.getters.sample).toBe(327162)
    expect(store.getters.visitorsPerDay).toBe(46738)
    expect(store.getters.runtime).toBe(7)
  })

  test('Expected changes when Base Rate changes', () => {
    resetStore()

    store.commit('SET_BASE_RATE', {
      baseRate: 15,
      lockedField: BLOCKED.DAYS,
      focusedBlock: FOCUS.SAMPLE,
    })

    expect(store.getters.baseRate).toBe(15)

    // base block
    expect(store.getters.metricTotal).toBe('52983')

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.3')
    expect(store.getters.minAbsoluteImpact).toBe('14.7')
    expect(store.getters.maxAbsoluteImpact).toBe('15.3')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1059)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(117)

    expect(store.getters.sample).toBe(353218)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(9)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      lockedField: BLOCKED.VISITORS_PER_DAY,
      focusedBlock: FOCUS.SAMPLE,
    })

    expect(store.getters.sample).toBe(353218)
    expect(store.getters.visitorsPerDay).toBe(50460)
    expect(store.getters.runtime).toBe(7)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(151)
  })

  test('Expected changes when Relative Impact changes', () => {
    resetStore()

    store.commit('SET_IMPACT', {
      impact: 5,
      isAbsolute: false,
      lockedField: BLOCKED.DAYS,
    })

    // base block
    expect(store.getters.metricTotal).toBe('9100')

    // impact block
    expect(store.getters.relativeImpact()).toBe('5')
    expect(store.getters.absoluteImpact()).toBe('0.5')
    expect(store.getters.minAbsoluteImpact).toBe('9.5')
    expect(store.getters.maxAbsoluteImpact).toBe('10.5')
    expect(store.getters.absoluteImpactPerVisitor).toBe(454)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(151)

    expect(store.getters.sample).toBe(90996)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(3)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      lockedField: BLOCKED.VISITORS_PER_DAY,
      focusedBlock: FOCUS.SAMPLE,
    })

    expect(store.getters.sample).toBe(90996)
    expect(store.getters.visitorsPerDay).toBe(13000)
    expect(store.getters.runtime).toBe(7)

    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(64)
  })

  test('Expected changes when Absolute Impact changes', () => {
    resetStore()
    store.commit('SET_IMPACT', {
      impact: 1.5,
      isAbsolute: true,
      lockedField: BLOCKED.DAYS,
    })

    // base block
    expect(store.getters.metricTotal).toBe('1054')

    // impact block
    expect(store.getters.relativeImpact()).toBe('15')
    expect(store.getters.absoluteImpact()).toBe('1.5')
    expect(store.getters.minAbsoluteImpact).toBe('8.5')
    expect(store.getters.maxAbsoluteImpact).toBe('11.5')
    expect(store.getters.absoluteImpactPerVisitor).toBe(158)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(158)

    expect(store.getters.sample).toBe(10540)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(1)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      lockedField: BLOCKED.VISITORS_PER_DAY,
      focusedBlock: FOCUS.SAMPLE,
    })

    expect(store.getters.sample).toBe(10540)
    expect(store.getters.visitorsPerDay).toBe(1506)
    expect(store.getters.runtime).toBe(7)

    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(22)
  })
}

export default {
  init,
}
