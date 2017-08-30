const { Scanner, tokens } = require('../src/scanner');
const { Parser, nodes } = require('../src/parser');
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

        it('should throw arity error on 2+ args', () => {
            let env = Env.standard();
            let lines = [
                '(car (1 2) (2 3))'
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

    const testCdrError = (input, error) => {
        return () => {
            let env = Env.standard();
            let thunk = () => execute(input, env);
            assert.throws(thunk, error);
        };
    };

    const testCdrValid = (input, expected) => {
        return () => {
            let env = Env.standard();
            let result = execute(input, env);
            assert.equal(JSON.stringify(result), JSON.stringify(expected));
        };
    };

    describe('cdr', () => {
        it('should return tail', testCdrValid('(cdr (1 2 3))',
            nodes.list([
                nodes.atom(tokens.intToken(2)),
                nodes.atom(tokens.intToken(3))
            ])));

        it('should return empty tail given singleton', () => {});
        it('should throw list empty error given empty', () => {});
        it('should throw type error given non-list', () => {});
        it('should throw arity error given no args', () => {});
        it('should throw arity error given 2+ args', () => {});
    });
});