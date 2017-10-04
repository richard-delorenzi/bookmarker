function(doc) {  
    // !code  lib/fragments/isDesignDoc.js
   
    if (is_Design()){
	emit(null, null); // use query `include_docs=true`
    }
}