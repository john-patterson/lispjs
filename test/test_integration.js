const { Scanner } = require('../src/scanner');
const { Parser } = require('../src/parser');
const { Interpreter } = require('../src/interpreter');
const { Env } = require('../src/env');
const assert = require('assert');

/*
process.stdin.resume();
process.stdin.setEncoding('utf-8');
let util = require('util');


let isDebug = false;
let debug = (message) => {
    if (isDebug) {
        console.log(message);
    }
}

process.stdin.on('data', (text) => {
});
*/

let interpreter = new Interpreter();
let parser = new Parser();
let scanner = new Scanner();

let execute = (input, env) => {
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