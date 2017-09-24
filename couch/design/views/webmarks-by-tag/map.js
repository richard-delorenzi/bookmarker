function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "webmark"){
	tags = doc.tags;
	tags.forEach ( function (tag) {
	    emit([tag],{count:1});
	});
    }
}

