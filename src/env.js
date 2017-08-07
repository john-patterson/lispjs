let Env = function() {
    this.data = {};
};

Env.prototype.update = function(mapping) {
    Object.keys(mapping)
        .forEach(key => {
            this.data[key] = mapping[key];
        });
};

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

module.exports = { Env };