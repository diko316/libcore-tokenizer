'use strict';

var Tokenizer = require("./index.js");

function testTokenizer(tokenizer, subject) {
    var token = tokenizer.tokenize(0, subject);
    var next;
    
    console.log('------------------------- tokenizing ', subject);
    for (; token; token = tokenizer.tokenize(next, subject)) {
        next = token[2];
        console.log(token);
    }
    
    console.log('-------------------------');
    
}
    
function test1() {
    var tokenizer = new Tokenizer(),
        subject = '12345abc67890';
    var tokenizer2 = new Tokenizer();
    
    tokenizer.define([
        "number",      /[0-9]+/,
        
        "sequence",     /[a-c]+/,
                        /[d-z]+/,
                        /[A-Z]+/
    ]);
    
    testTokenizer(tokenizer, subject);
    
    console.log('2nd tokenizer');
    tokenizer2.fromJSON(tokenizer.toJSON());
    
    
    testTokenizer(tokenizer2, subject);

}

function test2() {
    var tokenizer = new Tokenizer();
    
    tokenizer.define([
        "test", /[^a-c]/,
                /[^x-z]/
    ]);
    
    testTokenizer(tokenizer, 'mn09');
    
}

function test3() {
    var tokenizer = new Tokenizer();
    
    tokenizer.define([
        "number", /(\+|\-)?[0-9]+(\.[0-9]+)?/
    ]);
    
    testTokenizer(tokenizer, '09');
}

function test4() {
    var tokenizer = new Tokenizer();
    
    tokenizer.define([
        "special", /[\r\n\t ]+/,
        "let", /[a-z]+/
    ]);
    
    testTokenizer(tokenizer, '\na b cccd');
}

function test5() {
    var tokenizer = new Tokenizer(),
        subject = '0912diko+2dikoVersion3';
        //subject = '0912diko+2dikoVersion3';
        
    tokenizer.define([
                "dikofied", /diko(Version[0-9]+)?t?/,
                "number", /[\+|\-]?[0-9]+/
            ]);
    
    testTokenizer(tokenizer, subject);
    
    console.log(tokenizer);
}

function test6() {
    var tokenizer = new Tokenizer(),
        subject = '0912diko+2dikoxx3t9';
        
    tokenizer.define([
                "dikofied", /diko(xx[0-9]+)*t*/,
                "multi_sign_number", /[\+|\-]?[0-9]+/
            ]);
    
    testTokenizer(tokenizer, subject);
    
    console.log(tokenizer);
}

test6();
//test5();
//test4();
//test3();
//test2();
//test1();







//console.log(build('test', /a(bc)+d/.source));

//console.log(build('test', /ab|cd/.source));

//console.log(build('test', /ab[cdxz]e/.source));

//console.log(build('test', /ab[cd]?/.source));

/**
 * from: abc+ad
 * fill: a.b.c+.a.d
 */