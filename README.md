# libcore-tokenizer
NFA Tokenizer

# Installation

Tokenizer can be installed from NPM by running the lines below in your working directory containing package.json file for use in NodeJS, browserify or webpack.


```shell
npm install libcore-tokenizer --save
```

# Usage

The following lines defines tokens and regular expressions and uses the tokenizer instance to tokenize the string.

```javascript

var Tokenizer = require("libcore-tokenizer"),
	tokenizer = new Tokenizer(),
	subject = "12345abc67890";

// declare tokens
tokenizer.define([
	"number",	 /[0-9]+/,
        
	"sequence",	/a-c]+/,
					/[d-z]+/,
					/[A-Z]+/
]);

// tokenize (indexFrom, stringSubject)

tokenizer.tokenize(0, subject);
// result:
// 		["number", "12345", 5]


tokenizer.tokenize(5, subject);
// result: ["sequence", "abc", 8]

tokenizer.tokenize(8, subject);
// result: ["number", "67890", 13]


tokenizer.tokenize(13, subject);
// result: ["$", "", 14] -- end token, next call on next index would result in null

tokenizer.tokenize(14, subject);
// result: null

```


You can also export state matrix of the state machine to JSON string by running the lines below.

```javascript
var Tokenizer = require("libcore-tokenizer"),
	tokenizer = new Tokenizer();

// declare tokens
tokenizer.define([
	"number",	 /[0-9]+/,
        
	"sequence",	/a-c]+/,
					/[d-z]+/,
					/[A-Z]+/
]);

console.log(tokenizer.toJSON());
// result: JSON string containing state matrix object
```

You can import state matrix from JSON string or from Native Object.

```javascript
var Tokenizer = require("libcore-tokenizer"),
	exportedJSON = require("./tokenizer-matrix.json"),
	tokenizer = new Tokenizer();
	
tokenizer.fromJSON(exportedJSON());

// torkenizer is now ready for tokenizing string
```


