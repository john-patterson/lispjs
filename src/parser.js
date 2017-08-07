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

    list: (nodes) => ({
        nodes,
        type: NodeType.LIST
    }),
};

let Parser = function() {
};

let isAtomToken = (token) => {
    return token.type === TokenType.INT || token.type === TokenType.INDENTIFIER;
};

Parser.prototype.parse = function(tokenStream) {
    if (tokenStream.length == 0) {
        throw new Error('unexpected EOF while reading');
    }

    let tokenStack = tokenStream.slice(0);

    let innerParse = () => {
        let token = tokenStack.shift();
        if (token.type === TokenType.LBRACE) {
            let nodeCollection = [];
            while (tokenStack[0].type !== TokenType.RBRACE) {
                nodeCollection.push(innerParse());
            }
            tokenStack.shift();
            return nodes.list(nodeCollection);
        } else if (token.type === TokenType.RBRACE) {
            throw new Error("unexpected ')' found");
        } else {
            return nodes.atom(token);
        }
    };

    return innerParse();
};

module.exports = { nodes, NodeType, Parser };
/*
expr := atom | ( expr . expr) | list
list := ( expr+ )
atom := INT | INDENTIFIER
*/



