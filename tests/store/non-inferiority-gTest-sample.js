import Vue from 'vue';
import Vuex from 'vuex';
import Store from '../../src/store/index.js';

Vue.config.productionTip = false;

Vue.use(Vuex);

let store = new Vuex.Store(Store)

function resetStore(obj = {}) {
    let resetObj = Object.assign({
        testType: 'gTest',
        calculateProp: 'sample',

        sample: 561364,
        base: 10,
        impact: 2,
        power: 80,
        falsePosRate: 10,
        sdRate: 10,

        runtime: 14,

        visitorsPerDay: Math.ceil(561364 / 14),
        lockedField: 'days',

        // non inferiority
        threshold: 0,
        selected: 'relative',
        enabled: true
    }, obj);

    store.dispatch('test:reset', resetObj)
}


function init () {
    test('Expected initial calculated value of sample when using checkbox', () => {
        resetStore({
            impact: 2,
            enabled: false
        });

        store.dispatch('change:noninferiority', {prop: 'enabled', value: true});

        // non inferiority
        expect(store.state.nonInferiority.threshold).toBe(0);
        expect(store.state.nonInferiority.enabled).toBe(true);
        expect(store.state.nonInferiority.selected).toBe('relative');
        expect(store.getters.thresholdCorrectedValue).toBe(0);

        // base block
        expect(store.getters.visitorsWithGoals).toBe('-');

        // sample
        expect(store.state.attributes.sample).toBe('-');
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe('-');

        // impact block
        expect(store.state.attributes.impact).toBe(0);
        expect(store.getters.impactByMetricDisplay).toBe(0);
        expect(store.getters.impactByMetricMinDisplay).toBe(10);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10);
        expect(store.getters.impactByVisitorsDisplay).toBe('-');
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe('-');
    });

    test('Expected changes when threshold changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'threshold', value: 10});

        // non inferiority
        expect(store.state.nonInferiority.threshold).toBe(10);
        expect(store.state.nonInferiority.enabled).toBe(true);
        expect(store.state.nonInferiority.selected).toBe('relative');
        expect(store.getters.thresholdCorrectedValue).toBe(0.1);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(1623);

        // sample
        expect(store.state.attributes.sample).toBe(16230);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(1);

        // impact block
        expect(store.state.attributes.impact).toBe(0);
        expect(store.getters.impactByMetricDisplay).toBe(0);
        expect(store.getters.impactByMetricMinDisplay).toBe(10);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10);
        expect(store.getters.impactByVisitorsDisplay).toBe(0);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(0);

    });

    test('Expected changes when Selected Non inferiority changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'threshold', value: 100});
        store.dispatch('change:noninferiority', {prop: 'selected', value: 'absolutePerDay'});

        // non inferiority
        expect(store.state.nonInferiority.threshold).toBe(100);
        expect(store.state.nonInferiority.enabled).toBe(true);
        expect(store.state.nonInferiority.selected).toBe('absolutePerDay');
        expect(store.getters.thresholdCorrectedValue).toBe(100);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(26092);

        // sample
        expect(store.state.attributes.sample).toBe(260928);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(0);
        expect(store.getters.impactByMetricDisplay).toBe(0);
        expect(store.getters.impactByMetricMinDisplay).toBe(10);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10);
        expect(store.getters.impactByVisitorsDisplay).toBe(0);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(0);
    });

    test('Expected changes (none) for Relative Threshold when Runtime changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'threshold', value: 10});
        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 15});

        // non inferiority
        expect(store.state.nonInferiority.threshold).toBe(10);
        expect(store.state.nonInferiority.enabled).toBe(true);
        expect(store.state.nonInferiority.selected).toBe('relative');
        expect(store.getters.thresholdCorrectedValue).toBe(0.10);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(1623);

        // sample
        expect(store.state.attributes.sample).toBe(16230);
        expect(store.state.attributes.visitorsPerDay).toBe(1082);
        expect(store.state.attributes.runtime).toBe(15);

        // impact block
        expect(store.state.attributes.impact).toBe(0);
        expect(store.getters.impactByMetricDisplay).toBe(0);
        expect(store.getters.impactByMetricMinDisplay).toBe(10);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10);
        expect(store.getters.impactByVisitorsDisplay).toBe(0);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(0);
    });

    test('Expected changes (sample) for Absolute Threshold per Day when Runtime changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'threshold', value: 100});
        store.dispatch('change:noninferiority', {prop: 'selected', value: 'absolutePerDay'});
        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 15});

        // non inferiority
        expect(store.state.nonInferiority.threshold).toBe(100);
        expect(store.state.nonInferiority.enabled).toBe(true);
        expect(store.state.nonInferiority.selected).toBe('absolutePerDay');
        expect(store.getters.thresholdCorrectedValue).toBe(100);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(138646);

        // sample
        expect(store.state.attributes.sample).toBe(1386468);
        expect(store.state.attributes.visitorsPerDay).toBe(92431);
        expect(store.state.attributes.runtime).toBe(15);

        // impact block
        expect(store.state.attributes.impact).toBe(0);
        expect(store.getters.impactByMetricDisplay).toBe(0);
        expect(store.getters.impactByMetricMinDisplay).toBe(10);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10);
        expect(store.getters.impactByVisitorsDisplay).toBe(0);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(0);
    });

    test('Expected changes (sample) for Absolute Threshold per Day when switch the lock...', () => {
        // Expected changes (sample) for Absolute Threshold per Day when switch the lock from runtime to Visitors per Day changes (bug from previous version)
        resetStore();

        store.dispatch('field:change', {prop: 'threshold', value: 100});
        store.dispatch('change:noninferiority', {prop: 'selected', value: 'absolutePerDay'});
        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 15});
        store.dispatch('switch:lockedfield');

        // expect to be the same as previous test

        // non inferiority
        expect(store.state.nonInferiority.threshold).toBe(100);
        expect(store.state.nonInferiority.enabled).toBe(true);
        expect(store.state.nonInferiority.selected).toBe('absolutePerDay');
        expect(store.getters.thresholdCorrectedValue).toBe(100);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(138646);

        // sample
        expect(store.state.attributes.sample).toBe(1386468);
        expect(store.state.attributes.visitorsPerDay).toBe(92431);
        expect(store.state.attributes.runtime).toBe(15);

        // impact block
        expect(store.state.attributes.impact).toBe(0);
        expect(store.getters.impactByMetricDisplay).toBe(0);
        expect(store.getters.impactByMetricMinDisplay).toBe(10);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10);
        expect(store.getters.impactByVisitorsDisplay).toBe(0);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(0);
    });
}

export default {
    init
}
