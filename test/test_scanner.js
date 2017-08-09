const assert = require('assert');
const { Scanner, tokens, TokenType, UnknownSourceCharacterError } = require('../src/scanner');

let runTest = (input, expectedTokenStream) => {
    return () => {
        let scannerInstance = new Scanner();
        let result = scannerInstance.tokenize(input);
        for(let i = 0; i < expectedTokenStream.length; i++) {
            assert.deepEqual(expectedTokenStream[i], result[i]);
        }
    };
};

let runFailure = (input) => {
    return () => {
        assert.throws(runTest(input, []), UnknownSourceCharacterError);
    };
}

describe('Simple numbers', () => {
    it('should tokenize standalone', runTest('1', [
        tokens.intToken(1)
    ]));

    it('should tokenize parenthized', runTest('(1)', [
        tokens.lbraceToken(),
        tokens.intToken(1),
        tokens.rbraceToken()
    ]));

    it('should tokenize list of ints', runTest('(1 2 3)', [
        tokens.lbraceToken(),
        tokens.intToken(1),
        tokens.intToken(2),
        tokens.intToken(3),
        tokens.rbraceToken()
    ]));

    it('should throw on non-int/identifier in list', runFailure('(1 @ 3)'));
});

describe('Identifiers', () => {
    it('should recognize alpha only', runTest('ab', [
        tokens.identifierToken('ab')
    ]));

    it('should recognize leading mixed case', runTest('Ab', [
        tokens.identifierToken('Ab')
    ]));

    it('should recognize non-leading mixed case', runTest('aB', [
        tokens.identifierToken('aB')
    ]));

    it('should accept leading underscore', runTest('_a', [
        tokens.identifierToken('_a')
    ]));

    it('should not accept leading hyphen', runFailure('-a'));

    it('should accept mixed underscore and hyphen', runTest('_a-b_c-d__ef', [
        tokens.identifierToken('_a-b_c-d__ef')
    ]));

    it('should not accept leading numbers', runFailure('0ab'));

    it('should accept non-leading numbers', runTest('ab0', [
        tokens.identifierToken('ab0')
    ]));
});

describe('Expressions', () => {
    let exprTest = (sym) => {
        return runTest(`(${sym} 1 2)`, [
            tokens.lbraceToken(),
            tokens.identifierToken(sym),
            tokens.intToken(1),
            tokens.intToken(2),
            tokens.rbraceToken()
        ]);
    };

    it('should do simple multiplication', exprTest('*'));
    it('should do simple addition', exprTest('+'));
    it('should do simple subtraction', exprTest('-'));
    it('should do simple division', exprTest('/'));

    it('should do nested computation', runTest('(* (app a b) (rhy a b c) 2)', [
        tokens.lbraceToken(),
        tokens.identifierToken('*'),
        tokens.lbraceToken(),
        tokens.identifierToken('app'),
        tokens.identifierToken('a'),
        tokens.identifierToken('b'),
        tokens.rbraceToken(),
        tokens.lbraceToken(),
        tokens.identifierToken('rhy'),
        tokens.identifierToken('a'),
        tokens.identifierToken('b'),
        tokens.identifierToken('c'),
        tokens.rbraceToken(),
        tokens.intToken(2),
        tokens.rbraceToken()
    ]));
});

describe('Messy Input', () => {
    it('should omit trailing and leading whitespace', runTest('     (* 1 2)\n\r', [
        tokens.lbraceToken(),
        tokens.identifierToken('*'),
        tokens.intToken(1),
        tokens.intToken(2),
        tokens.rbraceToken()
    ]));

});