'use strict';

function empty() {}

module.exports = {
    clone: function (instance) {
        empty.prototype = instance;
        return new empty();
    }
};