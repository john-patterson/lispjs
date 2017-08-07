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
    let createBinding = (symbolName, body) => {
        let binding = {};
        if (body[0].type === NodeType.ATOM) {
            binding[symbolName] = body[0].isInt
                ? body[0].value
                : env.find(body[0].value);
            Interpreter.checkUndefined(binding[symbolName]);
        } else {
            binding[symbolName] = (args) => {
                return this.run(nodes.list(
                    [body].concat(args)
                ));
            };
        }
        return binding;
    };

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
            let binding = createBinding(symbolName, ast.nodes.slice(2));
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