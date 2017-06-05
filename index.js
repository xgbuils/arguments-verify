var typeVerify = require('type-verify')

function argumentsVerify (rules, argums, cb, fnName) {
    cb = cb || this.handler
    fnName = fnName || this.fnName
    rules = transformRules(rules)
    var err = null
    var ok = !rules.some(function (rule, index) {
        if (Array.isArray(rule)) {
            err = verify(argums, index, rule, fnName)
        } else {
            var length = Math.min(argums.length, index + rule.times)
            for (; index < length && !err; ++index) {
                err = verify(argums, index, rule.rule, fnName)
            }
        }
        return err
    })
    return cb ? cb(err, ok) : ok
}

function verify (argums, index, rule, fnName) {
    var err = typeVerify(argums[index], rule, errorHandlerCreator(fnName, index))
    if (!err && index >= argums.length) {
        err = {
            fnName: fnName,
            nth: index
        }
    }
    return err
}

function transformRules (rules) {
    var result = []
    rules.every(function (rule, index) {
        var ruleIsArray = Array.isArray(rule)
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

function errorHandlerCreator (fnName, nth) {
    return function (matches, value, expected, actual) {
        return matches ? null : {
            fnName: fnName,
            nth: nth,
            value: value,
            expected: expected,
            actual: actual
        }
    }
}

module.exports = argumentsVerify
