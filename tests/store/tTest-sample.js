import Vue from 'vue';
import Vuex from 'vuex';
import Store from '../../src/store/index.js';

Vue.config.productionTip = false;

Vue.use(Vuex);

let store = new Vuex.Store(Store)

function resetStore() {
    let resetObj = {
        testType: 'tTest',
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

        // base block
        expect(store.getters.visitorsWithGoals).toBe(618260);

        // sample
        expect(store.state.attributes.sample).toBe(61826);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(2);

        // impact
        expect(store.getters.impactByVisitorsDisplay).toBe(12365);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(6182);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        expect(store.state.attributes.sample).toBe(61826);
        expect(store.state.attributes.visitorsPerDay).toBe(8832);
        expect(store.state.attributes.runtime).toBe(7);
    });

    test('Expected changes when Visitors per Day changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'visitorsPerDay', value: 30098});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(618260);

        // sample
        expect(store.state.attributes.sample).toBe(61826);
        expect(store.state.attributes.visitorsPerDay).toBe(30098);
        expect(store.state.attributes.runtime).toBe(3);

        // impact
        expect(store.getters.impactByVisitorsDisplay).toBe(12365);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(4121);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // sample
        expect(store.state.attributes.sample).toBe(61826);
        expect(store.state.attributes.visitorsPerDay).toBe(8832);
        expect(store.state.attributes.runtime).toBe(7);

        // impact
        expect(store.getters.impactByVisitorsDisplay).toBe(12365);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(1766);
    });

    test('Expected changes when False Positive Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'falsePosRate', value: 5});

        expect(store.state.attributes.falsePosRate).toBe(5);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(784900);

        // sample
        expect(store.state.attributes.sample).toBe(78490);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(2);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(15698);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(7849);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(784900);

        // sample
        expect(store.state.attributes.sample).toBe(78490);
        expect(store.state.attributes.visitorsPerDay).toBe(11212);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(15698);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(2242);
    });

    test('Expected changes when Power changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'power', value: 60});

        expect(store.state.attributes.power).toBe(60);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(360320);

        // sample
        expect(store.state.attributes.sample).toBe(36032);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(1);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(7206);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(7206);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(360320);

        // sample
        expect(store.state.attributes.sample).toBe(36032);
        expect(store.state.attributes.visitorsPerDay).toBe(5147);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(7206);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(1029);

    });

    test('Expected changes when Base Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'base', value: 15});

        expect(store.state.attributes.base).toBe(15);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(412200);

        // sample
        expect(store.state.attributes.sample).toBe(27480);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(1);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.3);
        expect(store.getters.impactByMetricMinDisplay).toBe(14.7);
        expect(store.getters.impactByMetricMaxDisplay).toBe(15.3);
        expect(store.getters.impactByVisitorsDisplay).toBe(8244);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(8244);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(412200);

        // sample
        expect(store.state.attributes.sample).toBe(27480);
        expect(store.state.attributes.visitorsPerDay).toBe(3925);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.3);
        expect(store.getters.impactByMetricMinDisplay).toBe(14.7);
        expect(store.getters.impactByMetricMaxDisplay).toBe(15.3);
        expect(store.getters.impactByVisitorsDisplay).toBe(8244);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(1177);
    });

    test('Expected changes when Standard Deviation Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'sdRate', value: 15});

        expect(store.state.attributes.sdRate).toBe(15);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(1391080);

        // sample
        expect(store.state.attributes.sample).toBe(139108);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(4);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(27821);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(6955);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(1391080);

        // sample
        expect(store.state.attributes.sample).toBe(139108);
        expect(store.state.attributes.visitorsPerDay).toBe(19872);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(27821);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(3974);
    });

    test('Expected changes when Relative Impact changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'impact', value: 5});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(98940);

        // sample
        expect(store.state.attributes.sample).toBe(9894);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(1);

        // impact block
        expect(store.state.attributes.impact).toBe(5);
        expect(store.getters.impactByMetricDisplay).toBe(0.5);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.5);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.5);
        expect(store.getters.impactByVisitorsDisplay).toBe(4947);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(4947);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(98940);

        // sample
        expect(store.state.attributes.sample).toBe(9894);
        expect(store.state.attributes.visitorsPerDay).toBe(1413);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(5);
        expect(store.getters.impactByMetricDisplay).toBe(0.5);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.5);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.5);
        expect(store.getters.impactByVisitorsDisplay).toBe(4947);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(706);
    });

    test('Expected changes when Absolute Impact changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'impactByMetricValue', value: 0.15});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(1099140);

        // sample
        expect(store.state.attributes.sample).toBe(109914);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(3);

        // impact block
        expect(store.state.attributes.impact).toBe(1.5);
        expect(store.getters.impactByMetricDisplay).toBe(0.15);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.85);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.15);
        expect(store.getters.impactByVisitorsDisplay).toBe(16487);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(5495);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(1099140);

        // sample
        expect(store.state.attributes.sample).toBe(109914);
        expect(store.state.attributes.visitorsPerDay).toBe(15702);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(1.5);
        expect(store.getters.impactByMetricDisplay).toBe(0.15);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.85);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.15);
        expect(store.getters.impactByVisitorsDisplay).toBe(16487);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(2355);
    });
}

export default {
    init
}
