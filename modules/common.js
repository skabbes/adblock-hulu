var EXPORTED_SYMBOLS = ['PR_UINT32_MAX', 'Cc', 'Ci', 'CCIN'];

var PR_UINT32_MAX = 0xffffffff;
var Cc = Components.classes;
var Ci = Components.interfaces;

// Helper function for XPCOM instanciation (from Firebug)
function CCIN(cName, ifaceName) {
    return Cc[cName].createInstance(Ci[ifaceName]);
}
