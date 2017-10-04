//this is just for debugging, so maybe remove latter

function(doc) { 
    // !code  lib/fragments/isDesignDoc.js
   
    if (!is_Design()){
	emit(doc.type, null);  
    }
};