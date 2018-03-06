// getters to present data and format for calculations
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
    impactByMetricValue: {
        gTest: {type: 'percentage'},
        tTest: {type: 'float'}
    },
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



export default {
    displayValue (state) {
        return function displayValueInner (prop, value) {
            let result = value,
                type = getType(prop, 'displayValue', state.attributes.testType);

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
        }
    },
    extractValue (state) {
        return function extractValueInner (prop, value) { // value is option and is used when we don't want to update the state
            let result = typeof value == 'undefined' ? state.attributes[prop] : value,
                type = getType(prop, 'extractValue', state.attributes.testType);

            if (type == 'int') {
                return window.parseInt(result);
            }

            if (type == 'float') {
                return window.parseFloat(result);
            }

            if (type == 'percentage') {
                return window.parseFloat(result) / 100;
            }
        }
    }
}

function getType (prop, methodName, testType) {
    let validationConfig = validations[prop],
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
