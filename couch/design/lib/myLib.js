function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function addIfdef(stash) {
    switch (typeof(stash))
    {
    case "undefined":
    case "boolean":
    case "number":
    case "string":
        return stash;
    case "function":
        return stash;
        
    case "object":
        switch (Object.prototype.toString.call(stash))
        {
        case "[object Null]":
            return stash;
        case "[object Object]":
            var Result=new Object();
            for ( var i in stash)
            {
                if (typeof stash[i] != "undefined") {
                    Result["ifdef_"+i] = true; 
                }
                Result[i] = addIfdef(stash[i]);
            }
            return Result;
        case "[object Array]":
            var Result=new Array();
            for ( var i in stash)
            {
                Result[i] =  addIfdef(stash[i]);
            }
            return Result;
        default:
            assert(false,"not object or list:" + Object.prototype.toString.call(stash));
        }
    default:
        assert(false,"unhandled type");
    }
}

function listify(i) {
    if ( typeof i == "undefined" ) {
        return null;
    }
    else if (typeof i == "boolean") {
        return i?[true]:[false];
    }
    else if (Array.isArray(i)) {
        return i;
    }
    else {
        return [i]
    }
}

function nullToEmptyString(msg) {
    return (msg==null)?"":msg;
}

function getType (elem) {
  return Object.prototype.toString.call(elem).slice(8, -1);
};


function arrayUnique (a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};



exports.assert = assert;
exports.addIfdef = addIfdef;
exports.listify = listify;
exports.nullToEmptyString = nullToEmptyString;
exports.getType = getType;
exports.arrayUnique = arrayUnique;
