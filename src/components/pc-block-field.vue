<template id="pc-block-field">
  <span
    v-if="enableEdit"
    class="pc-value-field-wrapper"
    :class="fieldWrapperClasses"
    @click="setFocus()"
  >
    <span
      class="pc-value-formatting pc-value--formatted"
      aria-hidden="true"
      :class="'pc-value-formatting-' + fieldProp"
      :data-prefix="prefix"
      :data-suffix="suffix"
      :style="fieldFormattedStyle"
    >
      <span
        class="pc-value-display"
        ref="pc-formatted-value"
        v-text="formattedVal"
      ></span>
    </span>

    <span
      class="pc-value-formatting"
      :class="fieldClass"
      :data-prefix="prefix"
      :data-suffix="suffix"
      :style="fieldEditableStyle"
    >
      <span
        class="pc-value-display"
        :contenteditable="!isReadOnly"
        @focus="setFocusStyle(true)"
        @blur="setFocusStyle(false)"
        @input="updateVal"
        @keydown.enter.prevent
        v-text="formattedVal"
        ref="pc-value"
      ></span>
    </span>
  </span>
  <!-- Display value in case it is not editable -->
  <span v-else class="pc-value-display pc-field-not-editable">
    {{ prefix }} <strong>{{ formattedVal }}</strong> {{ suffix }}
  </span>
</template>

<script>
// Known bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1248186
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
  ],
  data() {
    return {
      islockedFieldSet: (this.lockedField || '').length > 0,
      isFocused: false,
    }
  },
  updated() {
    // Resync the editable fields
    const el = this.$refs['pc-value']
    if (el && el.textContent != this.formattedVal) {
      el.textContent = this.formattedVal
    }

    // Once it updates, places the cursor back where it was. This is a visual
    // glitch caused by the interaction between content editable and the prop drilling.
    const focus = document.activeElement
    if (el === focus) {
      const range = document.createRange()
      range.selectNodeContents(focus)
      range.collapse(false)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
  },
  computed: {
    isLocked() {
      return this.lockedField && this.lockedField == this.fieldProp
    },
    formattedVal() {
      let result = this.fieldValue
      const sep = ','

      if (result / 1000 >= 1) {
        const [integer, decimal] = (result + '').split('.')

        result = integer.split('').reduceRight((prev, cur, i, arr) => {
          const iFromLeft = arr.length - i
          let resultStr = cur + prev

          if (iFromLeft % 3 == 0 && iFromLeft != 0 && i != 0) {
            resultStr = sep + resultStr
          }

          return resultStr
        }, '')

        if (decimal) {
          result += '.' + decimal
        }
      }

      return result
    },
    fieldClass() {
      if (this.fieldProp != null) {
        return `pc-value-formatting-${this.fieldProp}`
      }
      return ''
    },
    fieldWrapperClasses() {
      const obj = {}

      obj['pc-field--read-only'] = this.isReadOnly
      obj['pc-field--focused'] = this.isFocused
      obj['pc-field-' + this.fieldProp] = true

      return obj
    },
    fieldFormattedStyle() {
      const result = {}
      if (this.isFocused) {
        result.display = 'none'
      }

      return result
    },
    fieldEditableStyle() {
      const result = {}
      if (!this.isFocused) {
        result.opacity = 0
      }

      return result
    },
    testType() {
      return this.$store.getters.testType
    },
  },
  methods: {
    getSanitizedPcValue() {
      // People will use copy paste. We need some data sanitization

      // remove markup
      const oldValue = this.$refs['pc-value'].textContent + ''

      // remove commas
      // try to extract numbers from it
      const newValue = parseFloat(oldValue.replace(/,/g, ''))

      return newValue
    },
    updateVal() {
      if (this.enableEdit) {
        const value = this.getSanitizedPcValue()

        if (value != this.fieldValue) {
          this.$emit('update:fieldValue', value)
        }
      }
    },
    setFocusStyle(bool) {
      this.isFocused = bool
    },
    setFocus() {
      const el = this.$refs['pc-value']
      el.focus()
    },
  },
  watch: {},
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
