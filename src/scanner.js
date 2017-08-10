const TokenType = {
    INT: 'INT',
    STRING: 'STRING',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE',
    INDENTIFIER: 'IDENTIFIER'
};

const tokens = {
    intToken: (value) => ({
        type: TokenType.INT,
        value: value
    }),

    stringToken: (value) => ({
        type: TokenType.STRING,
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

let UnexpectedEOFError = function() {
    this.name = 'UnexpectedEOFError';
    this.message = 'Unexpected EOF.';
}

UnexpectedEOFError.prototype = Error.prototype;

let Scanner = function() {
};


let isSpace = (ch) => ch === ' ' || ch === '\t'
    || ch === '\n' || ch === '\r';

Scanner.prototype.skipWhitespace = (source, initialPosition) => {
    let newPos = initialPosition;

    while (newPos < source.length && isSpace(source[newPos])) {
        newPos += 1;
    }

    return { position: newPos };
};

Scanner.prototype.readString = (source, initialPosition) => {
    if (source[initialPosition] !== "'") {
        throw new UnknownSourceCharacterError(
            `expected ' got ${source[initialPosition]} trying to parse string`);
    }

    let newPos = initialPosition + 1;
    while (newPos < source.length 
            && (source[newPos] != "'" || source[newPos - 1] == '\\')) {
        newPos += 1;
    }
    return {
        position: newPos < source.length ? newPos + 1 : newPos,
        value: source.slice(initialPosition + 1, newPos)
            .replace(/\\'/g, "'")
    };
};

Scanner.prototype.readNumberOrIdentifier = (source, initialPosition) => {
    let seenNonDigitAndNonPeriod = false;
    let seenPeriod = false;
    let newPos = initialPosition;
    let firstCharacterIsNumber = '0' <= source[initialPosition]
        && source[initialPosition] <= '9';
    let firstCharacterIsHyphen = source[initialPosition] === '-';

    while (newPos < source.length && !isSpace(source[newPos]) && source[newPos] !== ')') {
        let ch = source[newPos];
        if (ch === '.') {
            if (seenPeriod) {
                throw new UnknownSourceCharacterError("unexpected '.' at position " + newPos);
            }
            seenPeriod = true;
        } else if ((ch < '0' || '9' < ch) && ch !== '-') {
            seenNonDigitAndNonPeriod = true;
        }

        if ((ch < 'a' || 'z' < ch)
                && (ch < 'A' || 'Z' < ch)
                && (ch < '0' || '9' < ch)
                && (newPos != source.length - 1 || ch !== '?')
                && (newPos != 0 || ch !== '_')
                && (ch !== '-')
                && (ch !== '.')) {
            throw new UnknownSourceCharacterError(`unexpected '${ch}' at position ${newPos}`);
        }
        newPos += 1;
    }

    let raw = source.slice(initialPosition, newPos);
    let value = seenNonDigitAndNonPeriod
        ? raw
        : (seenPeriod ? parseFloat : parseInt)(raw);

    if ((firstCharacterIsNumber && seenNonDigitAndNonPeriod)
            || (seenNonDigitAndNonPeriod && seenPeriod))
        throw new UnknownSourceCharacterError(
            `unexpected '${source[initialPosition]}' at position ${initialPosition}`);

    if (seenNonDigitAndNonPeriod && firstCharacterIsHyphen)
        throw new UnknownSourceCharacterError(
            `unexpected '${source[initialPosition]}' at position ${initialPosition}`);

    return {
        isNumber: !seenNonDigitAndNonPeriod,
        raw,
        value,
        position: newPos
    };
};

let specialCharacters = new Set([
    '*', '+', '/', '-',
    '<', '>'
]);

Scanner.prototype.tokenize = function(source) {
    let position = 0;
    let tokenStream = [];
    while (position < source.length) {
        position = this.skipWhitespace(source, position).position;
        let ch = source[position];
        if (ch === '(') {
            tokenStream.push(tokens.lbraceToken());
            position += 1;
        } else if (ch === ')') {
            tokenStream.push(tokens.rbraceToken());
            position += 1;
        } else if (ch === "'") {
            let result = this.readString(source, position);
            position = result.position;
            tokenStream.push(tokens.stringToken(result.value));
        } else if (specialCharacters.has(ch) && isSpace(source[position + 1])) {
            tokenStream.push(tokens.identifierToken(ch));
            position += 1;
        } else {
            let result = this.readNumberOrIdentifier(source, position);
            position = result.position;
            if (result.isNumber) {
                tokenStream.push(tokens.intToken(result.value));
            } else {
                tokenStream.push(tokens.identifierToken(result.value));
            }
        }
    }

    return tokenStream;


    /*
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
        } else if (item === "'") { 
            let result = readString(source, )

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
    */
};


module.exports = {
    TokenType,
    tokens,
    Scanner,
    UnknownSourceCharacterError
};