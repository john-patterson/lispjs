const { Env } = require('./env');
const { Parser, NodeType } = require('./parser');
const { Scanner } = require('./scanner');

let Interpreter = function(env) {
    this.env = env;
};

Interpreter.checkUndefined = 
    (symbol) => { 
        if (symbol == null)
            throw new Error(`Symbol ${symbol} not defined.`); 
    };

Interpreter.prototype.run = function(ast) {
    if (ast.type === NodeType.ATOM) {
        if (ast.isInt) {
            return ast.value;
        } else {
            let lookup = this.env.find(ast.value);
            Interpreter.checkUndefined(lookup);
            return lookup;
        }
    } else if (ast.type === NodeType.LIST) {
        let f = this.env.find(ast.nodes[0].value);
        Interpreter.checkUndefined(f);
        let args = ast.nodes
            .slice(1)
            .map(arg => this.run(arg));
        return f(args);
    }
};


module.exports = { Interpreter };