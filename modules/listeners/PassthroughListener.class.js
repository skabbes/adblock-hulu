var EXPORTED_SYMBOLS = ["PassthroughListener"];
Components.utils.import("resource://adblock-hulu-modules/common.js");
Components.utils.import("resource://adblock-hulu-modules/alert.js");

//
// Copys one stream directly to another stream
//
function PassthroughListener() {
    this.origListener = null;
    this._complete = [];
    this._start = [];
    this.count = 0;
    this._stream = null;
}

PassthroughListener.prototype = {
    // onComplete
    complete: function( callback ){
        this._complete.push( callback );
    },

    // onStart
    start: function( callback ){
        this._start.push(callback);
    },

    // convenience function to stream to a file
    file: function(file){
        var output = CCIN("@mozilla.org/network/safe-file-output-stream;1", "nsIFileOutputStream");
        output.init(file, 0x04 | 0x08 | 0x20, 0600, 0);
        this.stream(output);
        this.complete( function(){
            if (output instanceof Ci.nsISafeOutputStream) {  
                output.finish();  
            } else {  
                output.close();  
            }  
        });
    },

    stream: function( stream ){
        if(stream == null){
            return this._stream;
        }
        this._stream = stream;
    },

    examine: function(subject){
        subject.QueryInterface(Ci.nsITraceableChannel);
        this.origListener = subject.setNewListener(this);
    },

    onDataAvailable: function(request, context, inputStream, offset, count){
        this.count += count;

        var memStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        memStream.init(8192, count, null);

        var memStreamWriter = CCIN("@mozilla.org/binaryoutputstream;1", "nsIBinaryOutputStream");
        memStreamWriter.setOutputStream(memStream);

        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
        binaryInputStream.setInputStream(inputStream);

        // Copy received data as it comes
        var data = binaryInputStream.readBytes(count);

        memStreamWriter.write(data, count);
        this._stream.write(data, count);

        this.origListener.onDataAvailable(request, context, memStream.newInputStream(0), offset, count);
    },

    onStartRequest: function(request, context) {
        this._start.forEach(function(startHandler){
            startHandler(request);
        });
        this.origListener.onStartRequest(request, context);
    },

    onStopRequest: function(request, context, statusCode){
        request.QueryInterface(Ci.nsIHttpChannel);

        var count = this.count;
        this._complete.forEach(function(completeCallback){
            completeCallback(request, statusCode, count);
        });
        this.origListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports) || aIID.equals(Ci.nsIRequestObserver)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
};
