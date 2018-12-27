"use strict";
function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "image"){
	emit( [doc.created_at] ,null);
    }
}

