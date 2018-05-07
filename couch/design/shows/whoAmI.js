"use strict";
function (doc, req) {
    const userCtx = req.userCtx;
    const name=userCtx.name;

    function stash(){
	return {
	    name:name
	};
    }
    
    provides("json", function() {
        return JSON.stringify(stash());
    });

}
