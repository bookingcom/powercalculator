export default {
    getGraphYTicks () {
        let impact = this.impact,
            arr = [impact/1.50, impact/1.25, impact, impact*1.25, impact*1.50];
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
