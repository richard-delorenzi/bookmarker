function  (head, req) {
    var ddoc = this;

    var dir=req.query["~dir"];
    var name=req.query["~name"];

    var Result="";

    function process(row){
	if (row.doc) {
            Result = row.doc[dir][name]; 
	} 
    }
    
    function mainLoop(){
        while (row = getRow() ) {
            process(row);
        }
    }
    
    mainLoop();

    send( Result);
}
