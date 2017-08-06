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

let Scanner = function() {
};

Scanner.prototype.tokenize = function(source) {
    return [];
};


module.exports = {
    TokenType,
    tokens,
    Scanner
};