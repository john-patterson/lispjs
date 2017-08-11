const { nodes } = require('../src/parser');
const { tokens } = require('../src/scanner');
const { Interpreter } = require('../src/interpreter');
const { Env } = require('../src/env');
const assert = require('assert');

describe('Simple atom', () => {
    it('should return integers', () => {
        let integer = nodes.atom(tokens.intToken(3));
        let interpreter = Interpreter();
        let result = interpreter.run(integer, {});
        assert.equal(result, 3);
    });

    it('should return strings', () => {
        let string = nodes.atom(tokens.stringToken('moo'));
        let interpreter = Interpreter();
        let result = interpreter.run(string, {});
        assert.equal(result, 'moo');
    });

    it('should lookup symbols', () => {
        let symbol = nodes.atom(tokens.identifierToken('_cow'));
        let interpreter = Interpreter();
        let result = interpreter.run(symbol, {
            find: function(key) {
                if (key === '_cow')
                    return 3;
                return null;
            }
        });
        assert.equal(result, 3);
    });

    it('should apply functions', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('plus')),
            nodes.atom(tokens.intToken(1)),
            nodes.atom(tokens.intToken(2)),
        ]);
        let interpreter = Interpreter();
        let result = interpreter.run(ast, {
            find: function(key) {
                if (key === 'plus')
                    return (args) => args[0] + args[1];
                return null;
            }
        });
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
        let result = Interpreter().run(ast, env);
        assert.equal(result, 34);
    });

});

describe('Define', () => {
    it('should define new var for atom binding', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('define')),
            nodes.atom(tokens.identifierToken('foo')),
            nodes.atom(tokens.intToken(2))
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        interpreter.run(ast, env);
        assert.equal(env.find('foo'), 2);
    });

    it('should lookup var at bind time', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('define')),
            nodes.atom(tokens.identifierToken('foo')),
            nodes.atom(tokens.identifierToken('moo'))
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        env.update({'moo': 10});
        interpreter.run(ast, env);
        env.update({'moo': 15});
        assert.equal(env.find('foo'), 10);
    });

    it('should throw failed lookup', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('define')),
            nodes.atom(tokens.identifierToken('foo')),
            nodes.atom(tokens.identifierToken('moo'))
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        assert.throws(() => interpreter.run(ast, env));
    });
});

describe('Lambda', () => {
    it('should invoke two arg function', () => {
        let ast = nodes.list([
            nodes.list([
                nodes.atom(tokens.identifierToken('lambda')),
                nodes.list([
                    nodes.atom(tokens.identifierToken('a')),
                    nodes.atom(tokens.identifierToken('b')),
                ]),
                nodes.list([
                    nodes.atom(tokens.identifierToken('+')),
                    nodes.atom(tokens.identifierToken('a')),
                    nodes.atom(tokens.identifierToken('b'))
                ])
            ]),
            nodes.atom(tokens.intToken(10)),
            nodes.atom(tokens.intToken(25))
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        let result = interpreter.run(ast, env);
        assert.equal(result, 35);
    });

    it('should invoke one arg function', () => {
        let ast = nodes.list([
            nodes.list([
                nodes.atom(tokens.identifierToken('lambda')),
                nodes.list([
                    nodes.atom(tokens.identifierToken('a')),
                ]),
                nodes.list([
                    nodes.atom(tokens.identifierToken('+')),
                    nodes.atom(tokens.identifierToken('a')),
                    nodes.atom(tokens.intToken(2))
                ])
            ]),
            nodes.atom(tokens.intToken(10)),
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        let result = interpreter.run(ast, env);
        assert.equal(result, 12);
    });

    it('should invoke no arg function', () => {
        let ast = nodes.list([
            nodes.list([
                nodes.atom(tokens.identifierToken('lambda')),
                nodes.list([
                ]),
                nodes.list([
                    nodes.atom(tokens.identifierToken('+')),
                    nodes.atom(tokens.intToken(1)),
                    nodes.atom(tokens.intToken(2))
                ])
            ]),
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        let result = interpreter.run(ast, env);
        assert.equal(result, 3);
    });
});

describe('Conditionals', () => {
    let trueConditional = nodes.list([ 
        nodes.atom(tokens.identifierToken('<')),
        nodes.atom(tokens.intToken(1)),
        nodes.atom(tokens.intToken(2)),
    ]);
    let falseConditional = nodes.list([ 
        nodes.atom(tokens.identifierToken('<')),
        nodes.atom(tokens.intToken(2)),
        nodes.atom(tokens.intToken(1)),
    ]);

    it('should return the first expression if true', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('if')),
            trueConditional,
            nodes.atom(tokens.intToken(1)),
            nodes.atom(tokens.intToken(2))
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        let result = interpreter.run(ast, env);
        assert.equal(result, 1);
    });

    it('should return the second expression if false', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('if')),
            falseConditional,
            nodes.atom(tokens.intToken(1)),
            nodes.atom(tokens.intToken(2))
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        let result = interpreter.run(ast, env);
        assert.equal(result, 2);
    });

    it('should return undefined if false and no second expr', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('if')),
            falseConditional,
            nodes.atom(tokens.intToken(1)),
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        let result = interpreter.run(ast, env);
        assert.equal(result, undefined);
    });

    it('should not evaluate second if true', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('if')),
            trueConditional,
            nodes.list([
                nodes.atom(tokens.identifierToken('define')),
                nodes.atom(tokens.identifierToken('a')),
                nodes.atom(tokens.intToken(1))
            ]),
            nodes.list([
                nodes.atom(tokens.identifierToken('define')),
                nodes.atom(tokens.identifierToken('b')),
                nodes.atom(tokens.intToken(1))
            ]),
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        interpreter.run(ast, env);
        assert.equal(env.find('a'), 1);
        assert.throws(() => env.find('b'));
    });

    it('should not evaluate first if false', () => {
        let ast = nodes.list([
            nodes.atom(tokens.identifierToken('if')),
            falseConditional,
            nodes.list([
                nodes.atom(tokens.identifierToken('define')),
                nodes.atom(tokens.identifierToken('a')),
                nodes.atom(tokens.intToken(1))
            ]),
            nodes.list([
                nodes.atom(tokens.identifierToken('define')),
                nodes.atom(tokens.identifierToken('b')),
                nodes.atom(tokens.intToken(1))
            ]),
        ]);
        let env = Env.standard();
        let interpreter = Interpreter();
        interpreter.run(ast, env);
        assert.equal(env.find('b'), 1);
        assert.throws(() => env.find('a'));
    });
});