"use strict";
function (doc, req) {
    const ddoc = this;
    const Mustache = require("lib/mustache");
    const List = require("vendor/couchapp/lib/list");
    const path = require("vendor/couchapp/lib/path").init(req);
    const myLib = require("lib/myLib");

//-----------------------------------------------------------------------------------------

    const request=req.requested_path;
    const docId= (doc!=null)? doc._id : null;
    const template = req.query["template"];
    const subSite = req.query["subSite"];
    
    function is_string(m) {
	return (typeof m === 'string' || m instanceof String);
    }


    function stash(){
	var stash={
	    title:doc.name,
	    content:doc.content,
	    author:doc.author,
	    created_at:doc.created_at,
	    tags:doc.tags,
	    subSite: subSite
	};

	return stash;
    }



    //-- The provides function serves the format the client requests.
    //-- The first matching format is sent, so reordering functions changes 
    //-- thier priority. In this case HTML is the preferred format, so it comes first.
    provides("html", function() {
        return Mustache.to_html(ddoc.templates[template],  myLib.addIfdef(stash()), ddoc.templates.partials);
    });

    provides("json", function() {
        return JSON.stringify(stash());
    });
};
