function (newDoc, oldDoc, userCtx, secObj) {
    ////////////////////////////////////////////////////////////////
    //helpers
    
    var v = require("lib/validate").init(newDoc, oldDoc, userCtx, secObj);
    var l = function(){}

    l.isAuthor = function() {
	return v.isAdmin() || userCtx.roles.indexOf("author") != -1;
    };

    l.isNumber = function(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
    };

    v.number = function(fieldName){
	v.assert( l.isNumber(newDoc[fieldName]) ,
		  fieldName+ ": must be a number" );
    };

    ////////////////////////////////////////////////////////////////
    //checks

    // admins or owner can always delete
    if (v.isAdmin()) return true;

    v.require("type");
    v.unchanged("type");
    
    v.require("created_at");
    if (newDoc.created_at) {
	v.dateFormat("created_at");
	try {
	    v.unchanged("created_at");
	} catch(err){
	    //:kludge:allow fixup of slighly wrong date format
	    v.assert( oldDoc["created_at"]+"Z" == newDoc["created_at"],
		      "You may not change the 'created_at' field. Except to fix it my adding a Z to the end.");
	}
    }
	
    v.require("author");
    
    switch (newDoc.type)
    {
	case "webmark":
	    break;
	case "webmark:tag-disable":
	    break;
	default:
	    v.assert(false, "invalid type");
    }

    if (newDoc.type == "webmark") {
	v.require("name");
	v.require("url");
	v.require("description");
	v.require("is_private");
	v.require("tags");
    }

    if (newDoc.type == "webmark:tag-disable") {
	v.require("name");
    }
}
