<template>
    <div></div>
</template>

<script>

import pcBlockField from './pc-block-field.vue'
import pcSvgChain from './pc-svg-chain.vue'

export default {
    props: ['fieldFromBlock'],
    data () {
        return {
            // isCalculated: this.calculateProp == this.fieldFromBlock,
        }
    },
    computed: {
        isCalculated: {
            get () {
                return this.$store.state.attributes.calculateProp == this.fieldFromBlock
            },
            set () {
                this.$store.dispatch('update:calculateprop', {value: this.fieldFromBlock})
            }
        },

        calculateProp () {
            return this.$store.state.attributes.calculateProp
        },
        testType () {
            return this.$store.state.attributes.testType
        }
    },
    components: {
        'pc-block-field': pcBlockField,
        'pc-svg-chain': pcSvgChain,
    }
}

</script>

<style>
.pc-block {
    position: relative;
    padding-bottom: 25px;
    border-bottom: 3px solid var(--pale-blue);
}

.pc-block-to-calculate {
    border-bottom-color: var(--dark-yellow);
}

.pc-calc-radio {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--light-gray);
    border-radius: 25% / 100%;
    padding: 7px 15px;
}

.pc-calc-radio--active {
    background: var(--white);
}

.pc-inputs {
    display: block;
    list-style-type: none;
    margin: 0;
    padding: 0;

    --row-gap: 10px;
    --padding: 25px;
    --columns-gap: 70px;
    --grid-column-width: calc(50% - (var(--columns-gap) / 2));

    display: grid;
    grid-template-columns: var(--grid-column-width) var(--grid-column-width);
    grid-template-rows: auto;
    grid-template-areas:
        "pc-input-left pc-input-right"
    ;
    align-items: start;
    grid-gap: var(--row-gap) var(--columns-gap);
    padding: 0 var(--padding);

}

.pc-input-item {
    text-align: center;
}

.pc-input-title {
    position: relative;
    display: block;
    margin-bottom: 25px;
}

.pc-input-sub-title {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 9px;
}

.pc-input-left {
    grid-area: pc-input-left;

}

.pc-input-right {
    grid-area: pc-input-right;
}

.pc-input-details {
    font-size: 10px;
    color: var(--dark-gray);
}

.pc-field-not-editable {
    position: relative;
    padding: 5px;
    display: block;
}

.pc-input-left .pc-field-not-editable,
.pc-input-right .pc-field-not-editable {
    background: var(--light-gray);
    outline: 2px solid var(--light-blue);
}

</style>
