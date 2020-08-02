"use strict";
function (head, req) {
    const ddoc = this;
    const Mustache = require("lib/mustache");
    const List = require("vendor/couchapp/lib/list");
    const path = require("vendor/couchapp/lib/path").init(req);
    const myLib = require("lib/myLib");
    const myTagSizeLib = require("lib/myTagSizeLib");
    const marked= require("lib/marked");

    //-----------------------------------------------------------------------------------------

    const template = req.query["template"];
    const key = req.query["key"];
    const title = req.query["title_part1"]+ " " +req.query["title_part2"] ;
    const is_tag_mode= (req.query["mode"]=="tags");
    const subSite = req.query["subSite"];
    const hostname = req.headers.Host;

    function stash(){
        var bookmark_stash=[];
        var tag_stash={};
        var maxTagCount = -1;

        function tagToUrl(tag){
            return "tag/" + encodeURIComponent(tag.toLowerCase());
        }
        function linkedTagsFromNames(tags){
            var out=[];
            tags.forEach( function (tag) {
                out.push({
                    name: tag,
                    url: tagToUrl(tag)
                });
            });
            return out;
        }
        function tagExists(item){
            return (item in tag_stash);
        }
        function addTag(tag){
            if (!tagExists(tag)){
                tag_stash[tag]=1;
            }else{
                var count = tag_stash[tag]+1
                tag_stash[tag]=count;
                maxTagCount = Math.max( maxTagCount, count);
            }
        }
        function addTags(tags){
            tags.forEach( function (tag) {
                addTag(tag);
            });
        }
        function LinkedSizedTagsFromNameAndFrequency(tags){
            var result=[];
            for (var key in tags) {
                // check if the property/key is defined in the object itself, not in parent
                if (tags.hasOwnProperty(key)) {
                    const entry={
                        name: key,
                        url: tagToUrl(key),
                        count: tags[key]
                    };
                    result.push(entry);
                }
            }
            return result;
        }

        var prevDate=null;
        function row_info(row){
            const date = row.doc.created_at.split("T")[0];
            const date_stash = {date: date};
            const edit_url= "edit/"+row.id;
            const tags=row.doc.tags;

            addTags(tags);

            const link= (subSite ==="blog")
                ?"blog/"+row.id
                  :undefined;
            const main_stash ={
                main:{
                    name: row.doc.name,
                    url : row.doc.url,
                    link: link,
                    tags: linkedTagsFromNames(tags),
                    description: row.doc.description,
                    edit_url: edit_url
                }
            };

            const Result= ( date != prevDate )?
                  [date_stash,main_stash]:
                  [main_stash];
            
            prevDate=date;
            return Result;
        }
        
        function mainLoop(){
            var row;
            while (row = getRow() ) {
                bookmark_stash = bookmark_stash.concat(row_info(row));
            }
        }
        
        mainLoop();

        var related_tags= LinkedSizedTagsFromNameAndFrequency(tag_stash);
        myTagSizeLib.AddTagSizesToDict(related_tags,maxTagCount);

        const testzzzz=marked('I am using __markdown__.');
        
        return {
            title:title,
            hostname:hostname,
            subSite: subSite,
            if_blogs: (subSite==="blog"),
            if_webmarks: (subSite==="webmark"),
            if_read: true,
            bookmarks:bookmark_stash,
            related_tags:related_tags
        };
        
    }



    //-- The provides function serves the format the client requests.
    //-- The first matching format is sent, so reordering functions changes 
    //-- thier priority. In this case HTML is the preferred format, so it comes first.

    if (true) {
        provides("html", function() {
            return Mustache.to_html(ddoc.templates[template],  myLib.addIfdef(stash()), ddoc.templates.partials);
        });
    }

    provides("json", function() {
        return JSON.stringify(stash());
    });   
};
