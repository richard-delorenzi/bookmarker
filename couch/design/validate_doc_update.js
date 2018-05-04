function (newDoc, oldDoc, userCtx, secObj) {
    ////////////////////////////////////////////////////////////////
    //helpers
    
    var v = require("lib/validate").init(newDoc, oldDoc, userCtx, secObj);
    var l = function(){}

    l.isAnAuthor = function() {
	//:tricky: checks author role
	return userCtx.roles.indexOf("author") != -1 || v.isAdmin();
    };

    v.onlyAuthor = function() {
	v.assert (l.isAnAuthor(),"You must be an author, to edit.");
	//:tricky: checks author field
	if (false){ //DISABLED - not tested (not coded).
	    if (newDoc.author) {
		enforce(
		    newDoc.author == userCtx.name,
		    "You may only update documents that you own: with author " + userCtx.name);
	    }
	}
    }

    l.isNumber = function(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
    };

    l.isNewOrChanged = function(fieldName) {
	return !oldDoc || oldDoc[fieldName] != newDoc[fieldName]
    }

    v.number = function(fieldName){
	v.assert( l.isNumber(newDoc[fieldName]) ,
		  fieldName+ ": must be a number" );
    };

    ////////////////////////////////////////////////////////////////
    //checks

    // admins can always delete
    if (v.isAdmin()) return true;
    
    //all docs must have these fields
    v.require("type");
    v.unchanged("type");  
    v.require("created_at");
    v.require("author");
    v.onlyAuthor();

    //check time
    if (newDoc.created_at) {
	try {
	    v.unchanged("created_at");
	} catch(err){
	    //:kludge:allow fixup of slighly wrong date format
	    v.assert( oldDoc["created_at"]+"Z" == newDoc["created_at"],
		      "You may not change the 'created_at' field. Except to make it valid, by adding a Z to the end.");
	}
	if ( l.isNewOrChanged("created_at")){
	    v.dateFormat("created_at");
	}
    }
	
    //check type 
    switch (newDoc.type)
    {
	case "webmark":
	    break;
	case "webmark:tag-disable":
	    break;
	case "blog":
	    break;
	default:
	    v.assert(false, "invalid type");
    }

    //rules for webmarks
    if (newDoc.type == "webmark") {
	v.require("name");
	v.require("url");
	v.require("description");
	v.require("is_private");
	v.require("tags");
    }

    //rules for blog
    if (newDoc.type == "blog") {
	v.require("name");
	v.require("content");
	v.require("is_private");
	v.require("tags");
    }

    // rules for disabled tags
    if (newDoc.type == "webmark:tag-disable") {
	v.require("name");
    }
}
