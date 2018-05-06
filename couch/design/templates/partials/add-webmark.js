/*This function is not the best it could be*/
function htmlDecoded(str){
    const temp=document.createElement("pre");
    temp.innerHTML=str;
    return (str=="") ? "" : temp.firstChild.nodeValue;
}

//----------------------------------------------------------------
//class GuidMaker

function GuidMaker(){
    var self=this;
    self.emptyThreshold=5;
    self.fetchQuantity=16;

    self.url="/_uuids?count="+self.fetchQuantity;

    self.requests1= -self.fetchQuantity;
    self.requests2= -self.fetchQuantity;
    self.guids=[];
    self.ajax=new Array();
    self._getSomeGuids();
};

GuidMaker.prototype._getSomeGuids= function(){
    var self=this;

    r=$.ajax({
        dataType: "json",
        url: self.url,
        cache: false,
        success: function( data ) {
            self.guids=$.merge(self.guids, data.uuids);
        }
    });
    self.ajax.push(r);
};

GuidMaker.prototype._nextGuid= function(){
    var self=this;
    var result= self.guids.pop();
    return result;
};

GuidMaker.prototype.Guid= function(callback){
    var self=this;

    self.requests1 += 1;
    self.requests2 += 1;

    if ( self.requests1 > -self.emptyThreshold )
    {
        self.requests1 -= self.fetchQuantity;
        self._getSomeGuids();
    }

    if ( self.requests2 > 0 )
    {
        self.requests2 -= self.fetchQuantity;
        self.ajax.shift();
    }
    
    $.when(self.ajax[0]).then(
        function() {
            callback(self._nextGuid());
        }
    );
};

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


////////////////////////////////////////////////////////////////

function addWebMarkModel(){
    const self=this;
    const now=new Date().toJSON();
    const date= "{{bm_created_at}}" || now;
    const _jsonFetch = _jsonFetch_asyncAjax;


    self.ko_title=ko.observable(htmlDecoded("{{bm_name}}"));
    self.ko_url=ko.observable(htmlDecoded("{{bm_url}}"));
    self.ko_description=ko.observable(htmlDecoded("{{bm_description}}"));
    self.ko_content=ko.observable(`{{bm_content}}`);
    self.ko_tags_astext=ko.observable("{{bm_tags_asText}}");
    self.ko_user=ko.observable("{{bm_author}}");
    self.ko_date=ko.observable(date);
    self.ko_is_private=ko.observable({{bm_is_private}});
    self.ko_revision=ko.observable("{{bm_rev}}");
    self.ko_uuid=ko.observable("{{docId}}");
    self.ko_type=ko.observable("{{bm_type}}");
    self.ko_similar_urls=ko.observableArray([]);
        
    self.is_uuidReady= function() {
        return  self.ko_uuid() != "";
    };
    
    if ( !self.is_uuidReady() ){
        self.guidMaker = new GuidMaker();
        self.guidMaker.Guid( function(guid) {
            self.ko_uuid(guid);
        });
    }

    self.ko_is_uuidReady= ko.computed( function() {
        return  self.ko_uuid() != "";
    },self);
    
    self.ko_tags=ko.computed(function(){
        const input=self.ko_tags_astext();
        return input==""?
            []:
            input.split(" ");
    },self);
    
    self.data = function() {
	data= {
	    zzzz1: window.location,
	    sibsite:  subsiteFromUrl(),
	    mode: modeFromUrl(),
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
        if (self.is_uuidReady()){
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
