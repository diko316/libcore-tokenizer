'use strict';

var libcore = require('libcore'),
    StateMap = require("./regex/state-map.js"),
    builder = require("./regex/state-builder.js");



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
