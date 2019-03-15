import util from './test_utils.js';
import statFormula from '../src/js/math.js';

var greater = [{control_rate: 0.01, change: 0.001,  mu: 0     },
               {control_rate: 0.01, change: 0.0001, mu: 0     },
               {control_rate: 0.01, change: 0.002,  mu: 0.001 },
               {control_rate: 0.01, change: 0,      mu: -0.001},
               {control_rate: 0.1,  change: 0.01,   mu: 0     },
               {control_rate: 0.1,  change: 0.001,  mu: 0     },
               {control_rate: 0.1,  change: 0.02,   mu: 0.01  },
               {control_rate: 0.1,  change: 0,      mu: -0.01 },
               {control_rate: 0.8,  change: 0.008,  mu: 0     },
               {control_rate: 0.8,  change: 0.08,   mu: 0     },
               {control_rate: 0.8,  change: 0.1,    mu: 0.08  },
               {control_rate: 0.8,  change: 0,      mu: -0.08 }];

var lower = [{control_rate: 0.01, change: -0.001,  mu: 0     },
             {control_rate: 0.01, change: -0.0001, mu: 0     },
             {control_rate: 0.01, change: -0.002,  mu: -0.001},
             {control_rate: 0.1,  change: -0.01,   mu: 0     },
             {control_rate: 0.1,  change: -0.001,  mu: 0     },
             {control_rate: 0.1,  change: -0.02,   mu: -0.01 },
             {control_rate: 0.8,  change: -0.008,  mu: 0     },
             {control_rate: 0.8,  change: -0.08,   mu: 0     },
             {control_rate: 0.8,  change: -0.1,    mu: -0.08 }];

var configs = [{alternative: "two-sided", data: greater.concat(lower),  variants: 1},
               {alternative: "greater",   data: greater,                variants: 1},
               {alternative: "lower",     data: lower,                  variants: 1},
               {alternative: "two-sided", data: greater.concat(lower),  variants: 2},
               {alternative: "greater",   data: greater,                variants: 2},
               {alternative: "lower",     data: lower,                  variants: 2},
               {alternative: "two-sided", data: greater.concat(lower),  variants: 3},
               {alternative: "greater",   data: greater,                variants: 3},
               {alternative: "lower",     data: lower,                  variants: 3}];

var sample_size = util.sample_size();
var replications = util.replications_power();
var default_fpr = util.default_fpr();
var margin = util.margin();

configs.forEach(function(config) {
    var cases = config.data;
    cases.forEach(function(test_case) {
        test_case.variants = config.variants;
        test("solveforpower yield the expected power with parameters: " + util.serialize(test_case), () => {
            var dataset = util.simulate_binary({
                "control_rate": test_case.control_rate,
                "change": test_case.change,
                "sample_size": sample_size,
                "reps": replications
            });
        
            var target = statFormula.gTest.power({
                "total_sample_size": (test_case.variants+1)*sample_size,
                "base_rate": test_case.control_rate,
                "effect_size": test_case.change/test_case.control_rate,
                "mu": test_case.mu,
                "alternative": config.alternative,
                "alpha": default_fpr,
                "variants": test_case.variants,
            });
        
            expect(util.check({
                data: dataset,
                alternative: config.alternative,
                mu: test_case.mu,
                alpha: default_fpr,
                target: target,
                margin: margin
            })).toBe(true);
        });
    });
});
