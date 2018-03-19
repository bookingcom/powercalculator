<template>
    <svg width="100%" height="59px" :viewBox="`0 0 ${svgBoxWidth} 59`" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" class="pc-svg-chain-icon" :style="svgBgLine">
        <g id="Power-Calculator" transform="translate(-811.000000, -485.000000)">
            <g transform="translate(676.000000, 327.000000)">
                <g id="Chain" transform="translate(132.000000, 158.000000)">
                    <path d="M12.1680332,24.5 L14.5,24.5 C16.709139,24.5 18.5,26.290861 18.5,28.5 L18.5,29.5 C18.5,31.709139 16.709139,33.5 14.5,33.5 L9.5,33.5 C7.290861,33.5 5.5,31.709139 5.5,29.5 L5.5,28.5 C6.20701437,28.5 6.87368104,28.5 7.5,28.5 L7.5,29.5 C7.5,30.6045695 8.3954305,31.5 9.5,31.5 L14.5,31.5 C15.6045695,31.5 16.5,30.6045695 16.5,29.5 L16.5,28.5 C16.5,27.3954305 15.6045695,26.5 14.5,26.5 L13.7237764,26.5 C13.463452,25.7924504 12.944871,25.1257837 12.1680332,24.5 Z" id="Rectangle-5" :fill="svgFillColor" fill-rule="nonzero" transform="translate(12.000000, 29.000000) scale(-1, -1) translate(-12.000000, -29.000000) "></path>
                    <path d="M18.1680332,24.5 L20.5,24.5 C22.709139,24.5 24.5,26.290861 24.5,28.5 L24.5,29.5 C24.5,31.709139 22.709139,33.5 20.5,33.5 L15.5,33.5 C13.290861,33.5 11.5,31.709139 11.5,29.5 L11.5,28.5 C12.2070144,28.5 12.873681,28.5 13.5,28.5 L13.5,29.5 C13.5,30.6045695 14.3954305,31.5 15.5,31.5 L20.5,31.5 C21.6045695,31.5 22.5,30.6045695 22.5,29.5 L22.5,28.5 C22.5,27.3954305 21.6045695,26.5 20.5,26.5 L19.7237764,26.5 C19.463452,25.7924504 18.944871,25.1257837 18.1680332,24.5 Z" id="Rectangle-5" :fill="svgFillColor" fill-rule="nonzero"></path>
                </g>
            </g>
        </g>
    </svg>
</template>

<script>
export default {
    props: ['fieldFromBlock'],
    data () {
        return {
            svgBoxWidth: 26
        }
    },
    computed: {
        calculateProp () {
            return this.$store.state.attributes.calculateProp
        },
        svgFillColor () {
            return this.calculateProp == this.fieldFromBlock ? '#E2B634' : '#C1CFD8'
        },
        svgBgColor () {
            return this.calculateProp == this.fieldFromBlock ? '#FEF1CB' : '#F0F0F0'
        },
        svgBgLine () {
            let { svgFillColor, svgBgColor, svgBoxWidth } = this,
                strokeWidth = 2,
                stokeStyle = `linear-gradient(
                    0deg,
                    transparent,
                    transparent calc(50% - ${strokeWidth/2}px - 1px),
                    ${svgFillColor} calc(50% - ${strokeWidth/2}px),
                    ${svgFillColor} calc(50% + ${strokeWidth/2}px),
                    transparent calc(50% + ${strokeWidth/2}px + 1px),
                    transparent 100%
                )`,
                strokeMask = `linear-gradient(
                    90deg,
                    transparent,
                    transparent calc(50% - ${svgBoxWidth/2}px - 1px),
                    ${svgBgColor} calc(50% - ${svgBoxWidth/2}px),
                    ${svgBgColor} calc(50% + ${svgBoxWidth/2}px),
                    transparent calc(50% + ${svgBoxWidth/2}px + 1px),
                    transparent 100%
                )`;


            return `background: ${strokeMask}, ${stokeStyle};`.replace(/\n/g, '');
        }
    }
}
</script>
<style>

.pc-svg-chain-icon {
    position: absolute;
    top: 138px;
    pointer-events: none;
    z-index: 0;
}

</style>
