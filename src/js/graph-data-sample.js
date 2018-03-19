export default {
    getGraphXTicksFormatted (x) {
        let result = x;

        result = this.$store.getters.displayValue('sample', result)
        if (result >= 1000) {
            result = window.parseInt(result / 1000) + 'k'
        }

        return result
    }
};
