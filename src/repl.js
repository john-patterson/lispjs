const { Scanner } = require('../src/scanner');
const { Parser } = require('../src/parser');
const { Interpreter } = require('../src/interpreter');
const { Env } = require('../src/env');


process.stdin.resume();
process.stdin.setEncoding('utf-8');
let util = require('util');

let interpreter = Interpreter();
let parser = new Parser();
let scanner = new Scanner();
let env = Env.standard();

let isDebug = false;
let debug = (message) => {
    if (isDebug) {
        console.log(message);
    }
}

process.stdin.on('data', (text) => {
    debug(`Tokenizing input: ${text}`);
    let tokenStream = scanner.tokenize(text);
    debug(`Parsing tokenStream: ${JSON.stringify(tokenStream)}`);
    let ast = parser.parse(tokenStream);
    debug(`Running AST: ${JSON.stringify(ast)}`);
    let result = interpreter.run(ast, env);
    console.log(`=> ${result}`);
});