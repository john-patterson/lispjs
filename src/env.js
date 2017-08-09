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
    throw Error(`could not find symbol ${key}`);
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
            throw new Error(`Error, expected ${paramsLength} arguments, got ${argsLength}.`);
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