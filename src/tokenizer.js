'use strict';

import {
            string,
            regex,
            array
        } from "libcore";

import StateMap from "./regex/state-map.js";

import builder from "./regex/state-builder.js";

function Tokenizer() {
    this.map = new StateMap();
}

Tokenizer.prototype = {
    map: null,
    constructor: Tokenizer,
    
    define: function (definitions) {
        var isString = string,
            isRegex = regex,
            map = this.map,
            priority = map.priority,
            pl = priority.length,
            build = builder,
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

                // add priority
                if (priority.indexOf(name) === -1) {
                    priority[pl++] = name;
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
            rank = map.priority,
            cursor = [map.start, null],
            len = str.length,
            limit = len - from,
            index = from - 1,
            found = null,
            lastFound = found,
            charIndex = 0;
        var chr, c, l, next, list, state, pointer, target, not, nmap, priority;
        
        if (limit === 0) {
            return ['$', '', len + 1];
        }
        else if (limit < 1) {
            return null;
        }
        
        for (; limit--;) {
            chr = str.charAt(++index);
            next = null;

            charIndex++;

            for (; cursor; cursor = cursor[1]) {
                state = cursor[0];
                pointer = states[state];
                
                if (state in ends) {
                    found = [ends[state], index, found];
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
                            found = [ends[target], index + 1, found];
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
                            found = [ends[target], index + 1, found];
                        }
                    }
                }

            }

            // save last found 
            if (found) {
                lastFound = found;
            }

            found = null;
            
            if (next) {
                cursor = next;
            }
            else {
                break;
            }
            
        }

        // resolve highest priority
        for (pointer = lastFound; pointer; pointer = pointer[2]) {
            index = pointer[1];
            priority = rank.indexOf(pointer[0]);

            // replace if high index and lowest priority
            if (!found || index > found[1] || priority < found[2]) {
                found = [pointer[0], index, priority];
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


export default Tokenizer;
