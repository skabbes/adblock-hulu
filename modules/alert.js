// ======================================================================  
// alert.js 
// alerts, confirm, and prompt for non-browser contexts, useful for
// debugging
// ======================================================================  

var EXPORTED_SYMBOLS = ["myAlert", "myPrompt", "myConfirm"];

Components.utils.import("resource://adblock-hulu-modules/common.js");

function myAlert(title, message){
    if( message == null){
        message = title;
        title = "Title";
    }
    var promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Ci.nsIPromptService);
    promptService.alert(null, title, message);
}

function myConfirm(title, text){
    if( text == null){
    text = title;
    title = "Title";
    }

    var promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Ci.nsIPromptService);

    return promptService.confirm(null, title, text);
}

function myPrompt(title, text, defaultValue){
    if( text == null){
        text = title;
        title = "Title";
    }

    var input = {value: defaultValue};

    var promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Ci.nsIPromptService);

    var ret = promptService.prompt(null, title, text, input, null, {});

    if( ret == false){
        return false;
    }

    return input.value;
    
}
