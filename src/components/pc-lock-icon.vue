<template id="pc-lock-icon">
    <button type="button" class="pc-field-lock" v-on:click="changeLock">
        <svg v-if="islocked"

             version="1.1"
             baseProfile="full"
             width="50" height="100"
             xmlns="http://www.w3.org/2000/svg"
             style="transform: scale(0.2); transform-origin: left top;">

            <desc>Locked input field</desc>

            <rect x="0" y="50" width="50" height="40" rx="5" ry="5"  fill="#5d5f63" />
            <path d="M10,50 a1,1.2 0 1,1 30,0" stroke-width="4" stroke="#5d5f63" fill="transparent"/>

        </svg>
        <svg v-else

             version="1.1"
             baseProfile="full"
             width="50" height="100"
             xmlns="http://www.w3.org/2000/svg"
             style="transform: scale(0.2); transform-origin: left top;">

            <desc>Unlocked input field</desc>

            <rect x="0" y="50" width="50" height="40" rx="5" ry="5"  fill="#5d5f63" />

            <path d="M10,40 a1,1.2 0 1,1 30,0" stroke-width="4" stroke="#5d5f63" fill="transparent"/>
            <line x1="40" y1="40" x2="40" y2="50" stroke-width="4" stroke="#5d5f63"/>
        </svg>
    </button>
</template>

<script>
export default {
    template: '#lock-icon',
    props: ['islocked', 'fieldprop'],
    data () {
        return {}
    },
    methods: {
        changeLock () {
            this.$emit('update:lockfield', {prop: this.islocked ? '' : this.fieldprop })
        }
    }
}
</script>

<style>

.pc-field-lock-wrapper {
    position: relative;
    display: block;
}

.pc-field-lock {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;

    border: none;
    background: transparent;
    -webkit-appearance: none;
    -webkit-border-radius: 0;
    margin: 0;
    padding: 0;
    text-align: center;
    overflow: hidden;
}
</style>
