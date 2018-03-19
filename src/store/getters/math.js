import statFormulas from '../../js/math.js'

export default {
    calculatedValues (state, getters) {
        let prop = state.attributes.calculateProp,
            value = getters.formulaToSolve(getters.convertDisplayedValues);
        return {
            prop,
            value: getters.displayValue(prop, value)
        };
    },
    formulaToSolve (state, getters) {
        let calculateProp = state.attributes.calculateProp;

        return getters.formulaToSolveProp[calculateProp];
    },
    formulaToSolveProp (state, getters) {
        // used for the graph as we need to pass many different values to dynamic attributes
        let testType = state.attributes.testType;

        return statFormulas[testType];
    },
    convertDisplayedValues (state, getters) {
        let { mu, opts, alternative } = getters;

        return {
            mu,
            opts,
            alternative,
            total_sample_size: getters.extractValue('sample'),
            base_rate: getters.extractValue('base'),
            effect_size: getters.extractValue('impact'),
            alpha: getters.extractValue('falsePosRate'),
            beta: 1 - getters.extractValue('power'), // power of 80%, beta is actually 20%
            sd_rate: getters.extractValue('sdRate')
        }
    }
}
