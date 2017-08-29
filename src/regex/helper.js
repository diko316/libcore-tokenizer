'use strict';

function empty() {}

export
    function clone(instance) {
        empty.prototype = instance;
        return new empty();
    }
