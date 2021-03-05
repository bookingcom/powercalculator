<template id="base-comp">
    <div class="pc-block pc-block--base" :class="{'pc-block-focused': focusedBlock == 'base'}">

        <pc-svg-chain v-bind:fieldFromBlock="fieldFromBlock"></pc-svg-chain>

        <div class="pc-header" v-if="testType == 'gTest'">
            Base Rate
        </div>
        <div class="pc-header" v-else>
            Base Average
        </div>

        <ul class="pc-inputs">
            <li class="pc-input-item pc-input-left">
                <label>
                    <span class="pc-input-title">{{testType == 'gTest' ? 'Base Rate' : 'Base Average'}} <small class="pc-input-sub-title">conversion</small></span>

                    <pc-block-field
                        fieldProp="base"
                        :suffix="testType === TEST_TYPE.BINOMIAL ? '%' : ''"

                        :fieldValue.sync="base"
                        :isReadOnly="isReadOnly"
                        :isBlockFocused="isBlockFocused"
                        :enableEdit="enableEdit"

                        v-on:update:focus="updateFocus"></pc-block-field>
                </label>
            </li>

            <li class="pc-input-item pc-input-right">
                <label>
                    <span class="pc-input-title">Metric Totals<small class="pc-input-sub-title">visitors reached goal</small></span>

                    <pc-block-field
                        fieldProp="visitorsWithGoals"
                        :fieldValue.sync="visitorsWithGoals"
                        :fieldFromBlock="fieldFromBlock"
                        :isBlockFocused="isBlockFocused"
                        :isReadOnly="isReadOnly"
                        :enableEdit="enableEdit && this.calculateProp != 'sample'"

                        v-on:update:focus="updateFocus"></pc-block-field>
                </label>
            </li>

            <li class="pc-input-item pc-input-sd-rate" v-if="testType == 'tTest'">
                <label>
                    <pc-block-field
                        prefix="±"
                        fieldProp="sdRate"
                        fieldFromBlock="base"

                        :fieldValue.sync="sdRate"
                        :isReadOnly="isReadOnly"
                        :isBlockFocused="isBlockFocused"
                        :enableEdit="enableEdit"

                        v-on:update:focus="updateFocus"></pc-block-field>
                    <span class="pc-input-details">Base Standard deviation</span>
                </label>
            </li>
        </ul>
    </div>
</template>

<script>
import pcBlock from './pc-block.vue'

const DEBOUNCE = 500

export default {
    props: ['enableEdit', 'fieldFromBlock', 'isBlockFocused'],
    extends: pcBlock,
    template: '#base-comp',
    data () {
        return {
            focusedBlock: '',
            baseDebouncer: null,
          sdRateDebouncer: null,
        }
    },
  computed: {
    isReadOnly () {
      return this.calculateProp == 'base'
    },
    base: {
      get() {

        return this.$store.getters.baseRate
      },
      set(val) {
        if (this.baseDebouncer != null) {
          clearTimeout(this.baseDebouncer)
        }
        this.baseDebouncer = setTimeout(() => {
          this.$store.commit('SET_BASE_RATE', val)
        }, DEBOUNCE)
      }
    },
    sdRate: {
      get() {
        return this.$store.getters.standardDeviation
      },
      set(val) {
        if (this.sdRateDebouncer != null) {
          clearTimeout(this.sdRateDebouncer)
        }
        this.sdRateDebouncer = setTimeout(() => {
          this.$store.commit('SET_STANDARD_DEVIATION', val)
        }, DEBOUNCE)
      }
    },
    visitorsWithGoals:{
      get() {
        return this.$store.getters.metricTotal
      }, 
      set(val) {
          if (this.$store.getters.isNonInferiority) return
      }
    },
    sample () {
      return this.$store.getters.sample
    },
    testType () {
      return this.$store.getters.testType
    },
    
  },
    methods: {
        enableInput () {
            // this.$emit('edit:update', {prop: 'base'})
        },
        updateFocus ({fieldProp, value}) {
            if (this.focusedBlock == fieldProp && value === false) {
                this.focusedBlock = ''
            } else if (value === true) {
                this.focusedBlock = fieldProp
            }

            // this.$emit('update:focus', {
            //    fieldProp: this.fieldFromBlock,
            //    value: value
            // })
        }

    }
}
</script>


<style>
.pc-input-sd-rate {
    margin-top: -10px;
    z-index: 1;
    position: relative;
    text-align: center;
}

.pc-field-sdRate {
    width: 90%;
    display: inline-block;
}
</style>

<style scoped>
    .pc-input-left {
        position: relative;
        z-index: 2;
    }
</style>
