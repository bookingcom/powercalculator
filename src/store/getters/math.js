import statFormulas from '../../js/math.js'

function calculatedValues(store, getters) {
  // DIRTY HACK AHEAD: The whole event system is a mess. One event triggers 2 to
  // 4 different ones. Adding a impact (threshold) calculation for
  // non-inferiority faced one issue. For some reason, the event triggered is
  // 'non-inferiority' instead of 'impact'. I have been trying to trace it, but
  // I cannot find the source of the event. However, it is only trigger in the
  // concrete combination of non-inferiority + impact. Therefore, we know that
  // when we are getting a 'non-inferiority' event, it is really an 'impact'
  // event. 
  //
  // The right fix would be to find the source of the event and change it, but
  // my sanity has limits.
  const property =
    store.attributes.calculateProp === 'non-inferiority'
      ? 'impact'
      : store.attributes.calculateProp
  const testType = store.attributes.testType

  const formula = statFormulas[testType][property]

  const value = formula(convertDisplayedValues(store, getters))
  return {
    prop: property,
    value: getters.displayValue(property, value)
  }
}

function formulaToSolve(state) {
  const calculateProp = state.attributes.calculateProp

  return formulaToSolveProp[calculateProp]
}

function formulaToSolveProp(state) {
  // used for the graph as we need to pass many different values to dynamic attributes
  const testType = state.attributes.testType
  return statFormulas[testType]
}

function convertDisplayedValues(state, getters) {
  let { mu, opts, alternative } = getters

  return {
    mu,
    opts,
    alternative,
    variants: getters.extractValue('variants'),
    total_sample_size: getters.extractValue('sample'),
    base_rate: getters.extractValue('base'),
    effect_size: getters.extractValue('impact'),
    alpha:
      state.attributes.comparisonMode === 'all'
        ? statFormulas.getCorrectedAlpha(
            getters.extractValue('falsePosRate'),
            getters.extractValue('variants')
          )
        : getters.extractValue('falsePosRate'),
    beta: 1 - getters.extractValue('power'), // power of 80%, beta is actually 20%
    sd_rate: getters.extractValue('sdRate')
  }
}

export default {
  calculatedValues,
  formulaToSolve,
  formulaToSolveProp,
  convertDisplayedValues
}
