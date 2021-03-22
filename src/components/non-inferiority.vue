<template>
  <div class="pc-non-inferiority">
    <label class="pc-non-inf-label">
      <input type="checkbox" v-model="enabled" />
      Use non inferiority test
    </label>
  </div>
</template>

<script>
import { BLOCKED } from '../store/modules/calculator'

export default {
  data: () => ({}),
  computed: {
    enabled: {
      get() {
        return this.$store.getters.isNonInferiority
      },
      set(newValue) {
        this.$store.commit('SET_IS_NON_INFERIORITY', newValue)
      },
    },
  },
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
