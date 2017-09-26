import { array, assign, number, object, regex, string } from 'libcore';

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
        if (string(id)) {
            return id;
        }
        return 's' + (++this.stateGenId);
    },
    
    finalizeFragments: function (name, fragment, endStates) {
        var this$1 = this;

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
                    idmap[state] = this$1.generateState();
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
        var isObject = object,
            isString = string;
        var item;
        
        if (isString(json)) {
            try {
                json = JSON.parse(json);
            }
            catch (e) {
                console.warn(e);
                throw new Error("Invalid JSON string parameter.");
            }
        }
        
        if (!isObject(json)) {
            throw new Error("Invalid JSON object parameter.");
        }
        
        // verify state gen id
        item = json.stateGenId;
        if (!number(item) || item < 0) {
            throw new Error("Invalid state generator");
        }
        this.stateGenId = item;
        
        item = json.start;
        if (!isString(item)) {
            throw new Error("Invalid start state name");
        }
        this.start = item;
        
        item = json.states;
        if (!isObject(item)) {
            throw new Error("Invalid state map object");
        }
        this.states = item;
        
        item = json.ends;
        if (!isObject(item)) {
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

var HEX_RE = /^[a-fA-F0-9]{2}$/;
var UTF8_RE = /^[a-fA-F0-9]{4}$/;
var RANGE_RE = /^([0-9]+|[0-9]+\,[0-9]*|[0-9]*\,[0-9]+)$/;
var SPECIAL_CHAR = {
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

var ENCLOSED_START = 2;
var ENCLOSED_END = 3;
var BINARY = 4;
var POSTFIX = 5;
var FINAL = 6;
var OPERATOR = {
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
var ENCLOSED_CLASS_REPLACE = {
        "[": 'char',
        "[^": 'char',
        "?": 'char',
        "+": 'char',
        "*": 'char',
        ",": 'char',
        "|": 'char',
        "(": 'char',
        ")": 'char'
    };
var ENCLOSED_REPLACE = {
        "[": ENCLOSED_CLASS_REPLACE,
        "[^": ENCLOSED_CLASS_REPLACE,
        "(": {
            "-": 'char'
        }
    };

function parse(str) {
        var operator = OPERATOR,
            tokenize$$1 = tokenize,
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
            
        var token, chr, item, l, op, stackOp, precedence,
            fill, opName, from, currentEnclosure, replacements;
        
        for (item = tokenize$$1(index, str); item; item = tokenize$$1(index, str))  {
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
                    // fill if there's lastToken and not "|"
                    fill = !!lastToken && lastToken !== '|';
                }
            }
            else {
                switch (lastToken) {
                case 'negative_char':
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
                            break binaryCompare;
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

function empty() {}

function clone(instance) {
        empty.prototype = instance;
        return new empty();
    }

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
        var clone$$1, last, fragment, pointer, startSplit, endSplit, created;
        
        operand2.applyState();
        
        for (; outgoing; outgoing = outgoing.next) {
            outgoing.fragment.pointer.point(operand2);
        }
        
        // repeat
        if (repeat) {
            last = operand2.lastPointer;
            
            for (; repeat; repeat = repeat.next) {
                clone$$1 = repeat.pointer;
                
                if (!last) {
                    operand2.pointer = clone$$1;
                }
                else {
                    last.next = clone$$1;
                }
                
                last = clone$$1;
                
            }
            
            operand2.lastPointer = last;
        }
        
        // split and not end state
        pointer = operand2.pointer;
        if (split && pointer) {
            
            startSplit = endSplit = null;
            
            // not end state
            for (; split; split = split.next) {
                fragment = split.fragment;
                clone$$1 = pointer.clone();
                last = fragment.lastPointer.last();
                last.next = clone$$1[0];
                fragment.lastPointer = clone$$1[1];
                
                // include split to next
                if (fragment.pointer !== operand1.pointer) {
                    created = {
                        fragment: fragment,
                        next: null
                    };
                    
                    if (!startSplit) {
                        startSplit = created;
                    }
                    else {
                        endSplit.next = created;
                    }
                    
                    endSplit = created;
                }
            }
            
            // concatenate split
            if (endSplit) {
                endSplit.next = newSplit;
                newSplit = startSplit;
            }

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
            cloned = clone(this);
        
        if (!base) {
            cloned.base = this;
        }
        
        cloned.id = 'f' + (++this.builder.fgen);
        return cloned;
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
            range = operand1.pointer.range(operand2.pointer);
        var fragment;
            
        if (range) {
            
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
            
            fragment = operand1.clone();
            fragment.lastPointer = operand2.lastPointer;
            
            // merge outgoing
            fragment.outgoing.next = operand2.outgoing;
            fragment.lastOutgoing = operand2.lastOutgoing;
            
            return fragment;
        }
        
        // merge
        return this.merge(operand2);
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
            dupe = clone,
            apply = assign,
            includeNext = overrides !== false;
        var created, last;
        
        if (!overrides) {
            overrides = null;
        }
        
        for (; pointer; pointer = pointer.next) {
            created = dupe(pointer);
            if (overrides) {
                apply(created, overrides);
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
        len = Math.max(to - from - 1, 0);
        
        if (len) {
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
        
        return null;
        
    }
    
};

var PATTERN_ERROR = 'Patterns resulting to empty token is not allowed. ';

function build(name, regex$$1, stateObject) {
    
    var F = Fragment,
        P = Pointer,
        rpn = parse(regex$$1),
        c = -1,
        l = rpn.length,
        stack = null,
        startState = null,
        el = 0,
        endStates = [],
        errorName = name + ' = /' + regex$$1 + '/',
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
                throw new Error("Invalid end of expression. " + errorName);
            }
            
            operand1 = stack[1];
            operand2 = new F(builder, null);
            operand1.link(operand2);
            
            sid = startState.id;
            id = operand2.state.id;
            
            if (id === sid) {
                throw new Error(PATTERN_ERROR + errorName);
            }
            
            endStates[el++] = id;
            
            // end split fragments
            split = operand1.splitted;
            
            for (; split; split = split.next) {
                id = split.fragment.state.id;
                if (id === sid) {
                    throw new Error(PATTERN_ERROR + errorName);
                }
                endStates[el++] = id;
                //if (id !== sid) {
                //    console.log(regex);
                //    endStates[el++] = id;
                //}
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

function Tokenizer$1() {
    this.map = new StateMap();
}

Tokenizer$1.prototype = {
    map: null,
    constructor: Tokenizer$1,
    
    define: function (definitions) {
        var isString = string,
            isRegex = regex,
            map = this.map,
            build$$1 = build,
            name = null;
        var item, c, len;
        
        if (!array(definitions)) {
            throw new Error("Invalid definitions parameter.");
        }
        
        c = -1;
        len = definitions.length;
        
        for (; len--;) {
            item = definitions[++c];
            
            if (isString(item)) {
                name = item;
                
            }
            else if (isRegex(item)) {
                item = item.source;
                if (!name) {
                    throw new Error("Token is not named " + item);
                }
                
                build$$1(name, item, map);
                
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
            
            index = found[1];
            
            // nothing was parsed
            if (from === index) {
                found = null;
            }
            else {
                found[2] = index;
                found[1] = str.substring(from, index);
            }
        }
        
        return found;
        
    }
};

export { Tokenizer$1 as Tokenizer };
export default Tokenizer$1;
//# sourceMappingURL=libcore-tokenizer.es.js.map
