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
