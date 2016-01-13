this.WhiteboardTextModel = (function() {
  let checkDashPosition, checkWidth;

  class WhiteboardTextModel extends WhiteboardToolModel {
    constructor(paper) {
      super(paper);
      this.paper = paper;
      this.definition = [0, 0, 0, 0, "#000", 0, 0, ""];
    }

    make(startingData) {
      let calcFontSize, colour, fontSize, height, text, width, x, y;
      x = startingData.x;
      y = startingData.y;
      width = startingData.textBoxWidth;
      height = startingData.textBoxHeight;
      colour = formatColor(startingData.fontColor);
      fontSize = startingData.fontSize;
      calcFontSize = startingData.calcedFontSize;
      text = startingData.text;
      this.definition = {
        shape: "text",
        data: [x, y, width, height, colour, fontSize, calcFontSize, text]
      };
      x = (x * this.gw) + this.xOffset;
      y = (y * this.gh) + this.yOffset + calcFontSize;
      width = width / 100 * this.gw;
      this.obj = this.paper.text(x / 100, y / 100, "");
      this.obj.attr({
        "fill": colour,
        "font-family": "Arial",
        "font-size": calcFontSize
      });
      this.obj.node.style["text-anchor"] = "start";
      this.obj.node.style["textAnchor"] = "start";
      return this.obj;
    }

    update(startingData) {
      let calcFontSize, cell, colour, computedTextLength, cumulY, curNumChars, dashArray, dashFound, dy, fontSize, height, i, indexPos, line, maxWidth, myText, myTextNode, result, svgNS, tempText, tspanEl, word, words, x, y;
      x = startingData.x;
      y = startingData.y;
      maxWidth = startingData.textBoxWidth;
      height = startingData.textBoxHeight;
      colour = formatColor(startingData.fontColor);
      fontSize = startingData.fontSize;
      calcFontSize = startingData.calcedFontSize;
      myText = startingData.text;
      if(this.obj != null) {
        this.definition.data = [x, y, maxWidth, height, colour, fontSize, calcFontSize, myText];
        calcFontSize = calcFontSize / 100 * this.gh;
        x = (x * this.gw) / 100 + this.xOffset;
        maxWidth = maxWidth / 100 * this.gw;
        this.obj.attr({
          "fill": colour,
          "font-family": "Arial",
          "font-size": calcFontSize
        });
        cell = this.obj.node;
        while((cell != null) && cell.hasChildNodes()) {
          cell.removeChild(cell.firstChild);
        }
        dashArray = new Array();
        dashFound = true;
        indexPos = 0;
        cumulY = 0;
        svgNS = "http://www.w3.org/2000/svg";
        while(dashFound === true) {
          result = myText.indexOf("-", indexPos);
          if(result === -1) {
            dashFound = false;
          } else {
            dashArray.push(result);
            indexPos = result + 1;
          }
        }
        words = myText.split(/[\s-]/);
        line = "";
        dy = 0;
        curNumChars = 0;
        computedTextLength = 0;
        myTextNode = void 0;
        tspanEl = void 0;
        i = 0;
        words = checkWidth(words, maxWidth, x, dy, cell);
        while(i < words.length) {
          word = words[i];
          curNumChars += word.length + 1;
          if(computedTextLength > maxWidth || i === 0) {
            if(computedTextLength > maxWidth) {
              tempText = tspanEl.firstChild.nodeValue;
              tempText = tempText.slice(0, tempText.length - words[i - 1].length - 2);
              tspanEl.firstChild.nodeValue = tempText;
            }
            if(i === 0) {
              dy = calcFontSize;
              cumulY += dy;
            }
            tspanEl = document.createElementNS(svgNS, "tspan");
            tspanEl.setAttributeNS(null, "x", x);
            tspanEl.setAttributeNS(null, "dy", dy);
            myTextNode = document.createTextNode(line);
            tspanEl.appendChild(myTextNode);
            cell.appendChild(tspanEl);
            if(checkDashPosition(dashArray, curNumChars - 1)) {
              line = `${word}-`;
            } else {
              line = `${word} `;
            }
            if(i !== 0) {
              line = `${words[i - 1]} ${line}`;
            }
            dy = calcFontSize;
            cumulY += dy;
          } else {
            if(checkDashPosition(dashArray, curNumChars - 1)) {
              line += `${word}-`;
            } else {
              line += `${word} `;
            }
          }
          tspanEl.firstChild.nodeValue = line;
          computedTextLength = tspanEl.getComputedTextLength() + 10;
          if(i === words.length - 1) {
            if(computedTextLength > maxWidth) {
              tempText = tspanEl.firstChild.nodeValue;
              tspanEl.firstChild.nodeValue = tempText.slice(0, tempText.length - words[i].length - 1);
              tspanEl = document.createElementNS(svgNS, "tspan");
              tspanEl.setAttributeNS(null, "x", x);
              tspanEl.setAttributeNS(null, "dy", dy);
              myTextNode = document.createTextNode(words[i]);
              tspanEl.appendChild(myTextNode);
              cell.appendChild(tspanEl);
            }
          }
          i++;
        }
        return cumulY;
      }
    }
  }

  checkDashPosition = function(dashArray, pos) {
    let i, result;
    result = false;
    i = 0;
    while(i < dashArray.length) {
      if(dashArray[i] === pos) {
        result = true;
      }
      i++;
    }
    return result;
  };

  checkWidth = function(words, maxWidth, x, dy, cell) {
    let count, num, partWord, start, str, svgNSi, temp, temp3, tempArray, tempSpanEl, tempTextNode, tempWord;
    count = 0;
    temp = words;
    temp3 = [];
    str = "";
    svgNSi = "http://www.w3.org/2000/svg";
    tempSpanEl = document.createElementNS(svgNSi, "tspan");
    tempSpanEl.setAttributeNS(null, "x", x);
    tempSpanEl.setAttributeNS(null, "dy", dy);
    tempTextNode = document.createTextNode(str);
    tempSpanEl.appendChild(tempTextNode);
    num = 0;
    while(num < temp.length) {
      tempSpanEl.firstChild.nodeValue = temp[num];
      cell.appendChild(tempSpanEl);
      if(tempSpanEl.getComputedTextLength() + 10 > maxWidth) {
        tempWord = temp[num];
        cell.removeChild(cell.firstChild);
        count = 1;
        start = 0;
        partWord = `${tempWord[0]}`;
        tempArray = [];
        while(count < tempWord.length) {
          partWord += tempWord[count];
          tempSpanEl.firstChild.nodeValue = partWord;
          cell.appendChild(tempSpanEl);
          if(tempSpanEl.getComputedTextLength() + 10 > maxWidth) {
            temp3.push(partWord.substring(0, partWord.length - 1));
            partWord = "";
            partWord += tempWord[count];
          }
          if(count === tempWord.length - 1) {
            temp3.push(partWord);
          }
          while((cell != null) && cell.hasChildNodes()) {
            cell.removeChild(cell.firstChild);
          }
          count++;
        }
      } else {
        temp3.push(temp[num]);
      }
      while((cell != null) && cell.hasChildNodes()) {
        cell.removeChild(cell.firstChild);
      }
      num++;
    }
    while((cell != null) && cell.hasChildNodes()) {
      cell.removeChild(cell.firstChild);
    }
    return temp3;
  };

  return WhiteboardTextModel;
})();
