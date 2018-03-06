export default {
    getGraphYTicks () {
        let arr = [10, 25, 50, 75, 100];
        return arr
    },
    getGraphYTicksFormatted (y) {
        return `${y}%`
    },
    updateClonedValues (clonedObj, value) {
        clonedObj.beta = 1 - this.$store.getters.extractValue('power', value);

        return clonedObj;
    },
    getCurrentYValue () {
        return this.power
    },
    getGraphXTicksFormatted () {
        // not needed yet
    },
};
