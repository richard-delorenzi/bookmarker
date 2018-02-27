"use strict";
function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "webmark"){
	var re = new RegExp('^[^:]+:/+');
	const urlWithoutProtocol = doc.url.replace(re,"");
	emit( [urlWithoutProtocol] ,null);
    }
}

