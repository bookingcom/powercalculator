export default {
    getGraphXTicksFormatted (x) {
        let { displayValue } = this,
            result = x / this.runtime;
        result = displayValue('sample', result)
        if (result >= 1000) {
            result = window.parseInt(result / 1000) + 'k'
        }

        return result
    },
    getGraphXValueForClonedValues (clonedValues) {
        let graphX = 'sample';
        return this.displayValue(graphX, (this.math[graphX](clonedValues)));
    }
};
