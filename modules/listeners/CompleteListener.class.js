// ======================================================================  
// CompleteListener.class.js 
// A listener which gives a callback after the request is complete
// ======================================================================  

var EXPORTED_SYMBOLS = ["CompleteListener"];
Components.utils.import("resource://adblock-hulu-modules/common.js");
Components.utils.import("resource://adblock-hulu-modules/listeners/PassthroughListener.class.js");

function CompleteListener() {}

CompleteListener.prototype = {
    _complete: function(data, request, statusCode){},

    complete: function( callback ){
        this._complete = callback;
        return this;
    },

    readFromIS: function(reader, count){
        return reader.readBytes(count);
    },

    examine: function(subject){
        var c = new PassthroughListener();

        var memStream = CCIN("@mozilla.org/storagestream;1", "nsIStorageStream");
        memStream.init(8192, PR_UINT32_MAX, null);

        var memStreamWriter = CCIN("@mozilla.org/binaryoutputstream;1", "nsIBinaryOutputStream");
        memStreamWriter.setOutputStream(memStream);

        c.stream( memStreamWriter );

        var self = this;
        c.complete( function(request, code, count){
            var stream = memStream.newInputStream(0);

            var reader = CCIN("@mozilla.org/binaryinputstream;1", "nsIBinaryInputStream");
            reader.setInputStream( stream );

            var data  = self.readFromIS( reader, count );
            self._complete(data, code, request);
        });

        c.examine(subject);
    },
};
