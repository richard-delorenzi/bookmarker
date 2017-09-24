// !code  lib/fragments/string_startsWith.js

function is_Design () {
    var id = doc._id;
    var is_design = id.startsWith( "_design/");
    return is_design;
}
