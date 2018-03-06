export default {
    getGraphYTicks () {
        let impact = isNaN(this.impact) ? 0 : this.impact,
            arr = [impact/1.50, impact/1.25, impact, impact*1.25, impact*1.50];
        return arr
    },
    getGraphYTicksFormatted (y) {
        let num = window.parseFloat(y);
        if ((num % 1) !== 0) {
            num = num.toFixed(2);
        }

        if (isNaN(num)) {
            num = 0;
        }

        return `${num}%`
    },
    updateClonedValues (clonedObj, value) {
        clonedObj.effect_size = this.$store.getters.extractValue('impact', value);

        return clonedObj;
    },
    getCurrentYValue () {
        return this.impact
    },
    getGraphXTicksFormatted (x) {
        let result = x;

        result += '%';

        return result
    },
};
