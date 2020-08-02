"use strict";
function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "image"){
        Object.keys(doc._attachments).forEach(function(key) {
	    emit( [doc.created_at] , key);
        });
    }
}

