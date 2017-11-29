export default {
    getGraphXTicksFormatted (x) {
        let { displayValue } = this,
            result = x;

        result = displayValue('sample', result)
        if (result >= 1000) {
            result = window.parseInt(result / 1000) + 'k'
        }

        return result
    }
};
