const { nodes } = require('../src/parser');
const { tokens } = require('../src/scanner');
const { Interpreter } = require('../src/interpreter');
const { Env } = require('../src/env');
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

    it('should compound expressions', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('+')),
            nodes.list([
                nodes.atom(tokens.identifierToken('-')),
                nodes.atom(tokens.intToken(6)),
                nodes.atom(tokens.identifierToken('cow-in-field'))
            ]),
            nodes.atom(tokens.intToken(10)),
            nodes.list([
                nodes.atom(tokens.identifierToken('*')),
                nodes.atom(tokens.intToken(2)),
                nodes.atom(tokens.intToken(10))
            ])
        ]);
        let env = Env.standard();
        env.update({
            'cow-in-field': 2
        });
        let result = (new Interpreter(env)).run(ast);
        assert.equal(result, 34);
    });

});