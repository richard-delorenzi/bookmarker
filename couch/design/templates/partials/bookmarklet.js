function selectedText(){
    var t;
    try {
	t= ((window.getSelection && window.getSelection()) ||
	    (document.getSelection && document.getSelection()) ||
	    (document.selection &&
	     document.selection.createRange &&
	     document.selection.createRange().text));
    }
    catch(e){ // access denied on https sites
	t = "";
    }
    return t;
}
	    

location.href='http://bookmarkdb/add'+
    '?url='   +encodeURIComponent(location.href)+
    '&title=' +encodeURIComponent(document.title);
"
