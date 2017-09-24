function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "webmark"){
	emitLinks( [doc.unixdate] ,doc);
    }
}

