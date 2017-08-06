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

let isAtomToken = (token) => {
    return token.type === TokenType.INT || token.type === TokenType.INDENTIFIER;
};

Parser.prototype.parse = function(tokenStream) {
    let endOfStream = tokenStream.length;

    if (isAtomToken(tokenStream[0])) {
        return nodes.atom(tokenStream[0]);
    } else if (tokenStream[0].type === TokenType.LBRACE) {
        let nodeCollection = [];
        let positionInStream = 1;
        let sliceOutSublist = (currentPos) => {
            if (currentPos < endOfStream) {
                let openParensSeen = 0;
                let finalPos = currentPos;

                do {
                    let itemType = tokenStream[finalPos].type;
                    if (itemType === TokenType.LBRACE) {
                        openParensSeen += 1;
                    } else if (itemType === TokenType.RBRACE) {
                        openParensSeen -= 1;
                    }
                    finalPos += 1;
                } while (openParensSeen != 0);

                return tokenStream.slice(currentPos, finalPos + 1);
            }

            throw new Error('you messed up your program, dummy');
        };

        while (positionInStream < tokenStream.length 
            && tokenStream[positionInStream].type !== TokenType.RBRACE) {

            let item = tokenStream[positionInStream];
            let node = isAtomToken(item)
                ? nodes.atom(item)
                : this.parse(sliceOutSublist(positionInStream));
            nodeCollection.push(node);
            positionInStream += 1;
        }

        return nodes.list(nodeCollection);
    }
};

module.exports = { nodes, NodeType, Parser };
/*
expr := atom | ( expr . expr) | list
list := ( expr+ )
atom := INT | INDENTIFIER
*/



