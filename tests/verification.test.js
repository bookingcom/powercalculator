import 'core-js/stable'
import 'regenerator-runtime/runtime'
import parse from 'csv-parse/lib/sync'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, join } from 'path'
import math from '../src/js/math'
import {
  COMPARISON_MODE,
  TRAFFIC_MODE,
  TEST_TYPE,
  VALUE_TYPE
} from '../src/store/modules/calculator'

const { tTest, getRelativeImpactFromAbsolute, getCorrectedAlpha } = math
const { power, sample, impact } = tTest

// The original idea consisted on create a test for each row of the CSV, each
// one with an expect cluase. However,
// - Jest has a lot of issues with async operations, so we need to load the test
// synchronously.
// - test.each does not allow to use variables computed on runtime.
// - Jest does not allow to generate test cases on runtime, so they need to be
// loaded as individual checks instead of individual tests.
// - expect does not allow to add custom messages, so we need to generate the
// error message in the expect and match the output with a regexp in order to
// have visibility on the errors.
const TOLERANCE = 0.0005
const DATASET_SIZE = 9234
const similar = (val, apr) => Math.abs(val - apr) / val
const executeTest = (idx, val, apr) => {
  const err = similar(val, apr)
  const out = `idx=${idx},out=${err < TOLERANCE},val=${val},apr=${apr},err=${err}`
  return out
}
const skipTest = idx => `idx=${idx},out=skipped`

const entries = []
beforeAll(() => {
  try {
    const content = readFileSync(resolve(join(__dirname, './dataset.csv')), {
      encoding: 'utf-8',
      flag: 'r'
    })
    entries.push(...parse(content, { columns: true }))
  } catch (e) {
    console.error(`Error parsing the dataset: ${e}`)
  }
})

describe('Verifying math library', () => {
  test('Validate dataset', () => {
    expect(entries.length).toBe(DATASET_SIZE)
  })
  describe('Comparative tests', () => {
    const cases = []
    beforeAll(() => {
      for (const entry of entries) {
        cases.push({
          baseRate: +entry.point_estimate,
          confidenceLevel: 0.9,
          falsePositiveRate: 0.1,
          sample: +entry.sample_size,
          targetPower: +entry.power,
          runtime: 10,
          visitorsPerDay: +entry.sample_size / 10,
          standardDeviation: +entry.stddev_base,
          variants: entry.nr_variants - 1,
          impact:
            entry.mre_type === VALUE_TYPE.ABSOLUTE
              ? getRelativeImpactFromAbsolute({
                  base_rate: +entry.point_estimate,
                  absolute_effect_size: +entry.effect_size
                })
              : +entry.effect_size,

          // Configuration
          isNonInferiority: false,
          comparisonMode: COMPARISON_MODE.ALL,
          trafficMode: TRAFFIC_MODE.TOTAL,
          testType: TEST_TYPE.CONTINUOUS
        })
      }
    })
    test('Calculating power', () => {
      const results = cases.map((entry, index) => {
        const {
          targetPower,
          sample,
          falsePositiveRate,
          standardDeviation,
          baseRate,
          impact,
          alpha,
          variants
        } = entry
        const approx = power({
          total_sample_size: sample,
          base_rate: baseRate,
          effect_size: impact,
          alpha: getCorrectedAlpha(falsePositiveRate, variants),
          variants,
          sd_rate: standardDeviation,
          alternative: 'two-sided',
          mu: 0
        })
        return executeTest(index, targetPower, approx)
      })

      const errors = results.filter(r => /false/.test(r))

      expect(errors.length).toBe(0)
    })

    test('Calculating sample', () => {
      const results = cases.map((entry, index) => {
        const {
          targetPower,
          sample: targetSample,
          falsePositiveRate,
          standardDeviation,
          baseRate,
          impact,
          alpha,
          variants
        } = entry

        if (targetPower < 0.7 || targetPower >= 0.999) return skipTest(index)
        const approx = sample({
          base_rate: baseRate,
          effect_size: impact,
          alpha: getCorrectedAlpha(falsePositiveRate, variants),
          beta: 1 - targetPower,
          variants,
          sd_rate: standardDeviation,
          alternative: 'two-sided',
          mu: 0
        })
        return executeTest(index, targetSample, approx)
      })

      const errors = results.filter(r => /false/.test(r))
      expect(errors.length).toBe(0)
    })

    test('Calculating effect size', () => {
      const results = cases.map((entry, index) => {
        const {
          targetPower,
          sample,
          falsePositiveRate,
          standardDeviation,
          baseRate,
          impact: targetImpact,
          alpha,
          variants
        } = entry
        if (targetPower < 0.7 || targetPower >= 0.999) return skipTest(index)
        const approx = impact({
          total_sample_size: sample,
          base_rate: baseRate,
          alpha: getCorrectedAlpha(falsePositiveRate, variants),
          beta: 1 - targetPower,
          variants,
          sd_rate: standardDeviation,
          alternative: 'two-sided',
          mu: 0
        })
        return executeTest(index, targetImpact, approx)
      })

      const errors = results.filter(r => /false/.test(r))
      expect(errors.length).toBe(0)
    })
  })
  describe('Non-inferiority tests', () => {
    const cases = []
    beforeAll(() => {
      for (const entry of entries) {
        const opts = {
          type: 'relative',
          alternative: 'greater',
          base_rate: +entry.point_estimate,
          threshold: -entry.effect_size
        }

        cases.push({
          baseRate: +entry.point_estimate,
          confidenceLevel: 0.9,
          falsePositiveRate: 0.1,
          sample: +entry.sample_size,
          targetPower: +entry.power_ni,
          runtime: 10,
          visitorsPerDay: +entry.sample_size / 10,
          standardDeviation: +entry.stddev_base,
          variants: entry.nr_variants - 1,
          impact: 0,
          threshold: -entry.effect_size,

          // Non-inferiority specials
          mu: math.getMuFromRelativeDifference(opts),
          opts,

          // Configuration
          isNonInferiority: true,
          comparisonMode: COMPARISON_MODE.ALL,
          trafficMode: TRAFFIC_MODE.TOTAL,
          testType: TEST_TYPE.CONTINUOUS
        })
      }
    })
    test('Calculating power', () => {
      const results = cases.map((entry, index) => {
        const {
          targetPower,
          sample,
          falsePositiveRate,
          standardDeviation,
          baseRate,
          impact,
          alpha,
          mu,
          opts,
          variants
        } = entry
        const approx = power({
          total_sample_size: sample,
          base_rate: baseRate,
          effect_size: 0,
          alpha: getCorrectedAlpha(falsePositiveRate, variants),
          variants,
          sd_rate: standardDeviation,
          alternative: 'greater',
          mu,
          opts,
        })
        return executeTest(index, targetPower, approx)
      })

      const errors = results.filter(r => /false/.test(r))
      expect(errors.length).toBe(0)
    })

    test('Calculating sample', () => {
      const results = cases.map((entry, index) => {
        const {
          targetPower,
          sample: targetSample,
          falsePositiveRate,
          standardDeviation,
          baseRate,
          impact,
          alpha,
          mu,
          opts,
          variants
        } = entry

        if (targetPower < 0.7 || targetPower >= 0.999) return skipTest(index)
        const approx = sample({
          base_rate: baseRate,
          effect_size: 0,
          alpha: getCorrectedAlpha(falsePositiveRate, variants),
          beta: 1 - targetPower,
          variants,
          sd_rate: standardDeviation,
          alternative: 'greater',
          mu,
          opts,
        })
        return executeTest(index, targetSample, approx)
      })

      const errors = results.filter(r => /false/.test(r))
      expect(errors.length).toBe(0)
    })
    test('Calculating effect size', () => {
      const results = cases.map((entry, index) => {
        const {
          targetPower,
          sample,
          falsePositiveRate,
          standardDeviation,
          baseRate,
          threshold,
          alpha,
          mu,
          opts,
          variants
        } = entry
        if (targetPower < 0.7 || targetPower >= 0.999) return skipTest(index)
        const approx = impact({
          total_sample_size: sample,
          base_rate: baseRate,
          alpha: getCorrectedAlpha(falsePositiveRate, variants),
          beta: 1 - targetPower,
          variants,
          sd_rate: standardDeviation,
          alternative: 'greater',
          mu,
          opts,
        })
        return executeTest(index, threshold, approx)
      })

      const errors = results.filter(r => /false/.test(r))
      expect(errors.length).toBe(0)
    })
  })
})
