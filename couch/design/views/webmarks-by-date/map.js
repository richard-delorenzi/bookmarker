function(doc) {
    // !code  lib/fragments/isDesignDoc.js
    
    if (!is_Design() && doc.type == "webmark"){
	emit( [doc.unix_date] ,doc);
    }
}

