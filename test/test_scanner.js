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

    it('should throw on non-int in list', () => {
        assert.throws(runTest('(1 a 3)', []), UnknownSourceCharacterError);
    });

    it('should throw on mixed-int in list', () => {
        assert.throws(runTest('(1a 2 3)', []), UnknownSourceCharacterError);
    });
});