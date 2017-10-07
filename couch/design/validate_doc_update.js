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
    //if (v.isAdmin()) return true;

    v.require("type");
    v.unchanged("type");
    
    v.require("created_at");
    v.unchanged("created_at");
    if (newDoc.created_at) v.dateFormat("created_at");

    v.require("author");
    
    switch (newDoc.type)
    {
    case "webmark":
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
}
