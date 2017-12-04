<template id="pc-tooltip">
    <div class="pc-tooltip">
        <div v-on:mouseover="showTooltip(true)" v-on:mouseout="showTooltip(false)">
            <slot name="text"></slot>
        </div>

        <div class="tooltip-wrapper" v-show="isTooltipShown">
            <slot name="tooltip"></slot>
        </div>
    </div>
</template>

<script>
export default {
    template: '#pc-tooltip',
    data () {
        return {
            isTooltipShown: false
        }
    },
    methods: {
        showTooltip (bool) {
            this.isTooltipShown = bool;
        }
    }

}
</script>

<style>
.pc-tooltip {
    --tooltip-background-color: var(--black);
    position: relative;
}

.tooltip-wrapper {
    position: absolute;
    left: 0;
    top: calc(100% + 10px);
    background: var(--tooltip-background-color);
    color: var(--light-gray);
    padding: 5px;
    border-radius: 4px;
    z-index: 10;
    width: 400px;
    white-space: normal;
    pointer-events: none;
}

.tooltip-wrapper:after {
    --size: 5px;

    content: '';
    position: absolute;
    left: 50px;
    bottom: calc(100% - var(--size));
    transform: translate(-50%, 0) rotateZ(45deg);

    border: var(--size) solid var(--tooltip-background-color);
    border-right-color: transparent;
    border-bottom-color: transparent;
}
</style>
