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
    focusedBlock: FOCUS.SAMPLE,
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
    expect(store.state.runtime).toBe(2)

    // impact
    expect(store.getters.absoluteImpactPerVisitor).toBe(12365)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(6182)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    expect(store.getters.sample).toBe(61826)
    expect(store.getters.visitorsPerDay).toBe(8833)
    expect(store.getters.runtime).toBe(7)
  })

  test('Expected changes when Visitors per Day changes', () => {
    resetStore()
    refreshValues()

    store.commit('SET_VISITORS_PER_DAY', {
      visitorsPerDay: 30098,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('618260')

    // sample
    expect(store.getters.sample).toBe(61826)
    expect(store.getters.visitorsPerDay).toBe(30098)
    expect(store.getters.runtime).toBe(3)

    // impact
    expect(store.getters.absoluteImpactPerVisitor).toBe(12365)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(4121)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // sample
    expect(store.getters.sample).toBe(61826)
    expect(store.getters.visitorsPerDay).toBe(8833)
    expect(store.getters.runtime).toBe(7)

    // impact
    expect(store.getters.absoluteImpactPerVisitor).toBe(12365)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(1766)
  })

  test('Expected changes when False Positive Rate changes', () => {
    resetStore()

    store.commit('SET_FALSE_POSITIVE_RATE', 5)
    refreshValues({
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.falsePositiveRate).toBe('5')
    expect(store.state.baseRate).toBe(10)

    // base block
    expect(store.getters.metricTotal).toBe('784900')

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(15698)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(7849)

    expect(store.getters.sample).toBe(78490)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(2)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('784900')

    // sample
    expect(store.getters.sample).toBe(78490)
    expect(store.getters.visitorsPerDay).toBe(11213)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(15698)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(2242)
  })

  test('Expected changes when Power changes', () => {
    resetStore()

    store.commit('SET_TARGET_POWER', 60)
    refreshValues({
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.targetPower).toBe('60')

    // base block
    expect(store.getters.metricTotal).toBe('360320')

    // sample
    expect(store.getters.sample).toBe(36032)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(1)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(7206)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(7206)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('360320')

    // sample
    expect(store.getters.sample).toBe(36032)
    expect(store.getters.visitorsPerDay).toBe(5148)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(7206)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(1029)
  })

  test('Expected changes when Base Rate changes', () => {
    resetStore()

    store.commit('SET_BASE_RATE', {
      baseRate: 15,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.baseRate).toBe(15)

    // base block
    expect(store.getters.metricTotal).toBe('412200')

    // sample
    expect(store.getters.sample).toBe(27480)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(1)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.3')
    expect(store.getters.minAbsoluteImpact).toBe('14.7')
    expect(store.getters.maxAbsoluteImpact).toBe('15.3')
    expect(store.getters.absoluteImpactPerVisitor).toBe(8244)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(8244)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('412200')

    // sample
    expect(store.getters.sample).toBe(27480)
    expect(store.getters.visitorsPerDay).toBe(3926)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.3')
    expect(store.getters.minAbsoluteImpact).toBe('14.7')
    expect(store.getters.maxAbsoluteImpact).toBe('15.3')
    expect(store.getters.absoluteImpactPerVisitor).toBe(8244)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(1177)
  })

  test('Expected changes when Standard Deviation Rate changes', () => {
    resetStore()

    store.commit('SET_STANDARD_DEVIATION', 15)
    refreshValues({
      lockedField: BLOCKED.DAYS,
    })

    expect(store.getters.standardDeviation).toBe(15)

    // base block
    expect(store.getters.metricTotal).toBe('1391080')

    // sample
    expect(store.getters.sample).toBe(139108)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(4)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(27821)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(6955)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('1391080')

    // sample
    expect(store.getters.sample).toBe(139108)
    expect(store.getters.visitorsPerDay).toBe(19873)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(27821)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(3974)
  })

  test('Expected changes when Relative Impact changes', () => {
    resetStore()

    store.commit('SET_IMPACT', {
      impact: 5,
      isAbsolute: false,
      lockedField: BLOCKED.DAYS,
    })

    // base block
    expect(store.getters.metricTotal).toBe('98940')

    // sample
    expect(store.getters.sample).toBe(9894)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(1)

    // impact block
    expect(store.getters.relativeImpact()).toBe('5')
    expect(store.getters.absoluteImpact()).toBe('0.5')
    expect(store.getters.minAbsoluteImpact).toBe('9.5')
    expect(store.getters.maxAbsoluteImpact).toBe('10.5')
    expect(store.getters.absoluteImpactPerVisitor).toBe(4947)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(4947)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('98940')

    // sample
    expect(store.getters.sample).toBe(9894)
    expect(store.getters.visitorsPerDay).toBe(1414)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('5')
    expect(store.getters.absoluteImpact()).toBe('0.5')
    expect(store.getters.minAbsoluteImpact).toBe('9.5')
    expect(store.getters.maxAbsoluteImpact).toBe('10.5')
    expect(store.getters.absoluteImpactPerVisitor).toBe(4947)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(706)
  })

  test('Expected changes when Absolute Impact changes', () => {
    resetStore()

    store.commit('SET_IMPACT', {
      impact: 15,
      isAbsolute: true,
      lockedField: BLOCKED.DAYS,
    })

    // base block
    expect(store.getters.metricTotal).toBe('1099140')

    // sample
    expect(store.getters.sample).toBe(109914)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(3)

    // impact block
    expect(store.getters.relativeImpact()).toBe('1.5')
    expect(store.getters.absoluteImpact()).toBe('0.15')
    expect(store.getters.minAbsoluteImpact).toBe('9.85')
    expect(store.getters.maxAbsoluteImpact).toBe('10.15')
    expect(store.getters.absoluteImpactPerVisitor).toBe(16487)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(5495)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base block
    expect(store.getters.metricTotal).toBe('1099140')

    // sample
    expect(store.getters.sample).toBe(109914)
    expect(store.getters.visitorsPerDay).toBe(15702)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('1.5')
    expect(store.getters.absoluteImpact()).toBe('0.15')
    expect(store.getters.minAbsoluteImpact).toBe('9.85')
    expect(store.getters.maxAbsoluteImpact).toBe('10.15')
    expect(store.getters.absoluteImpactPerVisitor).toBe(16487)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(2355)
  })
}

export default {
  init,
}
