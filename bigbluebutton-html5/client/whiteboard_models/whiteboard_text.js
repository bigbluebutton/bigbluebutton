// A text in the whiteboard
this.WhiteboardTextModel = (function () {
  let checkDashPosition, checkWidth;

  class WhiteboardTextModel extends WhiteboardToolModel {
    constructor(paper) {
      super(paper);
      this.paper = paper;

      // the defintion of this shape, kept so we can redraw the shape whenever needed
      // format: x, y, width, height, colour, fontSize, calcFontSize, text
      this.definition = [0, 0, 0, 0, '#000', 0, 0, ''];
    }

    // Make a text on the whiteboard
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
        shape: 'text',
        data: [x, y, width, height, colour, fontSize, calcFontSize, text],
      };

      //calcFontSize = (calcFontSize/100 * @gh)
      x = (x * this.gw) + this.xOffset;
      y = (y * this.gh) + this.yOffset + calcFontSize;
      width = width / 100 * this.gw;
      this.obj = this.paper.text(x / 100, y / 100, '');
      this.obj.attr({
        fill: colour,
        'font-family': 'Arial', // TODO: make dynamic
        'font-size': calcFontSize,
      });
      this.obj.node.style['text-anchor'] = 'start'; // force left align
      this.obj.node.style['textAnchor'] = 'start'; // for firefox, 'cause they like to be different
      return this.obj;
    }

    // Update text shape drawn
    // @param  {object} the object containing the shape info
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
      if (this.obj != null) {
        this.definition.data = [x, y, maxWidth, height, colour, fontSize, calcFontSize, myText];
        calcFontSize = calcFontSize / 100 * this.gh;
        x = (x * this.gw) / 100 + this.xOffset;
        maxWidth = maxWidth / 100 * this.gw;
        this.obj.attr({
          fill: colour,
          'font-family': 'Arial', // TODO: make dynamic
          'font-size': calcFontSize,
        });
        cell = this.obj.node;
        while ((cell != null) && cell.hasChildNodes()) {
          cell.removeChild(cell.firstChild);
        }

        // used code from textFlow lib http://www.carto.net/papers/svg/textFlow/
        // but had to merge it here because "cell" was bigger than what the stack could take

        //extract and add line breaks for start
        dashArray = new Array();
        dashFound = true;
        indexPos = 0;
        cumulY = 0;
        svgNS = 'http://www.w3.org/2000/svg';
        while (dashFound === true) {
          result = myText.indexOf('-', indexPos);
          if (result === -1) {
            //could not find a dash
            dashFound = false;
          } else {
            dashArray.push(result);
            indexPos = result + 1;
          }
        }

        //split the text at all spaces and dashes
        words = myText.split(/[\s-]/);
        line = '';
        dy = 0;
        curNumChars = 0;
        computedTextLength = 0;
        myTextNode = void 0;
        tspanEl = void 0;
        i = 0;

        //checking if any of the words exceed the width of a textBox
        words = checkWidth(words, maxWidth, x, dy, cell);
        while (i < words.length) {
          word = words[i];
          curNumChars += word.length + 1;
          if (computedTextLength > maxWidth || i === 0) {
            if (computedTextLength > maxWidth) {
              tempText = tspanEl.firstChild.nodeValue;
              tempText = tempText.slice(0, tempText.length - words[i - 1].length - 2); //the -2 is because we also strip off white space
              tspanEl.firstChild.nodeValue = tempText;
            }

            //setting up coordinates for the first line of text
            if (i === 0) {
              dy = calcFontSize;
              cumulY += dy;
            }

            //alternatively one could use textLength and lengthAdjust, however, currently this is not too well supported in SVG UA's
            tspanEl = document.createElementNS(svgNS, 'tspan');
            tspanEl.setAttributeNS(null, 'x', x);
            tspanEl.setAttributeNS(null, 'dy', dy);
            myTextNode = document.createTextNode(line);
            tspanEl.appendChild(myTextNode);
            cell.appendChild(tspanEl);
            if (checkDashPosition(dashArray, curNumChars - 1)) {
              line = `${word}-`;
            } else {
              line = `${word} `;
            }

            if (i !== 0) {
              line = `${words[i - 1]} ${line}`;
            }

            dy = calcFontSize;
            cumulY += dy;
          } else {
            if (checkDashPosition(dashArray, curNumChars - 1)) {
              line += `${word}-`;
            } else {
              line += `${word} `;
            }
          }

          tspanEl.firstChild.nodeValue = line;
          computedTextLength = tspanEl.getComputedTextLength() + 10;
          if (i === words.length - 1) {
            if (computedTextLength > maxWidth) {
              tempText = tspanEl.firstChild.nodeValue;
              tspanEl.firstChild.nodeValue = tempText.slice(0, tempText.length - words[i].length - 1);
              tspanEl = document.createElementNS(svgNS, 'tspan');
              tspanEl.setAttributeNS(null, 'x', x);
              tspanEl.setAttributeNS(null, 'dy', dy);
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

  //this function checks if there should be a dash at the given position, instead of a blank
  checkDashPosition = function (dashArray, pos) {
    let i, result;
    result = false;
    i = 0;
    while (i < dashArray.length) {
      if (dashArray[i] === pos) {
        result = true;
      }

      i++;
    }

    return result;
  };

  //this function checks the width of the word and adds a " " if the width of the word exceeds the width of the textbox
  //in order for the word to be split and shown properly
  checkWidth = function (words, maxWidth, x, dy, cell) {
    let count, num, partWord, start, str, svgNSi, temp, temp3, tempArray, tempSpanEl, tempTextNode, tempWord;
    count = 0;
    temp = words;
    temp3 = [];
    str = '';
    svgNSi = 'http://www.w3.org/2000/svg';
    tempSpanEl = document.createElementNS(svgNSi, 'tspan');
    tempSpanEl.setAttributeNS(null, 'x', x);
    tempSpanEl.setAttributeNS(null, 'dy', dy);
    tempTextNode = document.createTextNode(str);
    tempSpanEl.appendChild(tempTextNode);
    num = 0;

    //creating a textNode and adding it to the cell to check the width
    while (num < temp.length) {
      tempSpanEl.firstChild.nodeValue = temp[num];
      cell.appendChild(tempSpanEl);

      //if width is bigger than maxWidth + whitespace between textBox borders and a word
      if (tempSpanEl.getComputedTextLength() + 10 > maxWidth) {
        tempWord = temp[num];
        cell.removeChild(cell.firstChild);

        //initializing temp variables
        count = 1;
        start = 0;
        partWord = `${tempWord[0]}`;
        tempArray = [];

        //check the width by increasing the word character by character
        while (count < tempWord.length) {
          partWord += tempWord[count];
          tempSpanEl.firstChild.nodeValue = partWord;
          cell.appendChild(tempSpanEl);
          if (tempSpanEl.getComputedTextLength() + 10 > maxWidth) {
            temp3.push(partWord.substring(0, partWord.length - 1));
            partWord = '';
            partWord += tempWord[count];
          }

          if (count === tempWord.length - 1) {
            temp3.push(partWord);
          }

          while ((cell != null) && cell.hasChildNodes()) {
            cell.removeChild(cell.firstChild);
          }

          count++;
        }
      } else {
        temp3.push(temp[num]);
      }

      while ((cell != null) && cell.hasChildNodes()) {
        cell.removeChild(cell.firstChild);
      }

      num++;
    }

    while ((cell != null) && cell.hasChildNodes()) {
      cell.removeChild(cell.firstChild);
    }

    return temp3;
  };

  return WhiteboardTextModel;
})();
