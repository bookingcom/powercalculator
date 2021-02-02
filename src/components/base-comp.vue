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
                        :suffix="testType == 'gTest' ? '%' : ''"

                        v-bind:fieldValue="base"
                        v-bind:isReadOnly="isReadOnly"
                        v-bind:isBlockFocused="isBlockFocused"
                        v-bind:enableEdit="enableEdit"

                        v-on:update:focus="updateFocus"></pc-block-field>
                </label>
            </li>

            <li class="pc-input-item pc-input-right">
                <label>
                    <span class="pc-input-title">Metric Totals<small class="pc-input-sub-title">visitors reached goal</small></span>

                    <pc-block-field
                        fieldProp="visitorsWithGoals"
                        v-bind:fieldValue="visitorsWithGoals"
                        v-bind:fieldFromBlock="fieldFromBlock"
                        v-bind:isBlockFocused="isBlockFocused"
                        v-bind:isReadOnly="isReadOnly"
                        v-bind:enableEdit="enableEdit && this.calculateProp != 'sample'"

                        v-on:update:focus="updateFocus"></pc-block-field>
                </label>
            </li>

            <li class="pc-input-item pc-input-sd-rate" v-if="testType == 'tTest'">
                <label>
                    <pc-block-field
                        prefix="±"
                        fieldProp="sdRate"
                        fieldFromBlock="base"

                        v-bind:fieldValue="sdRate"
                        v-bind:isReadOnly="isReadOnly"
                        v-bind:isBlockFocused="isBlockFocused"
                        v-bind:enableEdit="enableEdit"

                        v-on:update:focus="updateFocus"></pc-block-field>
                    <span class="pc-input-details">Base Standard deviation</span>
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
    data () {
        return {
            focusedBlock: '',
        }
    },
    computed: {
        isReadOnly () {
            return this.calculateProp == 'base'
        },
        base () {
            return this.$store.state.attributes.base
        },
        sdRate () {
            return this.$store.state.attributes.sdRate
        },
        sample () {
            return this.$store.state.attributes.sample
        },
        testType () {
            return this.$store.state.attributes.testType
        },
        visitorsWithGoals () {
            return this.$store.getters.visitorsWithGoals
        }
    },
    methods: {
        enableInput () {
            this.$emit('edit:update', {prop: 'base'})
        },
        updateFocus ({fieldProp, value}) {
            if (this.focusedBlock == fieldProp && value === false) {
                this.focusedBlock = ''
            } else if (value === true) {
                this.focusedBlock = fieldProp
            }

            this.$emit('update:focus', {
                fieldProp: this.fieldFromBlock,
                value: value
            })
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
