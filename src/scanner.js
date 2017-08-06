const TokenType = {
    INT: 'INT',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE'
};

const tokens = {
    intToken: (value) => ({
        type: TokenType.INT,
        value: value
    }),

    lbraceToken: () => ({
        type: TokenType.LBRACE
    }),

    rbraceToken: () => ({
        type: TokenType.RBRACE
    })
};

let UnknownSourceCharacterError = function(message) {
    this.name = 'UnknownSourceCharacterError';
    this.message = message || '';
}

UnknownSourceCharacterError.prototype = Error.prototype;

let Scanner = function() {
};

Scanner.prototype.tokenize = function(source) {
    let spacedParens = source
        .replace('(', '( ')
        .replace(')', ' )')
        .split(' ');
    
    return spacedParens.map(item => {
        if (item === '(') {
            return tokens.lbraceToken();
        } else if (item === ')') {
            return tokens.rbraceToken();
        } else if (/^\d+$/.test(item)) {
            return tokens.intToken(parseInt(item));
        }

        throw new UnknownSourceCharacterError(`Found unknown item: ${item}`);
    });
};


module.exports = {
    TokenType,
    tokens,
    Scanner,
    UnknownSourceCharacterError
};