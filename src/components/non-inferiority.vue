<template>
    <div class="pc-non-inferiority">
        <label class="pc-non-inf-label">
            Use non inferiority test
            <input type="checkbox" v-model="enabled">
        </label>
        <div v-if="enabled" class="pc-non-inf-treshold">
            <select v-model="selected" class="pc-non-inf-select">
                <option v-for="(option, index) in options" v-bind:key="index" v-bind:value="option.value">
                    {{option.text}}
                </option>
            </select>

            <pc-block-field
                class="pc-non-inf-treshold-input"
                fieldProp="threshold"
                :suffix="isRelative ? '%' : ''"
                v-bind:fieldValue="nonInfThreshold"
                v-bind:enableEdit="true"></pc-block-field>
        </div>
    </div>
</template>

<script>
import pcBlockField from './pc-block-field.vue'

export default {
    props: [ 'lockedField', 'readOnlyVisitorsPerDay' ],
    data () {
        return {
            options: [
                {
                    text: 'relative difference of',
                    value: 'relative'
                },
                {
                    text: 'absolute impact per day of',
                    value: 'absolutePerDay'
                }
            ]
        }
    },
    computed: {
        enabled: {
            get () {
                return this.$store.state.nonInferiority.enabled
            },
            set (newValue) {
                this.$store.dispatch('change:noninferiority', {
                    prop: 'enabled',
                    value: newValue
                })
            }
        },
        selected: {
            get () {
                return this.$store.state.nonInferiority.selected
            },
            set (newValue) {
                this.$store.dispatch('change:noninferiority', {
                    prop: 'selected',
                    value: newValue
                })
            }
        },

        isRelative () {
            return this.$store.state.nonInferiority.selected == 'relative'
        },
        nonInfThreshold () {
            return this.$store.state.nonInferiority.threshold
        }
    },
    components: {
        'pc-block-field': pcBlockField,
    }
}

</script>

<style>

.pc-non-inf-label {
    white-space: nowrap;
}

.pc-non-inf-treshold {
    display: flex;
    align-items: center;
}

.pc-non-inf-treshold-input {
    margin-left: 5px;
}

</style>
