import Vue from 'vue';
import Vuex from 'vuex';
import Store from '../../src/store/index.js';

Vue.config.productionTip = false;

Vue.use(Vuex);

let store = new Vuex.Store(Store)

function resetStore() {
    let resetObj = {
        testType: 'gTest',
        calculateProp: 'impact',

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

        // base
        expect(store.getters.visitorsWithGoals).toBe(56136);

        // sample
        expect(store.state.attributes.sample).toBe(561364);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(14);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(1122);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(80);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base
        expect(store.getters.visitorsWithGoals).toBe(28068);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(2.83);
        expect(store.getters.impactByMetricDisplay).toBe(0.28);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.72);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.28);
        expect(store.getters.impactByVisitorsDisplay).toBe(794);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(113);
    });

    test('Expected changes when Visitors per Day changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'visitorsPerDay', value: 30098});

        // base
        expect(store.getters.visitorsWithGoals).toBe(42137);

        // sample
        expect(store.state.attributes.sample).toBe(421372);
        expect(store.state.attributes.visitorsPerDay).toBe(30098);
        expect(store.state.attributes.runtime).toBe(14);

        // impact block
        expect(store.state.attributes.impact).toBe(2.31);
        expect(store.getters.impactByMetricDisplay).toBe(0.23);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.77);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.23);
        expect(store.getters.impactByVisitorsDisplay).toBe(973);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(69);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base
        expect(store.getters.visitorsWithGoals).toBe(21068);

        // sample
        expect(store.state.attributes.sample).toBe(210686);
        expect(store.state.attributes.visitorsPerDay).toBe(30098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(3.27);
        expect(store.getters.impactByMetricDisplay).toBe(0.33);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.67);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.33);
        expect(store.getters.impactByVisitorsDisplay).toBe(688);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(98);
    });

    test('Expected changes when False Positive Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'falsePosRate', value: 5});

        expect(store.state.attributes.falsePosRate).toBe(5);

        // impact block
        expect(store.state.attributes.impact).toBe(2.25);
        expect(store.getters.impactByMetricDisplay).toBe(0.22);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.78);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.23);
        expect(store.getters.impactByVisitorsDisplay).toBe(1263);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(90);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base
        expect(store.getters.visitorsWithGoals).toBe(28068);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(3.2);
        expect(store.getters.impactByMetricDisplay).toBe(0.32);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.68);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.32);
        expect(store.getters.impactByVisitorsDisplay).toBe(898);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(128);
    });

    test('Expected changes when Power changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'power', value: 60});

        expect(store.state.attributes.power).toBe(60);

        // impact block
        expect(store.state.attributes.impact).toBe(1.53);
        expect(store.getters.impactByMetricDisplay).toBe(0.15);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.85);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.15);
        expect(store.getters.impactByVisitorsDisplay).toBe(858);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(61);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base
        expect(store.getters.visitorsWithGoals).toBe(28068);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(2.16);
        expect(store.getters.impactByMetricDisplay).toBe(0.22);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.78);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.22);
        expect(store.getters.impactByVisitorsDisplay).toBe(606);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(86);
    });

    test('Expected changes when Base Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'base', value: 15});

        expect(store.state.attributes.base).toBe(15);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(84204);

        // impact block
        expect(store.state.attributes.impact).toBe(1.59);
        expect(store.getters.impactByMetricDisplay).toBe(0.24);
        expect(store.getters.impactByMetricMinDisplay).toBe(14.76);
        expect(store.getters.impactByMetricMaxDisplay).toBe(15.24);
        expect(store.getters.impactByVisitorsDisplay).toBe(1338);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(95);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base
        expect(store.getters.visitorsWithGoals).toBe(42102);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(2.24);
        expect(store.getters.impactByMetricDisplay).toBe(0.34);
        expect(store.getters.impactByMetricMinDisplay).toBe(14.66);
        expect(store.getters.impactByMetricMaxDisplay).toBe(15.34);
        expect(store.getters.impactByVisitorsDisplay).toBe(943);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(134);
    });

    test('Expected changes when Total Sample changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'sample', value: 600000});

        // sample
        expect(store.state.attributes.sample).toBe(600000);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(15);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(60000);

        // impact block
        expect(store.state.attributes.impact).toBe(1.93);
        expect(store.getters.impactByMetricDisplay).toBe(0.19);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.81);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.19);
        expect(store.getters.impactByVisitorsDisplay).toBe(1158);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(77);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base
        expect(store.getters.visitorsWithGoals).toBe(28068);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(2.83);
        expect(store.getters.impactByMetricDisplay).toBe(0.28);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.72);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.28);
        expect(store.getters.impactByVisitorsDisplay).toBe(794);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(113);
    });

    test('Expected changes when Visitors per Day changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'visitorsPerDay', value: 50000});

        // sample
        expect(store.state.attributes.sample).toBe(700000);
        expect(store.state.attributes.visitorsPerDay).toBe(50000);
        expect(store.state.attributes.runtime).toBe(14);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(70000);

        // impact block
        expect(store.state.attributes.impact).toBe(1.79);
        expect(store.getters.impactByMetricDisplay).toBe(0.18);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.82);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.18);
        expect(store.getters.impactByVisitorsDisplay).toBe(1253);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(89);

    });
}

export default {
    init
}
