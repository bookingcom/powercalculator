<template>
    <div class="pc-non-inferiority">
        <label class="pc-non-inf-label">
            Use non inferiority test
            <input type="checkbox" v-model="enabled">
        </label>
        <div v-if="enabled" class="pc-non-inf-treshold">
            <select v-model="selected" class="pc-non-inf-select">
                <option v-for="option in options" v-bind:value="option.value">
                    {{option.text}}
                </option>
            </select>

            <pc-block-field
                class="pc-non-inf-treshold-input"
                fieldprop="nonInfThreshold"
                :suffix="isRelative ? '%' : ''"
                v-bind:fieldvalue="threshold"
                v-bind:testtype="testType"
                v-bind:enableedit="true"
                v-on:field:change="updateFields"></pc-block-field>
        </div>
    </div>
</template>

<script>
import statFormulas from '../js/math.js'
import pcBlockField from './pc-block-field.vue'

let storedImpact = 0;

export default {
    props: [ 'thresholdProp', 'enabledProp', 'selectedProp', 'view', 'extractValue', 'lockedField', 'readOnlyVisitorsPerDay' ],
    data () {
        return {
            threshold: this.thresholdProp,
            enabled: this.enabledProp,
            selected: this.selectedProp,
            options: [
                {
                    text: 'relative difference of',
                    value: 'relative'
                },
                // this one is broken because we need to update the
                // threshold value when visitors per day changes
                // {
                //     text: 'absolute impact per day of',
                //     value: 'absolutePerDay'
                // }
            ]
        }
    },
    computed: {
        isRelative () {
            return this.selectedProp == 'relative';
        },
        thresholdCorrectedValue () {
            // when relative is selected the value we will convert it to
            // percentage

            let result = this.threshold;
            if (this.isRelative) {
                result = result / 100
            }
            return result;
        },
        mu () {
            let mu = 0;

            if (this.enabled) {
                mu = this.getMu();
            }

            return mu
        },
        opts () {
            if (!this.enabled) {
                return false
            }
            return this.getExtraOpts()
        },
        alternative () {
            if (!this.enabled) {
                return false
            }
            return this.getAlternative()
        },
    },
    watch: {
        thresholdCorrectedValue () {
            this.$emit('field:change', {
                prop: 'nonInfThreshold',
                value: this.thresholdCorrectedValue
            })
        },
        enabled (newValue) {
            this.$emit('update:enabledProp', newValue);

            if (newValue) {
                storedImpact = this.view.impact;

                this.$emit('field:change', {
                    prop: 'impact',
                    value: 0
                })
            } else {
                this.$emit('field:change', {
                    prop: 'impact',
                    value: storedImpact
                })
            }




        },
        selected (newValue) {
            this.$emit('update:selectedProp', newValue);
        },
        mu (newValue) {
            this.updateSettings();
        },
        opts (newValue) {
            this.updateSettings();
        },
        alternative (newValue) {
            this.updateSettings();
        }

    },
    methods: {
        updateFields ({prop, value}) {
            this.threshold = value;
        },
        updateSettings () {
            let { mu, opts, alternative } = this,
                data = {
                    mu,
                    opts,
                    alternative
                },
                result = JSON.parse(JSON.stringify(data));

            this.$emit('update:noninf', result)
        },
        getMu () {
            let thresholdType = this.selected,
                { view, extractValue, lockedField, thresholdCorrectedValue } = this,
                { runtime, sample, base } = view,
                data = {
                    runtime: runtime,
                    threshold: -extractValue('nonInfThreshold', thresholdCorrectedValue),
                    total_sample_size: extractValue('sample', sample),
                    base_rate: extractValue('base', base),
                };

            return {
                absolutePerDay: statFormulas.getMuFromAbsolutePerDay,
                relative: statFormulas.getMuFromRelativeDifference
            }[thresholdType](data)
        },
        getExtraOpts () {
            let { view, extractValue, lockedField, thresholdCorrectedValue } = this,
                { runtime, sample } = view,
                type = this.selected,
                opts;

            opts = {
                type,
                calculating: lockedField,
                threshold: -extractValue('nonInfThreshold', thresholdCorrectedValue),
            };

            if (type == 'absolutePerDay') {
                if (lockedField == 'visitorsPerDay') {
                    opts = Object.assign(
                        opts,
                        {
                            days: runtime
                        }
                    );
                } else {
                    opts = Object.assign(
                        opts,
                        {
                            visitors_per_day: extractValue('sample', this.readOnlyVisitorsPerDay)
                        }
                    );
                }
            }

            return opts
        },
        getAlternative () {
            let testType;
            if(this.enabled) {
                testType = 'noninferiority';
            } else {
                testType = 'comparative';
            }
            return statFormulas.getAlternative({type: testType});
        }
    },
    components: {
        'pc-block-field': pcBlockField,
    }
}

</script>

<style>

.pc-non-inf-label {
    white-space: nowrap;
}

.pc-non-inf-treshold {
    display: flex;
    align-items: center;
}

.pc-non-inf-treshold-input {
    margin-left: 5px;
}

</style>
