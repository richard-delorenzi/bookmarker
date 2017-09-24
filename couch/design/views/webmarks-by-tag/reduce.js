function (key, values, rereduce) {
    if (rereduce) {
	return sum(values);
    } else {
	var Result = values.reduce( function(a,b) {
	    return { 
		count: (a["count"] + b["count"]) 
	    };
	});
	return Result["count"];
    }
}