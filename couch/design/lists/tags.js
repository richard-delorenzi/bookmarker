function (head, req) {
    var ddoc = this;
    var Mustache = require("lib/mustache");
    var List = require("vendor/couchapp/lib/list");
    var path = require("vendor/couchapp/lib/path").init(req);
    var myLib = require("lib/myLib");

//-----------------------------------------------------------------------------------------

    template = req.query["template"];
    title = req.query["title_part1"]+ " " +req.query["title_part2"] ;

    function stash(){
	var the_stash=[];

	
        function row_info(row){
	    name=row.key[0];
	    return {
		name: name,
		url: "/tag/" + name,
		size: row.value
	    }
	}
	 
	function mainLoop(){
            while (row = getRow() ) {
                 the_stash.push(row_info(row));
            }
        }
	
        mainLoop();
        return {bookmarks:the_stash, title:title};
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
