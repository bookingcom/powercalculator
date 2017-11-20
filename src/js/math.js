// SOLVING FOR POWER

import jStat from 'jStat';


function solveforpower_Gtest ({total_sample_size, base_rate, effect_size, alpha}) {
    var visitors_base = total_sample_size/2;
    var visitors_var = total_sample_size/2;
    var mean_base = base_rate;
    var mean_var = base_rate * (1+effect_size);
    var mean_diff = mean_var - mean_base;
    var variance_base = (mean_base*(1-mean_base))/visitors_base;
    var variance_var = (mean_var*(1-mean_var))/visitors_var;
    var SE = Math.sqrt(variance_var + variance_base);
    var dof = visitors_base + visitors_var - 2;

    var prop_hat = ((visitors_base*mean_base) + (visitors_var * mean_var)) / (visitors_base+visitors_var);
    var SE_hat = Math.sqrt(prop_hat*(1-prop_hat)*(1/visitors_base + 1/visitors_var));

    var power = 1 - jStat.studentt.cdf((jStat.studentt.inv(1-alpha/2,dof)*SE_hat - Math.abs(mean_diff))/SE,dof);

    return power
}

function solveforpower_Ttest({total_sample_size, base_rate, sd_rate, effect_size, alpha}) {
    var visitors_base = total_sample_size/2;
    var visitors_var = total_sample_size/2;
    var mean_base = base_rate;
    var mean_var = base_rate * (1+effect_size);
    var mean_diff = mean_var - mean_base;
    var variance_base = sd_rate**2;
    var variance_var = sd_rate**2;
    var SE = Math.sqrt((variance_base/visitors_base)+ (variance_var/visitors_var));
    var dof = visitors_base + visitors_var - 2;

    var power = 1 - jStat.studentt.cdf((jStat.studentt.inv((1-alpha/2), dof) - mean_diff/SE),dof)
    +   jStat.studentt.cdf( (- jStat.studentt.inv(1-alpha/2,dof) - mean_diff/SE), dof)
    return power
}



// SOLVING FOR SAMPLE SIZE

//DOF cant be based on sample size here!
function solveforsample_Ttest({base_rate, sd_rate, effect_size, alpha, beta}){
    var mean_base = base_rate;
    var mean_var = base_rate * (1+effect_size);
    var mean_diff = mean_var - mean_base;
    var variance_base = sd_rate**2;
    var variance_var = sd_rate**2;
    var dof = 10000;
    var sample_one_group = ((variance_base + variance_var)*(jStat.studentt.inv((1-alpha/2),dof)
        + jStat.studentt.inv(1-beta,dof))**2)/mean_diff**2;
    var total_sample_size = sample_one_group*2;
    return total_sample_size;
}



function solveforsample_Gtest({base_rate, effect_size, alpha, beta}){
    var mean_base = base_rate;
    var mean_var = base_rate * (1+effect_size);
    var mean_diff = mean_var - mean_base;
    var variance_base = (mean_base*(1-mean_base));
    var variance_var = (mean_var*(1-mean_var));
    var dof =100000;
    var sample_one_group = ((variance_base + variance_var)*(jStat.studentt.inv((1-alpha/2),dof)
        + jStat.studentt.inv(1-beta,dof))**2)/mean_diff**2;
    var total_sample_size = sample_one_group*2;
    return total_sample_size;
}



// SOLVING FOR EFFECT SIZE

function solveforeffectsize_Ttest({total_sample_size, base_rate, sd_rate, alpha, beta}){
    var sample_one_group = total_sample_size/2;
    var variance_base = sd_rate**2;
    var variance_var = sd_rate**2;
    var dof = total_sample_size - 2;
    var absolute_mean_diff = ((variance_base + variance_var)*(jStat.studentt.inv((1-alpha/2),dof)
        + jStat.studentt.inv(1-beta,dof))**2)/sample_one_group;
    var effect_size = absolute_mean_diff/base_rate;
    return effect_size;
}


function solveforeffectsize_Gtest({total_sample_size, base_rate, alpha, beta}){
    var sample_one_group = total_sample_size / 2;
    var mean_base = base_rate;
    var dof = total_sample_size - 2;
    var Z = (jStat.studentt.inv((1 - alpha / 2), dof) + jStat.studentt.inv(1 - beta, dof)) ** 2;
    var a = sample_one_group * mean_base + Z * mean_base;
    var b = -2 * sample_one_group * mean_base - Z;
    var c = sample_one_group * mean_base - Z * (1 - mean_base);
    var u1 = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a) - 1;
    var u2 = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a) - 1;
    var effect_size;
    if (u1 < 0) {
        effect_size = u2;
    } else {
        effect_size = u1;
    }
    return effect_size;
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
    getRelativeImpactFromVisitors: get_relative_impact_from_visitors
}
