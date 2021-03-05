<template id="noninferiority-comp">
  <div
    class="pc-block pc-block--noninferiority"
    :class="{
      'pc-block-focused': isBlockFocused,
      'pc-block-to-calculate': calculateProp == 'non-inferiority'
    }"
  >
    <pc-svg-chain
      v-bind:calculateProp="calculateProp"
      v-bind:fieldFromBlock="fieldFromBlock"
    ></pc-svg-chain>

    <label
      slot="text"
      class="pc-calc-radio pc-calc-radio--impact"
      :class="{ 'pc-calc-radio--active': isCalculated }"
    >
      <input type="radio" v-model="isCalculated" :value="true" />
      {{ isCalculated ? 'Calculating' : 'Calculate' }}
    </label>

    <div class="pc-header">
      Non Inferiority
    </div>

    <ul class="pc-inputs">
      <li class="pc-input-item pc-input-left">
        <label>
          <span class="pc-input-title"
            >Relative <small class="pc-input-sub-title">change</small></span
          >

          <pc-block-field
            class="pc-input-field"
            fieldProp="thresholdRelative"
            suffix="%"
            v-bind:fieldValue="thresholdRelative"
            v-bind:fieldFromBlock="fieldFromBlock"
            v-bind:isBlockFocused="isBlockFocused"
            v-bind:isReadOnly="isReadOnly"
            v-bind:enableEdit="enableEdit"
            v-on:update:focus="updateFocus"
          ></pc-block-field>
        </label>
      </li>

      <li class="pc-input-item pc-input-right">
        <label>
          <span class="pc-input-title"
            >Absolute
            <small v-if="!onlyTotalVisitors" class="pc-input-sub-title"
              >impact per day</small
            ></span
          >

          <pc-block-field
            class="pc-input-field"
            fieldProp="thresholdAbsolute"
            suffix=""
            v-bind:fieldValue="thresholdAbsolute"
            v-bind:fieldFromBlock="fieldFromBlock"
            v-bind:isBlockFocused="isBlockFocused"
            v-bind:isReadOnly="isReadOnly"
            v-bind:enableEdit="enableEdit"
            v-on:update:focus="updateFocus"
          ></pc-block-field>
        </label>
      </li>

      <li class="pc-input-item pc-input-left-bottom">
        <label>
          <span class="pc-input-title no-sub-title">
            Expected Change
            <small class="pc-input-sub-title"> </small>
          </span>

          <div class="pc-non-inf-select-wrapper">
            <select v-model="expectedChange" class="pc-non-inf-select"
              :disabled="isReadOnly">
              <option value="nochange">
                No Change
              </option>
              <option value="degradation">
                Degradation
              </option>
              <option value="improvement">
                Improvement
              </option>
            </select>
          </div>
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import pcBlock from './pc-block.vue'

export default {
  props: ['enableEdit', 'fieldFromBlock', 'isBlockFocused'],
  extends: pcBlock,
  template: '#base-comp',
  data() {
    return {
      focusedBlock: '',
      options: [
        {
          text: 'relative',
          value: 'relative'
        },
        {
          text: 'absolute',
          value: 'absolutePerDay'
        }
      ]
    }
  },
  computed: {
    enabled() {
      return this.$store.getters.isNonInferiority
    },
    threshold() {
      return // this.$store.state.nonInferiority.threshold
    },
    thresholdRelative() {
      return // this.$store.state.nonInferiority.thresholdRelative
    },
    thresholdAbsolute() {
      /*
      const thresholdPerDay = this.$store.state.nonInferiority.thresholdAbsolute
      if (this.$store.state.attributes.onlyTotalVisitors) {
        const runtime = this.$store.getters.runtime
        return thresholdPerDay * runtime
      }
      return thresholdPerDay
      */
    },
    isRelative() {
      return // this.$store.state.nonInferiority.selected == 'relative'
    },
    onlyTotalVisitors() {
      return // this.$store.state.attributes.onlyTotalVisitors
    },
    testType() {
      return this.$store.getters.testType
    },
    isReadOnly() {
      return // this.calculateProp == 'non-inferiority'
    },
    selected: {
      get() {
        return // this.$store.state.nonInferiority.selected
      },
      set(newValue) {
        /*
        this.$store.dispatch('change:noninferiority', {
          prop: 'selected',
          value: newValue
        })
        */
      }
    },
    expectedChange: {
      get() {
        return // this.$store.state.nonInferiority.expectedChange
      },
      set(newValue) {
        /*
        this.$store.dispatch('field:change', {
          prop: 'expectedChange',
          value: newValue
        })
        */
      }
    }
  },
  methods: {
    enableInput() {
      // this.$emit('edit:update', { prop: 'base' })
    },
    updateFocus({ fieldProp, value }) {
      if (this.focusedBlock == fieldProp && value === false) {
        this.focusedBlock = ''
      } else if (value === true) {
        this.focusedBlock = fieldProp
      }

      // this.$emit('update:focus', {
      //  fieldProp: this.fieldFromBlock,
       // value: value
      //})
    }
  }
}
</script>

<style>
.pc-non-inf-select {
  --base-padding: 5px;
  font-size: inherit;
  line-height: 28px;
  border: none;
  display: block;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  filter: drop-shadow(0 4px 2px rgba(0, 0, 0, 0.1));
  border-radius: 5px;
  background: var(--white);
  padding: var(--base-padding);

  overflow: hidden;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.pc-non-inf-select:focus {
  outline: 0;
  box-shadow: inset 0 0 0 1px var(--dark-blue);
}

.pc-non-inf-select-wrapper {
  position: relative;
}

.pc-non-inf-select-wrapper:after {
  --border-size: 7px;
  content: '';
  position: absolute;
  right: 5px;
  bottom: 0;
  pointer-events: none;
  border: var(--border-size) solid transparent;
  border-top: var(--border-size) solid var(--gray);
  transform: translateY(calc(-50% - var(--border-size) / 2));
}

.no-sub-title {
  margin: 15px 0 10px 0;
}
</style>
