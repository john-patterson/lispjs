const { Env } = require('./env');
const { Parser, NodeType } = require('./parser');
const { Scanner } = require('./scanner');

let Interpreter = function(env) {
    this.env = env;
};

Interpreter.prototype.run = function(ast) {
    if (ast.type === NodeType.ATOM) {
        if (ast.isInt) {
            return ast.value;
        } else {
            let lookup = this.env.find(ast.value);
            if (lookup == null) {
                throw new Error(`Symbol ${ast.value} not defined.`);
            }
            return lookup;
        }
    }
};


module.exports = { Interpreter };