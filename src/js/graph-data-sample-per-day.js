export default {
    getGraphXTicksFormatted (x) {
        let result = x / this.runtime;
        result = this.$store.getters.displayValue('sample', result)
        if (result >= 1000) {
            result = window.parseInt(result / 1000) + 'k'
        }

        return result
    },
    getGraphXValueForClonedValues (clonedValues) {
        let graphX = 'sample';
        return this.$store.getters.displayValue(graphX, (this.math[graphX](clonedValues)));
    }
};
