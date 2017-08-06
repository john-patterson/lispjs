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

            let item = tokenStream[positionInStream];
            if (item.type === TokenType.INT || item.type === TokenType.INDENTIFIER) {
                tokenCollection.push(nodes.atom(tokenStream[positionInStream]));
                positionInStream++;
            } else if (item.type === TokenType.LBRACE) {
                let newPos = positionInStream + 1;
                while (tokenStream[newPos].type !== TokenType.RBRACE)
                    newPos += 1;
                let node = this.parse(tokenStream.slice(positionInStream, newPos));
                tokenCollection.push(node);
                positionInStream++;
            }
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



