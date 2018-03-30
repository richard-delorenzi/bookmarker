"use strict";
function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "blog"){
	emit( [doc.created_at] ,null);
    }
}

