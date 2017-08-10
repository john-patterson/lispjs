let SymbolNotDefinedError = function (symbol) {
    this.name = 'SymbolNotDefinedError';
    this.message = `${this.name}: Symbol '${symbol}' is not defined.`;
};

SymbolNotDefinedError.prototype = Error.prototype;

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

module.exports = { Env, LispFunction };