'use strict';


var parse = require("./parser.js"),
    StateMap = require("./state-map.js"),
    Fragment = require("./fragment.js"),
    Pointer = require("./pointer.js");

function build(name, regex, stateObject) {
    
    var F = Fragment,
        P = Pointer,
        rpn = parse(regex),
        c = -1,
        l = rpn.length,
        stack = null,
        startState = null,
        el = 0,
        endStates = [],
        builder = {
            gen: 0,
            fgen: 0
        };
        
    var item, token, split,
        operand1, operand2;
        
    if (!(stateObject instanceof StateMap)) {
        stateObject = new StateMap();
    }
    
    for (; l--;) {
        item = rpn[++c];
        token = item[0];
        
        switch (token) {
        // concat
        case '.':
            stack = [stack[0][0],
                        stack[0][1].link(stack[1])];
            break;
        
        // one or none
        case '?':
            stack = [stack[0],
                        stack[1].split()];
            break;
        
        // repeat one or more
        case '+':
            stack = [stack[0],
                        stack[1].repeat()];
            break;
        
        // repeat none or more (kleen star)
        case '*':
            stack = [stack[0],
                        stack[1].split(true)];
            break;
        
        // character class concat
        case '^,':
        case ',':
        case '|': // also applicable to alternative
            stack = [stack[0][0],
                        stack[0][1].merge(stack[1],
                                          token === '^,')];
            break;
        
        // character class range
        case '^-':
        case '-':
            stack = [stack[0][0],
                        stack[0][1].fill(stack[1],
                                         token === '^-')];
            break;
        
        case '()':
            console.log("enclosed ", stack[1]);
            break;
        
        case '$$':
            if (!stack || stack[0] !== null) {
                console.log(stack);
                throw new Error("Invalid end of expression.");
            }
            
            operand1 = stack[1];
            operand2 = new F(builder, null);
            operand1.link(operand2);
            
            endStates[el++] = operand2.state.id;
            
            // end split fragments
            split = operand1.splitted;
            
            for (; split; split = split.next) {
                endStates[el++] = split.fragment.state.id;
            }
            break;
        
        case '^':
        case '$':
        case 'char':
        case 'negative_char':
            operand1 = new F(builder,
                             new P(item[1], token === 'negative_char'));
            
            if (!startState) {
                startState = operand1.applyState();
            }

            stack = [stack, operand1];
            
            

        }
        
    }
    
    
    if (el) {
        stateObject.finalizeFragments(name, stack[1], endStates);
    }
    
    builder = stack = split = operand1 = operand2 = null;
    
    return stateObject;
    
}




module.exports = build;