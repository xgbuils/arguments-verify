var typeVerify = require('type-verify')

function argumentsVerify (rules, argums, cb) {
    rules = transformRules(rules)
    var err = null
    var ok = !rules.some(function (rule, index) {
        if (typeVerify(rule, ['Object'])) {
            var length = Math.min(argums.length, index + rule.times)
            for (; index < length && !err; ++index) {
                err = typeVerify(argums[index], rule.rule, errorHandlerCreator(index))
            }
        } else {
            err = typeVerify(argums[index], rule, errorHandlerCreator(index))
        }
        return err
    })
    return cb ? cb(err, ok) : ok
}

function transformRules (rules) {
    var result = []
    rules.every(function (rule, index) {
        var ruleIsArray = typeVerify(rule, ['Array'])
        if (ruleIsArray) {
            result.push(rule)
        } else if (typeVerify(rule, ['Number'])) {
            result[index - 1] = {
                rule: result[index - 1],
                times: rule
            }
        }
        return ruleIsArray
    })
    return result
}

function errorHandlerCreator (nth) {
    return function (matches, value, expected, actual) {
        return matches ? null : {
            nth: nth,
            value: value,
            expected: expected,
            actual: actual
        }
    }
}

module.exports = argumentsVerify
