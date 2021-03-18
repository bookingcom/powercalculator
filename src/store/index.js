import calculator from './modules/calculator'
import { Store } from 'vuex'

const store = new Store({
  modules: {
    calculator,
  },
})

export default store
