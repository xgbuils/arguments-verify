var expect = require('chai').expect
var argumentsVerify = require('./index.js')
var sinon = require('sinon')

var OBJECT_STRING = new String('hello')
var OBJECT_NUMBER = new Number(8)
var OBJECT_BOOLEAN = new Boolean(false)
var OBJECT = {}
var PRIMITIVE_NUMBER = 6
var PRIMITIVE_BOOLEAN = true
var REGEXP = /abc/
var ARRAY = [1, 2, 3]
var GENERIC_ERROR = new Error('muahaha')
var FUNCTION = function () {}

var FN_NAME = 'foo'

function fnTestCreator (rules, cb, name) {
    var context = this
    return function () {
        return argumentsVerify.call(context, rules, arguments, cb, name)
    }
}

describe('argumentsVerify', function () {
    describe('without callback', function () {
        it('returns true if all of arguments are valid', function () {
            var RULES = [
                [String],
                ['Number'],
                ['Array', 'RegExp']
            ]
            var foo = fnTestCreator(RULES)
            expect(foo(OBJECT_STRING, PRIMITIVE_NUMBER, ARRAY)).to.be.equal(true)
        })

        it('arguments no specified in rules are always valid', function () {
            var RULES = [
                ['RegExp'],
                [],
                [Number]
            ]
            var foo = fnTestCreator(RULES)
            expect(foo(REGEXP, ARRAY, OBJECT_NUMBER, ARRAY, OBJECT_STRING)).to.be.equal(true)
        })

        it('it returns false if there are less arguments than requires', function () {
            var RULES = [
                ['RegExp'],
                [],
                []
            ]
            var foo = fnTestCreator(RULES)
            expect(foo(REGEXP, ARRAY)).to.be.equal(false)
        })

        it('returns false when first argument is invalid', function () {
            var RULES = [
                ['String'],
                ['Object'],
                []
            ]
            var foo = fnTestCreator(RULES)
            expect(foo(ARRAY, OBJECT, PRIMITIVE_NUMBER)).to.be.equal(false)
        })

        it('returns false when third argument is invalid', function () {
            var RULES = [
                ['Boolean'],
                [Boolean],
                ['Null']
            ]
            var foo = fnTestCreator(RULES)
            expect(foo(OBJECT_BOOLEAN, OBJECT_BOOLEAN)).to.be.equal(false)
        })

        it('returns false when more than one argument is invalid', function () {
            var RULES = [
                ['Boolean'],
                [Boolean],
                ['Null']
            ]
            var foo = fnTestCreator(RULES)
            expect(foo(OBJECT_BOOLEAN, PRIMITIVE_BOOLEAN)).to.be.equal(false)
        })

        describe('optional arguments validation', function () {
            describe('when last item of rules is a number `n` and given the previous rule', function () {
                describe('the first `n` optional arguments passed, are verified with the last rule', function () {
                    it('valid arguments (not putting optional arguments)', function () {
                        var n = 5
                        var RULES = [
                            ['Function'],
                            ['Number'],
                            n
                        ]
                        var foo = fnTestCreator(RULES)
                        expect(foo(FUNCTION)).to.be.equal(true)
                    })

                    it('valid arguments (not putting all of optional arguments to verify)', function () {
                        var n = 3
                        var RULES = [
                            ['Function'],
                            ['Number'],
                            n
                        ]
                        var foo = fnTestCreator(RULES)
                        expect(foo(FUNCTION, PRIMITIVE_NUMBER, OBJECT_NUMBER)).to.be.equal(true)
                    })

                    it('valid arguments (putting exactly the same arguments as `n`)', function () {
                        var n = 2
                        var RULES = [
                            ['Function'],
                            ['Number'],
                            n
                        ]
                        var foo = fnTestCreator(RULES)
                        expect(foo(FUNCTION, PRIMITIVE_NUMBER, OBJECT_NUMBER)).to.be.equal(true)
                    })

                    it('valid arguments (putting more arguments than `n`)', function () {
                        var n = 2
                        var RULES = [
                            ['Function'],
                            ['Number'],
                            n
                        ]
                        var foo = fnTestCreator(RULES)
                        expect(foo(FUNCTION, PRIMITIVE_NUMBER, OBJECT_NUMBER, ARRAY, FUNCTION)).to.be.equal(true)
                    })

                    it('invalid arguments (not putting all of optional arguments to verify)', function () {
                        var n = 3
                        var RULES = [
                            ['Function'],
                            ['Number'],
                            n
                        ]
                        var foo = fnTestCreator(RULES)
                        expect(foo(FUNCTION, PRIMITIVE_NUMBER, REGEXP)).to.be.equal(false)
                    })

                    it('invalid arguments (putting exactly the same arguments as `n`)', function () {
                        var n = 2
                        var RULES = [
                            ['Function'],
                            ['Number'],
                            n
                        ]
                        var foo = fnTestCreator(RULES)
                        expect(foo(FUNCTION, OBJECT, OBJECT_NUMBER)).to.be.equal(false)
                    })

                    it('invalid arguments (putting more arguments than `n`)', function () {
                        var n = 2
                        var RULES = [
                            ['Function'],
                            ['Number'],
                            n
                        ]
                        var foo = fnTestCreator(RULES)
                        expect(foo(FUNCTION, PRIMITIVE_NUMBER, REGEXP, ARRAY, FUNCTION)).to.be.equal(false)
                    })
                })
            })
        })
    })

    describe('with callback', function () {
        var cb
        beforeEach(function () {
            cb = sinon.spy()
        })

        it('callback is called once when arguments are valid', function () {
            var RULES = [
                ['Boolean'],
                ['Undefined']
            ]
            var foo = fnTestCreator(RULES, cb)
            foo(PRIMITIVE_BOOLEAN, undefined)
            expect(cb.calledOnce).to.be.equal(true)
        })

        it('callback is called once when some argument is invalid', function () {
            var RULES = [
                ['Number'],
                [TypeError]
            ]
            var foo = fnTestCreator(RULES, cb)
            foo(PRIMITIVE_NUMBER, GENERIC_ERROR)
            expect(cb.calledOnce).to.be.equal(true)
        })

        describe('error argument (first argument)', function () {
            it('is null if all of arguments are valid', function () {
                var RULES = [
                    [String],
                    ['Number'],
                    ['Array', 'RegExp']
                ]
                var foo = fnTestCreator(RULES, cb)
                foo(OBJECT_STRING, PRIMITIVE_NUMBER, ARRAY)
                expect(cb.args[0][0]).to.be.equal(null)
            })

            it('is null when are passed arguments no specified in rules', function () {
                var RULES = [
                    ['RegExp'],
                    [],
                    [Number]
                ]
                var foo = fnTestCreator(RULES, cb)
                foo(REGEXP, ARRAY, OBJECT_NUMBER, ARRAY, OBJECT_STRING)
                expect(cb.args[0][0]).to.be.equal(null)
            })

            it('error object is passed when first argument is invalid', function () {
                var RULES = [
                    ['String', Number],
                    ['Object'],
                    []
                ]
                var FN_NAME = 'foo'
                var foo = fnTestCreator(RULES, cb, FN_NAME)
                foo(ARRAY, OBJECT, PRIMITIVE_NUMBER)
                expect(cb.args[0][0]).to.be.deep.equal({
                    fnName: FN_NAME,
                    nth: 0,
                    value: ARRAY,
                    actual: {
                        type: 'Array',
                        instance: 'Array'
                    },
                    expected: {
                        type: ['String'],
                        instance: ['Number']
                    }
                })
            })

            it('error object is passed when third argument is invalid', function () {
                var RULES = [
                    ['Boolean'],
                    [Boolean],
                    ['Null']
                ]
                var FN_NAME = 'foo'
                var foo = fnTestCreator(RULES, cb, FN_NAME)
                foo(OBJECT_BOOLEAN, OBJECT_BOOLEAN)
                expect(cb.args[0][0]).to.be.deep.equal({
                    fnName: FN_NAME,
                    nth: 2,
                    value: undefined,
                    actual: {
                        type: 'Undefined'
                    },
                    expected: {
                        type: ['Null'],
                        instance: []
                    }
                })
            })

            it('error object with the first argument invalid is passed when more than one argument is invalid', function () {
                var RULES = [
                    ['Boolean'],
                    [Boolean],
                    ['Null']
                ]
                var FN_NAME = 'foo'
                var foo = fnTestCreator.call({
                    fnName: FN_NAME
                }, RULES, cb)
                foo(OBJECT_BOOLEAN, PRIMITIVE_BOOLEAN)
                expect(cb.args[0][0]).to.be.deep.equal({
                    fnName: FN_NAME,
                    nth: 1,
                    value: PRIMITIVE_BOOLEAN,
                    actual: {
                        instance: 'Boolean'
                    },
                    expected: {
                        type: [],
                        instance: ['Boolean']
                    }
                })
            })
        })

        describe('match argument (second argument)', function () {
            it('is true when arguments are valid', function () {
                var RULES = [
                    ['Boolean'],
                    ['Undefined']
                ]
                var foo = fnTestCreator(RULES, cb)
                foo(PRIMITIVE_BOOLEAN, undefined)
                expect(cb.args[0][1]).to.be.equal(true)
            })

            it('is false when some argument is invalid', function () {
                var RULES = [
                    ['Number'],
                    [TypeError]
                ]
                var foo = fnTestCreator(RULES, cb)
                foo(PRIMITIVE_NUMBER, GENERIC_ERROR)
                expect(cb.args[0][1]).to.be.equal(false)
            })
        })

        describe('less arguments than rules require', function () {
            it('it is passed an error parameter just with fnName & nth properties', function () {
                var RULES = [
                    ['RegExp'],
                    [],
                    []
                ]
                var foo = fnTestCreator(RULES, cb, FN_NAME)
                foo(REGEXP, ARRAY)
                expect(cb.args[0][0]).to.be.deep.equal({
                    fnName: FN_NAME,
                    nth: 2
                })
            })
        })

        describe('optional arguments validation', function () {
            describe('when last item of rules is a number `n` and given the previous rule', function () {
                describe('the first `n` optional arguments passed, are verified with the last rule', function () {
                    it('callback is called once when arguments are valid', function () {
                        var RULES = [
                            ['Boolean'],
                            ['Boolean'],
                            1
                        ]
                        var foo = fnTestCreator(RULES, cb)
                        foo(PRIMITIVE_BOOLEAN)
                        expect(cb.calledOnce).to.be.equal(true)
                    })

                    it('callback is called once when some argument is invalid', function () {
                        var RULES = [
                            ['Number'],
                            [Error],
                            4
                        ]
                        var foo = fnTestCreator(RULES, cb)
                        foo(PRIMITIVE_NUMBER, GENERIC_ERROR, GENERIC_ERROR, GENERIC_ERROR, PRIMITIVE_NUMBER)
                        expect(cb.calledOnce).to.be.equal(true)
                    })
                })
            })
        })

        describe('passing callback/error handler in context', function () {
            it('', function () {
                var RULES = [['Number']]
                var foo = fnTestCreator.call({
                    fnName: FN_NAME,
                    handler: cb
                }, RULES)
                foo(OBJECT_STRING)
                expect(cb.args[0][0]).to.be.deep.equal({
                    fnName: FN_NAME,
                    nth: 0,
                    value: OBJECT_STRING,
                    actual: {
                        type: 'String'
                    },
                    expected: {
                        type: ['Number'],
                        instance: []
                    }
                })
            })
        })
    })
})
