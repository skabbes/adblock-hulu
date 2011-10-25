var EXPORTED_SYMBOLS = ["ReplaceListener"];

Components.utils.import("resource://adblock-hulu-modules/common.js");
Components.utils.import("resource://adblock-hulu-modules/alert.js");


// Copy response listener implementation.
function ReplaceListener(data) {
    this.data = data;
    this.origListener = null;
}

ReplaceListener.prototype = {
    data: null,
    origListener: null,

    _complete: function(data, statusCode, request){ return data; },
    count: 0,

    copy: function(){
        var t = new ReplaceListener(this.data);
        t.origListener = this.origListener;
        t._complete = this._complete;
        return t;
    },

    complete: function( callback ){
        this._complete = callback;
        return this;
    },

    examine: function(subject){
        subject.QueryInterface(Ci.nsITraceableChannel);
        var c = this.copy();
        c.origListener = subject.setNewListener(c);
    },

    onDataAvailable: function(request, context, inputStream, offset, count){
        //don't do anything, we don't care about the actual request
    },

    onStartRequest: function(request, context) {
        // do all the work here, since we already know what data to put in
        // we can immediately populate the request with our fake data
        
        this.origListener.onStartRequest(request, context); 

        var data = this.data;

        var writeFn = "write";
        if ( data instanceof Array ){
            writeFn = "writeByteArray";
        }
        
        while( data.length > 0 ){
            var memStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
            memStream.init(8192, 8192, null);

            var memStreamWriter = CCIN("@mozilla.org/binaryoutputstream;1", "nsIBinaryOutputStream");
            memStreamWriter.setOutputStream(memStream);

            var numBytes = (data.length < 8192) ? data.length : 8192;
            memStreamWriter[writeFn](data, numBytes);
            this.origListener.onDataAvailable(request, context, memStream.newInputStream(0), 0, numBytes);

            // re-shift buffer
            data = data.slice(numBytes);
        }

        // call the complete callback
        this._complete(data, Components.results.NS_OK, request);
        this.origListener.onStopRequest(request, context, Components.results.NS_OK);
    },

    onStopRequest: function(request, context, statusCode) {
        // don't do anything, we don't care about the original request
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports) || aIID.equals(Ci.nsIRequestObserver)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
};
