var EXPORTED_SYMBOLS = ["HuluAdHandler"];

Components.utils.import("resource://adblock-hulu-modules/alert.js");
Components.utils.import("resource://adblock-hulu-modules/common.js");
Components.utils.import("resource://adblock-hulu-modules/listeners/ReplaceListener.class.js");

function read(file){
    var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var scriptableStream = Cc["@mozilla.org/scriptableinputstream;1"].getService(Ci.nsIScriptableInputStream);
    var channel = ioService.newChannel(file,null,null);
    var input = channel.open();
    scriptableStream.init(input);
    var result = scriptableStream.readBytes(input.available());
    scriptableStream.close();
    input.close();
    return result;
}

// maybe make this async
var DATA = read("chrome://adblock-hulu-chrome/content/blank.flv");

function HuluAdHandler(){
	this.strategy = new ReplaceListener(DATA);
}

HuluAdHandler.match = function(subject){
    var url = subject.URI.spec;
    var isMatch =   /^http:\/\/ll\.a\.hulu\.com.*\.flv$/.test(url) || 
                    /^http:\/\/ads\.hulu\.com.*\.flv$/.test(url) || 
                    /^http:\/\/assets\.hulu\.com.*\.flv$/.test(url);
    return isMatch;
};

HuluAdHandler.getHandler = function(){
    return new HuluAdHandler();
};

HuluAdHandler.prototype = {
    strategy: null,
    response: function(data, code, request){
        if( code !== 0 ) return;


    }
};
