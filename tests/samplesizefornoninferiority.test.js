import util from './test_utils.js';
import statFormula from '../src/js/math.js';

var greater = [{control_rate: 0.01, change: -0.001, opts: {calculating:'days', type: 'absolutePerDay', threshold: -40,  visitors_per_day:10000}},
               {control_rate: 0.01, change: 0,      opts: {calculating:'days', type: 'absolutePerDay', threshold: -40,  visitors_per_day:10000}},
               {control_rate: 0.1,  change: -0.01,  opts: {calculating:'days', type: 'absolutePerDay', threshold: -400, visitors_per_day:10000}},
               {control_rate: 0.1,  change: 0,      opts: {calculating:'days', type: 'absolutePerDay', threshold: -400, visitors_per_day:10000}},
               {control_rate: 0.01, change: -0.001,  opts: {calculating:'visitorsPerDay', days: 14, type: 'absolutePerDay', threshold: -40 }},
               {control_rate: 0.01, change: 0,      opts: {calculating:'visitorsPerDay', days: 14, type: 'absolutePerDay', threshold: -40 }},
               {control_rate: 0.1,  change: -0.01,  opts: {calculating:'visitorsPerDay', days: 14, type: 'absolutePerDay', threshold: -400}},
               {control_rate: 0.1,  change: 0,      opts: {calculating:'visitorsPerDay', days: 14, type: 'absolutePerDay', threshold: -400}}];

var lower = [{control_rate: 0.01, change: 0.001, opts: {calculating:'days', type: 'absolutePerDay', threshold: 40,  visitors_per_day:10000}},
             {control_rate: 0.01, change: 0,     opts: {calculating:'days', type: 'absolutePerDay', threshold: 40,  visitors_per_day:10000}},
             {control_rate: 0.1,  change: 0.01,  opts: {calculating:'days', type: 'absolutePerDay', threshold: 400, visitors_per_day:10000}},
             {control_rate: 0.1,  change: 0,     opts: {calculating:'days', type: 'absolutePerDay', threshold: 400, visitors_per_day:10000}},
             {control_rate: 0.01, change: 0.001, opts: {calculating:'visitorsPerDay', days: 14, type: 'absolutePerDay', threshold: 40 }},
             {control_rate: 0.01, change: 0,     opts: {calculating:'visitorsPerDay', days: 14, type: 'absolutePerDay', threshold: 40 }},
             {control_rate: 0.1,  change: 0.01,  opts: {calculating:'visitorsPerDay', days: 14, type: 'absolutePerDay', threshold: 400}},
             {control_rate: 0.1,  change: 0,     opts: {calculating:'visitorsPerDay', days: 14, type: 'absolutePerDay', threshold: 400}}];

var configs = [{alternative: "two-sided", data: greater.concat(lower)},
               {alternative: "greater",   data: greater},
               {alternative: "lower",     data: lower}];

var replications = util.replications_power();
var default_fpr = util.default_fpr();
var margin = util.margin();
var default_beta = util.default_beta();

configs.forEach(function(config) {
    var cases = config.data;
    cases.forEach(function(test_case) {
        test("solveforsample yield the expected power for noninferiority testing  with parameters: " + util.serialize(test_case), () => {
            var sample_size = statFormula.gTest.sample({
                base_rate: test_case.control_rate,
                effect_size: test_case.change/test_case.control_rate,
                alpha: default_fpr,
                beta: default_beta,
                alternative: config.alternative,
                opts: test_case.opts,
            });

            var mu;
            if (test_case.opts.visitors_per_day) {
                mu = test_case.opts.threshold/(2*test_case.opts.visitors_per_day);
            } else {
                mu  = test_case.opts.threshold*test_case.opts.days/sample_size;
            }
            var dataset = util.simulate_binary({
                "control_rate": test_case.control_rate,
                "change": test_case.change,
                "sample_size": sample_size/2,
                "reps": replications
            });
        
            expect(util.check({
                data: dataset,
                alternative: config.alternative,
                mu: mu,
                alpha: default_fpr,
                target: 1-default_beta,
                margin: margin
            })).toBe(true);
        });
    });
}); 
