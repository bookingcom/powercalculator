import Vue from 'vue';
import Vuex from 'vuex';
import Store from '../../src/store/index.js';

Vue.config.productionTip = false;

Vue.use(Vuex);

let store = new Vuex.Store(Store)

function resetStore() {
    let resetObj = {
        testType: 'tTest',
        calculateProp: 'impact',

        sample: 61826,
        base: 10,
        impact: 2,
        power: 80,
        falsePosRate: 10,
        sdRate: 10,

        runtime: 2,

        visitorsPerDay: 40098,
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
        expect(store.state.attributes.impact).toBe(2);
        expect(store.getters.impactByMetricDisplay).toBe(0.2);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.8);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.2);
        expect(store.getters.impactByVisitorsDisplay).toBe(12365);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(6182);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(2806860);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact
        expect(store.state.attributes.impact).toBe(0.94);
        expect(store.getters.impactByMetricDisplay).toBe(0.09399999999999999);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.906);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.094);
        expect(store.getters.impactByVisitorsDisplay).toBe(26384);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(3769);
    });

    test('Expected changes when Visitors per Day changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'visitorsPerDay', value: 30098});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(601960);

        // sample
        expect(store.state.attributes.sample).toBe(60196);
        expect(store.state.attributes.visitorsPerDay).toBe(30098);
        expect(store.state.attributes.runtime).toBe(2);

        // impact
        expect(store.state.attributes.impact).toBe(2.03);
        expect(store.getters.impactByMetricDisplay).toBe(0.20299999999999999);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.797);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.203);
        expect(store.getters.impactByVisitorsDisplay).toBe(12219);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(6109);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(2106860);

        // sample
        expect(store.state.attributes.sample).toBe(210686);
        expect(store.state.attributes.visitorsPerDay).toBe(30098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact
        expect(store.state.attributes.impact).toBe(1.08);
        expect(store.getters.impactByMetricDisplay).toBe(0.10800000000000001);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.892);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.108);
        expect(store.getters.impactByVisitorsDisplay).toBe(22754);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(3250);
    });

    test('Expected changes when False Positive Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'falsePosRate', value: 5});

        expect(store.state.attributes.falsePosRate).toBe(5);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(618260);

        // sample
        expect(store.state.attributes.sample).toBe(61826);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(2);

        // impact
        expect(store.state.attributes.impact).toBe(2.25);
        expect(store.getters.impactByMetricDisplay).toBe(0.22499999999999998);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.775);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.225);
        expect(store.getters.impactByVisitorsDisplay).toBe(13910);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(6955);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(2806860);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact
        expect(store.state.attributes.impact).toBe(1.06);
        expect(store.getters.impactByMetricDisplay).toBe(0.106);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.894);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.106);
        expect(store.getters.impactByVisitorsDisplay).toBe(29752);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(4250);
    });

    test('Expected changes when Power changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'power', value: 60});

        expect(store.state.attributes.power).toBe(60);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(618260);

        // sample
        expect(store.state.attributes.sample).toBe(61826);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(2);

        // impact
        expect(store.state.attributes.impact).toBe(1.53);
        expect(store.getters.impactByMetricDisplay).toBe(0.15300000000000002);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.847);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.153);
        expect(store.getters.impactByVisitorsDisplay).toBe(9459);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(4729);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(2806860);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact
        expect(store.state.attributes.impact).toBe(0.72);
        expect(store.getters.impactByMetricDisplay).toBe(0.072);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.928);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.072);
        expect(store.getters.impactByVisitorsDisplay).toBe(20209);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(2887);

    });

    test('Expected changes when Base Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'base', value: 15});

        expect(store.state.attributes.base).toBe(15);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(927390);

        // sample
        expect(store.state.attributes.sample).toBe(61826);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(2);

        // impact block
        expect(store.state.attributes.impact).toBe(1.33);
        expect(store.getters.impactByMetricDisplay).toBe(0.1995);
        expect(store.getters.impactByMetricMinDisplay).toBe(14.8005);
        expect(store.getters.impactByMetricMaxDisplay).toBe(15.1995);
        expect(store.getters.impactByVisitorsDisplay).toBe(12334);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(6167);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(4210290);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(0.63);
        expect(store.getters.impactByMetricDisplay).toBe(0.0945);
        expect(store.getters.impactByMetricMinDisplay).toBe(14.9055);
        expect(store.getters.impactByMetricMaxDisplay).toBe(15.0945);
        expect(store.getters.impactByVisitorsDisplay).toBe(26524);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(3789);
    });

    test('Expected changes when Standard Deviation Rate changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'sdRate', value: 15});

        expect(store.state.attributes.sdRate).toBe(15);

        // base block
        expect(store.getters.visitorsWithGoals).toBe(618260);

        // sample
        expect(store.state.attributes.sample).toBe(61826);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(2);

        // impact block
        expect(store.state.attributes.impact).toBe(3);
        expect(store.getters.impactByMetricDisplay).toBe(0.3);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.7);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.3);
        expect(store.getters.impactByVisitorsDisplay).toBe(18547);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(9273);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(2806860);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(1.41);
        expect(store.getters.impactByMetricDisplay).toBe(0.141);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.859);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.141);
        expect(store.getters.impactByVisitorsDisplay).toBe(39576);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(5653);
    });

    test('Expected changes when Total Sample changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'sample', value: 600000});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(6000000);

        // sample
        expect(store.state.attributes.sample).toBe(600000);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(15);

        // impact block
        expect(store.state.attributes.impact).toBe(0.64);
        expect(store.getters.impactByMetricDisplay).toBe(0.064);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.936);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.064);
        expect(store.getters.impactByVisitorsDisplay).toBe(38400);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(2560);

        store.dispatch('switch:lockedfield');
        store.dispatch('field:change', {prop: 'runtime', value: 7});

        // base
        expect(store.getters.visitorsWithGoals).toBe(2806860);

        // sample
        expect(store.state.attributes.sample).toBe(280686);
        expect(store.state.attributes.visitorsPerDay).toBe(40098);
        expect(store.state.attributes.runtime).toBe(7);

        // impact block
        expect(store.state.attributes.impact).toBe(0.94);
        expect(store.getters.impactByMetricDisplay).toBe(0.09399999999999999);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.906);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.094);
        expect(store.getters.impactByVisitorsDisplay).toBe(26384);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(3769);
    });

    test('Expected changes when Visitors per Day changes', () => {
        resetStore();

        store.dispatch('field:change', {prop: 'visitorsPerDay', value: 50000});

        // base block
        expect(store.getters.visitorsWithGoals).toBe(1000000);

        // sample
        expect(store.state.attributes.sample).toBe(100000);
        expect(store.state.attributes.visitorsPerDay).toBe(50000);
        expect(store.state.attributes.runtime).toBe(2);

        // impact block
        expect(store.state.attributes.impact).toBe(1.57);
        expect(store.getters.impactByMetricDisplay).toBe(0.15700000000000003);
        expect(store.getters.impactByMetricMinDisplay).toBe(9.843);
        expect(store.getters.impactByMetricMaxDisplay).toBe(10.157);
        expect(store.getters.impactByVisitorsDisplay).toBe(15700);
        expect(store.getters.impactByVisitorsPerDayDisplay).toBe(7850);

    });
}

export default {
    init
}
