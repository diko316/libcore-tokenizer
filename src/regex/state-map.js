'use strict';

import {
            string,
            number,
            object,
            array
        } from "libcore";

function StateMap(start) {
    var states = {};
    
    start = typeof start === 'string' ?
                            start : 'start';
    states[start] = {
        not: []
    };
    
    this.priority = [];
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
        var states = this.states,
            ends = this.ends,
            processed = {},
            idmap = {},
            pending = [fragment],
            pl = 1;
        var state, stateObject, item, pointer, chr, to, list, l, id,
            not, tl, targets, total, notIndex, endList, endIndex;
        
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
            // fixing race ends
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

        item = json.priority;
        if (!array(item)) {
            throw new Error("Invalid priority list");
        }
        this.priority = item;

        
        
        return this;
    },
    
    exportDefinition: function () {
        return {
            stateGenId: this.stateGenId,
            start: this.start,
            states: this.states,
            ends: this.ends,
            priority: this.priority
        };
    }
};


export default StateMap;
