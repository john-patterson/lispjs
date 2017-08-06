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

});