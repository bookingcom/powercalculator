import statFormulas from '../../js/math.js'

export default {
    state:{
        threshold: 0,
        thresholdRelative: 0,
        thresholdAbsolute: 0,
        selected: 'relative', // relative, absolutePerDay
        enabled: false,
        expectedChange: 'nochange' // nochange, degradation, improvement
    },
    mutations: {
        'field:change' (state, { prop, value }) {
            switch (prop) {
                case 'thresholdRelative':
                    state.threshold = value;
                    state.selected = 'relative';
                break;
                case 'thresholdAbsolute':
                    state.threshold = value;
                    state.selected = 'absolutePerDay';
                break;
                case 'threshold':
                    if (state.selected == 'absolutePerDay') {
                        state.thresholdAbsolute = value;
                    } else {
                        state.thresholdRelative = value;
                    }
                break;
                case 'selected':
                    if (value == 'absolutePerDay') {
                        state.thresholdAbsolute = state.threshold;
                    } else {
                        state.thresholdRelative = state.threshold;
                    }
                break;
                default:

                break;
            }

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
        nonInferiorityImpact (state, getters, rootState) {
            let { expectedChange, threshold, selected } = state,
                newImpact = 0,
                visitorsPerDay = rootState.attributes.visitorsPerDay,
                base = getters.extractValue('base', rootState.attributes.base);

            if (selected == 'absolutePerDay') {
                threshold = threshold/(base*visitorsPerDay)*100
            }
            switch (expectedChange) {
                case 'nochange':
                default:
                    // zero
                break;

                case 'degradation':
                    newImpact = -threshold/2;
                break;

                case 'improvement':
                    newImpact = threshold;
                break;
            }

            return newImpact
        },
        mu (state, getters) {
            return getters.customMu({
                runtime: getters.runtime,
                thresholdCorrectedValue: getters.thresholdCorrectedValue,
                visitors_per_day: getters.visitorsPerDay,
                base_rate: getters.extractValue('base'),
            });
        },
        customMu (state, getters) {
            return function customMuInner ({runtime, thresholdCorrectedValue, visitors_per_day, base_rate}) {
                let mu = 0;

                if (state.enabled) {
                    let thresholdType = state.selected,
                        data = {
                            runtime,
                            threshold: -( getters.extractValue('nonInfThreshold', thresholdCorrectedValue) ),
                            visitors_per_day,
                            base_rate
                        };
                    mu = {
                        absolutePerDay: statFormulas.getMuFromAbsolutePerDay,
                        relative: statFormulas.getMuFromRelativeDifference
                    }[thresholdType](data)
                }

                return mu
            }
        },
        opts (state, getters) {
            if (!state.enabled) {
                return false
            }

            let opts = {
                selected: state.selected,
                lockedField: getters.lockedField,
                thresholdCorrectedValue: getters.thresholdCorrectedValue,
                runtime: getters.runtime,
                visitorsPerDay: getters.visitorsPerDay,
            };

            return getters.customOpts(opts);
        },
        customOpts (state, getters) {
            return function customOptsInner ({ selected, lockedField, thresholdCorrectedValue, runtime, visitorsPerDay }) {
                let type = selected,
                    opts;

                opts = {
                    type,
                    calculating: lockedField,
                    threshold: -( getters.extractValue('nonInfThreshold', thresholdCorrectedValue) ),
                };

                if (type == 'absolutePerDay') {
                    if (lockedField == 'visitorsPerDay') {
                        opts = Object.assign(
                            opts,
                            {
                                days: runtime
                            }
                        );
                    } else {
                        opts = Object.assign(
                            opts,
                            {
                                visitors_per_day: getters.extractValue('sample', visitorsPerDay)
                            }
                        );
                    }
                }

                return opts
            }

        },
        alternative (state, getters) {
            if (!state.enabled) {
                // in this case the test type would be 'comparative'
                return false;
            }

            return getters.customAlternative({type: 'noninferiority'});
        },
        customAlternative (state, getters) {
            return function customAlternativeInner ({type}) {
                return statFormulas.getAlternative({type});
            }
        },
        thresholdCorrectedValue (state, getters) {
            let { threshold, selected } = state;

            return getters.customThresholdCorrectedValue({ threshold, selected });
        },
        customThresholdCorrectedValue (state) {
            return function customThresholdCorrectedValueInner ({ threshold, selected }) {
                // when relative is selected the value we will convert it to
                // percentage

                let nonInfThreshold = threshold;
                const isRelative = selected == 'relative';

                let result = nonInfThreshold;
                if (isRelative) {
                    result = result / 100;
                }

                return result;
            }
        },
        calculateRelativeFromAbsolute (state, getters, rootState) {
            return function caclulateRelativeFromAbsoluteInner(absoluteThreshold) {
                const visitorsPerDay = rootState.attributes.visitorsPerDay;
                const base = getters.extractValue('base', rootState.attributes.base);

                const relativeThreshold = absoluteThreshold/(base*visitorsPerDay);

                return isNaN(relativeThreshold) ? 0 : relativeThreshold;
            }
        },
        calculateAbsoluteFromRelative (state, getters, rootState) {
            return function calculateAbsoluteFromRelativeInner(relativeThreshold) {
                const visitorsPerDay = rootState.attributes.visitorsPerDay;
                const base = getters.extractValue('base', rootState.attributes.base);

                const absoluteThreshold = (relativeThreshold*base*visitorsPerDay)/100;
                return isNaN(absoluteThreshold) ? 0 : absoluteThreshold;
            }
        }
    }
}
