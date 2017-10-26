const { Env, LispFunction } = require('./env');
const { Parser, NodeType, nodes } = require('./parser');
const { Scanner } = require('./scanner');

let Interpreter = function() {
    let self = this;


    self.runDefine = (ast, env) => {
        let symbolName = ast.nodes[1].value;
        let value = self.run(ast.nodes[2], env);
        let binding = {};
        binding[symbolName] = value;
        env.update(binding);
    };

    self.defineLambda = (ast, env) => {
        let params = ast.nodes[1]
            .nodes
            .map(node => node.value);
        let body = ast.nodes[2];
        return LispFunction(self, params, body, env);
    };

    self.runConditional = (ast, env) => {
        let conditionCheckNode = ast.nodes[1];
        let truePartNode = ast.nodes[2];
        let falsePartNode = 3 < ast.nodes.length ? ast.nodes[3] : null;

        let isTrue = self.run(conditionCheckNode, env);
        if (isTrue) {
            return self.run(truePartNode, env);
        } else {
            return falsePartNode != null
                ? self.run(falsePartNode, env)
                : undefined;
        }
    };

    self.invokeFunctionOrLambda = (f, args, env) => {
        if (f.invoke != null) {
            return f.invoke(args);
        } else {
            let newArgs = args
                .map(arg => self.run(arg, env));
            return f(newArgs);
        }
    }

    self.runFunction = (ast, env) => {
        let functionName = ast.nodes[0].value;
        let f = env.find(functionName);
        let args = ast.nodes.slice(1);
        return self.invokeFunctionOrLambda(f, args, env);
    };

    self.runAtom = (ast, env) => {
        return ast.isInt
            ? ast.value
            : env.find(ast.value);
    };

    self.runList = (ast, env) => {
        let functionName = ast.nodes[0].value; 
        let functionType = ast.nodes[0].type;

        if (functionName === 'define') {
            self.runDefine(ast, env);
        } else if (functionName === 'lambda') { 
            return self.defineLambda(ast, env);
        } else if (functionName === 'if') {
            return self.runConditional(ast, env);
        } else if (functionType === NodeType.ATOM) {
            return self.runFunction(ast, env);
        } else if (functionType === NodeType.LIST) {
            let firstExpr = self.run(ast.nodes[0], env);
            let args = ast.nodes.slice(1);
            return self.invokeFunctionOrLambda(firstExpr, args, env);
        }
    };

    self.run = (ast, env) => {
        if (ast.type === NodeType.ATOM) {
            return self.runAtom(ast, env);
        } else if (ast.type === NodeType.LIST) {
            return self.runList(ast, env);
        }
    };

    return self;
};

module.exports = { Interpreter };