import jstat from 'jstat';

// SOLVING FOR POWER
function solveforpower_Gtest ({total_sample_size, base_rate, effect_size, alpha, alternative, mu}) {
    var sample_size = total_sample_size/2;

    var mean_base = base_rate;
    var mean_var = base_rate * (1+effect_size);

    var mean_diff = mean_var - mean_base;
    var delta = mean_diff - mu

    var variance = mean_base * (1-mean_base) + mean_var * (1-mean_var);
    var z = jstat.normal.inv(1-alpha/2, 0, 1);
    var mean = delta*Math.sqrt(sample_size/variance);

    var power;
    if (alternative == 'lower') {
        power = jstat.normal.cdf(jstat.normal.inv(alpha, 0, 1), mean, 1)
    } else if (alternative == 'greater') {
        power = 1-jstat.normal.cdf(jstat.normal.inv(1-alpha, 0, 1), mean, 1)
    } else {
        power = 1 - (jstat.normal.cdf(z, mean, 1) -
            jstat.normal.cdf(-z, mean, 1))
    }

    return power
}

function solveforpower_Ttest({total_sample_size, base_rate, sd_rate, effect_size, alpha, alternative, mu}) {
    var sample_size = total_sample_size/2;

    var mean_base = base_rate;
    var mean_var = base_rate * (1+effect_size);

    var mean_diff = mean_var - mean_base;
    var delta = mean_diff - mu

    var variance = 2*sd_rate**2;
    var z = jstat.normal.inv(1-alpha/2, 0, 1)
    var mean = delta*Math.sqrt(sample_size/variance);

    var power;
    if (alternative == 'lower') {
        power = jstat.normal.cdf(jstat.normal.inv(alpha, 0, 1), mean, 1)
    } else if (alternative == 'greater') {
	power = 1-jstat.normal.cdf(jstat.normal.inv(1-alpha, 0, 1), mean, 1)
    } else {
        power = 1 - (jstat.normal.cdf(z, mean, 1) -
            jstat.normal.cdf(-z, mean, 1))
   }

    return power
}


function is_valid_input(data) {
    var { base_rate, effect_size, alternative, opts, mu } = data;
    var change = effect_size*base_rate;
    if (typeof(mu) != 'undefined') {
        if (alternative == 'greater' && mu >= change) {
            return false;
        }
        if (alternative == 'lower' && mu <= change) {
            return false;
        }
     }

     if (opts && opts.type == 'relative') {
        if (alternative == 'greater' && opts.threshold >= effect_size) {
            return false;
        }
        if (alternative == 'lower' && opts.threshold <= effect_size) {
            return false;
        }
     }

     if (opts && opts.type == 'absolutePerDay' && opts.calculating == 'days') {
        if (alternative == 'greater' && opts.threshold/opts.visitors_per_day >= change) {
            return false;
        }
        if (alternative == 'lower' && opts.threshold/opts.visitors_per_day <= change) {
            return false;
        }
     }

     return true;
}

// SOLVING FOR SAMPLE SIZE
function solve_quadratic_for_sample({mean_diff, Z, days, threshold, variance}) {
    var a = mean_diff;
    if (a == 0) {
        return threshold*Math.sqrt(days)/(2*Math.sqrt(variance)*Z)
    }

    var b = Math.sqrt(variance)*Z/Math.sqrt(days);
    var c = -threshold/2;

    var det = b**2 - 4*a*c;
    if (det < 0) {
      return NaN;
    }

    var sol_h = (-b + Math.sqrt(det)) / (2*a);
    var sol_l = (-b - Math.sqrt(det)) / (2*a);

    return sol_h >= 0 ? sol_h : sol_l;
}

function solveforsample_Ttest(data){
    var { base_rate, sd_rate, effect_size, alpha, beta, alternative, mu, opts } = data;
    if (!is_valid_input(data)) {
       return NaN;
    }
    var mean_base = base_rate;
    var mean_var = base_rate * (1+effect_size);

    var variance = 2*sd_rate**2;
    var mean_diff = mean_var - mean_base;

    var multiplier;
    var sample_one_group;
    if (opts && opts.type == 'absolutePerDay') {
        if (opts.calculating == 'visitorsPerDay') {
            var Z;
            if (alternative == "greater") {
                Z = jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1-alpha, 0, 1);
            } else if (alternative == "lower") {
                Z = jstat.normal.inv(1-beta, 0, 1) - jstat.normal.inv(alpha, 0, 1);
            } else {
                Z = jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1);
            }
            var sqrt_visitors_per_day = solve_quadratic_for_sample({mean_diff: mean_diff, Z: Z,
                days: opts.days, threshold: opts.threshold, variance: variance});
            sample_one_group = opts.days*sqrt_visitors_per_day**2;
        } else {
            multiplier = variance/(mean_diff*Math.sqrt(opts.visitors_per_day/2) - opts.threshold/(Math.sqrt(2*opts.visitors_per_day)))**2;
            var days;
            if (alternative == "greater" || alternative == "lower") {
                days = multiplier * (jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1-alpha, 0, 1))**2
            } else {
                days = multiplier * (jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1))**2
            }
            sample_one_group = days*opts.visitors_per_day/2;
        }
    } else {
        multiplier = variance/(mu - mean_diff)**2

        if (alternative == "greater" || alternative == "lower") {
            sample_one_group = multiplier * (jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1-alpha, 0, 1))**2
        } else {
            sample_one_group = multiplier * (jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1))**2
        }
    }

    return 2*Math.ceil(sample_one_group);
}

function solveforsample_Gtest(data){
    var { base_rate, effect_size, alpha, beta, alternative, mu, opts } = data;
    if (!is_valid_input(data)) {
       return NaN;
    }
    var mean_base = base_rate;
    var mean_var = base_rate*(1+effect_size);

    var variance = mean_base*(1-mean_base) + mean_var*(1-mean_var);

    var mean_diff = mean_var - mean_base;

    var multiplier;
    var sample_one_group;
    if (opts && opts.type == 'absolutePerDay') {
        if (opts.calculating == 'visitorsPerDay') {
            var Z;
            if (alternative == "greater") {
                Z = jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1-alpha, 0, 1);
            } else if (alternative == "lower") {
                Z = jstat.normal.inv(1-beta, 0, 1) - jstat.normal.inv(alpha, 0, 1);
            } else {
                Z = jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1);
            }
            var sqrt_visitors_per_day = solve_quadratic_for_sample({mean_diff: mean_diff, Z: Z,
                days: opts.days, threshold: opts.threshold, variance: variance});
            sample_one_group = opts.days*sqrt_visitors_per_day**2;
        } else {
            multiplier = variance/(mean_diff*Math.sqrt(opts.visitors_per_day/2) - opts.threshold/(Math.sqrt(2*opts.visitors_per_day)))**2;
            var days;
            if (alternative == "greater" || alternative == "lower") {
                days = multiplier * (jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1-alpha, 0, 1))**2
            } else {
                days = multiplier * (jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1))**2
            }
            sample_one_group = days*opts.visitors_per_day/2;
        }
    } else {
        multiplier = variance/(mu - mean_diff)**2

        if (alternative == "greater" || alternative == "lower") {
            sample_one_group = multiplier * (jstat.normal.inv(beta, 0, 1) - jstat.normal.inv(1-alpha, 0, 1))**2
        } else {
            sample_one_group = multiplier * (jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1))**2
        }
    }

    return 2*Math.ceil(sample_one_group);
}



// SOLVING FOR EFFECT SIZE
function solveforeffectsize_Ttest({total_sample_size, base_rate, sd_rate, alpha, beta, alternative, mu}){
    var sample_size = total_sample_size/2;
    var variance = 2*sd_rate**2;

    var z = jstat.normal.inv(1-beta, 0, 1);
    var multiplier = Math.sqrt(variance/sample_size);
    var effect_size;
    if (alternative == "greater") {
        effect_size = mu + (z - jstat.normal.inv(alpha, 0, 1)) * multiplier;
    } else if (alternative == "lower") {
        effect_size = mu - (z - jstat.normal.inv(alpha, 0, 1)) * multiplier;
    } else {
        var delta = (z + jstat.normal.inv(1-alpha/2, 0, 1) )* multiplier;
        effect_size = mu + delta;
    }

    return effect_size/base_rate;
}

function solve_quadratic(Z, sample_size, control_rate, mu) {
    var a = (Z**2 + sample_size) * control_rate**2;
    var b = -(Z**2) * control_rate - 2 * (control_rate + mu) * sample_size * control_rate;
    var c = sample_size * (control_rate + mu)**2 - Z**2 * control_rate * (1-control_rate);

    var det = b**2 - 4*a*c;
    if (det < 0) {
      return [NaN, NaN];
    }

    var sol_h = (-b + Math.sqrt(det)) / (2*a);
    var sol_l = (-b - Math.sqrt(det)) / (2*a);

    return [sol_h, sol_l];
}

function solveforeffectsize_Gtest({total_sample_size, base_rate, alpha, beta, alternative, mu}){
    var sample_size = total_sample_size / 2;

    var rel_effect_size;
    var Z;
    var solutions;
    if (alternative == "greater" || alternative == "lower") {
        Z = jstat.normal.inv(beta, 0, 1) + jstat.normal.inv(alpha, 0, 1);
        solutions = solve_quadratic(Z, sample_size, base_rate, mu);
        if (alternative == 'greater') {
            rel_effect_size = solutions[0] - 1;
        } else {
            rel_effect_size = solutions[1] - 1;
        }
    } else {
        Z = jstat.normal.inv(1-beta, 0, 1) + jstat.normal.inv(1-alpha/2, 0, 1);
        solutions = solve_quadratic(Z, sample_size, base_rate, mu);
        rel_effect_size = solutions[0] - 1;
    }

    return rel_effect_size;
}


function get_visitors_with_goals({total_sample_size, base_rate}){
    return total_sample_size * base_rate;
}

function get_base_rate({total_sample_size, visitors_with_goals}){
    return visitors_with_goals / total_sample_size;
}

function get_absolute_impact_in_metric_hash({base_rate, effect_size}) {
    let value = base_rate * effect_size;
    return {
        value,
        min: base_rate - value,
        max: base_rate + value
    }
}

function get_relative_impact_from_absolute({base_rate, absolute_effect_size}) {
    return ((base_rate + absolute_effect_size) / base_rate) - 1
}

function get_absolute_impact_in_visitors({total_sample_size, base_rate, effect_size}) {
    let absoluteImpactInMetric = get_absolute_impact_in_metric_hash({base_rate, effect_size}).value;
    return absoluteImpactInMetric * total_sample_size
}

function get_relative_impact_from_visitors({total_sample_size, base_rate, visitors}) {
    let absoluteImpactInMetric = visitors / total_sample_size;

    return get_relative_impact_from_absolute({
        base_rate,
        absolute_effect_size: absoluteImpactInMetric
    })
}

function get_mu_from_relative_difference ({threshold, base_rate}) {
    return threshold*base_rate;
}

function get_mu_from_absolute_per_day ({threshold, visitors_per_day}) {
    return threshold/visitors_per_day;
}

function get_alternative ({type}) {
    let alternative = 'two-sided';
    if (type == 'noninferiority') {
        alternative = 'greater';
    }
    return alternative;
}

export default {
    gTest: {
        power: solveforpower_Gtest,
        sample: solveforsample_Gtest,
        impact: solveforeffectsize_Gtest
    },
    tTest: {
        power: solveforpower_Ttest,
        sample: solveforsample_Ttest,
        impact: solveforeffectsize_Ttest
    },
    getVisitorsWithGoals: get_visitors_with_goals,
    getBaseRate: get_base_rate,
    getAbsoluteImpactInMetricHash: get_absolute_impact_in_metric_hash,
    getAbsoluteImpactInVisitors: get_absolute_impact_in_visitors,
    getRelativeImpactFromAbsolute: get_relative_impact_from_absolute,
    getRelativeImpactFromVisitors: get_relative_impact_from_visitors,
    getMuFromRelativeDifference: get_mu_from_relative_difference,
    getMuFromAbsolutePerDay: get_mu_from_absolute_per_day,
    getAlternative: get_alternative,
}
