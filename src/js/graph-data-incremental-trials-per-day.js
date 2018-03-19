import statFormulas from '../js/math.js'

export default {
    getGraphYTicks () {
        let impact = isNaN(this.impact) ? 0 : this.impact,
            arr = [impact/1.50, impact/1.25, impact, impact*1.25, impact*1.50];

        return arr
    },
    getGraphYTicksFormatted (y) {
        let sample = this.sample,
            base = this.base,

            result = statFormulas.getAbsoluteImpactInVisitors({
                total_sample_size: this.$store.getters.extractValue('sample', sample / this.runtime),
                base_rate: this.$store.getters.extractValue('base', base),
                effect_size: this.$store.getters.extractValue('impact', y)
            });

        if (isNaN(result)) {
            result = 0;
        }

        return this.$store.getters.displayValue('impactByVisitors', result);
    },
    updateClonedValues (clonedObj, value) {
        clonedObj.effect_size = this.$store.getters.extractValue('impact', value);

        return clonedObj;
    },
    getCurrentYValue () {
        return this.impact
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

        return this.$store.getters.displayValue('impactByVisitors', impactByVisitor);
    }
};
