const { TokenType, tokens } = require('../src/scanner');
const { NodeType, nodes, Parser } = require('../src/parser');
const assert = require('assert');

let testAST = (tokenStream, expectedAST) => {
    let actualAST = (new Parser()).parse(tokenStream);
    assert.equal(JSON.stringify(actualAST),
        JSON.stringify(expectedAST));
};

let intTokens = [
    tokens.intToken(1),
    tokens.intToken(2),
    tokens.intToken(3),
];

let intNodes = intTokens
    .map(token => nodes.atom(token));

let identifierTokens = [
    tokens.identifierToken('_ab'),
    tokens.identifierToken('c-d'),
    tokens.identifierToken('e'),
];

let identifierNodes = identifierTokens
    .map(token => nodes.atom(token));

let lbrace = tokens.lbraceToken();
let rbrace = tokens.rbraceToken();


describe('Atoms', () => {
    it('should parse standalone integer', () => {
        let tokenStream = [ intTokens[0] ];
        let expectedAST = intNodes[0];
        testAST(tokenStream, expectedAST);
    });

    it('should parse identifier', () => {
        let tokenStream = [ identifierTokens[0] ];
        let expectedAST = identifierNodes[0];
        testAST(tokenStream, expectedAST);
    });
});


describe('Lists', () => {
    it('should parse empty list', () => {
        let tokenStream = [ lbrace, rbrace ];
        let expectedAST = nodes.list([]);
        testAST(tokenStream, expectedAST);
    });

    it('should parse list of numbers', () => {
        let tokenStream = [lbrace]
            .concat(intTokens)
            .concat([rbrace]);
        let expectedAST = nodes.list(intNodes);
        testAST(tokenStream, expectedAST);
    });

    it('should parse list of identifiers', () => {
        let tokenStream = [lbrace]
            .concat(identifierTokens)
            .concat([rbrace]);
        let expectedAST = nodes.list(identifierNodes);
        testAST(tokenStream, expectedAST);
    });

    it('should parse nested empty list', () => {
        let tokenStream = [
            lbrace,
                lbrace, rbrace,
            rbrace,
        ];
        let expectedAST = nodes.list([
            nodes.list([])
        ]);
        testAST(tokenStream, expectedAST);
    });

    it('should parse doubly nested empty list', () => {
        let tokenStream = [
            lbrace,
                lbrace,
                    lbrace, rbrace,
                rbrace,
            rbrace,
        ];
        let expectedAST = nodes.list([
            nodes.list([
                nodes.list([])
            ])
        ]);
        testAST(tokenStream, expectedAST);
    });

    it('should parse adjacent lists', () => {
        let tokenStream = [
            lbrace,
                lbrace, rbrace,
                lbrace, rbrace,
            rbrace
        ];
        let expectedAST = nodes.list([
            nodes.list([]),
            nodes.list([])
        ]);
        testAST(tokenStream, expectedAST);
    });

    it('should parse non-homogenous lists', () => {
        let tokenStream = [
            lbrace,
                intTokens[0],
                intTokens[1],
                lbrace,
                    identifierTokens[0],
                rbrace,
                intTokens[2],
                lbrace,
                    identifierTokens[2],
                    lbrace, 
                        intTokens[1],
                    rbrace,
                rbrace,
            rbrace
        ];
        let expectedAST = nodes.list([
            intNodes[0],
            intNodes[1],
            nodes.list([identifierNodes[0]]),
            intNodes[2],
            nodes.list([
                identifierNodes[2],
                nodes.list([
                    intNodes[1]
                ])
            ])
        ]);
        testAST(tokenStream, expectedAST);
    });
});