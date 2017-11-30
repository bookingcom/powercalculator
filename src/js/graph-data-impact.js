export default {
    getGraphYTicks () {
        let impact = this.impact,
            arr = [impact/4, impact/2, impact, impact*2, impact*4];

        return arr
    },
    getGraphYTicksFormatted (y) {
        return `${y}%`
    },
    updateClonedValues (clonedObj, value) {
        clonedObj.effect_size = this.extractValue('impact', value);

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
};
