# arguments-verify
function to check if arguments of function are valid

### Version
0.1.0

### Install
```
npm install --save arguments-verify
```

### Usage
``` javascript
var argumentsVerify = require('arguments-verify')

function func (arr, num) {
    argumentsVerify([['Array'], ['Number', 'Undefined']], function (err) {
        if (err) {
            throw Error('in ' + fnName + ': ' + err.value + ' is not correct')
        }
    }, 'func')
    num = num || 1
    return arr.map(function (e) {
        return e * num
    })
}

// or

var func_validator = {
    fnName: 'func',
    validate: argumentsVerify
}

function func (arr, num) {
    func_validator.validate([['Array'], ['Number', 'Undefined']], function (err) {
        if (err) {
            throw Error('in ' + fnName + ': ' + err.value + ' is not correct')
        }
    })
    num = num || 1
    return arr.map(function (e) {
        return e * num
    })
}
```

### Documentation:
See tests


### LICENSE
MIT
