/*
Scripts to create flowText (rectangular) in SVG 1.1 UAs
Copyright (C) <2007>  <Andreas Neumann>
Version 1.0, 2007-02-26
neumann@karto.baug.ethz.ch
http://www.carto.net/
http://www.carto.net/neumann/

----

Documentation: http://www.carto.net/papers/svg/textFlow/

----

current version: 1.0.

1.0 (2007-02-26)
initial release

-------

This ECMA script library is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

This library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this library (lesser_gpl.txt); if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

----

original document site: http://www.carto.net/papers/svg/textFlow/
Please contact the author in case you want to use code or ideas commercially.
If you use this code, please include this copyright header, the included full
LGPL 2.1 text and read the terms provided in the LGPL 2.1 license
(http://www.gnu.org/copyleft/lesser.txt)

-------------------------------

Please report bugs and send improvements to neumann@karto.baug.ethz.ch
If you use this control, please link to the original (http://www.carto.net/papers/svg/textFlow/)
somewhere in the source-code-comment or the "about" of your project and give credits, thanks!

*/

//main function
function textFlow(myText,textToAppend,maxWidth,x,ddy,justified) {
        //extract and add line breaks for start
        var dashArray = new Array();
        var dashFound = true;
        var indexPos = 0;
        var cumulY = 0;
        while (dashFound == true) {
                var result = myText.indexOf("-",indexPos);
                if (result == -1) {
                        //could not find a dash
                        dashFound = false;
                }
                else {
                        dashArray.push(result);
                        indexPos = result + 1;
                }
        }
        //split the text at all spaces and dashes
        var words = myText.split(/[\s-]/);
        var line = "";
        var dy = 0;
        var curNumChars = 0;
        var computedTextLength = 0;
        var myTextNode;
        var tspanEl;
        var lastLineBreak = 0;
        
        for (i=0;i<words.length;i++) {
                var word = words[i];
                curNumChars += word.length + 1;
                if (computedTextLength > maxWidth || i == 0) {
                        if (computedTextLength > maxWidth) {
                             var tempText = tspanEl.firstChild.nodeValue;
                             tempText = tempText.slice(0,(tempText.length - words[i-1].length - 2)); //the -2 is because we also strip off white space
                             tspanEl.firstChild.nodeValue = tempText;
                             if (justified) {
                               //determine the number of words in this line
                               var nrWords = tempText.split(/\s/).length;
                               computedTextLength = tspanEl.getComputedTextLength();
                               var additionalWordSpacing = (maxWidth - computedTextLength) / (nrWords - 1);
                               tspanEl.setAttributeNS(null,"word-spacing",additionalWordSpacing);
                               //alternatively one could use textLength and lengthAdjust, however, currently this is not too well supported in SVG UA's
                             }
                        }
                        tspanEl = document.createElementNS(svgNS,"tspan");
                        tspanEl.setAttributeNS(null,"x",x);
                        tspanEl.setAttributeNS(null,"dy",dy);
                        myTextNode = document.createTextNode(line);
                        tspanEl.appendChild(myTextNode);
                        textToAppend.appendChild(tspanEl);
                        
                        if(checkDashPosition(dashArray,curNumChars-1)) {
                           line = word + "-";
                        }
                        else {
                           line = word + " ";
                        }
                        if (i != 0) {
                           line = words[i-1] + " " + line;
                        }
                        dy = ddy;
                        cumulY += dy;
                 }
                else {
                        if(checkDashPosition(dashArray,curNumChars-1)) {
                                line += word + "-";
                        }
                        else {
                                line += word + " ";
                        }
                }
                tspanEl.firstChild.nodeValue = line;
                computedTextLength = tspanEl.getComputedTextLength();
                if (i == words.length - 1) {
                  if (computedTextLength > maxWidth) {
                    var tempText = tspanEl.firstChild.nodeValue;
                    tspanEl.firstChild.nodeValue = tempText.slice(0,(tempText.length - words[i].length - 1));
                    tspanEl = document.createElementNS(svgNS,"tspan");
                    tspanEl.setAttributeNS(null,"x",x);
                    tspanEl.setAttributeNS(null,"dy",dy);
                    myTextNode = document.createTextNode(words[i]);
                    tspanEl.appendChild(myTextNode);
                    textToAppend.appendChild(tspanEl);
                  }
                
                }
        }
        return cumulY;
}

//this function checks if there should be a dash at the given position, instead of a blank
function checkDashPosition(dashArray,pos) {
        var result = false;
        for (var i=0;i<dashArray.length;i++) {
                if (dashArray[i] == pos) {
                        result = true;
                }
        }
        return result;
}