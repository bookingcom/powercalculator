import statFormulas from '../../js/math.js'

export default {
    state:{
        testType: 'gTest',
        calculateProp: 'sample', // power, impact, base, sample

        sample: 561364,
        base: 10,
        impact: 2,
        power: 80,
        falsePosRate: 10,
        sdRate: 10,

        runtime: 14, //days

        visitorsPerDay: Math.ceil(561364 / 14),
        lockedField: 'days'
    },

    mutations: {
        'field:change' (state, { prop, value }) {
            if (typeof state[prop] != 'undefined') {
                state[prop] = value;
            }
        },
        'sample:sideeffect' (state, { prop, value }) {
            state[prop] = value;
        },
        'switch:lockedfield' (state, { value }) {
            state.lockedField = value;
        },
        'update:calculateprop' (state, { value }) {
            state.calculateProp = value;
        },
        'test:reset' (state, stateObj) {
            let props = Object.keys(state);
            props.forEach((prop) => {
                if (prop in stateObj) {
                    state[prop] = stateObj[prop];
                }
            })
        }
    },

    getters: {
        visitorsPerDay (state, getters) {
            return state.visitorsPerDay
        },
        lockedField (state, getters) {
            return state.lockedField
        },
        runtime (state, getters) {
            return state.runtime
        },
        visitorsWithGoals (state, getters) {
            let result = statFormulas.getVisitorsWithGoals({
                    total_sample_size: getters.extractValue('sample'),
                    base_rate: getters.extractValue('base')
                })

            return getters.displayValue('metricTotals', result)
        },
        impactByMetric (state, getters) {
            return function impactByMetricInner (prop = 'value') {
                let impactByMetricObj = statFormulas.getAbsoluteImpactInMetricHash({
                    base_rate: getters.extractValue('base', state.base),
                    effect_size: getters.extractValue('impact', state.impact)
                })

                return impactByMetricObj[prop];
            }
        },
        impactByVisitors (state, getters) {
            return statFormulas.getAbsoluteImpactInVisitors({
                total_sample_size: getters.extractValue('sample', state.sample),
                base_rate: getters.extractValue('base', state.base),
                effect_size: getters.extractValue('impact', state.impact)
            })
        },
        impactByVisitorsPerDay (state, getters) {
            return Math.floor(getters.impactByVisitors / state.runtime);
        },
        impactByMetricDisplay (state, getters) {
            return getters.displayValue('impactByMetricValue', getters.impactByMetric());
        },
        impactByMetricMinDisplay (state, getters) {
            return getters.displayValue('impactByMetricValue', getters.impactByMetric('min'));
        },
        impactByMetricMaxDisplay (state, getters) {
            return getters.displayValue('impactByMetricValue', getters.impactByMetric('max'));
        },
        impactByVisitorsDisplay (state, getters) {
            return getters.displayValue('impactByVisitors', getters.impactByVisitors)
        },
        impactByVisitorsPerDayDisplay (state, getters) {
            return getters.displayValue('impactByVisitorsPerDay', getters.impactByVisitorsPerDay)
        },
        calculateImpactFromAbsoluteImpact (state, getters) {
            return function calculateImpactFromAbsoluteImpactInner (absolute_effect_size) {

                let absoluteImpact = getters.extractValue('impactByMetricValue', absolute_effect_size);
                return statFormulas.getRelativeImpactFromAbsolute({
                    absolute_effect_size: absoluteImpact,
                    base_rate: getters.extractValue('base', state.base)
                });
            }
        },
        baseFromVisitorsWithGoals (state, getters) {
            return function baseFromVisitorsWithGoalsInner (value) {
                return getters.displayValue(
                    'base',
                    statFormulas.getBaseRate({
                        total_sample_size: getters.extractValue('sample', state.sample),
                        visitors_with_goals: value
                    })
                )
            }
        }

    }
}
