var EXPORTED_SYMBOLS = ["CompleteByteListener"];

Components.utils.import("resource://adblock-hulu-modules/listeners/CompleteListener.class.js");

function CompleteByteListener() {
	CompleteByteListener.prototype.constructor.call(this);
}

CompleteByteListener.prototype = new CompleteListener();

CompleteByteListener.prototype.readFromIS = function(reader, count){
    return reader.readByteArray(count);
};
