'use strict';

import {
            assign
        } from "libcore";
        
import { clone } from "./helper.js";


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

export default Pointer;