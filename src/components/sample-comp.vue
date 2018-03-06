<template id="sample-comp">
    <div class="pc-block pc-block--sample" :class="{'pc-block-focused': isBlockFocused == 'sample', 'pc-block-to-calculate': calculateProp == 'sample'}">

        <pc-svg-chain v-bind:calculateProp="calculateProp" v-bind:fieldFromBlock="fieldFromBlock"></pc-svg-chain>

        <label slot="text" class="pc-calc-radio pc-calc-radio--sample" :class="{'pc-calc-radio--active': isCalculated}">
            <input type="radio" v-model="isCalculated" :value="true" >
                {{ isCalculated ? 'Calculating' : 'Calculate' }}
        </label>

        <div class="pc-header">
            Sample Size
        </div>


        <ul class="pc-inputs">
            <li class="pc-input-item pc-input-left">
                <label>
                    <span class="pc-input-title">Total # <small class="pc-input-sub-title">of visitors</small></span>

                    <pc-block-field
                        fieldProp="sample"

                        v-bind:fieldValue="sample"
                        v-bind:isReadOnly="calculateProp == 'sample'"
                        v-bind:enableEdit="enableEdit"

                        v-on:update:focus="updateFocus"></pc-block-field>
                </label>
            </li>
            <li class="pc-input-item pc-input-right pc-value-field--lockable" :class="getLockedStateClass('visitorsPerDay')">
                <label>
                    <span class="pc-input-title">Daily # <small class="pc-input-sub-title">of visitors</small></span>

                    <pc-block-field
                        fieldProp="visitorsPerDay"
                        v-bind:fieldValue="visitorsPerDay"
                        v-bind:isReadOnly="lockedField == 'visitorsPerDay'"
                        v-bind:isBlockFocused="isBlockFocused"
                        v-bind:enableEdit="enableEdit"

                        v-bind:lockedField="lockedField"

                        v-on:update:focus="updateFocus"></pc-block-field>
                </label>

                <button type="button" class="pc-swap-button" v-on:click="switchLockedField">
                    <svg width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <desc>Lock {{ lockedField == 'days' ? 'number of days' : 'visitors per day' }}</desc>
                        <defs>
                            <circle id="path-1" cx="13" cy="13" r="10"></circle>
                            <filter x="-5.0%" y="-5.0%" width="110.0%" height="110.0%" filterUnits="objectBoundingBox" id="filter-2">
                                <feGaussianBlur stdDeviation="0.5" in="SourceAlpha" result="shadowBlurInner1"></feGaussianBlur>
                                <feOffset dx="0" dy="1" in="shadowBlurInner1" result="shadowOffsetInner1"></feOffset>
                                <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
                                <feColorMatrix values="0 0 0 0 0.489716199   0 0 0 0 0.489716199   0 0 0 0 0.489716199  0 0 0 0.5 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
                            </filter>
                        </defs>
                        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                            <g id="Power-Calculator" transform="translate(-550.000000, -522.000000)">
                                <g id="Switcher" transform="translate(547.000000, 519.000000)">
                                    <g id="Oval-3">
                                        <use fill="#EFEFEF" fill-rule="evenodd" xlink:href="#path-1"></use>
                                        <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                                    </g>
                                    <g id="Group" stroke-width="1" fill-rule="evenodd" transform="translate(7.000000, 7.000000)" fill="#155EAB">
                                        <path d="M4.5,4.20404051 L4.5,9.9127641 L2.5,9.9127641 L2.5,4.20404051 L0.5,4.20404051 L3.5,0.70872359 L6.5,4.20404051 L4.5,4.20404051 Z" id="Combined-Shape"></path>
                                        <path d="M9.5,5.49531692 L9.5,11.2040405 L7.5,11.2040405 L7.5,5.49531692 L5.5,5.49531692 L8.5,2 L11.5,5.49531692 L9.5,5.49531692 Z" id="Combined-Shape" transform="translate(8.500000, 6.602020) scale(1, -1) translate(-8.500000, -6.602020) "></path>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </svg>
                </button>

            </li>
            <li class="pc-input-item pc-input-right-swap pc-value-field--lockable" :class="getLockedStateClass('days')">
                <label>
                    <pc-block-field
                        fieldProp="runtime"
                        prefix=""
                        suffix=" days"
                        v-bind:fieldValue="runtime"
                        v-bind:isReadOnly="lockedField == 'days'"
                        v-bind:isBlockFocused="isBlockFocused"
                        v-bind:enableEdit="enableEdit"

                        v-bind:lockedField="lockedField"

                        v-on:update:focus="updateFocus"
                        aria-label="Days"></pc-block-field>
                </label>
            </li>
        </ul>
    </div>
</template>

<script>
import pcBlock from './pc-block.vue'

export default {
    props: ['enableEdit', 'isBlockFocused', 'fieldFromBlock'],
    template: '#sample-comp',
    extends: pcBlock,
    data () {
        return {
            variants: 2,
            focusedBlock: ''
        }
    },
    computed: {
        sample () {
            return this.$store.state.attributes.sample
        },
        visitorsPerDay () {
            return this.$store.state.attributes.visitorsPerDay
        },
        runtime () {
            return this.$store.state.attributes.runtime
        },
        lockedField () {
            return this.$store.state.attributes.lockedField
        }
    },
    methods: {
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
        },
        switchLockedField () {
            this.$store.dispatch('switch:lockedfield');
        },
        getLockedStateClass (param) {
            return this.lockedField == param ? 'pc-value-field--locked' : 'pc-value-field--unlocked'
        }
    }
}

</script>

<style>
.pc-swap-button {
    -webkit-appearance: none;
    background: none;
    border: 0;
    margin: 0;
    padding: 0;
    position: absolute;
    top: calc(100% - 10px);
    left: 5px;
    z-index: 5;
}

.pc-value-field--unlocked .pc-value-field-wrapper {
    z-index: 1;
}

.pc-block-to-calculate  .pc-value-field--locked .pc-value-formatting:before,
.pc-block-to-calculate  .pc-value-field--locked .pc-value-formatting:after,
.pc-value-field--locked .pc-value-formatting:before,
.pc-value-field--locked .pc-value-formatting:after,
.pc-value-field--locked .pc-value-field-wrapper {
    color: var(--dark-gray);
}
</style>

<style scoped>
.pc-inputs {
    grid-template-areas:
        "pc-input-left pc-input-right"
        "pc-input-left-swap pc-input-right-swap"
    ;
}

.pc-input-right-swap,
.pc-input-right {
    position: relative;
}

.pc-input-right-swap {
    grid-area: pc-input-right-swap;
    margin-top: -10px;
    filter: drop-shadow(0 4px 2px rgba(0,0,0,0.1)) drop-shadow(0 -4px 2px rgba(0,0,0,0.1));
}

.pc-input-right-swap .pc-value-field-wrapper {
    filter: none;
}

.pc-value-formatting:after {
    font-size: 14px;
}

.pc-block-to-calculate .pc-field-visitorsPerDay,
.pc-block-to-calculate .pc-field-runtime {
    background: var(--white);
}

.pc-value-field--lockable.pc-value-field--locked .pc-value-field-wrapper {
    background: linear-gradient(0deg, var(--light-gray) 0%, var(--white) 100%);
}

</style>
