import actions from './actions.js'
import mutations from './mutations.js'

import attributes from './modules/attributes.js'
import nonInferiority from './modules/non-inferiority.js'

import dataFormat from './getters/data-format.js'
import math from './getters/math.js'

export default {
    modules: {
        attributes,
        nonInferiority,
    },
    actions,
    mutations,
    getters: Object.assign({}, dataFormat, math)
}
