// ======================================================================  
// ModifyingByteListener.class.js 
//
// same as the ModifyingListener, but the callback is given as an array of
// bytes
// ======================================================================  

var EXPORTED_SYMBOLS = ["ModifyingByteListener"];
Components.utils.import("resource://adblock-hulu-modules/listeners/ModifyingListener.class.js");

// Copy response listener implementation.
function ModifyingByteListener() {
    ModifyingByteListener.prototype.constructor.apply(this, arguments);
}

ModifyingByteListener.prototype = new ModifyingListener();

ModifyingByteListener.prototype.readFromIS = function(reader, count){
    return reader.readByteArray( count );
};
