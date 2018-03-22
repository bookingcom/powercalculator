<template id="svg-graph">
    <label class="pc-graph-radio-label">
        <input type="radio" class="pc-graph-radio-input" name="graph" :value="value" v-model="graphTypeSynced">
        <span class="pc-graph-radio-text" :class="spanClass">{{graphName}}</span>
    </label>
</template>


<script>
export default {
    props: ['graphType', 'graphX', 'graphY', 'getMetricDisplayName'],
    data () {
        return {
        }
    },
    computed: {
        graphName () {
            const graphXDisplay = this.getMetricDisplayName(this.graphX);
            const graphYDisplay = this.getMetricDisplayName(this.graphY);
            return `${graphYDisplay} / ${graphXDisplay}`
        },
        value () {
            return `${this.graphX}-${this.graphY}`
        },
        spanClass () {
            return {
                'pc-graph-radio-selected': this.graphType == this.value
            }
        },
        graphTypeSynced: {
            get () {
                return this.graphType
            },
            set (newValue) {
                this.$emit('update:graphType', newValue)
            }
        }
    }
}

</script>

<style>

</style>
