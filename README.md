#TODO
  - ✓ bookmarklet should open a popup/other-tab
  - ✓ make tags case insensative
  - ✓ make it so I can edit existing bookmark
  - make it detect when adding an already existing bookmark
  - add tag hierarchy
  - add filters (to hide tags, and bookmarks with these tags)
    - obsolete tag: hides bookmark, does not count tags.
    - obsolete tags list: causes tags to not appear in tag cloud 
       - ✓ add a doc with tag  count of -∞, then don't display any tag with count ≤ 0.
       - add code to add above doc.
       - ( I am now wondering how usefull this is, maybe to hide tags from public view).
  - ✓ add menus to all pages

#Bugfix
  - bugfix: link to ? tag
  - ✓ sometags have trailing space or \n, strip whitespace.
  - ✓ add page broken: I think caused by framing.
  - can not bookmark github (bookmarklet does nothing)
  - can not edit some bookmarks: seems to be older bookmarks, that I imported. It is because of invalid time stamp (no Z at end)