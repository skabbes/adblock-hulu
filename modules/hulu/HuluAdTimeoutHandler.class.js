// ======================================================================  
// HuluAdTimeoutHandler.class.js 
//
// This class attempts to block interactive (flash) ads with timeouts.  
// This is mostly untested because I can't find enough interactive ads 
// to sufficiently test this
// ======================================================================  

var EXPORTED_SYMBOLS = ["HuluAdTimeoutHandler"];

Components.utils.import("resource://adblock-hulu-modules/alert.js");
Components.utils.import("resource://adblock-hulu-modules/common.js");
Components.utils.import("resource://adblock-hulu-modules/listeners/ModifyingListener.class.js");

function HuluAdTimeoutHandler(){
	this.strategy = new ModifyingListener();
}

HuluAdTimeoutHandler.match = function(subject){
    var url = subject.URI.spec;
    return /^http:\/\/a\.huluad\.com\/.*\/instream_ad.xml$/.test(url);
};

HuluAdTimeoutHandler.getHandler = function(){
    return new HuluAdTimeoutHandler();
};

HuluAdTimeoutHandler.prototype = {
    strategy: null,
    response: function(data, code, request){
        if( code !== 0 ) return;
        data = data.replace(/<automation name="VwTimeoutLength">.*?<\/automation>/, "<automation name=\"VwTimeoutLength\"><![CDATA[5]]></automation>");
        data = data.replace(/<automation name="VwTimeout">.*?<\/automation>/, "<automation name=\"VwTimeout\"><![CDATA[5]]></automation>");
        return data;
    }
};
