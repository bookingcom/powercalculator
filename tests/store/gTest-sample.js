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
        ...store.state,
        focusedBlock: FOCUS.SAMPLE,
        lockedField: BLOCKED.VISITORS_PER_DAY,
        ...customState
    });
}

function resetStore() {
  const resetObj = {
    testType: 'gTest',
    calculateProp: 'sample',

    baseRate: 0.1,
    relativeImpact: 0.02,
    targetPower: 0.8,
    falsePositiveRate: 0.1,
    standardDeviation: 1,
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
    refreshValues();
    
    expect(store.getters.falsePositiveRate).toBe(5)
    expect(store.state.falsePositiveRate).toBe(0.05)

    // base block
    expect(store.getters.metricTotal).toBe(71266)

    // impact block
    expect(store.getters.impact).toBe(2)
    expect(store.getters.impactByMetricDisplay).toBe(0.2)
    expect(store.getters.impactByMetricMinDisplay).toBe(9.8)
    expect(store.getters.impactByMetricMaxDisplay).toBe(10.2)
    expect(store.getters.impactByVisitorsDisplay).toBe(1425)
    expect(store.getters.impactByVisitorsPerDayDisplay).toBe(79)

    expect(store.getters.sample).toBe(71264)
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

    expect(store.getters.impactByVisitorsPerDayDisplay).toBe(203)
  })

  test('Expected changes when Power changes', () => {
    resetStore()

    store.commit('SET_TARGET_POWER', 60 )
    refreshValues()

    expect(store.getters.targetPower).toBe(60)

    // base block
    expect(store.getters.metricTotal).toBe(32716)

    // impact block
    expect(store.getters.impact).toBe(2)
    expect(store.getters.impactByMetricDisplay).toBe(0.2)
    expect(store.getters.impactByMetricMinDisplay).toBe(9.8)
    expect(store.getters.impactByMetricMaxDisplay).toBe(10.2)
    expect(store.getters.impactByVisitorsDisplay).toBe(654)
    expect(store.getters.impactByVisitorsPerDayDisplay).toBe(72)

    expect(store.getters.sample).toBe(327162)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(9)

      store.commit('SET_RUNTIME', {
      runtime: 7,
      focusedBlock: FOCUS.SAMPLE,
      lockedField: BLOCKED.VISITORS_PER_DAY,
    })

    expect(store.getters.sample).toBe(712664)
    expect(store.getters.visitorsPerDay).toBe(101810)
    expect(store.getters.runtime).toBe(7)

    expect(store.getters.impactByVisitorsPerDayDisplay).toBe(203)
  })

  test('Expected changes when Power changes', () => {
    resetStore()

    store.commit('SET_TARGET_POWER', 60 )

    expect(store.getters.targetPower).toBe(60)

    // base block
    expect(store.getters.sample).toBe(32716)

    // impact block
    expect(store.getters.impact).toBe(2)
    expect(store.getters.impactByMetricDisplay).toBe(0.2)
    expect(store.getters.impactByMetricMinDisplay).toBe(9.8)
    expect(store.getters.impactByMetricMaxDisplay).toBe(10.2)
    expect(store.getters.impactByVisitorsDisplay).toBe(654)
    expect(store.getters.impactByVisitorsPerDayDisplay).toBe(72)

    expect(store.getters.sample).toBe(327162)
    expect(store.getters.visitorsPerDay).toBe(40098)
    expect(store.getters.runtime).toBe(9)

    store.commit('field:change', { prop: 'runtime', value: 7 })
    expect(store.getters.sample).toBe(327162)
    expect(store.getters.visitorsPerDay).toBe(46737)
    expect(store.getters.runtime).toBe(7)

    expect(store.getters.impactByVisitorsPerDayDisplay).toBe(93)
  })

  //     test('Expected changes when Base Rate changes', () => {
  //         resetStore();

  //         store.commit('field:change', {prop: 'base', value: 15});

  //         expect(store.getters.base).toBe(15);

  //         // base block
  //         expect(store.getters.visitorsWithGoals).toBe(52982);

  //         // impact block
  //         expect(store.getters.impact).toBe(2);
  //         expect(store.getters.impactByMetricDisplay).toBe(0.3);
  //         expect(store.getters.impactByMetricMinDisplay).toBe(14.7);
  //         expect(store.getters.impactByMetricMaxDisplay).toBe(15.3);
  //         expect(store.getters.impactByVisitorsDisplay).toBe(1059);
  //         expect(store.getters.impactByVisitorsPerDayDisplay).toBe(117);

  //         expect(store.getters.sample).toBe(353218);
  //         expect(store.getters.visitorsPerDay).toBe(40098);
  //         expect(store.getters.runtime).toBe(9);

  //         store.commit('switch:lockedfield');
  //         store.commit('field:change', {prop: 'runtime', value: 7});

  //         expect(store.getters.sample).toBe(353218);
  //         expect(store.getters.visitorsPerDay).toBe(50459);
  //         expect(store.getters.runtime).toBe(7);

  //         expect(store.getters.impactByVisitorsPerDayDisplay).toBe(151);
  //     });

  //     test('Expected changes when Relative Impact changes', () => {
  //         resetStore();

  //         store.commit('field:change', {prop: 'impact', value: 5});

  //         // base block
  //         expect(store.getters.visitorsWithGoals).toBe(9099);

  //         // impact block
  //         expect(store.getters.impact).toBe(5);
  //         expect(store.getters.impactByMetricDisplay).toBe(0.5);
  //         expect(store.getters.impactByMetricMinDisplay).toBe(9.5);
  //         expect(store.getters.impactByMetricMaxDisplay).toBe(10.5);
  //         expect(store.getters.impactByVisitorsDisplay).toBe(454);
  //         expect(store.getters.impactByVisitorsPerDayDisplay).toBe(151);

  //         expect(store.getters.sample).toBe(90996);
  //         expect(store.getters.visitorsPerDay).toBe(40098);
  //         expect(store.getters.runtime).toBe(3);

  //         store.commit('switch:lockedfield');
  //         store.commit('field:change', {prop: 'runtime', value: 7});

  //         expect(store.getters.sample).toBe(90996);
  //         expect(store.getters.visitorsPerDay).toBe(12999);
  //         expect(store.getters.runtime).toBe(7);

  //         expect(store.getters.impactByVisitorsPerDayDisplay).toBe(64);
  //     });

  //     test('Expected changes when Absolute Impact changes', () => {
  //         resetStore();

  //         store.commit('field:change', {prop: 'impactByMetricValue', value: 1.5});

  //         // base block
  //         expect(store.getters.visitorsWithGoals).toBe(1054);

  //         // impact block
  //         expect(store.getters.impact).toBe(15);
  //         expect(store.getters.impactByMetricDisplay).toBe(1.5);
  //         expect(store.getters.impactByMetricMinDisplay).toBe(8.5);
  //         expect(store.getters.impactByMetricMaxDisplay).toBe(11.5);
  //         expect(store.getters.impactByVisitorsDisplay).toBe(158);
  //         expect(store.getters.impactByVisitorsPerDayDisplay).toBe(158);

  //         expect(store.getters.sample).toBe(10540);
  //         expect(store.getters.visitorsPerDay).toBe(40098);
  //         expect(store.getters.runtime).toBe(1);

  //         store.commit('switch:lockedfield');
  //         store.commit('field:change', {prop: 'runtime', value: 7});

  //         expect(store.getters.sample).toBe(10540);
  //         expect(store.getters.visitorsPerDay).toBe(1505);
  //         expect(store.getters.runtime).toBe(7);

  //         expect(store.getters.impactByVisitorsPerDayDisplay).toBe(22);
  //     });
}

export default {
  init,
}
