(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("libcore"));
	else if(typeof define === 'function' && define.amd)
		define("libcore-tokenizer", ["libcore"], factory);
	else if(typeof exports === 'object')
		exports["libcore-tokenizer"] = factory(require("libcore"));
	else
		root["libcore-tokenizer"] = factory(root["libcore"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function empty() {}

module.exports = {
    clone: function (instance) {
        empty.prototype = instance;
        return new empty();
    }
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var libcore = __webpack_require__(0);

function StateMap(start) {
    var states = {};
    
    start = typeof start === 'string' ?
                            start : 'start';
    states[start] = {
        not: []
    };
    
    this.stateGenId = 0;
    this.start = start;
    this.states = states;
    this.ends = {};
}

StateMap.prototype = {
    constructor: StateMap,
    
    generateState: function (id) {
        if (libcore.string(id)) {
            return id;
        }
        return 's' + (++this.stateGenId);
    },
    
    finalizeFragments: function (name, fragment, endStates) {
        var states = this.states,
            ends = this.ends,
            processed = {},
            idmap = {},
            pending = [fragment],
            pl = 1;
        var state, stateObject, item, pointer, chr, to, list, l, id,
            not, tl, targets, total, notIndex;
        
        idmap[fragment.state.id] = this.start;
        
        for (; pl--;) {
            item = pending[0];
            pending.splice(0, 1);
            
            state = idmap[item.state.id];
            if (!(state in states)) {
                states[state] = {
                    not: []
                };
            }
            stateObject = states[state];
            
            
            for (pointer = item.pointer; pointer; pointer = pointer.next) {
                chr = pointer.chr;
                to = pointer.to;
                id = to.id;
                
                if (!(id in processed)) {
                    processed[id] = true;
                    pending[pl++] = to;
                }
                
                // finalize state
                state = to.state.id;
                if (!(state in idmap)) {
                    idmap[state] = this.generateState();
                }
                state = idmap[state];
                
                // negative
                if (pointer.negative) {
                    targets = stateObject.not;
                    tl = total = targets.length;
                    
                    not = null;
                    for (; tl--;) {
                        not = targets[tl];
                        if (not[0] === state) {
                            break;
                        }
                        not = null;
                    }
                    
                    if (!not) {
                        not = targets[total++] = [state, {}];
                    }
                    
                    notIndex = not[1];
                    
                    if (!(chr in notIndex)) {
                        notIndex[chr] = 1;
                    }
                    
                }
                // positive
                else {

                    if (!(chr in stateObject)) {
                        stateObject[chr] = [];
                    }
                    list = stateObject[chr];
                    if (list.indexOf(state) === -1) {
                        list[list.length] = state;
                    }
                    
                }
            }
            
        }
        
        // create end states
        for (l = endStates.length; l--;) {
            ends[idmap[endStates[l]]] = name;
        }

        
    },
    
    importDefinition: function (json) {
        var lib = libcore,
            object = lib.object,
            string = lib.string;
        var item;
        
        if (string(json)) {
            try {
                json = JSON.parse(json);
            }
            catch (e) {
                console.warn(e);
                throw new Error("Invalid JSON string parameter.");
            }
        }
        
        if (!object(json)) {
            throw new Error("Invalid JSON object parameter.");
        }
        
        // verify state gen id
        item = json.stateGenId;
        if (!lib.number(item) || item < 0) {
            throw new Error("Invalid state generator");
        }
        this.stateGenId = item;
        
        item = json.start;
        if (!lib.string(item)) {
            throw new Error("Invalid start state name");
        }
        this.start = item;
        
        item = json.states;
        if (!object(item)) {
            throw new Error("Invalid state map object");
        }
        this.states = item;
        
        item = json.ends;
        if (!object(item)) {
            throw new Error("Invalid end states object");
        }
        this.ends = item;
        
        return this;
    },
    
    exportDefinition: function () {
        return {
            stateGenId: this.stateGenId,
            start: this.start,
            states: this.states,
            ends: this.ends
        };
    }
};


module.exports = StateMap;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(9);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var helper = __webpack_require__(1);

function Fragment(builder, pointer) {
    this.id = 'f' + (++builder.fgen);
    this.state = { id: null };
    this.builder = builder;
    
    if (pointer) {
        
        this.pointer = pointer;
        
        for (; pointer.next; pointer = pointer.next) {}
        this.lastPointer = pointer;
        
        // create outgoing
        this.outgoing = this.lastOutgoing = {
            fragment: this,
            next: null
        };
        
    }
    
    
}

Fragment.prototype = {
    constructor: Fragment,
    id: null,
    state: null,
    base: null,
    map: null,
    splitted: null,
    repeated: null,
    pointer: null,
    lastPointer: null,
    outgoing: null,
    lastOutgoing: null,
    
    link: function (operand2) {
        var operand1 = this,
            outgoing = operand1.outgoing,
            split = operand1.splitted,
            newSplit = operand2.splitted,
            repeat = operand1.repeated;
        var clone, last, fragment, pointer;
        
        operand2.applyState();
        
        for (; outgoing; outgoing = outgoing.next) {
            outgoing.fragment.pointer.point(operand2);
        }
        
        // repeat
        if (repeat) {
            last = operand2.lastPointer;
            
            for (; repeat; repeat = repeat.next) {
                clone = repeat.pointer;
                
                if (!last) {
                    operand2.pointer = clone;
                }
                else {
                    last.next = clone;
                }
                
                last = clone;
                
                //console.log("cloned! ", repeat.fragment, clone[0].chr, ' to: ', clone[0].to);
                
            }
            
            operand2.lastPointer = last;
        }
        
        // split and not end state
        pointer = operand2.pointer;
        if (split && pointer) {
            
            // not end state
            for (; split; split = split.next) {
                fragment = split.fragment;
                clone = pointer.clone();
                last = fragment.lastPointer.last();
                last.next = clone[0];
                fragment.lastPointer = clone[1];
            }
            
            // concatenate split
            if (newSplit) {
                
                operand1.lastSplit().next = newSplit;
                
            }
            
            newSplit = operand1.splitted;

        }
        
        // apply repeat to all splits?
        
        fragment = operand1.clone();
        fragment.splitted = newSplit;
        fragment.repeated = operand2.repeated;
        
        fragment.outgoing = operand2.outgoing;
        fragment.lastOutgoing = operand2.lastOutgoing;
        
        return fragment;
    },
    
    lastSplit: function () {
        var split = this.splitted;
        if (split) {
            for (; split.next; split = split.next) {}
            return split;
        }
        return null;
        
    },
    
    clone: function () {
        var base = this.base,
            clone = helper.clone(this);
        
        if (!base) {
            clone.base = this;
        }
        
        clone.id = 'f' + (++this.builder.fgen);
        return clone;
    },
    
    split: function (repeat) {
        var me = this,
            current = me.splitted,
            split = {
                fragment: me,
                next: null
            },
            fragment = me.clone();
            
        if (repeat) {
            fragment.repeat();
        }
        
        if (!current) {
            fragment.splitted = split;
        }
        
        return fragment;
        
    },
    
    repeat: function () {
        var fragment = this,
            pointer = fragment.pointer,
            current = fragment.repeated;
            
        if (!current && pointer) {
            pointer = pointer.clone();
            
            fragment.repeated = {
                pointer: pointer[0],
                next: null
            };
        }
        
        return fragment;
    },
    
    fill: function (operand2) {
        var operand1 = this,
            fragment = operand1.clone(),
            range = operand1.pointer.range(operand2.pointer);
        
        // set 2nd operand state id
        operand2.state = operand1.state;
        
        // connect pointers
        if (range) {
            range[1].next = operand2.pointer;
        }
        else {
            range = [operand2.pointer];
        }
        
        operand1.lastPointer.next = range[0];
        
        
        fragment.lastPointer = operand2.lastPointer;
        
        // merge outgoing
        fragment.outgoing.next = operand2.outgoing;
        fragment.lastOutgoing = operand2.lastOutgoing;

        return fragment;
    },
    
    merge: function (operand2) {
        var operand1 = this,
            fragment = operand1.clone();
        var last, first, item;
        
        // apply state if operand1 has state
        
        // merge state
        operand2.state = operand1.state;
        
        operand1.lastPointer.next = operand2.pointer;
        operand1.lastOutgoing.next = operand2.outgoing;
        
        fragment.lastPointer = operand2.lastPointer;
        fragment.lastOutgoing = operand2.lastOutgoing;
        
        // create split
        first = operand1.splitted;
        last = operand2.splitted;
        fragment.splitted = first || last;
        
        if (first && last) {
            for (item = first; item.next; item = item.next) { }
            item.next = last;
        }
        
        // create repeat
        first = operand1.repeated;
        last = operand2.repeated;
        fragment.repeated = first || last;
        
        if (first && last) {
            for (item = first; item.next; item = item.next) { }
            item.next = last;
        }
        
        
        
        return fragment;
    },
    
    applyState: function () {
        var state = this.state;
        
        if (!state.id) {
            state.id = 's' + (++this.builder.gen);
        }
        
        return state;
    }
    
};

module.exports = Fragment;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


var TOKENIZE = __webpack_require__(8),
    //libcore = require("libcore"),
    //object = libcore.object,
    
    ENCLOSED_START = 2,
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
    };


function parse(str) {
    var tokenize = TOKENIZE,
        operator = OPERATOR,
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
        enclosure = null,
        buffer = [],
        bl = 0,
        bc = 0;
        
    var token, chr, item, l, op, stackOp, fill, precedence, opName, from,
        currentEnclosure;
    
        
    for (item = tokenize(index, str); item; item = tokenize(index, str))  {
        index = item[2];
        chr = item[1];
        token = item[0];
        fill = false;
        
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
        
        currentEnclosure = enclosure && enclosure[1];
        
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

module.exports = parse;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var helper = __webpack_require__(1),
    libcore = __webpack_require__(0);

function Pointer(chr, negative) {
    if (chr) {
        this.chr = chr;
    }
    
    this.negative = negative === true;
}

Pointer.prototype = {
    constructor: Pointer,
    negative: false,
    repeated: false,
    chr: '',
    to: null,
    next: null,
    
    clone: function (overrides) {
        var pointer = this,
            from = null,
            dupe = helper.clone,
            assign = libcore.assign,
            includeNext = overrides !== false;
        var created, last;
        
        if (!overrides) {
            overrides = null;
        }
        
        for (; pointer; pointer = pointer.next) {
            created = dupe(pointer);
            if (overrides) {
                assign(created, overrides);
            }
            
            if (from) {
                last.next = created;
            }
            else {
                from = created;
            }
            
            last = created;
            if (!includeNext) {
                break;
            }
        }
        
        last.next = null;
        
        return [from, last];
        
    },
    
    point: function (fragment) {
        var pointer = this;
        
        for (; pointer; pointer = pointer.next) {
            if (!pointer.to) {
                pointer.to = fragment;
            }
        }
        
        return this;
    },
    
    last: function () {
        var pointer = this;
        
        for (; pointer.next; pointer = pointer.next) {}
        
        return pointer;
    },
    
    range: function (to) {
        var chr = this.chr,
            Class = Pointer,
            S = String,
            start = null,
            end = null,
            negative = this.negative;
        var from, len, created;
        
        from = chr.charCodeAt(0);
        chr = to.chr;
        to = chr.charCodeAt(0);
        len = to - from - 1;
        
        for (; len--;) {
            created = new Class(S.fromCharCode(++from), negative);
            if (start) {
                end.next = created;
            }
            else {
                start = created;
            }
            end = created;
        }
        
        return start && [start, end];
    }
    
};

module.exports = Pointer;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var parse = __webpack_require__(5),
    StateMap = __webpack_require__(2),
    Fragment = __webpack_require__(4),
    Pointer = __webpack_require__(6);

function build(name, regex, stateObject) {
    
    var F = Fragment,
        P = Pointer,
        rpn = parse(regex),
        c = -1,
        l = rpn.length,
        stack = null,
        startState = null,
        el = 0,
        endStates = [],
        builder = {
            gen: 0,
            fgen: 0
        };
        
    var item, token, split, operand1, operand2, id, sid;
        
    if (!(stateObject instanceof StateMap)) {
        stateObject = new StateMap();
    }
    
    for (; l--;) {
        item = rpn[++c];
        token = item[0];
        
        switch (token) {
        // concat
        case '.':
            stack = [stack[0][0],
                        stack[0][1].link(stack[1])];
            break;
        
        // one or none
        case '?':
            stack = [stack[0],
                        stack[1].split()];
            break;
        
        // repeat one or more
        case '+':
            stack = [stack[0],
                        stack[1].repeat()];
            break;
        
        // repeat none or more (kleen star)
        case '*':
            stack = [stack[0],
                        stack[1].split(true)];
            break;
        
        // character class concat
        case '^,':
        case ',':
        case '|': // also applicable to alternative
            stack = [stack[0][0],
                        stack[0][1].merge(stack[1],
                                          token === '^,')];
            break;
        
        // character class range
        case '^-':
        case '-':
            stack = [stack[0][0],
                        stack[0][1].fill(stack[1],
                                         token === '^-')];
            break;
        
        case '$$':
            if (!stack || stack[0] !== null) {
                console.warn(stack);
                throw new Error("Invalid end of expression.");
            }
            
            operand1 = stack[1];
            operand2 = new F(builder, null);
            operand1.link(operand2);
            
            sid = startState.id;
            id = operand2.state.id;
            //console.log(id, ' !== ', startState.id);
            if (id !== sid) {
                endStates[el++] = id;
            }
            
            // end split fragments
            split = operand1.splitted;
            
            for (; split; split = split.next) {
                id = split.fragment.state.id;
                //console.log(id, ' !== ', sid);
                if (id !== sid) {
                    endStates[el++] = id;
                }
            }
            break;
        
        case '^':
        case '$':
        case 'char':
        case 'negative_char':
            operand1 = new F(builder,
                             new P(item[1], token === 'negative_char'));
            
            if (!startState) {
                startState = operand1.applyState();
            }

            stack = [stack, operand1];
            
            

        }
        
    }
    
    
    if (el) {
        stateObject.finalizeFragments(name, stack[1], endStates);
    }
    
    builder = stack = split = operand1 = operand2 = null;
    
    return stateObject;
    
}




module.exports = build;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var HEX_RE = /^[a-fA-F0-9]{2}$/,
    UTF8_RE = /^[a-fA-F0-9]{4}$/,
    RANGE_RE = /^([0-9]+|[0-9]+\,[0-9]*|[0-9]*\,[0-9]+)$/,
    SPECIAL_CHAR = {
        "b": "\b",
        "f": "\f",
        "n": "\n",
        "r": "\r",
        "t": "\t",
        "v": "\x0B",
        "\\": "\\",
        "B": "\\"
    };

function escape(index, regexString) {
    var c = index + 1,
        len = c + 1,
        special = SPECIAL_CHAR,
        chr = regexString.substring(c, len);
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
        return [chr in special ?
                    special[chr] : chr,
                len];
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
                return [chr, c + 1];
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
        next = chr[1];
        chr = chr[0];
        token = 'char';
        break;
    
    case "{":
        chr = range(index, regexString);
        if (chr) {
            next = chr[1];
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
        if (next < len && regexString.charAt(next) === '^') {
            token = '[^';
            next++;
            break;
        }
        
    /* falls through */
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

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var libcore = __webpack_require__(0),
    StateMap = __webpack_require__(2),
    builder = __webpack_require__(7);



function Tokenizer() {
    this.map = new StateMap();
}

Tokenizer.prototype = {
    map: null,
    constructor: Tokenizer,
    
    define: function (definitions) {
        var lib = libcore,
            string = lib.string,
            regex = lib.regex,
            map = this.map,
            build = builder,
            name = null;
        var item, c, len;
        
        if (!lib.array(definitions)) {
            throw new Error("Invalid definitions parameter.");
        }
        
        c = -1;
        len = definitions.length;
        
        for (; len--;) {
            item = definitions[++c];
            
            if (string(item)) {
                name = item;
                
            }
            else if (regex(item)) {
                item = item.source;
                if (!name) {
                    throw new Error("Token is not named " + item);
                }
                
                build(name, item, map);
                
            }
            
        }
        
        return this;
    },
    
    fromJSON: function (data) {
        this.map.importDefinition(data);
        return this;
    },
    
    toJSON: function () {
        return JSON.stringify(this.toObject());
    },
    
    toObject: function () {
        return this.map.exportDefinition();
    },
    
    tokenize: function (from, str) {
        var map = this.map,
            ends = map.ends,
            states = map.states,
            cursor = [map.start, null],
            len = str.length,
            limit = len - from,
            index = from - 1,
            found = null;
        var chr, c, l, next, list, state, pointer, target, not, nmap;
        
        if (limit === 0) {
            return ['$', '', len + 1];
        }
        else if (limit < 1) {
            return null;
        }
        
        for (; limit--;) {
            chr = str.charAt(++index);
            next = null;
            for (; cursor; cursor = cursor[1]) {
                state = cursor[0];
                pointer = states[state];
                
                if (state in ends) {
                    found = [ends[state], index];
                }
                
                // apply positive match
                if (chr in pointer) {
                    list = pointer[chr];
                    
                    
                    for (c = -1, l = list.length; l--;) {
                        target = list[++c];
                        next = [target, next];
                        
                        //console.log(state,':', chr, '->', target);
                        
                        // found token
                        if (target in ends) {
                            found = [ends[target], index + 1];
                        }
                    }
                }
                
                // find negative match
                not = pointer.not;
                for (c = -1, l = not.length; l--;) {
                    target = not[++c];
                    nmap = target[1];
                    
                    if (!(chr in nmap)) {
                        target = target[0];
                        next = [target, next];
                        //console.log(state,':', chr, '->', target);
                        
                        // found token
                        if (target in ends) {
                            found = [ends[target], index + 1];
                        }
                    }
                }

            }
            
            if (next) {
                cursor = next;
            }
            else {
                break;
            }
            
        }
        
        if (found) {
            found[2] = found[1];
            found[1] = str.substring(from, found[1]);
        }
        
        return found;
        
    }
};


module.exports = Tokenizer;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(3);


/***/ })
/******/ ]);
});