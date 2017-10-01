
//class not used
function autoUpdateModel(data) {
    if (viewModel == null){
        viewModel = ko.mapping.fromJS(data);
        ko.applyBindings(viewModel);
    }else{
        ko.mapping.fromJS(data,viewModel);
    }
}

//----------------------------------------------------------------
//class KnockoutModelSynchronizedToCouchdb

function KnockoutModelSynchronizedToCouchdb(){
    var self=this;

    self.table = new Object();
    self.table["rows"] = ko.observableArray();   

    self.guidMaker = new GuidMaker();
    self.foreignKeys= new ForeignKeys();
    self.tableDescriptions= new TableDescriptions();

    self._jsonFetch = _jsonFetch_asyncAjax;

    _koSubscribe( self.ViewUrl(), function(newValue) {
        self.load(newValue);
    });

    ko.applyBindings(self);
};

KnockoutModelSynchronizedToCouchdb.prototype.ViewUrl=function(){
    var self=this;
    var result =  self.tableDescriptions.viewUrl();
    return result;
};

KnockoutModelSynchronizedToCouchdb.prototype.load = function(url){
    var self=this;
    self._jsonFetch(url, self._updateModelFromView.bind(self));
};

KnockoutModelSynchronizedToCouchdb.prototype._updateModelFromView= function(data) {
    var self=this;
    var rows=data["rows"];

    self.table["rows"].removeAll(); 
    
    $.each(rows, function(index, row) {
        self.addRow(row["doc"]);
    });
};

KnockoutModelSynchronizedToCouchdb.prototype.addRow= function(row){
    var self=this;
    var value = new Object();
    var original = new Object();

    var cols=self.tableDescriptions.uiColumns()();
    $.each(cols, function(index, v) {
        var name = v.dbName;
        value[name] = ko.observable();
        original[name] = ko.observable();
    });

    $.each(row, function(index, v) {
	_koSetOrCreateObservable(value,    index, row[index]);
	_koSetOrCreateObservable(original, index, row[index]);
    });
    
    var o = new Object();
    
    o["value"]=value;
    o["original"]=original;

    var rev = ko.computed( function(){
        var row = this;
        var rev = row.value["_rev"]()
        return rev==null?null:rev.split("-")[0];
    }, o);
    o["rev"]=rev;
    
    var isChanged = ko.computed(function() {
        var row = this;
        var result = (row.rev() == null);
        $.each(row.value, function(index,v) {
            result = result || (row.value[index]() != row.original[index]());
        });
        return result;
    }, o);
    o["isChanged"]=isChanged;
    
    self.table.rows.push(o);
};

KnockoutModelSynchronizedToCouchdb.prototype.newRow= function(){
    var self=this;
    self.guidMaker.Guid( function(guid) {
        var table=self.tableDescriptions._rawThisType();

        var row = {
            _id:guid,
            _rev:undefined,
            type: table.type
        };
        
        $.each(table.columns, function(index, column) {
            row[column.dbName]=column.defaultValue;
        });
        
        self.addRow(row);
    });
};

KnockoutModelSynchronizedToCouchdb.prototype.revertFromUndo= function(){
    var self=this;
    $.each(self.table.rows(), function(index, row) {
        self.revertRowFromUndo(row);
    });
};

KnockoutModelSynchronizedToCouchdb.prototype.commitRowToUndo= function(row) {
    var self=this;
    self._copyRow(row, "value", "original");
};

KnockoutModelSynchronizedToCouchdb.prototype.revertRowFromUndo= function(row){
    var self=this;
    self._copyRow(row, "original", "value");
};

KnockoutModelSynchronizedToCouchdb.prototype._copyRow= function(row, from, to) {
    var self=this;
    $.each(row[from], function(index, v) {
        var newValue= v();
        row[to][index](newValue);
    });
};

KnockoutModelSynchronizedToCouchdb.prototype.save= function(){
    var self=this;
    function f(index, row){
        jsRow=ko.toJS(row)
        if (jsRow.isChanged) {
            var value= jsRow.value;
            $.ajax({
                url: "db/"+value._id, 
                type: "put",
                data: JSON.stringify(value),
                success:  function(responce) {
                    var rev=responce["rev"];
                    var value = row.value;
                    value["_rev"](rev);
		    self.commitRowToUndo(row);
                }
            });
        }
    }

    $.each(self.table.rows(), f);
};

KnockoutModelSynchronizedToCouchdb.prototype.row = function(f_row, rows) {
    var self=this;
    return ko.computed( function(){
        $.each( rows(), function(index, row) {
            if(self.cmp( f_row, row )) {
                return [row];
            }
        } );
        return [];
    });
}

KnockoutModelSynchronizedToCouchdb.prototype.cmp = function( f_row, row ){
    var self=this;
    var f_id = f_row.id;
    var s_id = row.value.ride();
    var result = f_id == s_id;
    return result;
}

//----------------------------------------------------------------
//class TableDescriptions

function TableDescriptions() {
    var self=this;
    self.viewId=ko.observable(null);
    self._newObservableArray = _newKoArray;
    self._newObservable = _newKo;
    self._jsonFetch = _jsonFetch_asyncAjax;

    self._managerMenu = self._newObservableArray();
    self._uiColumns = self._newObservableArray();
    self._meta = self._newObservable();
    
    self._load();
};

TableDescriptions.prototype._load= function(){
    var self=this;

    self._jsonFetch(
	"/table-descriptions",
	function( data ) {
            self._data=data;
	   
	    self.calculateManagerMenu();
	    _koSubscribe( self.viewId, function(newValue) {
		self.calculateUiColumns();
		self.calculateMeta();
	    });
	}
    );
};

TableDescriptions.prototype._commonColumns=function(){
    var self=this;
    return self._data.common.columns;
};

TableDescriptions.prototype.calculateUiColumns=function(){
    var self=this;
    self._uiColumns.removeAll();
    $.each(self._commonColumns(), function(index, col) {
	self._uiColumns.push(col);
    });
    $.each(self._rawThisType().columns, function(index, col) {
	self._uiColumns.push(col);
    });
};

TableDescriptions.prototype.uiColumns=function(){
    var self=this;
    return self._uiColumns;
};

TableDescriptions.prototype.calculateManagerMenu=function(){
    var self=this;
    $.each(self._data.managerMenu, function(index, row){
	self._managerMenu.push(row);
    });
};

TableDescriptions.prototype.managerMenu=function(){
    var self=this;
    return self._managerMenu;
};

TableDescriptions.prototype._rawThisType=function() {
    var self=this;
    return self._data.types[self.viewId()];
};

TableDescriptions.prototype.calculateMeta=function() {
    var self=this;
    self._meta( self._rawThisType().meta );
};

TableDescriptions.prototype.meta=function(name) {
    var self=this;
    return ko.computed( function() {
	var meta = self._meta();
	return meta ? meta[name] : null;
    },this );
};

TableDescriptions.prototype.viewUrl=function() {
    var self=this;
    return self.meta("view");
};

TableDescriptions.prototype.each=function() {
    var self=this;
    return self.meta("each");
};

//----------------------------------------------------------------
//standalone private methods

_jsonFetch_asyncAjax= function(url, callback){
    $.ajax({
        dataType: "json",
        url: url,
        success: callback
    });
}

_newKoArray = function() {
    return ko.observableArray();
}

_newKo = function() {
    return ko.observable();
}

_koSubscribe = function(observable, callback){
    observable.subscribe( callback );
    
    if (observable()) {
        observable.valueHasMutated();
    }
}

_koSetOrCreateObservable = function(parentObject, newName, newValue){
    if (parentObject[newName]){
	parentObject[newName](newValue);
    }else{
	parentObject[newName] = ko.observable(newValue);
    }
}

_findInArray = function( array, key ) {
    $.each(array, function(index, item) {
	//if (item.value.Guid
    });
    return null;
}

//----------------------------------------------------------------
//class ForeignKeys

function ForeignKeys(){
    var self=this;
    self._jsonFetch = _jsonFetch_asyncAjax;
    self._newObservableArray = _newKoArray;
    self._values= new Array();
}

ForeignKeys.prototype._load= function(type){
    var self=this;
    if ( !self._values[type] ){ //once
        self._values[type] = self._newObservableArray();
	self._jsonFetch(
	    "/view/name-by-type/"+type,
	    function( data ) {
                $.each(data.rows, function(index, row) {
                    self._values[type].push(row);
                });
	    }
	);
    }
};

ForeignKeys.prototype.values= function(type){
    var self=this;
    self._load(type);
    var result = self._values[type];
    return result;
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
