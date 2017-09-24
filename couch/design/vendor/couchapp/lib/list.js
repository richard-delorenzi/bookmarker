// Helpers for writing server-side _list functions in CouchDB
exports.withRows = function(fun) {
    Result = new Array();
    while ( row = getRow() ) {
	Result.push( fun(row) );
    };
  
    return Result;
}
