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
    testType: TEST_TYPE.BINOMIAL,
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
  test('Expected initial visitedPerDay when diff sample and runtime on init', () => {
    resetStore({
      sample: 100000,
      runtime: 10,
      visitorsPerDay: 10000,
    })
    refreshValues()

    // base
    expect(store.getters.metricTotal).toBe('10000')

    // sample
    expect(store.getters.sample).toBe(100000)
    expect(store.getters.visitorsPerDay).toBe(10000)
    expect(store.getters.runtime).toBe(10)

    // impact block
    expect(store.getters.relativeImpact()).toBe('4.77')
    expect(store.getters.absoluteImpact()).toBe('0.48')
    expect(store.getters.minAbsoluteImpact).toBe('9.52')
    expect(store.getters.maxAbsoluteImpact).toBe('10.48')
    expect(store.getters.absoluteImpactPerVisitor).toBe(476)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(47)
  })

  test('Expected initial visitedPerDay when diff sample and runtime on init for 2 variants', () => {
    resetStore({
      sample: 100000,
      runtime: 10,
      visitorsPerDay: 10000,
      variants: 2,
    })
    refreshValues()

    // base
    expect(store.getters.metricTotal).toBe('10000')

    // sample
    expect(store.getters.sample).toBe(100000)
    expect(store.getters.visitorsPerDay).toBe(10000)
    expect(store.getters.runtime).toBe(10)

    // impact block
    expect(store.getters.relativeImpact()).toBe('6.58')
    expect(store.getters.absoluteImpact()).toBe('0.66')
    expect(store.getters.minAbsoluteImpact).toBe('9.34')
    expect(store.getters.maxAbsoluteImpact).toBe('10.66')
    expect(store.getters.absoluteImpactPerVisitor).toBe(657)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(65)
  })

  test('Expected initial runtime when diff sample and visitorsPerDay on init', () => {
    resetStore({
      sample: 100000,
      visitorsPerDay: 10000,
      runtime: 10,
    })
    refreshValues()

    // base
    expect(store.getters.metricTotal).toBe('10000')

    // sample
    expect(store.getters.sample).toBe(100000)
    expect(store.getters.visitorsPerDay).toBe(10000)
    expect(store.getters.runtime).toBe(10)

    // impact block
    expect(store.getters.relativeImpact()).toBe('4.77')
    expect(store.getters.absoluteImpact()).toBe('0.48')
    expect(store.getters.minAbsoluteImpact).toBe('9.52')
    expect(store.getters.maxAbsoluteImpact).toBe('10.48')
    expect(store.getters.absoluteImpactPerVisitor).toBe(476)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(47)
  })

  test('Expected initial calculated value of sample', () => {
    resetStore()
    refreshValues()

    // base
    expect(store.getters.metricTotal).toBe('56136')

    // sample
    expect(store.getters.sample).toBe(561364)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(14)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2')
    expect(store.getters.absoluteImpact()).toBe('0.2')
    expect(store.getters.minAbsoluteImpact).toBe('9.8')
    expect(store.getters.maxAbsoluteImpact).toBe('10.2')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1122)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(80)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('28069')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2.83')
    expect(store.getters.absoluteImpact()).toBe('0.28')
    expect(store.getters.minAbsoluteImpact).toBe('9.72')
    expect(store.getters.maxAbsoluteImpact).toBe('10.28')
    expect(store.getters.absoluteImpactPerVisitor).toBe(795)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(113)
  })

  test('Expected initial calculated value of sample with 2 variants', () => {
    resetStore({
      variants: 2,
    })
    refreshValues()

    // base
    expect(store.getters.metricTotal).toBe('56136')

    // sample
    expect(store.getters.sample).toBe(561364)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(14)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2.75')
    expect(store.getters.absoluteImpact()).toBe('0.28')
    expect(store.getters.minAbsoluteImpact).toBe('9.72')
    expect(store.getters.maxAbsoluteImpact).toBe('10.28')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1545)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(110)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('28069')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('3.9')
    expect(store.getters.absoluteImpact()).toBe('0.39')
    expect(store.getters.minAbsoluteImpact).toBe('9.61')
    expect(store.getters.maxAbsoluteImpact).toBe('10.39')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1095)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(156)
  })

  test('Expected changes when Visitors per Day changes', () => {
    resetStore()

    store.commit('SET_VISITORS_PER_DAY', {
      visitorsPerDay: 30098,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.DAYS,
    })

    // base
    expect(store.getters.metricTotal).toBe('42137')

    // sample
    expect(store.getters.sample).toBe(421372)
    expect(store.getters.visitorsPerDay).toBe(30098)
    expect(store.getters.runtime).toBe(14)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2.31')
    expect(store.getters.absoluteImpact()).toBe('0.23')
    expect(store.getters.minAbsoluteImpact).toBe('9.77')
    expect(store.getters.maxAbsoluteImpact).toBe('10.23')
    expect(store.getters.absoluteImpactPerVisitor).toBe(973)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(69)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('21069')

    // sample
    expect(store.getters.sample).toBe(210686)
    expect(store.getters.visitorsPerDay).toBe(30098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('3.27')
    expect(store.getters.absoluteImpact()).toBe('0.33')
    expect(store.getters.minAbsoluteImpact).toBe('9.67')
    expect(store.getters.maxAbsoluteImpact).toBe('10.33')
    expect(store.getters.absoluteImpactPerVisitor).toBe(689)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(98)
  })

  test('Expected changes when Visitors per Day changes with 3 variants', () => {
    resetStore({
      variants: 3,
    })

    store.commit('SET_VISITORS_PER_DAY', {
      visitorsPerDay: 30098,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.DAYS,
    })

    // base
    expect(store.getters.metricTotal).toBe('42137')

    // sample
    expect(store.getters.sample).toBe(421372)
    expect(store.getters.visitorsPerDay).toBe(30098)
    expect(store.getters.runtime).toBe(14)

    // impact block
    expect(store.getters.relativeImpact()).toBe('3.9')
    expect(store.getters.absoluteImpact()).toBe('0.39')
    expect(store.getters.minAbsoluteImpact).toBe('9.61')
    expect(store.getters.maxAbsoluteImpact).toBe('10.39')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1641)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(117)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('21069')

    // sample
    expect(store.getters.sample).toBe(210686)
    expect(store.getters.visitorsPerDay).toBe(30098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('5.53')
    expect(store.getters.absoluteImpact()).toBe('0.55')
    expect(store.getters.minAbsoluteImpact).toBe('9.45')
    expect(store.getters.maxAbsoluteImpact).toBe('10.55')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1165)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(166)
  })

  test('Expected changes when False Positive Rate changes', () => {
    resetStore()

    store.commit('SET_FALSE_POSITIVE_RATE', 5)
    refreshValues()

    expect(store.getters.falsePositiveRate).toBe('5')

    // impact block
    expect(store.getters.relativeImpact()).toBe('2.25')
    expect(store.getters.absoluteImpact()).toBe('0.23')
    expect(store.getters.minAbsoluteImpact).toBe('9.77')
    expect(store.getters.maxAbsoluteImpact).toBe('10.23')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1265)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(90)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('28069')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('3.2')
    expect(store.getters.absoluteImpact()).toBe('0.32')
    expect(store.getters.minAbsoluteImpact).toBe('9.68')
    expect(store.getters.maxAbsoluteImpact).toBe('10.32')
    expect(store.getters.absoluteImpactPerVisitor).toBe(896)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(128)
  })

  test('Expected changes when Power changes', () => {
    resetStore()

    store.commit('SET_TARGET_POWER', 60)
    refreshValues()

    expect(store.getters.targetPower).toBe('60')

    // impact block
    expect(store.getters.relativeImpact()).toBe('1.53')
    expect(store.getters.absoluteImpact()).toBe('0.15')
    expect(store.getters.minAbsoluteImpact).toBe('9.85')
    expect(store.getters.maxAbsoluteImpact).toBe('10.15')
    expect(store.getters.absoluteImpactPerVisitor).toBe(856)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(61)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('28069')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2.16')
    expect(store.getters.absoluteImpact()).toBe('0.22')
    expect(store.getters.minAbsoluteImpact).toBe('9.78')
    expect(store.getters.maxAbsoluteImpact).toBe('10.22')
    expect(store.getters.absoluteImpactPerVisitor).toBe(606)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(86)
  })

  test('Expected changes when Power changes with 4 variants', () => {
    resetStore({
      variants: 4,
    })

    store.commit('SET_TARGET_POWER', 60)
    refreshValues()

    expect(store.getters.targetPower).toBe('60')

    // impact block
    expect(store.getters.relativeImpact()).toBe('3.16')
    expect(store.getters.absoluteImpact()).toBe('0.32')
    expect(store.getters.minAbsoluteImpact).toBe('9.68')
    expect(store.getters.maxAbsoluteImpact).toBe('10.32')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1774)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(126)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('28069')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('4.48')
    expect(store.getters.absoluteImpact()).toBe('0.45')
    expect(store.getters.minAbsoluteImpact).toBe('9.55')
    expect(store.getters.maxAbsoluteImpact).toBe('10.45')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1258)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(179)
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
    expect(store.getters.metricTotal).toBe('84205')

    // impact block
    expect(store.getters.relativeImpact()).toBe('1.59')
    expect(store.getters.absoluteImpact()).toBe('0.24')
    expect(store.getters.minAbsoluteImpact).toBe('14.76')
    expect(store.getters.maxAbsoluteImpact).toBe('15.24')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1334)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(95)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('42103')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2.24')
    expect(store.getters.absoluteImpact()).toBe('0.34')
    expect(store.getters.minAbsoluteImpact).toBe('14.66')
    expect(store.getters.maxAbsoluteImpact).toBe('15.34')
    expect(store.getters.absoluteImpactPerVisitor).toBe(945)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(135)
  })

  test('Expected changes when Total Sample changes', () => {
    resetStore()

    store.commit('SET_SAMPLE', {
      sample: 600000,
      lockedField: BLOCKED.DAYS,
    })
    refreshValues()

    // sample
    expect(store.getters.sample).toBe(600000)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(15)

    // base block
    expect(store.getters.metricTotal).toBe('60000')

    // impact block
    expect(store.getters.relativeImpact()).toBe('1.93')
    expect(store.getters.absoluteImpact()).toBe('0.19')
    expect(store.getters.minAbsoluteImpact).toBe('9.81')
    expect(store.getters.maxAbsoluteImpact).toBe('10.19')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1160)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(77)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('28069')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('2.83')
    expect(store.getters.absoluteImpact()).toBe('0.28')
    expect(store.getters.minAbsoluteImpact).toBe('9.72')
    expect(store.getters.maxAbsoluteImpact).toBe('10.28')
    expect(store.getters.absoluteImpactPerVisitor).toBe(795)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(113)
  })

  test('Expected changes when Visitors per Day changes', () => {
    resetStore()

    store.commit('SET_VISITORS_PER_DAY', {
      visitorsPerDay: 50000,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.DAYS,
    })

    // sample
    expect(store.getters.sample).toBe(700000)
    expect(store.getters.visitorsPerDay).toBe(50000)
    expect(store.getters.runtime).toBe(14)

    // base block
    expect(store.getters.metricTotal).toBe('70000')

    // impact block
    expect(store.getters.relativeImpact()).toBe('1.79')
    expect(store.getters.absoluteImpact()).toBe('0.18')
    expect(store.getters.minAbsoluteImpact).toBe('9.82')
    expect(store.getters.maxAbsoluteImpact).toBe('10.18')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1253)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(89)
  })

  test('Expected changes when comparison mode changes with 2 variants', () => {
    resetStore({
      variants: 2,
    })

    store.commit('SET_COMPARISON_MODE', 'one')
    refreshValues()

    // sample
    expect(store.getters.sample).toBe(561364)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(14)
    expect(store.state.variants).toBe(2)
    expect(store.state.comparisonMode).toBe('one')

    // base block
    expect(store.getters.metricTotal).toBe('56136')

    // impact block
    expect(store.getters.relativeImpact()).toBe('2.45')
    expect(store.getters.absoluteImpact()).toBe('0.25')
    expect(store.getters.minAbsoluteImpact).toBe('9.75')
    expect(store.getters.maxAbsoluteImpact).toBe('10.25')
    expect(store.getters.absoluteImpactPerVisitor).toBe(1376)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(98)

    store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.IMPACT,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    // base
    expect(store.getters.metricTotal).toBe('28069')

    // sample
    expect(store.getters.sample).toBe(280686)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(7)

    // impact block
    expect(store.getters.relativeImpact()).toBe('3.48')
    expect(store.getters.absoluteImpact()).toBe('0.35')
    expect(store.getters.minAbsoluteImpact).toBe('9.65')
    expect(store.getters.maxAbsoluteImpact).toBe('10.35')
    expect(store.getters.absoluteImpactPerVisitor).toBe(975)
    expect(store.getters.absoluteImpactPerVisitorPerDay).toBe(139)
  })
}

export default {
  init,
}
