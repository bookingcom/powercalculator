export default {
    beforeCreate () {
        let validations = {
            sample: {type: 'int'},
            base: {
                gTest: {type: 'percentage'},
                tTest: {type: 'float'}
            },
            impact: {type: 'percentage'},
            runtime: {type: 'int'},
            power: {type: 'percentage'},
            falsePosRate: {type: 'percentage'},
            impactByMetricValue: {type: 'percentage'},
            impactByVisitors: {type: 'int'},
            impactByVisitorsPerDay: {type: 'int'},
            metricTotals: {type: 'int'},
            sdRate: {type: 'float'},
            nonInfThreshold: {type: 'float'}
        }

        // add validation for component version of main data
        validations.totalSample = validations.sample;
        validations.relativeImpact = validations.impact;
        validations.baseRate = validations.base;

        this.validations = validations;
    },
    methods: {
        displayValue (prop, value) {
            let result = value,
                type = this.getType(prop, 'displayValue');

            if (type == 'int') {
                result = window.parseInt(result);
            }

            if (type == 'float') {
                result = window.parseFloat(result);
            }

            if (type == 'percentage') {
                result = (window.parseFloat(result) * 100).toFixed(2);
                result = +result.toString();
            }

            return isNaN(result) || !isFinite(result) ? '-' : result;
        },
        extractValue (prop, value) {
            let result = value,
                type = this.getType(prop, 'extractValue');

            if (type == 'int') {
                return window.parseInt(result);
            }

            if (type == 'float') {
                return window.parseFloat(result);
            }

            if (type == 'percentage') {
                return window.parseFloat(result) / 100;
            }
        },
        getType (prop, methodName) {
            let testType = this.testType || this.testtype || 'gTest',
                validationConfig = this.validations[prop],
                result,
                throwError = false;

            if (validationConfig) {
                if (validationConfig.type) {
                    result = validationConfig.type;
                } else if (validationConfig[testType] && validationConfig[testType].type) {
                    result = validationConfig[testType].type
                } else {
                    throwError = true;
                }
            } else {
                throwError = true;
            }

            if (throwError) {
                throw new Error(`Type not found for "${prop}" when trying to call "${methodName}".`)
            }

            return result || ''
        }
    }
}
