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
    runtime: 2,
    visitorsPerDay: 40098,
    sample: 61826,
    isNonInferiority: false,
    comparisonMode: COMPARISON_MODE.ALL,
    trafficMode: TRAFFIC_MODE.DAILY,
    testType: TEST_TYPE.CONTINUOUS,
  }
  Object.assign(resetObj, obj)
  store.commit('SET_IMPORTED_METRICS', resetObj)
}

function refreshValues(customState = {}) {
  store.commit('SET_BASE_RATE', {
    baseRate: store.getters.baseRate,
    focusedBlock: FOCUS.IMPACT,
    lockedField: BLOCKED.DAYS,
    ...customState,
  })
}

function init() {
  test('Expected initial calculated value of sample', () => {
    resetStore()
    refreshValues()

    // base block
    expect(store.getters.metricTotal).toBe('618260')

    // sample
    expect(store.getters.sample).toBe(61826)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(2)

    // impact
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(12365)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(6182)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('2806860')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact
    expect(store.getters.relativeImpact()).toBe('0.94')
    expect(store.getters.absoluteImpact()).toBe('0.09')
    expect(store.getters.minAbsoluteImpact).toBe('9.91')
    expect(store.getters.maxAbsoluteImpact).toBe('10.09')
    expect(store.getters.absoluteImpactPerVisitor).toBe(26346)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(3763)
  })

  test('Expected changes when Visitors per Day changes', () => {
    resetStore()

    store.commit('SET_VISITORS_PER_DAY', {
      visitorsPerDay: 30098,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.DAYS,
    })

    // base block
    expect(store.getters.metricTotal).toBe('601960')

    // sample
    expect(store.getters.sample).toBe(60196)
    expect(store.getters.visitorsPerDay).toBe(30098)
    expect(store.getters.runtime).toBe(2)

    // impact
    expect(store.getters.relativeImpact()).toBe('2.03')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(12201)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(6100)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('2106860')

    // sample
    expect(store.getters.sample).toBe(210686)
    expect(store.getters.visitorsPerDay).toBe(30098)
    expect(store.getters.runtime).toBe(7)

    // impact
    expect(store.getters.relativeImpact()).toBe('1.08')
    expect(store.getters.absoluteImpact()).toBe('0.11')
    expect(store.getters.minAbsoluteImpact).toBe('9.89')
    expect(store.getters.maxAbsoluteImpact).toBe('10.11')
    expect(store.getters.absoluteImpactPerVisitor).toBe(22826)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(3260)
  })

  test('Expected changes when False Positive Rate changes', () => {
    resetStore()

    store.commit('SET_FALSE_POSITIVE_RATE', 5)
    refreshValues()

    expect(store.getters.falsePositiveRate).toBe('5')

    // base block
    expect(store.getters.metricTotal).toBe('618260')

    // sample
    expect(store.getters.sample).toBe(61826)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(2)

    // impact
    expect(store.getters.relativeImpact()).toBe('2.25')
    expect(store.getters.absoluteImpact()).toBe('0.23')
    expect(store.getters.minAbsoluteImpact).toBe('9.77')
    expect(store.getters.maxAbsoluteImpact).toBe('10.23')
    expect(store.getters.absoluteImpactPerVisitor).toBe(13932)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(6966)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('2806860')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact
    expect(store.getters.relativeImpact()).toBe('1.06')
    expect(store.getters.absoluteImpact()).toBe('0.11')
    expect(store.getters.minAbsoluteImpact).toBe('9.89')
    expect(store.getters.maxAbsoluteImpact).toBe('10.11')
    expect(store.getters.absoluteImpactPerVisitor).toBe(29685)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(4240)
  })

  test('Expected changes when Power changes', () => {
    resetStore()

    store.commit('SET_TARGET_POWER', 60)
    refreshValues()

    expect(store.getters.targetPower).toBe('60')

    // base block
    expect(store.getters.metricTotal).toBe('618260')

    // sample
    expect(store.getters.sample).toBe(61826)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(2)

    // impact
    expect(store.getters.relativeImpact()).toBe('1.53')
    expect(store.getters.absoluteImpact()).toBe('0.15')
    expect(store.getters.minAbsoluteImpact).toBe('9.85')
    expect(store.getters.maxAbsoluteImpact).toBe('10.15')
    expect(store.getters.absoluteImpactPerVisitor).toBe(9439)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(4719)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('2806860')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact
    expect(store.getters.relativeImpact()).toBe('0.72')
    expect(store.getters.absoluteImpact()).toBe('0.07')
    expect(store.getters.minAbsoluteImpact).toBe('9.93')
    expect(store.getters.maxAbsoluteImpact).toBe('10.07')
    expect(store.getters.absoluteImpactPerVisitor).toBe(20113)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(2873)
  })

  test('Expected changes when Base Rate changes', () => {
    resetStore()

    store.commit('SET_BASE_RATE', {
      baseRate: 15,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.baseRate).toBe(15)

    // base block
    expect(store.getters.metricTotal).toBe('927390')

    // sample
    expect(store.getters.sample).toBe(61826)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(2)

    // impact block
    expect(store.getters.relativeImpact()).toBe('1.33')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('14.8')
    expect(store.getters.maxAbsoluteImpact).toBe('15.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(12365)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(6182)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('4210290')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('0.63')
    expect(store.getters.absoluteImpact()).toBe('0.09')
    expect(store.getters.minAbsoluteImpact).toBe('14.91')
    expect(store.getters.maxAbsoluteImpact).toBe('15.09')
    expect(store.getters.absoluteImpactPerVisitor).toBe(26346)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(3763)
  })

  test('Expected changes when Standard Deviation Rate changes', () => {
    resetStore()

    store.commit('SET_STANDARD_DEVIATION', 15)
    refreshValues()

    expect(store.getters.standardDeviation).toBe(15)

    // base block
    expect(store.getters.metricTotal).toBe('618260')

    // sample
    expect(store.getters.sample).toBe(61826)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(2)

    // impact block
    expect(store.getters.relativeImpact()).toBe('3')
    expect(store.getters.absoluteImpact()).toBe('0.3')
    expect(store.getters.minAbsoluteImpact).toBe('9.7')
    expect(store.getters.maxAbsoluteImpact).toBe('10.3')
    expect(store.getters.absoluteImpactPerVisitor).toBe(18547)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(9273)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('2806860')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('1.41')
    expect(store.getters.absoluteImpact()).toBe('0.14')
    expect(store.getters.minAbsoluteImpact).toBe('9.86')
    expect(store.getters.maxAbsoluteImpact).toBe('10.14')
    expect(store.getters.absoluteImpactPerVisitor).toBe(39519)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(5645)
  })

  test('Expected changes when Total Sample changes', () => {
    resetStore()

    store.commit('SET_SAMPLE', {
      sample: 600000,
      lockedField: BLOCKED.DAYS,
    })
    refreshValues()

    // base block
    expect(store.getters.metricTotal).toBe('6000000')

    // sample
    expect(store.getters.sample).toBe(600000)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(15)

    // impact block
    expect(store.getters.relativeImpact()).toBe('0.64')
    expect(store.getters.absoluteImpact()).toBe('0.06')
    expect(store.getters.minAbsoluteImpact).toBe('9.94')
    expect(store.getters.maxAbsoluteImpact).toBe('10.06')
    expect(store.getters.absoluteImpactPerVisitor).toBe(38520)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(2568)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('2806860')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('0.94')
    expect(store.getters.absoluteImpact()).toBe('0.09')
    expect(store.getters.minAbsoluteImpact).toBe('9.91')
    expect(store.getters.maxAbsoluteImpact).toBe('10.09')
    expect(store.getters.absoluteImpactPerVisitor).toBe(26346)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(3763)
  })

  test('Expected changes when Visitors per Day changes', () => {
    resetStore()

    store.commit('SET_VISITORS_PER_DAY', {
      visitorsPerDay: 50000,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.DAYS,
    })

    // base block
    expect(store.getters.metricTotal).toBe('1000000')

    // sample
    expect(store.getters.sample).toBe(100000)
    expect(store.getters.visitorsPerDay).toBe(50000)
    expect(store.getters.runtime).toBe(2)

    // impact block
    expect(store.getters.relativeImpact()).toBe('1.57')
    expect(store.getters.absoluteImpact()).toBe('0.16')
    expect(store.getters.minAbsoluteImpact).toBe('9.84')
    expect(store.getters.maxAbsoluteImpact).toBe('10.16')
    expect(store.getters.absoluteImpactPerVisitor).toBe(15725)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(7862)
  })
}

export default {
  init,
}
