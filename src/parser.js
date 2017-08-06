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
    if (tokenStream[0].type === TokenType.INT
        || tokenStream[0].type === TokenType.INDENTIFIER) {

        return nodes.atom(tokenStream[0]);
    } else if (tokenStream[0].type === TokenType.LBRACE) {
        let tokenCollection = [];
        let positionInStream = 1;
        while (positionInStream < tokenStream.length 
            && tokenStream[positionInStream].type !== TokenType.RBRACE) {

            tokenCollection.push(tokenStream[positionInStream]);
            positionInStream++;
        }

        return nodes.list(tokenCollection);
    }
};

module.exports = { nodes, NodeType, Parser };
/*
expr := atom | ( expr . expr) | list
list := ( expr+ )
atom := INT | INDENTIFIER
*/



