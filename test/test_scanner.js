const assert = require('assert');
const { Scanner, tokens, TokenType, 
    UnknownSourceCharacterError, UnexpectedEOFError } = require('../src/scanner');

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

    it('should accept trailing question mark', runTest('is-null?', [
        tokens.identifierToken('is-null?')
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

describe('Sub-scanning methods', () => {
    describe('skipWhitespace', () => {
        it('should return position after last whitespace', () => {
            let scanner = new Scanner();
            let input = '     t';
            let newPosition = scanner.skipWhitespace(input, 0).position;
            assert.equal(newPosition, input.length - 1);
        });

        it('should return starting pos if not whitespace', () => {
            let scanner = new Scanner();
            let input = 'bark t';
            let newPosition = scanner.skipWhitespace(input, 0).position;
            assert.equal(newPosition, 0);
        });

        it('should skip all kinds of mixed whitespace', () => {
            let scanner = new Scanner();
            let input = '   \t   \n    \n t';
            let newPosition = scanner.skipWhitespace(input, 0).position;
            assert.equal(newPosition, input.length - 1);
        });

    });

    describe('readString', () => {
        let readString = (input, expectedPosition, expectedValue) => {
            let scanner = new Scanner();
            let result = scanner.readString(input, 0);
            assert.equal(result.position, expectedPosition);
            assert.equal(result.value, expectedValue);
        };

        it('should read empty string', () => {
            let input = "''";
            readString(input, input.length, '');
        });

        it('should read non-empty string', () => {
            let input = "'lion king'";
            readString(input, input.length, 'lion king');
        });

        it('should read escaped character', () => {
            let input = "'lion\\'s den";
            readString(input, input.length, "lion's den");
        });

        it('should barf on non-string start', () => {
            let input = "nope 'over here'";
            assert.throws(() => readString(input), UnknownSourceCharacterError);
        });

        it('should barf on non-ended string', () => {
            let input = "'no resolution";
            assert.throws(() => readString(input), UnexpectedEOFError);
        });

        it('should parse strings with newlines', () => {
            let input = "'this is\na\n\tmultiline\nstring'";
            readString(input, input.length, 
                'this is\na\n\tmultiline\nstring');
        });

    });

    describe('readNumberOrIdentifier', () => {
         let readNorI = (input, expectedPosition, expectedValue) => {
            let scanner = new Scanner();
            let result = scanner.readNumberOrIdentifier(input, 0);
            assert.equal(result.position, expectedPosition);
            assert.equal(result.value, expectedValue);
            assert.equal(result.isNumber,
                    typeof result.value === 'number');
        };

       it('should parse integer', () => {
           let input = '234 test';
           readNorI(input, 3, 234);
        });

        it('should parse float', () => {
            let input = '0.234';
            readNorI(input, input.length, 0.234);
        });

        it('should parse trailing period float', () => {
            let input = '234.';
            readNorI(input, input.length, 234.0);
        });

        it('should parse leading period float', () => {
            let input = '.234';
            readNorI(input, input.length, 0.234);
        });

        it('should recognize plain text identifiers', () => {
            let input = 'foo test';
            readNorI(input, 3, 'foo');
        });

        it('should recognize identifiers with numbers', () => {
            let input = 'foo3 test';
            readNorI(input, 4, 'foo3');
        });

        it('should not let identifiers lead with number', () => {
            assert.throws(() => readNorI('0sdf',
                UnknownSourceCharacterError));
        });

        it('should not let two periods', () => {
            assert.throws(() => readNorI('test..thing',
                UnknownSourceCharacterError));
        });

        it('should allow one period in identifier', () => {
            let input = 'fo.o test';
            readNorI(input, 4, 'fo.o');
        });

        it('should disallow two periods in identifier', () => {
            let input = 'f.o.o test';
            assert.throws(() => readNorI(input),
                UnknownSourceCharacterError);
        });


    });
});

