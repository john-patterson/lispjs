const { TokenType, tokens } = require('../src/scanner');
const { NodeType, nodes, Parser } = require('../src/parser');
const assert = require('assert');

describe('Atoms', () => {
    it('should parse standalone integer', () => {
        let tokenStream = [ tokens.intToken(1) ];
        let parser = new Parser();
        let ast = parser.parse(tokenStream);

        assert.equal(ast.type, NodeType.ATOM);
        assert.equal(ast.isInt, true);
        assert.equal(ast.value, 1)
        assert.deepEqual(ast.token, tokenStream[0]);
    });

    it('should parse identifier', () => {
        let tokenStream = [ tokens.identifierToken('_ab') ];
        let parser = new Parser();
        let ast = parser.parse(tokenStream);

        assert.equal(ast.type, NodeType.ATOM);
        assert.equal(ast.isInt, false);
        assert.equal(ast.value, '_ab')
        assert.deepEqual(ast.token, tokenStream[0]);
    });
});


describe('Lists', () => {
    it('should parse empty list', () => {
        let tokenStream = [ 
            tokens.lbraceToken(),
            tokens.rbraceToken()
        ];
        let parser = new Parser();
        let ast = parser.parse(tokenStream);

        assert.equal(ast.type, NodeType.LIST);
        assert.deepEqual(ast.nodes, []);
    });

    it('should parse list of numbers', () => {
        let tokenStream = [ 
            tokens.lbraceToken(),
            tokens.intToken(1),
            tokens.intToken(2),
            tokens.intToken(3),
            tokens.rbraceToken()
        ];
        let parser = new Parser();
        let ast = parser.parse(tokenStream);

        assert.equal(ast.type, NodeType.LIST);
        assert.deepEqual(ast.nodes, [
            nodes.atom(tokenStream[1]),
            nodes.atom(tokenStream[2]),
            nodes.atom(tokenStream[3]),
        ]);
    });

    it('should parse list of identifiers', () => {
        let tokenStream = [ 
            tokens.lbraceToken(),
            tokens.identifierToken('_ab'),
            tokens.identifierToken('c-d'),
            tokens.identifierToken('e'),
            tokens.rbraceToken()
        ];
        let parser = new Parser();
        let ast = parser.parse(tokenStream);

        assert.equal(ast.type, NodeType.LIST);
        assert.deepEqual(ast.nodes, [
            nodes.atom(tokenStream[1]),
            nodes.atom(tokenStream[2]),
            nodes.atom(tokenStream[3]),
        ]);
    });

    it('should parse nested empty list', () => {
        let tokenStream = [ 
            tokens.lbraceToken(),
            tokens.lbraceToken(),
            tokens.rbraceToken(),
            tokens.rbraceToken()
        ];

        let parser = new Parser();
        let ast = parser.parse(tokenStream);

        assert.equal(ast.type, NodeType.LIST);
        assert.equal(ast.nodes[0].type, NodeType.LIST);
    });

    it('should parse doubly nested empty list', () => {
        let tokenStream = [ 
            tokens.lbraceToken(),
            tokens.lbraceToken(),
            tokens.lbraceToken(),
            tokens.rbraceToken(),
            tokens.rbraceToken(),
            tokens.rbraceToken()
        ];

        let parser = new Parser();
        let ast = parser.parse(tokenStream);

        assert.equal(ast.type, NodeType.LIST);
        assert.equal(ast.nodes[0].type, NodeType.LIST);
        assert.equal(ast.nodes[0].nodes[0].type, NodeType.LIST);
        assert.deepEqual(ast.nodes[0].nodes[0].nodes, []);
    });
});