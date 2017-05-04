'use strict';

var helper = require("./helper.js");

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
                clone = repeat.fragment.pointer.clone();
                if (!last) {
                    operand2.pointer = clone[0];
                    operand2.lastPointer = last = clone[1];
                }
                else {
                    last.next = clone[0];
                    last = clone[1];
                }
                
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
            
        }
        
        fragment = operand1.clone();
        fragment.splitted = operand2.splitted;
        fragment.repeated = operand2.repeated;
        
        fragment.outgoing = operand2.outgoing;
        fragment.lastOutgoing = operand2.lastOutgoing;
        
        return fragment;
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
            fragment = repeat ?
                            me.repeat() : me.clone();
        
        if (current) {
            fragment.splitted = current;
            for (; current.next; current = current.next) { }
            current.next = split;
        }
        else {
            fragment.splitted = split;
        }
        
        return fragment;
        
    },
    
    repeat: function () {
        var fragment = this.clone(),
            current = fragment.repeated,
            repeat = {
                fragment: this,
                next: null
            };
            
        if (current) {
            for (; current.next; current = current.next) { }
            current.next = repeat;
        }
        else {
            fragment.repeated = repeat;
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