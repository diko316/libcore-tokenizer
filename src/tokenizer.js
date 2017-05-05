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
    
    append: function () {
        var lib = libcore,
            string = lib.string,
            regex = lib.regex,
            map = this.map,
            build = builder,
            args = arguments,
            len = args.length,
            c = -1,
            name = null;
        var item;
        
        for (; len--;) {
            item = args[++c];
            
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
    
    load: function (data) {
        this.map.importDefinition(data);
        return this;
    },
    
    view: function () {
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
                    console.log('negative! ', chr, target);
                    if (chr in nmap) {
                        target = target[0];
                        next = [target, next];
                        
                                                
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
