<template id="pc-block-field">
  <span
    v-if="enableEdit"
    class="pc-value-field-wrapper"
    :class="fieldWrapperClasses"
    v-on:click="setFocus()"
  >
    <span
      class="pc-value-formatting pc-value--formatted"
      aria-hidden="true"
      :class="'pc-value-formatting-' + fieldProp"
      :data-prefix="prefix"
      :data-suffix="suffix"
      :style="fieldFormattedStyle"
    >
      <span class="pc-value-display" ref="pc-formatted-value">{{
        formattedVal
      }}</span>
    </span>

    <span
      class="pc-value-formatting"
      :class="'pc-value-formatting-' + fieldProp"
      :data-prefix="prefix"
      :data-suffix="suffix"
      :style="fieldEditableStyle"
    >
      <span
        class="pc-value-display"
        :data-test="isFocused"
        :contenteditable="!isReadOnly"
        v-on:focus="setFocusStyle(true)"
        v-on:blur="blur"
        v-on:input="updateVal"
        v-initialvalue
        ref="pc-value"
      ></span>
    </span>
  </span>
  <span v-else class="pc-value-display pc-field-not-editable">
    {{ prefix }} <strong>{{ formattedVal }}</strong> {{ suffix }}
  </span>
</template>

<script>

let validationCache = {};

export default {
    template: '#pc-block-field',
    props: [
        'lockedField',
        'enableEdit',
        'isReadOnly',
        'fieldProp',
        'fieldValue',
        'prefix',
        'suffix',
        'fieldFromBlock'
    ],
    data () {
        return {
            islockedFieldSet: (this.lockedField || '').length > 0,
            isFocused: false,
        }
    },
    computed: {
        isLocked () {
            return this.lockedField && this.lockedField == this.fieldProp
        },
        formattedVal () {
            let result = this.fieldValue;
            const sep = ',';

            if (result / 1000 >= 1) {
                const [integer, decimal] = (result + '').split('.');

                result = integer.split('').reduceRight((prev, cur, i, arr) => {
                    let resultStr = cur + prev,
                        iFromLeft = arr.length - i;

                    if (iFromLeft % 3 == 0 && iFromLeft != 0 && i != 0) {
                        resultStr = sep + resultStr;
                    }

                    return resultStr;
                }, '')

                if (decimal) {
                    result += '.' + decimal;

                }

            }

            return result;
        },
        fieldWrapperClasses () {
            let obj = {};

            obj['pc-field--read-only'] = this.isReadOnly;
            obj['pc-field--focused'] = this.isFocused;
            obj['pc-field-' + this.fieldProp] = true;

            return obj
        },
        fieldFormattedStyle () {
            const result = {};
            if (this.isFocused) {
                result.display = 'none';
            }

            return result
        },
        fieldEditableStyle () {
            const result = {};
            if (!this.isFocused) {
                result.opacity = 0;
            }

            return result
        },
        testType () {
            return this.$store.getters.testType
        }
    },
    methods: {
        getSanitizedPcValue () {
            // People will use copy paste. We need some data sanitization

            // remove markup
            const oldValue = this.$refs['pc-value'].textContent + ''

            // remove commas
            // try to extract numbers from it
            const newValue = parseFloat(oldValue.replace(/,/g, ''))

            return newValue

        },
        updateVal (val) {
            if (this.enableEdit) {
                const value = this.getSanitizedPcValue();

                if (value != this.fieldValue) {
                    // this.val = value;
                    this.$emit('update:fieldValue', value)
                }
            }
        },
        /*
        formatDisplay () {
            if (this.enableEdit) {
                this.$refs['pc-value'].textContent = this.formatNumberFields(this.getSanitizedPcValue());
            } else {
                this.val = this.formatNumberFields(this.fieldValue);
            }
        },
        formatNumberFields (value) {
            let result = parseFloat(value);

            result = this.validateField(result);

            return result || 0
        },
        */
        blur () {
            // this.formatDisplay();
            this.setFocusStyle(false);
        },
        setFocusStyle (bool) {
            this.isFocused = bool;
        },
        setFocus () {
            let el = this.$refs['pc-value'];
            el.focus();
        },
      /*
        validateField (value) {
            let validateConfigList = this.getValidationConfig(),
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
            let {fieldProp, testtype} = this,
                validationTypeCategories,
                result;

            if (validationCache[testtype] && validationCache[testtype][fieldProp]) {
                return validationCache[testtype][fieldProp]
            }

            validationTypeCategories = [].filter(Boolean);

            result = validationTypeCategories.reduce((prev, cur) => {
                let {fn, defaultVal} = cur[fieldProp] || {};

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
            validationCache[testtype][fieldProp] = result;

            return result
        },
        */
        placeCaretAtEnd (el) {
            if (typeof window.getSelection != "undefined"
                    && typeof document.createRange != "undefined") {
                var range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (typeof document.body.createTextRange != "undefined") {
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(el);
                textRange.collapse(false);
                textRange.select();
            }
        }

    },
    watch: {
        isFocused (newValue) {
            this.$emit('update:focus', {
                fieldProp: this.fieldFromBlock || this.fieldProp,
                value: newValue
            })
        }
    },
    directives: {
        initialvalue: {
            inserted (el, directive, vnode) {
                el.textContent = vnode.context.val
            }
        }
    }
}
</script>

<style>
.pc-value-field-wrapper {
  --base-padding: 5px;

  display: block;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  filter: drop-shadow(0 4px 2px rgba(0, 0, 0, 0.1));
  border-radius: 5px;
  background: var(--white);
  padding: var(--base-padding);

  overflow: hidden;
}

.pc-field--focused {
  box-shadow: inset 0 0 0 1px var(--dark-blue);
}

.pc-value--formatted {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  width: 100%;
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

.pc-non-inf-treshold-input,
.pc-power-input,
.pc-false-positive-input,
.pc-variants-input {
  display: inline-block;
  vertical-align: middle;
  padding: 4px 8px;
  text-align: center;
  width: 4em;
  border: 2px solid var(--gray);
  border-radius: 8px;
  font-size: inherit;
}

.pc-variants-input {
  width: 6.5em;
}

.pc-top-fields-error {
  color: var(--red);
}

/* prefixes and suffixes */

.pc-value-formatting:before {
  color: var(--gray);
  content: attr(data-prefix);
}

.pc-value-formatting:after {
  color: var(--gray);
  content: attr(data-suffix);
}

/* block to calculate override rules*/

.pc-block-to-calculate .pc-value-field-wrapper:not(.pc-value-display) {
  background: var(--light-yellow);
  outline: 2px solid var(--dark-yellow);
}

.pc-block-to-calculate .pc-value .pc-value-formatting:before {
  content: '=' attr(data-prefix);
  color: var(--black);
}

.pc-block-to-calculate .pc-value-formatting:after {
  color: var(--black);
}
</style>
