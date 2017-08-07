const { Env } = require('./env');
const { Parser, NodeType, nodes } = require('./parser');
const { Scanner } = require('./scanner');

let Interpreter = function() {
};

Interpreter.checkUndefined = 
    (symbol) => { 
        if (symbol == null)
            throw new Error(`Symbol ${symbol} not defined.`); 
    };

Interpreter.prototype.run = function(ast, env) {
    if (ast.type === NodeType.ATOM) {
        if (ast.isInt) {
            return ast.value;
        } else {
            let lookup = env.find(ast.value);
            Interpreter.checkUndefined(lookup);
            return lookup;
        }
    } else if (ast.type === NodeType.LIST) {
        let functionName = ast.nodes[0].value; 
        if (functionName === 'define') {
            let symbolName = ast.nodes[1].value;
            let value = this.run(ast.nodes[2], env);
            let binding = {};
            binding[symbolName] = value;
            env.update(binding);
        } else {
            let f = env.find(functionName);
            Interpreter.checkUndefined(f);
            let args = ast.nodes
                .slice(1)
                .map(arg => this.run(arg, env));
            return f(args);
        }
    }
};


module.exports = { Interpreter };