const { Env, LispFunction } = require('./env');
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
        } else if (functionName === 'lambda') { 
            let params = ast.nodes[1]
                .nodes
                .map(node => node.value);
            let body = ast.nodes[2];
            return LispFunction(this, params, body, env);
        } else {
            if (ast.nodes[0].type === NodeType.ATOM) {
                let f = env.find(functionName);
                Interpreter.checkUndefined(f);
                if (f.invoke != null) {
                    let args = ast.nodes.slice(1);
                    return f.invoke(args);
                } else {
                    let args = ast.nodes.slice(1)
                        .map(arg => this.run(arg, env));
                    return f(args);
                }
            } else {
                let lambda = this.run(ast.nodes[0], env);
                let args = ast.nodes.slice(1);
                return lambda.invoke(args);
            }
        }
    }
};


module.exports = { Interpreter };