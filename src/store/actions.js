export default {
  'field:change'(context, { prop, value }) {
    // add validations necessary here

    switch (prop) {
      // these 3 cases will call the same extra action
      case 'base':
        context.commit('field:change', { prop, value })
        if (context.state.nonInferiority.enabled === true) {
          if (context.state.nonInferiority.selected == 'absolutePerDay') {
            context.dispatch('change:noninferiorityimpact')
          }
          context.dispatch('convert:noninferioritythreshold', { prop, value })
        }

        context.dispatch(
          'update:proptocalculate',
          context.getters.calculatedValues
          )
        break

      case 'sample':
      case 'runtime':
      case 'visitorsPerDay':
        context.dispatch('sample:sideeffect', { prop, value })
        context.dispatch('update:proptocalculate')
        if (
          context.state.nonInferiority.enabled === true
          // && prop == 'visitorsPerDay'
        ) {
          context.dispatch('convert:noninferioritythreshold', { prop, value })
        }
        break

      case 'thresholdRelative':
      case 'thresholdAbsolute':
        context.dispatch('threshold:sideeffect', { prop, value })
        context.dispatch('change:noninferiorityimpact')
        context.dispatch('convert:noninferioritythreshold', { prop, value })
        break

      case 'impactByMetricValue':
        context.dispatch('convert:absoluteimpact', { prop, value })
        break

      case 'expectedChange':
        context.commit('field:change', { prop, value })
        context.dispatch('change:noninferiorityimpact')
        break

      case 'visitorsWithGoals':
        context.dispatch('convert:visitorswithgoals', { prop, value })
        break

      default:
        context.commit('field:change', { prop, value })

        if (context.state.nonInferiority.enabled === true) {
          context.dispatch('convert:noninferioritythreshold', { prop, value })
        }

        // calculate new value for calculated prop
        context.dispatch(
          'update:proptocalculate',
          context.getters.calculatedValues
        )
        break
    }
  },
  'change:noninferiority'(context, { prop, value }) {
    // add validations necessary here
    context.commit('change:noninferiority', { prop, value })
    context.dispatch('change:noninferiorityimpact', { value: 'sample' })

    if (prop == 'enabled') {
      if (value === true) {
        context.dispatch('field:change', {
          prop: 'lockedField',
          value: 'days'
        })
        context.dispatch('field:change', {
          prop: 'onlyTotalVisitors',
          value: false
        })
        context.dispatch('update:calculateprop', { value: 'sample' })
      }
    } else {
      // update values based on nonInferiority.selected
      context.dispatch(
        'update:proptocalculate',
        context.getters.calculatedValues
      )
    }
  },
  'change:noninferiorityimpact'(context) {
    let impactValue = context.getters.nonInferiorityImpact

    if (context.state.nonInferiority.enabled === true) {
      this.__impactBackup = context.state.attributes.impact
      context.dispatch('convert:noninferioritythreshold', {
        prop: 'impact',
        value: impactValue
      })
    } else {
      impactValue = this.__impactBackup || 0
    }

    context.dispatch('field:change', {
      prop: 'impact',
      value: impactValue
    })
  },
  'switch:lockedfield'(context) {
    let newLockedField =
      context.state.attributes.lockedField == 'days' ? 'visitorsPerDay' : 'days'

    context.commit('switch:lockedfield', {
      value: newLockedField
    })
  },
  'sample:sideeffect'(context, { prop, value }) {
    const isSampleCalculated =
      context.state.attributes.calculateProp == 'sample'
    let lockedField = context.state.attributes.lockedField

    let stateMachine = {
      calculated: {
        sample: false,
        runtime: lockedField == 'days',
        visitorsPerDay: lockedField != 'days'
      },
      notCalculated: {
        sample: true,
        runtime: lockedField == 'days' && prop == 'sample',
        visitorsPerDay: lockedField != 'days' && prop == 'sample'
      }
    }

    let input =
      stateMachine[isSampleCalculated ? 'calculated' : 'notCalculated']

    let data = {
      sample: context.state.attributes.sample,
      visitorsPerDay: context.state.attributes.visitorsPerDay,
      runtime: context.state.attributes.runtime
    }

    // override of the prop changed by the action change:fields with the new value
    data[prop] = value

    context.commit('sample:sideeffect', {
      prop: prop,
      value: data[prop]
    })

    // looks throught the stat machine list and updates all values based on data
    Object.keys(input).forEach((key) => {
      if (input[key] == true) {
        if (key != prop) {
          let result = 0
          if (key == 'runtime') {
            result = Math.ceil(window.parseInt(data.sample) / data.visitorsPerDay)
            result = isNaN(result) ? '-' : result
          } else if (key == 'visitorsPerDay') {
            let isInvalid = false
            result = Math.floor(window.parseInt(data.sample) / data.runtime)
            isInvalid = isNaN(result)

            result = isNaN(result) || isInvalid ? '-' : result
          } else if (key == 'sample') {
            let isInvalid = false
            result = Math.ceil(data.runtime * data.visitorsPerDay)
            isInvalid = isNaN(result)

            result = isInvalid ? '-' : result
          }

          context.commit('sample:sideeffect', {
            prop: key,
            value: result
          })
        }
      }
    })
  },
  'threshold:sideeffect'(context, { prop, value }) {
    context.commit('field:change', { prop, value })
    if (context.state.attributes.calculateProp == 'sample') {
      context.dispatch('sample:sideeffect', context.getters.calculatedValues)
    }
    context.dispatch('update:proptocalculate', context.getters.calculatedValues)
  },
  'update:calculateprop'(context, { value }) {
    context.commit('update:calculateprop', { value })
  },
  'convert:absoluteimpact'(context, { prop, value }) {
    let impactObj = {
      prop: 'impact',
      value: context.getters.displayValue(
        'impact',
        context.getters.calculateImpactFromAbsoluteImpact(value)
      )
    }

    context.dispatch('field:change', impactObj)
  },
  'convert:visitorswithgoals'(context, { prop, value }) {
    let newValue = context.getters.baseFromVisitorsWithGoals(value)

    context.dispatch('field:change', {
      prop: 'base',
      value: newValue
    })
  },
  'convert:noninferioritythreshold'(context, { prop, value }) {

    const calculateAbsolute = relative => Math.round(context.getters.displayValue(
      'nonInfThresholdAbsolute',
      context.getters.calculateAbsoluteFromRelative(relative)) * 100) / 100

    const calculateRelative = absolute => context.getters.displayValue(
      'nonInfThresholdRelative',
      context.getters.calculateRelativeFromAbsolute(absolute)
    )

    switch (prop) {
      case 'thresholdRelative':
        context.commit('change:noninferiority', {
          prop: 'thresholdAbsolute',
          value: calculateAbsolute(value) || 0
        })
        break

      case 'thresholdAbsolute':
        context.commit('change:noninferiority', {
          prop: 'thresholdRelative',
          value: calculateRelative(value) || 0
        })
        break

      case 'visitorsPerDay':
        if (context.state.nonInferiority.selected == 'absolutePerDay') {
          context.commit('change:noninferiority', {
            prop: 'thresholdRelative',
            value: calculateRelative(context.state.nonInferiority.threshold)
          })
          context.dispatch('field:change', {
            prop: 'thresholdRelative',
            value: calculateRelative(context.state.nonInferiority.threshold)
          })

        } else {
          context.commit('change:noninferiority', {
            prop: 'thresholdAbsolute',
            value: calculateAbsolute(context.state.nonInferiority.threshold)
          })
          context.dispatch('field:change', {
            prop: 'thresholdAbsolute',
            value: calculateAbsolute(context.state.nonInferiority.threshold)
          })
        }

        break
        // both
        // ISSUE IS HERE: It needs to calculate one of them.
      case 'impact':
      default:
        if (context.state.nonInferiority.selected == 'absolutePerDay') {
          context.commit('change:noninferiority', {
            prop: 'thresholdRelative',
            value: calculateRelative(context.state.nonInferiority.threshold)
          })
        } else {
          context.commit('change:noninferiority', {
            prop: 'thresholdAbsolute',
            value: calculateAbsolute(context.state.nonInferiority.threshold)
          })
        }
        break
    }
  },
  'update:proptocalculate'(context) {
    const calculatedObj = context.getters.calculatedValues || context.rootGetters.calculatedValue
    context.commit('update:proptocalculate', calculatedObj)

    if (calculatedObj.prop == 'sample') {
      // apply side effects
      context.dispatch('sample:sideeffect', calculatedObj)
    }
  },
  'init:calculator'(context) {
    if (context.state.nonInferiority.enabled) {
      context.dispatch('change:noninferiorityimpact')
    }

    if (context.state.attributes.calculateProp != 'sample') {
      context.dispatch('field:change', {
        prop: 'sample',
        value: context.state.attributes.sample
      })
    }

    context.dispatch('update:proptocalculate')
  },
  'test:reset'(context, stateObj) {
    context.commit('test:reset', stateObj)
    context.dispatch('init:calculator')
  }
}
