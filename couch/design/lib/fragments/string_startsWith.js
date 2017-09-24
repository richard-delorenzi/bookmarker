if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (sub){
        var self=this;
        return self.substring(0, sub.length) === sub;
    }
};