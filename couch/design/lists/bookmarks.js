function (head, req) {
    var ddoc = this;
    var Mustache = require("lib/mustache");
    var List = require("vendor/couchapp/lib/list");
    var path = require("vendor/couchapp/lib/path").init(req);
    var myLib = require("lib/myLib");

//-----------------------------------------------------------------------------------------

    template = req.query["template"];
    key = req.query["key"]

    function stash(){
	var the_stash=[];

	
        function row_info(row){
	    return {
		url : row.doc.url,
		name: row.doc.name,
		tags: row.doc.tags,
		date: row.doc.unix_date
	    }
	}
	 
	function mainLoop(){
            while (row = getRow() ) {
                the_stash.push(row_info(row));
            }
        }
	
        mainLoop();
        return {bookmarks:the_stash, title:"Bookmarks"};
    }



    //-- The provides function serves the format the client requests.
    //-- The first matching format is sent, so reordering functions changes 
    //-- thier priority. In this case HTML is the preferred format, so it comes first.

    if (true) {
    provides("html", function() {
        return Mustache.to_html(ddoc.templates[template],  myLib.addIfdef(stash()), ddoc.templates.partials);
    });
    }

    provides("json", function() {
        return JSON.stringify(stash());
    });   
};
