import jstat from 'jstat';
import Rands from 'rands';

var rands = new Rands();

// Sample size used throughout the tests
function sample_size() {
    return 5000
}
function sample_size_continuous() {
    return 100
}

// Constants used for the tests
function default_beta() {
    return  0.2
}
function default_fpr() {
    return  0.1
}

// Number of replications needed to attain 99.9% power when doing an equivalence test
// H0: |observed_power - theoretical_power| > 0.015 at a 99.9% confidence level.
function margin() {
    return 0.015
}
function replications_power() {
    return 30000
}

function serialize(test_case) {
    var output = [];
    Object.keys(test_case).forEach(function(element) {
       if (typeof(test_case[element]) == 'object') {
           output.push(`${element}:` + JSON.stringify(test_case[element]));
       } else {
           output.push(`${element}: ${test_case[element]}`);
       }
    });
    return output.join(', '); 
}

function simulate_continuous({control_mean, control_std, change,
    treatment_std, sample_size, reps}) {

    var data = [];
    for (var i = 0; i < reps; i++) {
        var control_samples = rands.normal(control_mean, control_std, sample_size);
        var treatment_samples = rands.normal(control_mean+change, treatment_std, sample_size);

	var simul = {"control_mean": jstat.mean(control_samples),
                     "treatment_mean": jstat.mean(treatment_samples),
                     "control_var": jstat.variance(control_samples),
                     "treatment_var": jstat.variance(treatment_samples),
                     "sample_size": sample_size};
        data.push(simul);
     }

     return(data)
}

function simulate_binary({control_rate, change, sample_size, reps}) {

    var data = [];
    var control_samples = rands.binomial(sample_size, control_rate, reps);
    var treatment_samples = rands.binomial(sample_size, control_rate+change, reps);
    for (var i = 0; i < reps; i++) {
        var control_mean = control_samples[i]/sample_size;
        var treatment_mean = treatment_samples[i]/sample_size
        var simul = {"control_mean": control_mean,
                     "treatment_mean": treatment_mean,
                     "control_var": control_mean*(1-control_mean),
                     "treatment_var": treatment_mean*(1-treatment_mean),
                     "sample_size": sample_size};
        data.push(simul);
    }

    return(data)
}

function two_sample_test({data, alternative, mu, alpha}) {
    var diff = data["treatment_mean"] - data["control_mean"] - mu;
    var variance = (data["control_var"] + data["treatment_var"])/data["sample_size"];
    var test_statistic = diff/Math.sqrt(variance);

    var p_value;
    if (alternative == "greater") {
        p_value = 1 - jstat.normal.cdf(test_statistic, 0, 1);
    } else if (alternative == "lower") {
        p_value = jstat.normal.cdf(test_statistic, 0, 1);
    } else if (alternative == "tost") {
        var test_statistic_greater = (data["treatment_mean"]-data["control_mean"]+mu)/Math.sqrt(variance);
        p_value = jstat.max([1-jstat.normal.cdf(test_statistic_greater, 0, 1),
            jstat.normal.cdf(test_statistic, 0, 1)]);
    } else {
       p_value = 2*(1 - jstat.normal.cdf(Math.abs(test_statistic), 0, 1));
    }

    return p_value <= alpha;
}

function one_sample_equivalence_test({data, mu, margin, alpha}) {
   var variance = data["mean"]*(1-data["mean"]);
   var stddev = Math.sqrt(data["variance"]/data["sample_size"]);

   var test_statistic_lower = (data["mean"] - (mu + margin))/stddev;
   var test_statistic_greater = (data["mean"] - (mu - margin))/stddev;
 
   var p_value = jstat.max([1-jstat.normal.cdf(test_statistic_greater, 0, 1),
            jstat.normal.cdf(test_statistic_lower, 0, 1)]);

   return p_value <= alpha;
}

function check ({data, alternative, mu, alpha, target, margin}) {
    var sigs = [];
    for (var i = 0; i < data.length; i++) {
        sigs.push(two_sample_test({"data": data[i], "alternative": alternative,
                         "mu": mu, "alpha": alpha}));
    }
    var sig_data = {"mean": jstat.sum(sigs)/sigs.length,
        "variance": jstat.variance(sigs), "sample_size": sigs.length};
    var sig_test = one_sample_equivalence_test({"data": sig_data,  "mu": target,
                                                "margin": margin, "alpha": alpha})
    return sig_test
}

export default {
    simulate_continuous: simulate_continuous,
    simulate_binary: simulate_binary,
    two_sample_test: two_sample_test,
    one_sample_equivalence_test: one_sample_equivalence_test,
    check: check,
    sample_size: sample_size,
    sample_size_continuous: sample_size_continuous,
    default_beta: default_beta,
    default_fpr: default_fpr,
    replications_power: replications_power,
    margin: margin,
    serialize: serialize
};
