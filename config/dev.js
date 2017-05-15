'use strict';


function augment(config) {
    config.devtool = "eval-source-map";
    config.entry.test = ['./src/test.js'];
}


module.exports = augment;