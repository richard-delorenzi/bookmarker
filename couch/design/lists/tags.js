"use strict";
function (head, req) {
    const ddoc = this;
    const Mustache = require("lib/mustache");
    const List = require("vendor/couchapp/lib/list");
    const path = require("vendor/couchapp/lib/path").init(req);
    const myLib = require("lib/myLib");

    //-----------------------------------------------------------------------------------------

    const template = req.query["template"];
    const title = req.query["title_part1"]+ " " +req.query["title_part2"];

    function stash(){
	var tags =    new Array();
	var maxes = { "tag": -1 };
	
	function fontSize(count, total){
	    const minSize=75;
	    const maxSize=200;
	    const m = maxSize-minSize;
	    const c = minSize;

	    /*:tricky:
	      if total is 0 then we would get a div by zero, so clip to maxsize
	      if total is 1 [log(1) is zero] then we would get a div by zero, so clip to maxsize
	    */
	    const x = 
		  (total>1)?
		  shapedSize(count, total):
		  1;

	    const sizeNumber = m*x+c;

	    return Math.round(sizeNumber)+ "%";
	}

	function shapedSize(count, total){
	    //:tricky: clamp lowest count to 1, to avoid negatives ( count of 0 is not displayed anyway).
	    const normalised_count=Math.max(1,count);

	    //:tricky: shaping function must return value 0 to 1
	    if (true) //log
		return Math.log(normalised_count) / (Math.log(total));
	    if (false) // inbetween( almost linear
		return Math.log(normalised_count) * count / (Math.log(total)*total);
	    if (false) //linear
		return (count-1) / (total-1);
	}

	function calcTagSizes( list, maxCount ) {
	    list.forEach( function( element, index, array) {
		element["fontSize"]=fontSize(element.count, maxCount);
	    });
	}

	function process(row){
	    if (row){
		outputTag ( tags, "tag", "tag", row );
	    }else{
		//post-processing
		calcTagSizes(tags, maxes["tag"]);
	    }
	}

	function outputTag( outputList, input_key, url_prefix, row ) {
	    const count = row.value;
	    const name=row.key[0];
	    maxes[input_key] = Math.max( maxes[input_key], count);
	    
	    outputList.push(
		{
		    count: count,
		    name: name,
		    url: "/" +url_prefix+ "/" +name
		}
	    );
	}
	
	function mainLoop(){
	    var row;
            while (row = getRow() ) {
                process(row);
            }
	    process(null);
        }
	
        mainLoop();
        return {tags:tags, title:title};
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
