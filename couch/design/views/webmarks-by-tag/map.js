"use strict";
function(doc) {
    // !code  lib/fragments/isDesignDoc.js

    const date_time = doc.created_at;
    const date=date_time.split("T")[0];
    
    if (!is_Design() && doc.type == "webmark"){
	const tags = doc.tags;
	tags.forEach ( function (tag) {
	    emit([tag.toLowerCase(),date],{count:1});
	});
    }
    if (!is_Design() && doc.type == "webmark:tag-disable"){
	//:tricky: the -infinity and -Number.MAX_VALUE do not work
	// they just output null.
	emit( [doc.name.toLowerCase(),date],
	      {count:-32768} );
    }
}

