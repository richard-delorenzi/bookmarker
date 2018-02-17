"use strict";
function fontSize(count, total){
    const minSize=75;
    const maxSize=200;
    const m = maxSize-minSize;
    const c = minSize;
    
    /*:tricky:
      if total is 0 then we would get a div by zero, so clip to maxsize
      if total is 1 [log(1) is zero] then we would get a div by zero, so clip to maxsize
    */
    const x = 
	  (total>1)?
	  shapedSize(count, total):
	  1;
    
    const sizeNumber = m*x+c;
    
    return Math.round(sizeNumber)+ "%";
}

function shapedSize(count, total){
    //:tricky: clamp lowest count to 1, to avoid negatives ( count of 0 is not displayed anyway).
    const normalised_count=Math.max(1,count);
    
    //:tricky: shaping function must return value 0 to 1
    if (true) //log
	return Math.log(normalised_count) / (Math.log(total));
    if (false) // inbetween( almost linear
	return Math.log(normalised_count) * count / (Math.log(total)*total);
    if (false) //linear
		return (count-1) / (total-1);
}

function calcTagSizes( list, maxCount ) {
    list.forEach( function( element, index, array) {
	element["fontSize"]=fontSize(element.count, maxCount);
    });
}

exports.calcTagSizes = calcTagSizes;
