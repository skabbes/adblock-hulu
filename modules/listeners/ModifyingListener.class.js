// ======================================================================  
// ModifyingListener.class.js 
//
// A listener which gives a callback after the request is complete (as an
// array of uint8's), but also gives you the option to modify the data
// before it is passed back to the browser
//
// An example of when you would use this would be if you wanted to change
// the artist name of every song on Pandora to be "justin bieber" ( just 
// modify the incoming xml song list)
// ======================================================================  

var EXPORTED_SYMBOLS = ["ModifyingListener"];

Components.utils.import("resource://adblock-hulu-modules/common.js");
Components.utils.import("resource://adblock-hulu-modules/alert.js");

function ModifyingListener() {
    this.stream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
    this.stream.init(8192, PR_UINT32_MAX, null);

    this.streamWriter = CCIN("@mozilla.org/binaryoutputstream;1", "nsIBinaryOutputStream");
    this.streamWriter.setOutputStream(this.stream);
}

ModifyingListener.prototype = {
    origListener: null,
    stream: null,
    streamWriter: null,
    _complete: function(data, statusCode, request){ return data; },
    count: 0,

    copy: function(){
        var t = new ModifyingListener();
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

    onDataAvailable: function(request, context, inputStream, offset, count) {
        this.count += count;

        var binaryInputStream = CCIN("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
        binaryInputStream.setInputStream(inputStream);

        // Copy received data as they come.
        var data = binaryInputStream.readBytes(count);

        this.streamWriter.write(data, count);

        // DONT call ondataavailable...
        //this.origListener.onDataAvailable(request, context, memStream.newInputStream(0), offset, count);
    },

    onStartRequest: function(request, context) {
        this.origListener.onStartRequest(request, context);
    },

    readFromIS: function(reader, count){
        return reader.readBytes( count );
    },

    onStopRequest: function(request, context, statusCode)
    {
        request.QueryInterface(Ci.nsIHttpChannel);

        var stream = this.stream.newInputStream(0);
        var reader = CCIN("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
        reader.setInputStream( stream );

        var data  = this.readFromIS(reader, this.count);
        data = this._complete(data, statusCode, request);

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
            memStreamWriter[writeFn]( data, numBytes);
            this.origListener.onDataAvailable(request, context, memStream.newInputStream(0), 0, numBytes);

            // re-shift buffer
            data = data.slice(numBytes);
        }

        this.origListener.onStopRequest(request, context, statusCode);
    },

    QueryInterface: function (aIID) {
        if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports) || aIID.equals(Ci.nsIRequestObserver)) {
            return this;
        }
        throw Components.results.NS_NOINTERFACE;
    }
};
