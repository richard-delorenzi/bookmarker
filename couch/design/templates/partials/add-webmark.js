/*This function is not the best it could be*/
function htmlDecoded(str){
    const temp=document.createElement("pre");
    temp.innerHTML=str;
    return (str=="") ? "" : temp.firstChild.nodeValue;
}

{{>guidMaker}}

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

function _info() {
    Result = {};
    if ( modeFromUrl() === "add" ){
	Result.tags= "";
	Result.is_private= false;
	Result.rev= null;
	const now=new Date().toJSON();
	Result.date= now;
	if ( subsiteFromUrl() === "webmarks" ){
	    Result.url= urlQueryParameterByName("url");
	    Result.title= urlQueryParameterByName("title");
	    Result.description= urlQueryParameterByName("description");
	    Result.type= "webmark";
	}else if ( subsiteFromUrl() === "blogs" ){
	   
	}else{
	   
	}	
    }else if ( modeFromUrl() === "edit" ) {
	Result.id=idFromUrl();
	Result.date="{{bm_created_at}}";
	Result.content=`{{bm_content}}`;
    }else{
	
    }
    return Result;
}
const info= _info();

////////////////////////////////////////////////////////////////

function addWebMarkModel(){
    const self=this;
    const _jsonFetch = _jsonFetch_asyncAjax;

    self.ko_title=ko.observable(info.title);
    self.ko_url=ko.observable(info.url);
    self.ko_description=ko.observable(info.description);
    self.ko_content=ko.observable(info.content);
    self.ko_tags_astext=ko.observable(info.tags);
    self.ko_user=ko.observable("");
    self.ko_date=ko.observable(info.date);
    self.ko_is_private=ko.observable(info.is_private);
    self.ko_revision=ko.observable(info.rev);
    self.ko_uuid=ko.observable("");
    self.ko_type=ko.observable(info.type);
    self.ko_similar_urls=ko.observableArray([]);

    ////////////////////////////////////////////////////////////////
    //create guid
    self.guidMaker = new GuidMaker();
    self.guidMaker.Guid( function(guid) {
        self.ko_uuid(guid);
    });

    //get user name
    _jsonFetch("/whoAmI", function(data){
	self.ko_user(data.name);
    });

    ////////////////////////////////////////////////////////////////

    self.ko_is_Ready= ko.computed( function() {
        return self.ko_uuid() != "" &&
	    self.ko_user != "";
    },self);

    ////////////////////////////////////////////////////////////////
    
    self.ko_tags=ko.computed(function(){
        const input=self.ko_tags_astext();
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
	self.ko_content_preview=ko.computed(function(){
	    const html = marked(self.ko_content());
	    return html;
	},self);
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

    function _getSimilarUrls(url){      
        const lookup="/webmarks-by-url?"+
              'startkey=["' +url+ '"]&' +
              'endkey=["' +url+ '\ufff0"]'
        _jsonFetch(
            lookup,
            function(data){
                $.each(data.rows, function(index, row){
                    const url=row.key[0];
                    const edit_url= "/edit/"+row.id;
                    self.ko_similar_urls.push({
                        url:url,
                        edit_url:edit_url
                    });
                });
            });
    }
    function getSimilarUrls(){
        var re = new RegExp('^[^:]+:/+');
        var full_url=htmlDecoded("{{bm_url}}");
        var urlWithoutProtocol = full_url.replace(re,"");
        _getSimilarUrls(urlWithoutProtocol);
    }
    getSimilarUrls();
}

ko.applyBindings(new addWebMarkModel());
