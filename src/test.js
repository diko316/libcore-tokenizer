'use strict';

var Tokenizer = require("./tokenizer.js");

function testTokenizer(tokenizer, subject) {
    var token = tokenizer.tokenize(0, subject);
    var next;

    for (; token; token = tokenizer.tokenize(next, subject)) {
        next = token[2];
        console.log(token);
    }
    
}
    
function test1() {
    var tokenizer = new Tokenizer(),
        subject = '12345abc67890';
    var tokenizer2 = new Tokenizer();
    
    tokenizer.append(
        "number",   /[0-9]+/,
        
        "char",     /[a-c]+/,
                    /[d-z]+/,
                    /[A-Z]+/
    );
    
    testTokenizer(tokenizer, subject);
    
    console.log('2nd tokenizer');
    tokenizer2.load(tokenizer.view());
    
    
    testTokenizer(tokenizer2, subject);

}

function test2() {
    var tokenizer = new Tokenizer();
    
    tokenizer.append(
        "test", /[^a-c]/,
                /[^x-z]/
    );
    console.log('try');
    testTokenizer(tokenizer, 'mn09');
    
}

test2();

console.log('-------------------------');

//test1();






//console.log(build('test', /a(bc)+d/.source));

//console.log(build('test', /ab|cd/.source));

//console.log(build('test', /ab[cdxz]e/.source));

//console.log(build('test', /ab[cd]?/.source));

/**
 * from: abc+ad
 * fill: a.b.c+.a.d
 */