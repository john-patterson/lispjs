const { TokenType } = require('./scanner');

const NodeType = {
    ATOM: 'ATOM',
    LIST: 'LIST',
    EXPR: 'EXPR'
};

const nodes = {
    atom: (token) => ({
        isInt: token.type === TokenType.INT,
        isString: token.type === TokenType.STRING,
        token: token,
        value: token.value,
        type: NodeType.ATOM
    }),

    list: (nodes) => ({
        nodes,
        type: NodeType.LIST
    }),
};

let UnexpectedEOFError = function() {
    this.name = 'UnexpectedEOFError';
    this.message = 'Unexpected EOF while parsing.';
};

UnexpectedEOFError.prototype = Error.prototype;

let UnexpectedEndOfExpression = function() {
    this.name = 'UnexpectedEndOfExpression';
    this.message = "Unexpected ')' found.";
};

UnexpectedEndOfExpression.prototype = Error.prototype;

let Parser = function() {
    let self = this;

    let isAtomToken = (token) => {
        return token.type === TokenType.INT || token.type === TokenType.INDENTIFIER 
            || token.type === TokenType.STRING;
    };

    self.parse = (tokenStream) => {
        if (tokenStream.length == 0) {
            throw new UnexpectedEOFError();
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
                throw new UnexpectedEndOfExpression();
            } else {
                return nodes.atom(token);
            }
        };

        return innerParse();
    };

    return self;
};

module.exports = { nodes, NodeType, Parser };
