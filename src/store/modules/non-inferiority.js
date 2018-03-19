import statFormulas from '../../js/math.js'

export default {
    state:{
        threshold: 0,
        selected: 'relative', // relative, absolutePerDay
        enabled: false
    },
    mutations: {
        'field:change' (state, { prop, value }) {
            if (typeof state[prop] != 'undefined') {
                state[prop] = value;
            }
        },
        'change:noninferiority' (state, {prop, value}) {
            state[prop] = value
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
        mu (state, getters) {
            let mu = 0;

            if (state.enabled) {
                let thresholdType = state.selected,
                    data = {
                        runtime: getters.runtime,
                        threshold: -( getters.extractValue('nonInfThreshold', getters.thresholdCorrectedValue) ),
                        visitors_per_day: getters.visitorsPerDay,
                        base_rate: getters.extractValue('base'),
                    };
                mu = {
                    absolutePerDay: statFormulas.getMuFromAbsolutePerDay,
                    relative: statFormulas.getMuFromRelativeDifference
                }[thresholdType](data)
            }

            return mu
        },
        opts (state, getters) {
            if (!state.enabled) {
                return false
            }

            let type = state.selected,
                opts;

            opts = {
                type,
                calculating: getters.lockedField,
                threshold: -( getters.extractValue('nonInfThreshold', getters.thresholdCorrectedValue) ),
            };

            if (type == 'absolutePerDay') {
                if (getters.lockedField == 'visitorsPerDay') {
                    opts = Object.assign(
                        opts,
                        {
                            days: getters.runtime
                        }
                    );
                } else {
                    opts = Object.assign(
                        opts,
                        {
                            visitors_per_day: getters.extractValue('sample', getters.visitorsPerDay)
                        }
                    );
                }
            }

            return opts
        },
        alternative (state, getters) {
            if (!state.enabled) {
                // in this case the test type would be 'comparative'
                return false
            }

            return statFormulas.getAlternative({type: 'noninferiority'});
        },
        thresholdCorrectedValue (state) {
            // when relative is selected the value we will convert it to
            // percentage

            let nonInfThreshold = state.threshold;
            const isRelative = state.selected == 'relative';

            let result = nonInfThreshold;
            if (isRelative) {
                result = result / 100
            }

            return result;
        }
    }
}
