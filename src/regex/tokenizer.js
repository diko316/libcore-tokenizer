'use strict';

var HEX_RE = /^[a-fA-F0-9]{2}$/,
    UTF8_RE = /^[a-fA-F0-9]{4}$/,
    RANGE_RE = /^([0-9]+|[0-9]+\,[0-9]*|[0-9]*\,[0-9]+)$/;

function escape(c, regexString) {
    var chr = regexString.substring(++c, 2),
        len = c + 1;
    var match, l;
    
    switch (chr) {
    case "x":
        l = c + 2;
        match = regexString.substring(++c, l + 1).match(HEX_RE);
        
        return match ?
                    
                    [String.
                        fromCharCode(parseInt(match[0],
                                                  16)),
                     l] :
                    
                    ["x",
                     len];
    case "u":
        l = c + 4;
        match = regexString.substring(++c, l + 1).match(UTF8_RE);
        
        return match ?
                    
                    [String.
                        fromCharCode(parseInt(match[0],
                                                  16)),
                     l] :
                    
                    ["x",
                     len];
    default:
        return [chr, len];
    }
}

function range(index, regexString) {
    var c = index,
        l = regexString.length;
    var chr;
    
    for (; l--;) {
        chr = regexString.charAt(++c);
        if (chr === '}') {
            chr = regexString.substring(index + 1, c);
            if (RANGE_RE.test(chr)) {
                return [chr, c];
            }
        }
    }
    
    return null;
    
}


function tokenize(index, regexString) {
    var M = Math,
        len = regexString.length;
    var chr, next, token;
    
    index = M.max(0, index);
    
    if (index > len) {
        return null;
    }
    else if (index === len) {
        return ['$$', null, len + 1];
    }
    
    next = index + 1;
    chr = regexString.charAt(index);
    token =  'char';
    
    switch (chr) {
    case "\\":
        chr = escape(index, regexString);
        next = chr[1] + 1;
        chr = chr[0];
        token = 'char';
        break;
    
    case "{":
        chr = range(index, regexString);
        if (chr) {
            next = chr[1] + 1;
            chr = chr[0];
            token = 'range';
        }
        else {
            throw new Error("Invalid token near " +
                        regexString.substring(index,
                                              M.min(len, index + 10)));
        }
        break;
    
    case "[":
    case "]":
    case "(":
    case ")":
    case "|":
    case "?":
    case "+":
    case "*":
    case "-":
    case "^":
    case "$":
        token = chr;
        break;
    }
    
    return token ?
                [token, chr, next] : null;
}


module.exports = tokenize;