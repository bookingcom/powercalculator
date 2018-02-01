import util from './test_utils.js';
import statFormula from '../src/js/math.js';

var greater = [{control_mean: 0.001, stddev: 1, mu: 0     },
               {control_mean: 0.01,  stddev: 1, mu: 0.001 },
               {control_mean: 0.01,  stddev: 1, mu: -0.001},
               {control_mean: 1,     stddev: 1, mu: 0     },
               {control_mean: 1,     stddev: 1, mu: 0.1   },
               {control_mean: 1,     stddev: 1, mu: -0.1  },
               {control_mean: 10,    stddev: 1, mu: 0     },
               {control_mean: 10,    stddev: 1, mu: 1     },
               {control_mean: 10,    stddev: 1, mu: -1    }];

var lower = [{control_mean:  0.001, stddev: 1, mu: 0     },
             {control_mean:  0.01,  stddev: 1, mu: 0.001 },
             {control_mean:  0.01,  stddev: 1, mu: -0.001},
             {control_mean:  1,     stddev: 1, mu: 0     },
             {control_mean:  1,     stddev: 1, mu: 0.1   },
             {control_mean:  1,     stddev: 1, mu: -0.1  },
             {control_mean:  10,    stddev: 1, mu: 0     },
             {control_mean:  10,    stddev: 1, mu: 1,    },
             {control_mean:  10,    stddev: 1, mu: -1,   }];

var configs = [{alternative: "two-sided", data: greater.concat(lower)},
               {alternative: "greater",   data: greater},
               {alternative: "lower",     data: lower}];

var sample_size_continuous = util.sample_size_continuous();
var replications = util.replications_power();
var default_fpr = util.default_fpr();
var margin = util.margin();
var default_beta = util.default_beta();

configs.forEach(function(config) {
    var cases = config.data;
    cases.forEach(function(test_case) {
        test("solveforeffectsize yield the expected power for continuous metrics with parameters: " + util.serialize(test_case), () => {
            var impact = statFormula.tTest.impact({
                total_sample_size: 2*sample_size_continuous,
                base_rate: test_case.control_mean,
                sd_rate: test_case.stddev,
                alpha: default_fpr,
                beta: default_beta,
                alternative: config.alternative,
                mu: test_case.mu
             });

            var dataset = util.simulate_continuous({
                control_mean: test_case.control_mean,
                control_std: test_case.stddev,
                change: impact*test_case.control_mean,
                treatment_std: test_case.stddev,
                sample_size: sample_size_continuous,
                reps: replications
            });

            expect(util.check({
                data: dataset,
                alternative: config.alternative,
                mu: test_case.mu,
                alpha: default_fpr,
                target: 1-default_beta,
                margin: margin
            })).toBe(true);
        });
    });
}); 

var greater_binary = [{control_rate: 0.01, mu: 0     },
                      {control_rate: 0.01, mu: 0.001 },
                      {control_rate: 0.01, mu: -0.001},
                      {control_rate: 0.1,  mu: 0     },
                      {control_rate: 0.1,  mu: 0.01  },
                      {control_rate: 0.1,  mu: -0.01 },
                      {control_rate: 0.8,  mu: 0     },
                      {control_rate: 0.8,  mu: 0.08  },
                      {control_rate: 0.8,  mu: -0.08 }];

var lower_binary = [{control_rate: 0.01, mu: 0      },
                    {control_rate: 0.01, mu: 0.001  },
                    {control_rate: 0.01, mu: -0.001 },
                    {control_rate: 0.1,  mu: 0      },
                    {control_rate: 0.1,  mu: 0.01   },
                    {control_rate: 0.1,  mu: -0.01  },
                    {control_rate: 0.8,  mu: 0      },
                    {control_rate: 0.8,  mu: 0.08   },
                    {control_rate: 0.8,  mu: -0.08  }];

var configs_binary = [{alternative: "two-sided", data: greater_binary.concat(lower_binary)},
                      {alternative: "greater",   data: greater_binary},
                      {alternative: "lower",     data: lower_binary}];

var sample_size = util.sample_size();

configs_binary.forEach(function(config) {
    var cases = config.data;
    cases.forEach(function(test_case) {
        test("solveforeffectsize yield the expected power for binary metrics with parameters: " + util.serialize(test_case), () => {
            var impact = statFormula.gTest.impact({
                total_sample_size: 2*sample_size,
                base_rate: test_case.control_rate,
                alpha: default_fpr,
                beta: default_beta,
                alternative: config.alternative,
                mu: test_case.mu
             }); 

            var dataset = util.simulate_binary({
                control_rate: test_case.control_rate,
                change: impact*test_case.control_rate,
                sample_size: sample_size,
                reps: replications
            });
        
            expect(util.check({
                data: dataset,
                alternative: config.alternative,
                mu: test_case.mu,
                alpha: default_fpr,
                target: 1-default_beta,
                margin: margin
            })).toBe(true);
        });
    });
}); 
