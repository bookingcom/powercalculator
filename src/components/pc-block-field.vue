<template id="pc-block-field">
    <span v-if="enableedit" class="pc-value-field-wrapper" :class="fieldWrapperClasses" v-on:click="setFocus()">
        <span class="pc-value-formatting" style="position: relative;" :class="'pc-value-formatting-' + fieldprop" :data-prefix="prefix" :data-suffix="suffix">
            <span class="pc-value-display"
                :contenteditable="!isreadonly"

                v-on:focus="setFocusStyle(true)"
                v-on:blur="blur"
                v-on:input="updateVal"
                v-initialvalue

                ref="pc-value"></span>
        </span>

        <pc-lock-icon v-if="isLockedFieldSet" v-bind:fieldprop="fieldprop" v-bind:islocked="isLocked" v-on:update:lockfield="triggerUpdateLockField"></pc-lock-icon>

    </span>
    <span v-else class="pc-value-display pc-field-lock-wrapper">
        {{prefix}} <strong>{{val}}</strong> {{suffix}} <pc-lock-icon v-if="isLockedFieldSet" v-bind:fieldprop="fieldprop" v-bind:islocked="isLocked" v-on:update:lockfield="triggerUpdateLockField"></pc-lock-icon>
    </span>
</template>

<script>

import pcLockIcon from './pc-lock-icon.vue'

let validateFunctions = {
        '*': {
            // Base rate > 0
            base: {
                fn (value) {
                    return value > 0
                },
                defaultVal: 10
            },
            // Power be between 0 and 100%(incl)
            power: {
                fn (value) {
                    return value >= 0 && value <= 100
                },
                defaultVal: 80
            }
        },
        gTest: {
            // Limit Gtest rate input to be between 0.0001% and 99.999%
            base: {
                fn (value) {
                    return value >= 0.01 && value <= 99.9
                }
            }
        },
        tTest: {
            // Standard deviation > 0
            sdRate: {
                fn (value) {
                    return value > 0
                },
                defaultVal: 10
            }
        }
    },
    validationCache = {};

export default {
    template: '#pc-block-field',
    props: [
        'lockedfield',
        'testtype',
        'enableedit',
        'isreadonly',
        'fieldprop',
        'fieldvalue',
        'prefix',
        'suffix',
        'isblockfocused',
        'fieldfromblock'
    ],
    data () {
        return {
            isLockedFieldSet: (this.lockedfield || '').length > 0,
            val: parseFloat(this.fieldvalue),
            isFocused: false,
        }
    },
    computed: {
        fieldWrapperClasses () {
            let obj = {};

            obj['pc-field--read-only'] = this.isreadonly;
            obj['pc-field--focused'] = this.isFocused;
            obj['pc-field-' + this.fieldprop] = true;
            obj['pc-field-lock-wrapper'] = this.isLockedFieldSet;

            return obj
        },
        isLocked () {
            return this.lockedfield && this.lockedfield == this.fieldprop
        }
    },
    methods: {
        updateVal ({target}) {
            if (this.enableedit) {
                let value = target.innerHTML;

                if (value != this.val) {
                    this.val = value;
                }
            }
        },
        formatDisplay () {
            if (this.enableedit) {
                this.$refs['pc-value'].innerHTML = this.formatNumberFields(this.$refs['pc-value'].innerHTML);
            } else {
                this.val = this.formatNumberFields(this.val);
            }
        },
        formatNumberFields (value) {
            let result = parseFloat(value);

            result = this.validateField(result);

            return result || 0
        },
        blur () {
            this.formatDisplay();
            this.setFocusStyle(false);
        },
        setFocusStyle (bool) {
            this.isFocused = bool;
        },
        setFocus () {
            this.$refs['pc-value'].focus();
        },
        validateField (value) {
            let {testtype} = this,
                validateConfigList = this.getValidationConfig(),
                isValid = true,
                result = value;

            if (isNaN(result) || !isFinite(result)) {
                result = validateConfigList.defaultVal;
            }

            if (validateConfigList.fns.length > 0) {
                validateConfigList.fns.forEach((fn) => {
                    if (!fn(result)) {
                        isValid = false;
                    }
                })
            }

            if (!isValid) {
                result = validateConfigList.defaultVal;
            }

            return result
        },
        getValidationConfig () {
            let {fieldprop, testtype} = this,
                validationTypeCategories,
                result;

            if (validationCache[testtype] && validationCache[testtype][fieldprop]) {
                return validationCache[testtype][fieldprop]
            }

            validationTypeCategories = [validateFunctions['*'], validateFunctions[testtype]].filter(Boolean);

            result = validationTypeCategories.reduce((prev, cur) => {
                let {fn, defaultVal} = cur[fieldprop] || {};

                if (typeof fn != 'undefined') {
                    prev.fns.push(fn);
                }
                if (typeof defaultVal != 'undefined') {
                    prev.defaultVal = defaultVal;
                }
                return prev
            }, {fns: [], defaultVal: 0})

            //cacheing
            validationCache[testtype] = validationCache[testtype] || {};
            validationCache[testtype][fieldprop] = result;

            return result
        },
        triggerUpdateLockField ({prop}) {
            this.$emit('update:lock', prop)
        }

    },
    watch: {
        val (newValue, oldValue) {
            newValue = parseFloat(this.formatNumberFields(newValue));
            oldValue = parseFloat(this.formatNumberFields(oldValue));

            if (this.isreadonly || (newValue == oldValue)) {
                return;
            }

            // updating calculations
            this.$emit('field:change', {
                prop: this.fieldprop,
                value: newValue || 0

            })
        },
        fieldvalue () {
            // in case some input field on the same block changes the main math values
            // we need to update the input fiel
            let anotherFieldInBlockIsUpdating = !this.isFocused;

            if (!this.isreadonly && !anotherFieldInBlockIsUpdating) {
                return
            }

            this.val = this.fieldvalue;
            if (this.enableedit) {
                this.$refs['pc-value'].innerHTML = this.val;
            }
        },
        isFocused (newValue) {
            this.$emit('update:focus', {
                fieldProp: this.fieldfromblock || this.fieldprop,
                value: newValue
            })
        }
    },
    directives: {
        initialvalue: {
            inserted (el, directive, vnode) {
                el.innerHTML = vnode.context.val
            }
        }
    },
    components: {
        'pc-lock-icon': pcLockIcon
    }
}

</script>

<style>
.pc-value-field-wrapper {
    --base-padding: 5px;

    display: block;
    box-sizing: border-box;
    width: 100%;
    filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1));
    border-radius: 5px;
    background: var(--white);
    padding: var(--base-padding);

    overflow: hidden;
}

.pc-field--focused {
    box-shadow: inset 0 0 0 1px var(--dark-blue);
}

.pc-value-display {
    box-sizing: border-box;
    font-size: 1em;
    line-height: 1.8em;
    align-self: center;
    min-height: 1em;
    display: inline-block;
}

.pc-value-display:focus {
    outline: 0;
}

.pc-power-input,
.pc-false-positive-input {
    display: inline-block;
    vertical-align: middle;
    padding: 0.6em;
    text-align: center;
    width: 4em;
    border: 2px solid var(--light-gray);
    border-radius: 8px;
    font-size: inherit;
}

.pc-top-fields-error {
    color: var(--red);
}

/* prefixes and suffixes */

.pc-value-formatting:before {
    color: var(--light-gray);
    content: attr(data-prefix);
}

.pc-value-formatting:after {
    color: var(--light-gray);
    content: attr(data-suffix);
}

</style>
