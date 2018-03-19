// name convention is the name used to set the graphY and graphX with a underscore before it

import _impact from './graph-data-impact.js'
import _incrementalTrials from './graph-data-incremental-trials.js'
import _incrementalTrialsPerDay from './graph-data-incremental-trials-per-day.js'
import _days from './graph-data-days.js'
import _sample from './graph-data-sample.js'
import _samplePerDay from './graph-data-sample-per-day.js'
import _power from './graph-data-power.js'


var defaultConfig = {
    getGraphYTicks () {
        throw Error (`getGraphYTicks not defined for ${this.graphY}`)
    },
    getGraphYTicksFormatted () {
        throw Error (`getGraphYTicksFormatted not defined for ${this.graphY}`)
    },
    getGraphYDataSet ({amount}) {
        let yTicks = this.getGraphYTicks(),
            curYValue = this.getCurrentYValue(),
            firstTick = yTicks[0],
            lastTick = yTicks[yTicks.length - 1],
            ratio = (lastTick - firstTick) / amount,
            result = Array.from(new Array(amount));

        result = result.map((cur, i, arr) => {
            let value = firstTick + ratio * i;
            return value
        })

        // add the current value in case it isn't there
        result.push(curYValue);

        // sort current value
        result.sort((a,b) => { return a - b});

        // remove duplicates
        result = [...new Set(result)]

        return result
    },
    updateClonedValues () {
        throw Error (`updateClonedValues not defined for ${this.graphY}`)
    },
    getCurrentYValue () {
        throw Error (`getCurrentYValue not defined for ${this.graphY}`)
    },
    getGraphXTicksFormatted () {
        throw Error (`getGraphXTicksFormatted not defined for ${this.graphY}`)
    },
    getGraphXValueForClonedValues (clonedValues) {
        if (!this.math[this.graphX]) {
            throw Error (`getGraphXValueForClonedValues didn't find math formula for ${this.graphX}`)
        }
        return this.$store.getters.displayValue(this.graphX, (this.math[this.graphX](clonedValues)));
    }
}



export default {
    beforeCreate () {
        // register configurations for metric params
        // this is done to agregate different pieces of configuration that need to work in harmony
        // for the svg graph
        Object.assign(this, {
            _sample:                    Object.assign({}, defaultConfig, _sample),
            _samplePerDay:              Object.assign({}, defaultConfig, _samplePerDay),
            _impact:                    Object.assign({}, defaultConfig, _impact),
            _incrementalTrials:         Object.assign({}, defaultConfig, _incrementalTrials),
            _power:                     Object.assign({}, defaultConfig, _power),
            _incrementalTrialsPerDay:   Object.assign({}, defaultConfig, _incrementalTrialsPerDay),
            _days:                      Object.assign({}, defaultConfig, _days),
        })
    },
    methods: {
        getGraphYTicks () {
            return this._getGraphY().getGraphYTicks.apply(this, []);
        },
        getGraphYTicksFormatted () {
            return this._getGraphY().getGraphYTicksFormatted.apply(this, [...arguments]);
        },
        getGraphYDataSet () {
            return this._getGraphY().getGraphYDataSet.apply(this, [...arguments]);
        },
        updateClonedValues () {
            return this._getGraphY().updateClonedValues.apply(this, [...arguments]);
        },
        getCurrentYValue () {
            return this._getGraphY().getCurrentYValue.apply(this, [...arguments]);
        },
        getGraphXValueForClonedValues () {
            return this._getGraphX().getGraphXValueForClonedValues.apply(this, [...arguments]);
        },
        getGraphXTicksFormatted () {
            return this._getGraphX().getGraphXTicksFormatted.apply(this, [...arguments]);
        },
        _getGraphX () {
            let graphX = this[`_${this.graphX}`];

            if (!graphX) {
                throw Error (`_${this.graphX} is not registered`);
            }

            return graphX
        },
        _getGraphY () {
            let graphY = this[`_${this.graphY}`];

            if (!graphY) {
                throw Error (`_${this.graphY} is not registered`);
            }

            return graphY
        }
    }
}
