var EXPORTED_SYMBOLS = ["Examiner"];
Components.utils.import("resource://adblock-hulu-modules/common.js");
Components.utils.import("resource://adblock-hulu-modules/alert.js");

var observers = [];
var handlers = [];

function findHandler(subject, observer){
    var handler = null;
    for(var i=0;i<handlers.length;i++){
        if( handlers[i].observer === observer && handlers[i].subject === subject ){
            handler = handlers[i].handler;
        }
    }
    return handler;
}

function getHandler(subject, observer){
    var handler = findHandler(subject, observer);
    if( handler === null){
        handler = observer.getHandler(subject);
    }

    var temp = {subject: subject, observer: observer, handler: handler};
    handlers.push(temp);

    return handler;
}

function removeHandler(subject, observer){
    var handler = null;
    for(var i=0;i<handlers.length;i++){
        if( handlers[i].observer === observer && handlers[i].subject === subject ){
            handlers.splice(i, 1);
        }
    }
}

function onModifyRequest(subject, handler){
    subject.QueryInterface(Ci.nsIUploadChannel);
    subject.uploadStream.QueryInterface(Ci.nsISeekableStream);

    var seekStream = CCIN("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream");
    seekStream.init(subject.uploadStream);

    var data = seekStream.read( seekStream.available() );
    subject.uploadStream.seek(0, 0);

    handler.request(data, subject);
}

function onExamineResponse(subject, handler){
    var c = handler.strategy;
    c.complete( function(data, statusCode, request){
        var newData =  handler.response(data, statusCode, request);
        return newData || data;
    });
    c.examine( subject );
}

var Examiner = {
    listen: function( observer ){
        observers.push( observer );
    },

    observe: function(subject, topic, data) {
        subject.QueryInterface(Ci.nsIHttpChannel);
        for( var i=0;i<observers.length;i++ ){
            if( observers[i].match(subject) ){
                var handler = getHandler(subject, observers[i]);
                if( handler.request !== undefined && topic == "http-on-modify-request" ){
                    onModifyRequest(subject, handler);
                } 
                else if(handler.response !== undefined && topic == "http-on-examine-response"){
                    removeHandler(subject, observers[i]);
                    onExamineResponse(subject, handler);
                }
            }
        }
    },

    register: function() {
        var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
        observerService.addObserver(this, "http-on-modify-request", false);
        observerService.addObserver(this, "http-on-examine-response", false);
    },

    unregister: function() {
        var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
        observerService.removeObserver(this, "http-on-modify-request");
        observerService.removeObserver(this, "http-on-examine-response");
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIObserver) || aIID.equals(Ci.nsISupports) ){
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
};
