const { TokenType } = require('./scanner');

const NodeType = {
    ATOM: 'ATOM',
    LIST: 'LIST',
    EXPR: 'EXPR'
};

const nodes = {
    atom: (token) => ({
        isInt: token.type === TokenType.INT,
        token: token,
        value: token.value,
        type: NodeType.ATOM
    }),

    list: (tokens) => ({
        tokens: tokens,
        type: NodeType.LIST
    })
};

let Parser = function() {
};

Parser.prototype.parse = function(tokenStream) {
    return integer(tokenStream[0]);
};

let integer = (token) => {
    if (token.type === TokenType.INT) {
        return nodes.atom(token);
    }
};

module.exports = { nodes, NodeType, Parser };
/*
expr := atom | ( expr . expr) | list
list := ( expr+ )
atom := INT | INDENTIFIER
*/



