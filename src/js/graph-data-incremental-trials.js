import statFormulas from '../js/math.js'

export default {
    getGraphYTicks () {
        let impact = this.impact,
            arr = [impact/4, impact/2, impact, impact*2, impact*4];

        return arr
    },
    getGraphYTicksFormatted (y) {
        let sample = this.sample,
            base = this.base,

            result = statFormulas.getAbsoluteImpactInVisitors({
                total_sample_size: this.extractValue('sample', sample),
                base_rate: this.extractValue('base', base),
                effect_size: this.extractValue('impact', y)
            });

        return this.displayValue('impactByVisitors', result);
    },
    updateClonedValues (clonedObj, value) {
        clonedObj.effect_size = this.extractValue('impact', value);;

        return clonedObj;
    },
    getCurrentYValue () {
        return this.impact
    },
    getGraphXTicksFormatted (x) {
        let { displayValue } = this,
            result = x;

        result = result
        result += '%';

        return result
    },
    getGraphXTicksFormatted (x) {
        let { displayValue } = this,
            result = x / this.runtime;

        result = displayValue('impactByVisitors', result)
        if (result >= 1000) {
            result = window.parseInt(result / 1000) + 'k'
        }

        return result
    },
    getGraphXValueForClonedValues (clonedValues) {
        let {total_sample_size, base_rate, effect_size} = clonedValues,

            impactByVisitor = statFormulas.getAbsoluteImpactInVisitors({
                total_sample_size,
                base_rate,
                effect_size,
            });

        return this.displayValue('impactByVisitors', impactByVisitor);
    }
};
