"use strict";
function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "webmark"){
	const tags = doc.tags;
	const date_time = doc.created_at;
	const date=date_time.split("T")[0];
	tags.forEach ( function (tag) {
	    emit([tag.toLowerCase(),date],{count:1});
	});
    }
}

