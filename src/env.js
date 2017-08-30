const { NodeType } = require('./parser');

let SymbolNotDefinedError = function (symbol) {
    this.name = 'SymbolNotDefinedError';
    this.message = `${this.name}: Symbol '${symbol}' is not defined.`;
};

SymbolNotDefinedError.prototype = Error.prototype;

let ArityMismatchError = function (expectedArity, gotArity) {
    this.name = 'ArityMismatchError';
    this.message = `Expected ${expectedArity} arguments, received ${gotArity}.`;
}
ArityMismatchError.prototype = Error.prototype;

let ListEmptyError = function (functionName) {
    this.name = 'ListEmptyError';
    this.message = `Attempted illegal operation '${functionName}' on empty list.`
};
ListEmptyError.prototype = Error.prototype;

let Env = function() {
    this.data = {};
};

Env.prototype.update = function(mapping) {
    Object.keys(mapping)
        .forEach(key => {
            this.data[key] = mapping[key];
        });
};

Env.prototype.extend = function(mapping) {
    let newEnv = Object.assign(this, {});
    newEnv.find = this.find;
    newEnv.update = this.update;
    newEnv.update(mapping);
    return newEnv;
}

Env.prototype.find = function(key) {
    if (key in this.data) {
        return this.data[key];
    }
    throw new SymbolNotDefinedError(key);
};

Env.standard = function() {
    let env = new Env();
    env.update({
        '+': (args) => args.reduce((prev, curr) => prev + curr),
        '-': (args) => args.reduce((prev, curr) => prev - curr),
        '*': (args) => args.reduce((prev, curr) => prev * curr),
        '/': (args) => args.reduce((prev, curr) => prev / curr),
        '<': (args) => args.reduce((prev, curr) => prev < curr),
        'car': { invoke: (args) => {
            if (args[0] == null) {
                throw new ArityMismatchError(1, 0);
            } else if (args[0].nodes == null || args[0].nodes.length < 1) {
                throw new ListEmptyError('car');
            } else if (args[0].type !== NodeType.LIST) {
                throw new TypeError("Expected list type to 'car', got atom.");
            }
            return args[0].nodes[0];
        } }
    });

    return env;
};

let NotEnoughArgumentsError = function(expected, got) {
    this.name = 'NotEnoughArgumentsError';
    this.message = `${this.name}: expected ${expected} arguments, got ${got}.`;
}

NotEnoughArgumentsError.prototype = Error.prototype;

let LispFunction = function(interpreter, params, body, env) {
    let _this = this;
    _this.params = params;
    _this.body = body;
    _this.env = env;
    _this.interpreter = interpreter;

    _this.invoke = (args) => {
        let argsLength = args.length;
        let paramsLength = _this.params.length;
        if (argsLength != paramsLength) {
            throw new NotEnoughArgumentsError(paramsLength, argsLength);
        }

        let paramsBindings = {};
        for(let i = 0; i < paramsLength; i++) {
            paramsBindings[_this.params[i]] = _this.interpreter.run(args[i], env);
        }

        let newEnv = _this.env.extend(paramsBindings);
        return _this.interpreter.run(_this.body, newEnv);
    };

    return _this;
};

module.exports = { Env, LispFunction, ListEmptyError, ArityMismatchError };