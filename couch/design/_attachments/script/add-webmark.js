/*This function is not the best it could be*/
function htmlDecoded(str){
    const temp=document.createElement("pre");
    temp.innerHTML=str;
    return (str=="") ? "" : temp.firstChild.nodeValue;
}

////////////////////////////////////////////////////////////////

function auto_grow(element) {
    const eh = element.clientHeight;
    element.style.height = "5px";
    const sh= element.scrollHeight;
    element.style.height = Math.max(eh,sh)+"px";
}

_jsonFetch_asyncAjax= function(url, callback){
    $.ajax({
        dataType: "json",
        url: url,
        success: callback
    });
}

//process url string	
function urlQueryParameterByName(name) {
    var match = RegExp(
	'[?&]' + name + '=([^&]*)'
    ).exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function urlPath() {
    return window.location.pathname.split("/");
}

function subsiteFromUrl() {
    return urlPath()[1];
}

function modeFromUrl() {
    return urlPath()[2];
}

function idFromUrl() {
    //Require: urlPath()[2] === "edit"
    return urlPath()[3];
}

////////////////////////////////////////////////////////////////

function addWebMarkModel(){
    const self=this;
    const _jsonFetch = _jsonFetch_asyncAjax;

    self.ko_uuid=ko.observable();
    self.ko_revision=ko.observable();
    self.ko_date=ko.observable();
    self.ko_tags_astext=ko.observable("");
    self.ko_is_private=ko.observable();
    self.ko_user=ko.observable();
    self.ko_url=ko.observable();
    self.ko_title=ko.observable();
    self.ko_description=ko.observable();
    self.ko_type=ko.observable(); 
    self.ko_content=ko.observable("");

    //
    self.ko_similar_urls=ko.observableArray([]);

    function init() {
	if ( modeFromUrl() === "add" ){
            //create guid
	    self.guidMaker = new GuidMaker();
	    self.guidMaker.Guid( function(guid) {
		self.ko_uuid(guid);
	    });
            //get user name
	    _jsonFetch("/whoAmI", function(data){
		self.ko_user(data.name);
	    });

            const url=urlQueryParameterByName("url");
            const title=urlQueryParameterByName("title");
            const description=urlQueryParameterByName("description");
	    const now=new Date().toJSON();

            self.getSimilarUrls(url);
	   
	    self.ko_revision(null);
	    self.ko_date(now);
	    self.ko_tags_astext("");
	    self.ko_is_private(false);
	    if ( subsiteFromUrl() === "webmarks" ){
		self.ko_url(url);
		self.ko_title(title);
		self.ko_description(description);
		self.ko_type("webmark");
	    }else if ( subsiteFromUrl() === "blogs" ){
		self.ko_type("blog");
	    }else{
		
	    }
	    
	}else if ( modeFromUrl() === "edit" ) {
	    const id=idFromUrl();

	    _jsonFetch("/db/" + id, function(data){
                const type=data.type;
                if (type=== "webmark" ){
                    self.getSimilarUrls(data.url);
		    self.ko_url(data.url);
		    self.ko_description(data.description);
		} else if (type==="blog"){
		    self.ko_content(data.content);
		}else{
		    //error
		}
		self.ko_revision(data._rev);
		self.ko_date(data.created_at);
		self.ko_tags_astext(data.tags.join(" "));
		self.ko_is_private(data.is_private);
		self.ko_user(data.author);
		self.ko_title(data.name);
		self.ko_type(type);
	    });
            self.ko_uuid(id);
	}else{
	
	}
    }

    ////////////////////////////////////////////////////////////////
    
    self._getSimilarUrls= function(url){
        const lookup="/webmarks/by-url?"+
              'startkey=["' +url+ '"]&' +
              'endkey=["' +url+ '\ufff0"]';
        _jsonFetch(
            lookup,
            function(data){
                $.each(data.rows, function(index, row){
                    const url=row.key[0];
                    const edit_url= "/webmarks/edit/"+row.id;
                    const name=row.doc.name;
                    self.ko_similar_urls.push({
                        url:url,
                        edit_url:edit_url,
                        name:name
                        });
                });
            }
        );
    };
    self.getSimilarUrls= function(url){
        if (url!=null){
            var re = new RegExp('^[^:]+:/+');
            var full_url=url;
            var urlWithoutProtocol = full_url.replace(re,"");
            self._getSimilarUrls(urlWithoutProtocol);
        }
    };

    init();

    ////////////////////////////////////////////////////////////////

    self.is_Ready=function() {
            return self.ko_uuid() != "" &&
		self.ko_user != "";
    };
    
    self.ko_is_Ready= ko.computed( function() {
        return self.is_Ready();
    },self);

    ////////////////////////////////////////////////////////////////
    
    self.ko_tags=ko.computed(function(){
        const input=self.ko_tags_astext().trim();
        return input==""?
            []:
            input.split(" ");
    },self);
    
    self.data = function() {
	data= {
            name: self.ko_title(),
            created_at: self.ko_date(),
            is_private : self.ko_is_private(),
            author: self.ko_user(),
            tags: self.ko_tags(),
            type: self.ko_type()
        };
	if ( subsiteFromUrl() === "webmarks" ){
	    data.url = self.ko_url();
            data.description = self.ko_description();
	}
        if ( subsiteFromUrl() === "blogs" ){
	    data.content = self.ko_content();
	}
    
        data._rev= self.ko_revision() || undefined;
        return data;
    };
    
    self.ko_json_data=ko.computed(function(){
        const data={
            id:self.ko_uuid(),
            data:self.data()
        };
        return JSON.stringify(data,null,4);
    },self);

    self.ko_json_data_height=ko.computed(function(){
        const txt=self.ko_json_data();
        return (txt.match(/\n/g) || []).length +1;
    },self);
    
    self.json_data = function() {
        return JSON.stringify(self.data());
    };

    if (  subsiteFromUrl() === "blogs" ){
	self.ko_content_preview=ko.pureComputed(function(){
            const md = self.ko_content();
            const html = marked(md);
	    return html;
	},self); /*.extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 400 } });*/
    }
    
    self.save= function() {
        if (self.is_Ready()){
            $.ajax({
                url: "/db/"+self.ko_uuid(),
                type: "PUT",
                data: self.json_data(),
                success: function(responce){
                    $("body form")
                        .replaceWith(
                            "<h2>All Done</h2>"
                        );
                }
            });
        }
    };
}

//start
ko.options.deferUpdates = true;
var model1=new addWebMarkModel();
ko.applyBindings(model1);
