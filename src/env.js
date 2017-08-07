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
    let newEnv = Object.assign(this, mapping);
    newEnv.find = this.find;
    return newEnv;
}

Env.prototype.find = function(key) {
    if (key in this.data) {
        return this.data[key];
    }
    return null;
};

Env.standard = function() {
    let env = new Env();
    env.update({
        '+': (args) => args.reduce((prev, curr) => prev + curr),
        '-': (args) => args.reduce((prev, curr) => prev - curr),
        '*': (args) => args.reduce((prev, curr) => prev * curr),
        '/': (args) => args.reduce((prev, curr) => prev / curr)
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
        console.log(`Args: '${JSON.stringify(args)}'`);
        console.log(`Params: '${JSON.stringify(_this.params)}'`);
        let argsLength = args.length;
        let paramsLength = _this.params.length;
        if (argsLength != paramsLength) {
            throw new Error(`Error, expected ${paramsLength} arguments, got ${argsLength}.`);
        }

        let paramsBindings = {};
        for(let i = 0; i < paramsLength; i++) {
            paramsBindings[_this.params[i]] = args[i];
        }

        let newEnv = _this.env.extend(paramsBindings);
        console.log(`BINDINGS:\n=======\n${JSON.stringify(newEnv)}`);
        return _this.interpreter.run(_this.body, newEnv);
    };

    return _this;
};

module.exports = { Env, LispFunction };