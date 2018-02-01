"use strict";
function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "webmark"){
	emit( [doc.url] ,null);
    }
}

