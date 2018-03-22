export default {
    getGraphYTicks () {
        let threshold = isNaN(this.$store.state.nonInferiority.threshold) ? 0 : this.$store.state.nonInferiority.threshold,
            arr = [threshold/1.50, threshold/1.25, threshold, threshold*1.25, threshold*1.50];
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

        const suffix = this.$store.state.nonInferiority.selected == 'relative' ? '%' : '';

        return `${num}${suffix}`
    },
    getCurrentYValue () {
        return this.$store.state.nonInferiority.threshold
    },
    updateClonedValues (clonedObj, value) {
        let { getters, state } = this.$store,
            { customMu, customOpts, customAlternative, customThresholdCorrectedValue } = getters;

        const thresholdCorrectedValue = customThresholdCorrectedValue({
            threshold: value,
            selected: state.nonInferiority.selected
        });

        const mu = customMu({
            runtime: getters.runtime,
            thresholdCorrectedValue: thresholdCorrectedValue,
            visitors_per_day: getters.visitorsPerDay,
            base_rate: getters.extractValue('base'),
        });

        const opts = customOpts({
            selected: state.nonInferiority.selected,
            lockedField: getters.lockedField,
            thresholdCorrectedValue: thresholdCorrectedValue,
            runtime: getters.runtime,
            visitorsPerDay: getters.visitorsPerDay,
        });

        const alternative = customAlternative({ type: 'noninferiority' });

        Object.assign(clonedObj, {
            mu,
            opts,
            alternative
        })

        return clonedObj;
    },
};
