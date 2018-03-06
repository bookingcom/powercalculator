import Vue from 'vue';
import Vuex from 'vuex';
import Store from '../../src/store/index.js';

Vue.config.productionTip = false;

Vue.use(Vuex);

let store = new Vuex.Store(Store)

function resetStore() {
    let resetObj = {
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
        lockedField: 'days'
    };

    store.dispatch('test:reset', resetObj)
}


function init () {
    test('Expected initial calculated value of sample', () => {
        resetStore();

        store.dispatch('update:proptocalculate');

        expect(store.state.attributes.sample).toBe(561364);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(14);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        expect(store.state.attributes.sample).toBe(561364);
        expect(store.state.attributes.visitorsPerDay).toBe(80194);
        expect(store.state.attributes.runtime).toBe(7);

        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(160);
    });

    test('Expected changes when Visitors per Day changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'visitorsPerDay', value: 30098});

        expect(store.state.attributes.sample).toBe(561364);
        expect(store.state.attributes.visitorsPerDay).toBe(30098);
        expect(store.state.attributes.runtime).toBe(19);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        expect(store.state.attributes.sample).toBe(561364);
        expect(store.state.attributes.visitorsPerDay).toBe(80194);
        expect(store.state.attributes.runtime).toBe(7);

        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(160);
    });

    test('Expected changes when False Positive Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'falsePosRate', value: 5});

        expect(store.state.attributes.falsePosRate).toBe(5);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(71266);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(1425);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(79);

        expect(store.state.attributes.sample).toBe(712664);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(18);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        expect(store.state.attributes.sample).toBe(712664);
        expect(store.state.attributes.visitorsPerDay).toBe(101809);
        expect(store.state.attributes.runtime).toBe(7);

        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(203);
    });

    test('Expected changes when Power changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'power', value: 60});

        expect(store.state.attributes.power).toBe(60);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(32716);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(654);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(72);

        expect(store.state.attributes.sample).toBe(327162);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(9);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        expect(store.state.attributes.sample).toBe(327162);
        expect(store.state.attributes.visitorsPerDay).toBe(46737);
        expect(store.state.attributes.runtime).toBe(7);

        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(93);
    });

    test('Expected changes when Base Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'base', value: 15});

        expect(store.state.attributes.base).toBe(15);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(52982);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.3);
        expect(store.getters.impactByMetricMinDisplay).toBe(14.7);
        expect(store.getters.impactByMetricMaxDisplay).toBe(15.3);
        expect(store.getters.impactByVisitorsDisplay).toBe(1059);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(117);

        expect(store.state.attributes.sample).toBe(353218);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(9);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        expect(store.state.attributes.sample).toBe(353218);
        expect(store.state.attributes.visitorsPerDay).toBe(50459);
        expect(store.state.attributes.runtime).toBe(7);

        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(151);
    });

    test('Expected changes when Relative Impact changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'impact', value: 5});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(9099);

        // impact block
        expect(store.state.attributes.impact).toBe(5);
        expect(store.getters.impactByMetricDisplay).toBe(0.5);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.5);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.5);
        expect(store.getters.impactByVisitorsDisplay).toBe(454);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(151);

        expect(store.state.attributes.sample).toBe(90996);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(3);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        expect(store.state.attributes.sample).toBe(90996);
        expect(store.state.attributes.visitorsPerDay).toBe(12999);
        expect(store.state.attributes.runtime).toBe(7);

        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(64);
    });

    test('Expected changes when Absolute Impact changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'impactByMetricValue', value: 1.5});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(1054);

        // impact block
        expect(store.state.attributes.impact).toBe(15);
        expect(store.getters.impactByMetricDisplay).toBe(1.5);
        expect(store.getters.impactByMetricMinDisplay).toBe(8.5);
        expect(store.getters.impactByMetricMaxDisplay).toBe(11.5);
        expect(store.getters.impactByVisitorsDisplay).toBe(158);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(158);

        expect(store.state.attributes.sample).toBe(10540);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(1);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        expect(store.state.attributes.sample).toBe(10540);
        expect(store.state.attributes.visitorsPerDay).toBe(1505);
        expect(store.state.attributes.runtime).toBe(7);

        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(22);
    });
}

export default {
    init
}
