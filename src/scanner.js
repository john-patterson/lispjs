const TokenType = {
    INT: 'INT',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE',
    INDENTIFIER: 'IDENTIFIER'
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
    }),

    identifierToken: (raw) => ({
        type: TokenType.INDENTIFIER,
        value: raw
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
        .trim()
        .replace(/\(/g, '( ')
        .replace(/\)/g, ' )')
        .split(' ');
    
    return spacedParens.map(item => {
        const numberRegex = /^\d+$/;
        const identifierRegex = /^[a-zA-Z\_][a-zA-Z\_\-0-9]*\??$/; 

        if (item === '(') {
            return tokens.lbraceToken();
        } else if (item === ')') {
            return tokens.rbraceToken();
        } else if (numberRegex.test(item)) {
            return tokens.intToken(parseInt(item));
        } else if (identifierRegex.test(item)) {
            return tokens.identifierToken(item);
        } else if (item === '*' || item === '+' 
                || item === '-' || item === '/') {
            return tokens.identifierToken(item);
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