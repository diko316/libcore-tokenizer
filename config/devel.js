'use strict';

var browsersync = require('rollup-plugin-browsersync');
    // bodyParser = require("body-parser"),
    // MULTIPARTY = require("multiparty"),
    // MULTIPART_RE = /^multipart\/form\-data/i,
    // IE_VERSION_RE = /msie ([0-9]+\.[0-9]+)/i;

// function respond(req, res, data) {
//     var output = [],
//         ol = 0,
//         useragent = req.headers['user-agent'],
//         ieVersion = 0;
//     var match;
    
//     output[ol++] = JSON.stringify({
//                                 requestType: req.headers['content-type'],
//                                 accept: req.headers['accept'],
//                                 data: data
//                             });
    
//     if (typeof useragent === "string") {
//         match = useragent.match(IE_VERSION_RE);
//         if (match) {
//             ieVersion = parseInt(match[1], 10) || 0;
//         }
//     }
    
//     if (ieVersion && ieVersion < 10) {
//         res.setHeader("Content-type", "text/plain");
//     }
//     else {
//         res.setHeader("Content-type", "application/json");
//     }
    
//     res.write(output.join("\r\n"));
//     res.end();
// }

// function handleRequest(req, res, next) {
//     var form;
    
//     if (req.method === 'POST') {
        
//         // create data from multipart
//         if (MULTIPART_RE.test(req.headers['content-type'])) {
//             form = new MULTIPARTY.Form();
//             form.parse(req, function (error, fields) {
//                 var data = {};
//                 var name, value;
//                 if (fields) {
//                     for (name in fields) {
//                         if (fields.hasOwnProperty(name)) {
//                             value = fields[name];
//                             if (value instanceof Array) {
//                                 data[name] = value[0];
//                             }
//                         }
//                     }
//                 }
//                 respond(req, res, data);
//             });
//         }
//         else {
//             respond(req, res, req.body);
//         }
//     }
//     else {
//         next();
//     }
    
// }


function configure(config) {
    
    config.plugins.
        push(browsersync({
                server: {
                    baseDir: "dist",
                    index: "index.html"
                    // middleware: [bodyParser.json(),
                    //          bodyParser.urlencoded({
                    //             extended: true
                    //         }),
                    //          handleRequest]
                },
                port: 3000,
                open: false,
                
                files: ["dist/**/*.html",
                        "dist/**/*.js"]
            }));
}
    
    
module.exports = configure;