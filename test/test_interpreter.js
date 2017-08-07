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
    })

});