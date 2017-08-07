const { nodes } = require('../src/parser');
const { tokens } = require('../src/scanner');
const { Interpreter } = require('../src/interpreter');
const assert = require('assert');

describe('Simple atom', () => {
    it('should return integers', () => {
        let integer = nodes.atom(tokens.intToken(3));
        let interpreter = new Interpreter();
        let result = interpreter.run(integer);
        assert.equal(result, 3);
    });

    it('should lookup symbols', () => {
        let symbol = nodes.atom(tokens.identifierToken('_cow'));
        let interpreter = new Interpreter({
            find: function(key) {
                if (key === '_cow')
                    return 3;
                return null;
            }
        });
        let result = interpreter.run(symbol);
        assert.equal(result, 3);
    });

    it('should apply functions', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('plus')),
            nodes.atom(tokens.intToken(1)),
            nodes.atom(tokens.intToken(2)),
        ]);
        let interpreter = new Interpreter({
            find: function(key) {
                if (key === 'plus')
                    return (args) => args[0] + args[1];
                return null;
            }
        });
        let result = interpreter.run(ast);
        assert.equal(result, 3);
    });

});