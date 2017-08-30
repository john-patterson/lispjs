const { Scanner } = require('../src/scanner');
const { Parser } = require('../src/parser');
const { Interpreter } = require('../src/interpreter');
const { Env, ListEmptyError, ArityMismatchError } = require('../src/env');
const assert = require('assert');

let interpreter = new Interpreter();
let parser = new Parser();
let scanner = new Scanner();

let execute = (input, env) => {
    let interpreter = Interpreter();
    let parser = Parser();
    let scanner = new Scanner();
    let tokenStream = scanner.tokenize(input);
    let ast = parser.parse(tokenStream);
    return interpreter.run(ast, env);
};

describe('Invocation', () => {
    it('simple expression', () => {
        let env = Env.standard();
        let result = execute(`
            (* 1 2)
        `, env);
        assert.equal(result, 2);
    });

    it('returning string', () => {
        let env = Env.standard();
        let result = execute(`
            ((lambda () 'moo'))
        `, env);
        assert.equal(result, 'moo');
    });
});

describe('Lambdas', () => {
    it('can be defined and invoked', () => {
        let env = Env.standard();
        let lines = [
            '(define foo (lambda (a b) (* a b)))',
            '(foo 2 12)'
        ];
        execute(lines[0], env);
        let result = execute(lines[1], env);
        assert.equal(result, 24);
    });
});

describe('List manipulation', () => {
    describe('car', () => {
        it('should return first item of non-empty list', () => {
            let env = Env.standard();
            let lines = [
                '(car (1 2 3))'
            ];
            let result = execute(lines[0], env);
            assert.equal(result, 1);
        });

        it('should throw empty list error on empty list', () => {
            let env = Env.standard();
            let lines = [
                '(car ())'
            ];
            let thunk = () => execute(lines[0], env);
            assert.throws(thunk, ListEmptyError);
        });

        it('should throw arity error on no args', () => {
            let env = Env.standard();
            let lines = [
                '(car)'
            ];
            let thunk = () => execute(lines[0], env);
            assert.throws(thunk, ArityMismatchError);
        });

        it('should throw type error non-list', () => {
            let env = Env.standard();
            let lines = [
                '(car 1)'
            ];
            let thunk = () => execute(lines[0], env);
            assert.throws(thunk, 'TypeError');
        });
    });
});