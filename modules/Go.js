// ======================================================================  
// Go.js 
// Entrance point for the extension put into a module form, since it should
// only be started up once per firefox session (not once per browser window)
// ======================================================================  

var EXPORTED_SYMBOLS = [];

//Components.utils.import("resource://adblock-hulu-modules/common.js");
//Components.utils.import("resource://adblock-hulu-modules/alert.js");

Components.utils.import("resource://adblock-hulu-modules/Examiner.class.js");
Components.utils.import("resource://adblock-hulu-modules/hulu/HuluAdHandler.class.js");
Components.utils.import("resource://adblock-hulu-modules/hulu/HuluAdTimeoutHandler.class.js");

// ideally, this would be a user switch or page triggered
// register when adblocking is necessary, unregister when it isn't
Examiner.register();
Examiner.listen( HuluAdHandler );
Examiner.listen( HuluAdTimeoutHandler );
