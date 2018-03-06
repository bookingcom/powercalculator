import gTestSample from './store/gTest-sample.js'
import gTestImpact from './store/gTest-impact.js'
import tTestSample from './store/tTest-sample.js'
import tTestImpact from './store/tTest-impact.js'

import nonInferiorityGTestSample from './store/non-inferiority-gTest-sample.js'
import nonInferiorityTTestSample from './store/non-inferiority-tTest-sample.js'

describe('gTest - calculating sample', () => {
    gTestSample.init();
})

describe('gTest - calculating impact', () => {
    gTestImpact.init();
})

describe('tTest - calculating sample', () => {
    tTestSample.init();
})

describe('tTest - calculating impact', () => {
    tTestImpact.init();
})

describe('Non Inferiority - gTest - calculating sample', () => {
    nonInferiorityGTestSample.init();
})

describe('Non Inferiority - tTest - calculating sample', () => {
    nonInferiorityTTestSample.init();
})
