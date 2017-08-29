'use strict';

/**
 * SEQUENCE         -> UNIT
 *                  -> REPEATED
 *                  -> SEQUENCE UNIT
 *                  -> SEQUENCE REPEATED
 *
 * REPEATED         -> UNIT '+'
 *                  -> UNIT '?'
 *                  -> UNIT '*'
 *
 * UNIT             -> 'char'
 *                  -> CLASS
 *                  -> '(' SEQUENCE ')'
 *
 * CLASS            -> '[' CLASS_CHAR ']'
 *
 * CLASS_CHAR       -> CLASS_CHAR CLASS_RANGE
 *                  -> CLASS_RANGE
 *
 * CLASS_RANGE      -> 'char' '-' 'char'
 *                  -> 'char'
 */

import TOKENIZE from "./tokenizer.js";
        
var ENCLOSED_START = 2,
    ENCLOSED_END = 3,
    BINARY = 4,
    POSTFIX = 5,
    FINAL = 6,
    OPERATOR = {
        "[": [ENCLOSED_START, 15, "]"],
        "[^": [ENCLOSED_START, 15, "]^"],
        "]": [ENCLOSED_END, 1, "[]"],
        "]^": [ENCLOSED_END, 1, "[^]"],
        "(": [ENCLOSED_START, 15, ")"],
        ")": [ENCLOSED_END, 1, "()"],
        "?": [POSTFIX, 10],
        "+": [POSTFIX, 10],
        "*": [POSTFIX, 10],
        "range": [POSTFIX, 10],
        "-": [BINARY, 7],
        "^-": [BINARY, 7],
        "^,": [BINARY, 5],
        ",": [BINARY, 5],
        ".": [BINARY, 5],
        "|": [BINARY, 3],
        "$$": [FINAL, 1]
    },
    ENCLOSED_CLASS_REPLACE = {
        "[": 'char',
        "[^": 'char',
        "?": 'char',
        "+": 'char',
        "*": 'char',
        ",": 'char',
        "|": 'char',
        "(": 'char',
        ")": 'char'
    },
    ENCLOSED_REPLACE = {
        "[": ENCLOSED_CLASS_REPLACE,
        "[^": ENCLOSED_CLASS_REPLACE,
        "(": {
            "-": 'char'
        }
    };

export
    function parse(str) {
        var operator = OPERATOR,
            tokenize = TOKENIZE,
            enclosed_start = ENCLOSED_START,
            enclosed_end = ENCLOSED_END,
            binary = BINARY,
            postfix = POSTFIX,
            end = FINAL,
            index = 0,
            start = 0,
            stack = null,
            queue = [],
            ql = 0,
            lastToken = null,
            enclosure = [null, '('],
            enclosedReplacements = ENCLOSED_REPLACE,
            buffer = [],
            bl = 0,
            bc = 0;
            
        var token, chr, item, l, op, stackOp, fill, precedence, opName, from,
            currentEnclosure, replacements;
        
            
        for (item = tokenize(index, str); item; item = tokenize(index, str))  {
            index = item[2];
            chr = item[1];
            token = item[0];
            fill = false;
            currentEnclosure = enclosure && enclosure[1];
            
            // replace token based on replacement by enclosure
            if (currentEnclosure) {
                replacements = enclosedReplacements[currentEnclosure];
                if (token in replacements) {
                    token = replacements[token];
                    
                }
            }
            
            // finalize and fill-in concat operator
            if (token in operator) {
                switch (token) {
                case '(':
                case '[':
                case '[^':
                    fill = !!lastToken;
                }
            }
            else {
                switch (lastToken) {
                case 'char':
                case ']':
                case ']^':
                case ')':
                case '+':
                case '?':
                case '*':
                case 'range':
                    fill = true;
                }
            }
            
            if (fill) {
                buffer[bl++] = [currentEnclosure === '[' ?
                                    ',' :
                                    currentEnclosure === '[^' ?
                                        '^,' :
                                        '.',
                                null,
                                2,
                                start,
                                0];
            }
            if (currentEnclosure === '[^') {
                switch (token) {
                case '-':
                    token = '^-';
                    break;
                
                case ']':
                    token = ']^';
                    break;
                
                case 'char':
                    token = 'negative_char';
                }
            }
            
            buffer[bl++] = [token, chr, 0, start, index - start];
            start = index;
            lastToken = token;
            
            // parse buffer
            l = bl - bc;
            for (; l--; bc++) {
                item = buffer[bc];
                token = item[0];
                chr = item[1];
                
                if (token in operator) {
                    op = operator[token];
                    opName = op[0];
                    precedence = op[1];
                    
                    switch (opName) {
                    case end:
                    case postfix:
                    case binary:
                        
                        item[2] = opName === binary ? 2 : 1;
                        
                        binaryCompare: for (; stack; stack = stack[0]) {
                            stackOp = stack[1];
                            switch (stackOp[0]) {
                            case postfix:
                            case binary:
                                if (precedence <= stackOp[1]) {
                                    queue[ql++] = stack[2];
                                    continue binaryCompare;
                                }
                            
                            }
                            break;
                        }
                        
                        if (opName !== end) {
                            stack = [stack, op, item];
                        }
                        else {
                            queue[ql++] = item;
                        }
                        break;
                        
                    case enclosed_start:
                        stack = [stack, op, item];
                        enclosure = [enclosure, token];
                        break;
                    
                    case enclosed_end:
                        
                        for (; stack; stack = stack[0]) {
                            stackOp = stack[1];
                            
                            if (stackOp[0] === enclosed_start) {
                                if (stackOp[2] !== token) {
                                    throw new Error("Unmatched token found " + chr);
                                }
                                from = stack[2][3];
                                queue[ql++] = [op[2],
                                               null,
                                               1,
                                               from,
                                               item[3] - from + 1];
                                if (enclosure) {
                                    enclosure = enclosure[0];
                                }
                                stack = stack[0];
                                break;
                            }
                            
                            queue[ql++] = stack[2];
                        }
                    }
                }
                else {
                    queue[ql++] = item;
                }
            }
        }
    
        // there are unmatched or invalid token pending from stack
        if (stack) {
            throw new Error("Invalid token found " + stack[2][1]);
        }
        
        return queue;
    
    }

export default parse;