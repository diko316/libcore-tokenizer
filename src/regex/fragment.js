'use strict';

import { clone } from "./helper.js";


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
        var clone, last, fragment, pointer, startSplit, endSplit, created;
        
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
                clone = pointer.clone();
                last = fragment.lastPointer.last();
                last.next = clone[0];
                fragment.lastPointer = clone[1];
                
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

export default Fragment;
