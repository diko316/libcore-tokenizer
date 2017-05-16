'use strict';

var //PATH = require('path'),
    webpack = require("webpack"),
    DEFINITION = require("./package.json"),
    LIB_NAME = DEFINITION.name,
    CONFIG = require("./config/base.js"),
    hot = true;
    
switch (process.env.BUILD_MODE) {
case "unit-test":
case "production":
case "compressed":
    hot = false;
    
/* falls through */
default:
    require("./config/dev.js")(CONFIG);
    if (hot) {
        CONFIG.plugins = [new webpack.HotModuleReplacementPlugin()];
        CONFIG.entry[LIB_NAME].
            splice(0,0,
                'webpack-hot-middleware/client?reload=true&overlay=false');
    }
}
    
    
module.exports = CONFIG;