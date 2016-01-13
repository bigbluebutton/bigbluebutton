let calculateFontAndWidth, getRenderedTextSize;
let bind = function(fn, me) {
  return function() {
    return fn.apply(me, arguments);
  };
};

this.WhiteboardPollModel = (function() {
  class WhiteboardPollModel extends WhiteboardToolModel {
    constructor(paper1) {
      super(paper1);
      this.paper = paper1;
      this.make = bind(this.make, this);
      this.definition = [0, 0, 0, 0, "#333333", "2px", "#ffffff"];
    }

    make(startingData) {
      let backgroundColor, barHeight, barWidth, calcFontSize, calculatedData, centerCell, color, height, horizontalPadding, i, k, l, leftCell, m, magicNumber, maxBarWidth, maxDigitWidth, maxLeftWidth, maxLineHeight, maxNumVotes, maxRightWidth, n, objects, percResult, ref, ref1, ref2, ref3, ref4, ref5, rightCell, svgNSi, tempSpanEl, tempTextNode, textArray, thickness, verticalPadding, votesTotal, width, x, x1, x2, xBar, xLeft, xNumVotes, xNumVotesDefault, xNumVotesMovedRight, xRight, y, y1, y2, yBar, yLeft, yNumVotes, yRight;
      x1 = startingData.points[0];
      y1 = startingData.points[1];
      x2 = startingData.points[2] + startingData.points[0] - 0.001;
      y2 = startingData.points[3] + startingData.points[1] - 0.001;
      thickness = 2;
      backgroundColor = "#ffffff";
      verticalPadding = 0;
      horizontalPadding = 0;
      calcFontSize = 30;
      votesTotal = 0;
      maxNumVotes = 0;
      textArray = [];
      if(startingData.result != null) {
        for(i = k = 0, ref = startingData.result.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
          votesTotal += startingData.result[i].num_votes;
          if(maxNumVotes < startingData.result[i].num_votes) {
            maxNumVotes = startingData.result[i].num_votes;
          }
          textArray[i] = [];
        }
        for(i = l = 0, ref1 = startingData.result.length - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; i = 0 <= ref1 ? ++l : --l) {
          textArray[i].push(startingData.result[i].key, `${startingData.result[i].num_votes}`);
          if(votesTotal === 0) {
            textArray[i].push("0%");
          } else {
            percResult = startingData.result[i].num_votes / votesTotal * 100;
            textArray[i].push(`${Math.round(percResult)}%`);
          }
        }
      }
      if(x2 < x1) {
        ref2 = [x2, x1], x1 = ref2[0], x2 = ref2[1];
      }
      if(y2 < y1) {
        ref3 = [y2, y1], y1 = ref3[0], y2 = ref3[1];
      }
      x = x1 * this.gw + this.xOffset;
      y = y1 * this.gh + this.yOffset;
      width = (x2 * this.gw + this.xOffset) - x;
      height = (y2 * this.gh + this.yOffset) - y;
      this.obj = this.paper.rect(x, y, width, height, 0);
      this.obj.attr("fill", backgroundColor);
      this.obj.attr("stroke-width", 0);
      this.definition = {
        shape: "poll_result",
        data: [x1, y1, x2, y2, this.obj.attrs["stroke"], this.obj.attrs["stroke-width"], this.obj.attrs["fill"]]
      };
      width = width * 0.95;
      height = height - width * 0.05;
      x = x + width * 0.025;
      y = y + width * 0.025;
      this.obj1 = this.paper.rect(x, y, width, height, 0);
      this.obj1.attr("stroke", "#333333");
      this.obj1.attr("fill", backgroundColor);
      this.obj1.attr("stroke-width", zoomStroke(formatThickness(thickness)));
      this.definition = {
        shape: "poll_result",
        data: [x1, y1, x2, y2, this.obj.attrs["stroke"], this.obj1.attrs["stroke-width"], this.obj1.attrs["fill"]]
      };
      calculatedData = calculateFontAndWidth(textArray, calcFontSize, width, height, x, y);
      calcFontSize = calculatedData[0];
      maxLeftWidth = calculatedData[1];
      maxRightWidth = calculatedData[2];
      maxLineHeight = calculatedData[3];
      maxDigitWidth = calculatedData[4];
      maxBarWidth = width * 0.9 - maxLeftWidth - maxRightWidth;
      barHeight = height * 0.75 / textArray.length;
      svgNSi = "http://www.w3.org/2000/svg";
      this.obj2 = this.paper.text(x, y, "");
      this.obj2.attr({
        "fill": "#333333",
        "font-family": "Arial",
        "font-size": calcFontSize
      });
      this.obj2.node.style["text-anchor"] = "start";
      this.obj2.node.style["textAnchor"] = "start";
      leftCell = this.obj2.node;
      while((leftCell != null) && leftCell.hasChildNodes()) {
        leftCell.removeChild(leftCell.firstChild);
      }
      this.obj3 = this.paper.text(x, y, "");
      this.obj3.attr({
        "fill": "#333333",
        "font-family": "Arial",
        "font-size": calcFontSize
      });
      this.obj3.node.style["text-anchor"] = "end";
      this.obj3.node.style["textAnchor"] = "end";
      rightCell = this.obj3.node;
      while((rightCell != null) && rightCell.hasChildNodes()) {
        rightCell.removeChild(rightCell.firstChild);
      }
      leftCell.style['font-size'] = calcFontSize;
      rightCell.style['font-size'] = calcFontSize;
      horizontalPadding = width * 0.1 / 4;
      verticalPadding = height * 0.25 / (textArray.length + 1);
      magicNumber = 3.5;
      yLeft = y + verticalPadding + barHeight / 2 - magicNumber;
      xLeft = x + horizontalPadding + 1;
      xBar = x + maxLeftWidth + horizontalPadding * 2;
      yBar = y + verticalPadding;
      yRight = y + verticalPadding + barHeight / 2 - magicNumber;
      xRight = x + horizontalPadding * 3 + maxLeftWidth + maxRightWidth + maxBarWidth + 1;
      objects = [this.obj, this.obj1, this.obj2, this.obj3];
      for(i = m = 0, ref4 = textArray.length - 1; 0 <= ref4 ? m <= ref4 : m >= ref4; i = 0 <= ref4 ? ++m : --m) {
        tempSpanEl = document.createElementNS(svgNSi, "tspan");
        tempSpanEl.setAttributeNS(null, "x", xLeft);
        tempSpanEl.setAttributeNS(null, "y", yLeft);
        tempSpanEl.setAttributeNS(null, "dy", maxLineHeight / 2);
        tempTextNode = document.createTextNode(textArray[i][0]);
        tempSpanEl.appendChild(tempTextNode);
        leftCell.appendChild(tempSpanEl);
        if(maxNumVotes === 0 || startingData.result[i].num_votes === 0) {
          barWidth = 2;
        } else {
          barWidth = startingData.result[i].num_votes / maxNumVotes * maxBarWidth;
        }
        this.obj4 = this.paper.rect(xBar, yBar, barWidth, barHeight, 0);
        this.obj4.attr("stroke", "#333333");
        this.obj4.attr("fill", "#333333");
        this.obj4.attr("stroke-width", zoomStroke(formatThickness(0)));
        objects.push(this.obj4);
        tempSpanEl = document.createElementNS(svgNSi, "tspan");
        tempSpanEl.setAttributeNS(null, "x", xRight);
        tempSpanEl.setAttributeNS(null, "y", yRight);
        tempSpanEl.setAttributeNS(null, "dy", maxLineHeight / 2);
        tempTextNode = document.createTextNode(textArray[i][2]);
        tempSpanEl.appendChild(tempTextNode);
        rightCell.appendChild(tempSpanEl);
        yBar = yBar + barHeight + verticalPadding;
        yLeft = yLeft + barHeight + verticalPadding;
        yRight = yRight + barHeight + verticalPadding;
      }
      this.obj5 = this.paper.text(x, y, "");
      this.obj5.attr({
        "fill": "#333333",
        "font-family": "Arial",
        "font-size": calcFontSize
      });
      centerCell = this.obj5.node;
      while((centerCell != null) && centerCell.hasChildNodes()) {
        centerCell.removeChild(centerCell.firstChild);
      }
      xNumVotesDefault = x + maxLeftWidth + horizontalPadding * 2;
      xNumVotesMovedRight = xNumVotesDefault + barWidth / 2 + horizontalPadding + maxDigitWidth / 2;
      yNumVotes = y + verticalPadding - magicNumber;
      color = "white";
      for(i = n = 0, ref5 = textArray.length - 1; 0 <= ref5 ? n <= ref5 : n >= ref5; i = 0 <= ref5 ? ++n : --n) {
        if(maxNumVotes === 0 || startingData.result[i].num_votes === 0) {
          barWidth = 2;
        } else {
          barWidth = startingData.result[i].num_votes / maxNumVotes * maxBarWidth;
        }
        if(barWidth < maxDigitWidth + 8) {
          xNumVotes = xNumVotesMovedRight;
          color = "#333333";
        } else {
          xNumVotes = xNumVotesDefault;
          color = "white";
        }
        tempSpanEl = document.createElementNS(svgNSi, "tspan");
        tempSpanEl.setAttributeNS(null, "x", xNumVotes + barWidth / 2);
        tempSpanEl.setAttributeNS(null, "y", yNumVotes + barHeight / 2);
        tempSpanEl.setAttributeNS(null, "dy", maxLineHeight / 2);
        tempSpanEl.setAttributeNS(null, "fill", color);
        tempTextNode = document.createTextNode(startingData.result[i].num_votes);
        tempSpanEl.appendChild(tempTextNode);
        centerCell.appendChild(tempSpanEl);
        yNumVotes = yNumVotes + barHeight + verticalPadding;
      }
      objects.push(this.obj5);
      return objects;
    }

    update(startingData) {}
  }

  return WhiteboardPollModel;
})();

calculateFontAndWidth = function(textArray, calcFontSize, width, height, x, y) {
  let calculatedData, flag, i, j, k, l, len, line, m, maxDigitWidth, maxLeftWidth, maxLineHeight, maxLineWidth, maxRightWidth, ref, ref1, spanHeight, spanWidth, test;
  calculatedData = [];
  maxLineWidth = width / 3;
  maxLineHeight = height * 0.75 / (textArray != null ? textArray.length : void 0);
  flag = true;
  while(flag) {
    flag = false;
    for(i = k = 0, ref = textArray.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      for(j = l = 0, ref1 = textArray[i].length - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
        test = getRenderedTextSize(textArray[i][j], calcFontSize);
        spanWidth = test[0];
        spanHeight = test[1];
        if(spanWidth > maxLineWidth || spanHeight > maxLineHeight) {
          calcFontSize -= 1;
          flag = true;
        }
      }
    }
  }
  calculatedData.push(calcFontSize);
  maxLeftWidth = 0;
  maxRightWidth = 0;
  maxLineHeight = 0;
  for(m = 0, len = textArray.length; m < len; m++) {
    line = textArray[m];
    test = getRenderedTextSize(line[0], calcFontSize);
    spanWidth = test[0];
    spanHeight = test[1];
    if(spanWidth > maxLeftWidth) {
      maxLeftWidth = spanWidth;
    }
    if(spanHeight > maxLineHeight) {
      maxLineHeight = spanHeight;
    }
    test = getRenderedTextSize(line[2], calcFontSize);
    spanWidth = test[0];
    spanHeight = test[1];
    if(spanWidth > maxRightWidth) {
      maxRightWidth = spanWidth;
    }
    if(spanHeight > maxLineHeight) {
      maxLineHeight = spanHeight;
    }
  }
  test = getRenderedTextSize("0", calcFontSize);
  spanWidth = test[0];
  spanHeight = test[1];
  maxDigitWidth = spanWidth;
  calculatedData.push(maxLeftWidth, maxRightWidth, maxLineHeight, maxDigitWidth);
  return calculatedData;
};

getRenderedTextSize = function(string, fontSize) {
  let arrayTest, bBox, el, paper;
  paper = Raphael(0, 0, 0, 0);
  paper.canvas.style.visibility = 'hidden';
  el = paper.text(0, 0, string);
  el.attr("font-family", "Arial");
  el.attr("font-size", fontSize);
  bBox = el.getBBox();
  paper.remove();
  arrayTest = [];
  arrayTest.push(bBox.width);
  arrayTest.push(bBox.height);
  paper.remove();
  return arrayTest;
};
