"use strict";
function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "webmark"){
	const tags = doc.tags;
	tags.forEach ( function (tag) {
	    emit([tag.toLowerCase()],{count:1});
	});
    }
}

