var PRESENTATION_SERVER = "http://192.168.1.218/";

//object references
slide_obj = document.getElementById("slide");
textbox = document.getElementById('area');
$('#area').autosize();

var gw, gh, cx2, cy2, cx1, cy1, px, py, cx, cy, sw, sh, slides, textx, texty, text,
    paper, cur, s_top, s_left, current_url, ex, ey, ellipse, line, scrollh, scrollw, textoffset,
    current_colour, current_thickness, path, rect, sx, sy, current_shapes, sw_orig, sh_orig, vw, vh, shift_pressed;
var zoom_level = 1, fitToPage = true, path_max = 30,
    path_count = 0, default_colour = "#FF0000", default_thickness = 1,
    dcr = 3;

/**
 * Drawing the thickness viewer for client feedback.
 * No messages are sent to the server, it is completely
 * local. Shows visual of thickness for drawing tools.
 * @param  {number} thickness the thickness value
 * @param  {string} colour    the colour it should be displayed as
 * @return {undefined}
 */
function drawThicknessView(thickness, colour){
  current_thickness = thickness;
  tctx.fillStyle='#FFFFFF';
  tctx.fillRect(0,0,20,20);
  var center = Math.round((20-thickness+1)/2);
  tctx.fillStyle=colour;
  tctx.fillRect(center,center,thickness+1,thickness+1);
}

/**
 * Drawing the colour viewer for client feedback.
 * No messages are sent to the server, it is
 * completely local. Shows colour visual for drawing
 * tools.
 * @param  {string} colour the colour it should be displayed as
 * @return {undefined}
 */
function drawColourView(colour) {
  current_colour = colour;
  ctx.fillStyle = colour;
  cptext.value = colour;
  ctx.fillRect(0,0,12,12);
}

/**
 * Toggles the visibility of the colour picker,
 * which is hidden by default. The picker is a
 * RaphaelJS object, so each node of the object
 * must be shown/hidden individually.
 * @return {undefined}
 */
function toggleColourPicker() {
  if(cpVisible) {
    cpVisible = false;
    cp.raphael.forEach(function(i){ i.hide(); });
  }
  else {
    cpVisible = true;
    cp.raphael.forEach(function(i){ i.show(); });
  }
}

/**
 * Switches the tool and thus the functions that get
 * called when certain events are fired from Raphael.
 * @param  {string} tool the tool to turn on
 * @return {undefined}
 */
function turnOn(tool) {
  current_tool = tool;
  console.log("it's here the tool:"+tool);
  switch(tool) {
    case 'line':
      cur.undrag();
      cur.drag(curDragging, curDragStart, curDragStop);
    break;

    case 'rect':
      cur.undrag();
      cur.drag(curRectDragging, curRectDragStart, curRectDragStop);
    break;

    case 'panzoom':
      cur.undrag();
      cur.drag(panDragging, panGo, panStop);
    break;

    case 'ellipse':
      cur.undrag();
      cur.drag(curEllipseDragging, curEllipseDragStart, curEllipseDragStop);
    break;

    case 'text':
      cur.undrag();
      cur.drag(curRectDragging, curTextStart, curTextStop);
    break;

    default:
      console.log("ERROR: Cannot turn on tool, invalid tool: " + tool);
    break;
  }
}

/**
 * Initializes the "Paper" which is the Raphael term for
 * the entire SVG object on the webpage.
 * @return {undefined}
 */
function initPaper() {
  //paper is embedded within the div#slide of the page.
  paper = paper || Raphael('slide', gw, gh); //create a SVG object using RaphaelJS
  paper.canvas.setAttribute('preserveAspectRatio', 'xMinYMin slice');
  cur = paper.circle(0, 0, dcr);
  cur.attr('fill', 'red');
  $(cur.node).bind('mousewheel', zoomSlide);
  if(slides) {
    rebuildPaper();
  }
  else slides = {}; //if previously loaded

  if (navigator.userAgent.indexOf("Firefox") != -1) {
    paper.renderfix();
  }
}

/**
 * Updates the paper from the server values.
 * @param  {number} cx_ the x-offset value as a percentage of the original width
 * @param  {number} cy_ the y-offset value as a percentage of the original height
 * @param  {number} sw_ the slide width value as a percentage of the original width
 * @param  {number} sh_ the slide height value as a percentage of the original height
 * @return {undefined}
 */
function updatePaperFromServer(cx_, cy_, sw_, sh_) {
  //if updating the slide size (zooming!)
  if(sw_ && sh_) {
    paper.setViewBox(cx_*gw, cy_*gh, sw_*gw, sh_*gh);
    sw = gw/sw_;
    sh = gh/sh_;
  }
  //just panning, so use old slide size values
  else {
    paper.setViewBox(cx_*gw, cy_*gh, paper._viewBox[2], paper._viewBox[3]);
  }
  //update corners
  cx = cx_*sw;
  cy = cy_*sh;
  //update position of svg object in the window
  sx = (vw - gw)/2;
  sy = (vh - gh)/2;
  if(sy < 0) sy = 0; // ??
  paper.canvas.style.left = sx + "px";
  paper.canvas.style.top = sy + "px";
  paper.setSize(gw-2, gh-2);
  //update zoom level and cursor position
  var z = paper._viewBox[2]/gw;
  cur.attr({ r : dcr*z }); //adjust cursor size
  zoom_level = z;
  //force the slice attribute despite Raphael changing it
  paper.canvas.setAttribute('preserveAspectRatio', 'xMinYMin slice');
}

/**
 * Sets the fit to page.
 * @param {boolean} fit fit == true ? -> fit to page. fit == false ? -> fit to width.
 */
function setFitToPage(fit) {
  fitToPage = fit;
  var temp = slides;
  removeAllImagesFromPaper();
  slides = temp;
  rebuildPaper(); //re-add all the images as they should fit differently
  sendPaperUpdate(0, 0, 1, 1); //set to default zoom level
  getShapesFromServer(); //reprocess the shapes
}

/**
 * Add an image to the paper.
 * @param {string} url the URL of the image to add to the paper
 * @param {number} w   the width of the image (in pixels)
 * @param {number} h   the height of the image (in pixels)
 * @return {Raphael.image} the image object added to the whiteboard
 */
function addImageToPaper(url, w, h) {
  console.log("addIMageToPaper show me url:" + url);
  var img;
  if(fitToPage) {
    //solve for the ratio of what length is going to fit more than the other
    var xr = w/vw;
    var yr = h/vh;
    var max = Math.max(xr, yr);
    //fit it all in appropriately
    //temporary solution
    url = PRESENTATION_SERVER + url;
    //img = paper.image(url, cx = 0, cy = 0, gw = w/max, gh = h/max);
    img = paper.image(url, cx = 0, cy = 0, gw = w, gh = h);
    console.log(img);
    //update the global variables we will need to use
    sw = w/max;
    sh = h/max;
    sw_orig = sw;
    sh_orig = sh;
  }
  else {
    //fit to width
    //assume it will fit width ways
    var wr = w/vw;
    img = paper.image(url, cx = 0, cy = 0, w/wr, h/wr);
    sw = w/wr;
    sh = h/wr;
    sw_orig = sw;
    sh_orig = sh;
    gw = sw;
    gh = sh;
  }
  slides[url] = { 'id' : img.id, 'w' : w, 'h' : h};
  if(!current_url) {
    img.toBack();
    current_url = url;
  }
  else if(current_url == url) {
    img.toBack();
  }
  else {
    img.hide();
  }
  img.mousemove(mvingCur);
  $(img.node).bind('mousewheel', zoomSlide);
  return img;
}

/**
 * Removes all the images from the Raphael paper.
 * @return {undefined}
 */
function removeAllImagesFromPaper() {
  var img;
  for (url in slides) {
    if(slides.hasOwnProperty(url)) {
      paper.getById(slides[url].id).remove();
      $('#preload' + slides[url].id).remove();
    }
  }
  slides = {};
  current_url = null;
}

/**
 * Draws an array of shapes to the paper.
 * @param  {array} shapes the array of shapes to draw
 * @return {undefined}
 */
function drawListOfShapes(shapes) {
  current_shapes = paper.set();
  for (var i = shapes.length - 1; i >= 0; i--) {
    var data = JSON.parse(shapes[i].data);
    switch(shapes[i].shape) {
      case 'path':
        drawLine.apply(drawLine, data);
      break;

      case 'rect':
        drawRect.apply(drawRect, data);
      break;

      case 'ellipse':
        drawEllipse.apply(drawEllipse, data);
      break;

      case 'text':
        drawText.apply(drawText, data);
      break;

      default:
      break;
    }
  }
  bringCursorToFront(); //make sure the cursor is still on top;
}

/**
 * Re-add the images to the paper that are found
 * in the slides array (an object of urls and dimensions).
 * @return {undefined}
 */
function rebuildPaper() {
  current_url = null;
  for(url in slides) {
    if(slides.hasOwnProperty(url)) {
      addImageToPaper(url, slides[url].w, slides[url].h, function(img) {
      });
    }
  }
}

/**
 * Shows an image from the paper.
 * The url must be in the slides array.
 * @param  {string} url the url of the image (must be in slides array)
 * @return {undefined}
 */
function showImageFromPaper(url) {
  if(current_url != url) {
    //temporary solution
    url = PRESENTATION_SERVER + url;

    hideImageFromPaper(current_url);
    var next = getImageFromPaper(url);
    if(next) {
      next.show();
      next.toFront();
      current_shapes.forEach(function(element) {
        element.toFront();
      });
      cur.toFront();
    }
    current_url = url;
  }
}

/**
 * Retrieves an image element from the paper.
 * The url must be in the slides array.
 * @param  {string} url        the url of the image (must be in slides array)
 * @return {Raphael.image}     return the image or null if not found
 */
function getImageFromPaper(url) {
  console.log("show me url:" + url);
  if(slides[url]) {
    var id = slides[url].id;
    if(id) {
      return paper.getById(id);
    }
    else return null;
  }
  else return null;
}

/**
 * Hides an image from the paper given the URL.
 * The url must be in the slides array.
 * @param  {string} url the url of the image (must be in slides array)
 * @return {undefined}
 */
function hideImageFromPaper(url) {
  var img = getImageFromPaper(url);
  if(img) img.hide();
}

/**
 * Puts the cursor on top so it doesn't
 * get hidden behind any objects/images.
 * @return {undefined}
 */
function bringCursorToFront() {
  cur.toFront();
}

/**
 * When panning starts
 * @param  {number} x the x value of the cursor
 * @param  {number} y the y value of the cursor
 * @return {undefined}
 */
var panGo = function(x, y) {
  px = cx;
  py = cy;
};

/**
 * When the user is dragging the cursor (click + move)
 * @param  {number} dx the difference between the x value from panGo and now
 * @param  {number} dy the difference between the y value from panGo and now
 * @return {undefined}
 */
var panDragging = function(dx, dy) {
  //ensuring that we cannot pan outside of the boundaries
  var x = (px - dx);
  x = x < 0 ? 0 : x; //cannot pan past the left edge of the page
  var y = (py - dy);
  y = y < 0 ? 0 : y; //cannot pan past the top of the page
  var x2;
  if(fitToPage) x2 = gw + x;
  else x2 = vw + x;
  x = x2 > sw ? sw - (vw - sx*2) : x; //cannot pan past the width
  var y2;
  if(fitToPage) y2 = gh + y;
  else y2 = vh + y; //height of image could be greater (or less) than the box it fits in
  y = y2 > sh ? sh - (vh - sy*2) : y; //cannot pan below the height
  sendPaperUpdate(x/sw, y/sh, null, null);
};

/**
 * When panning finishes
 * @param  {Event} e the mouse event
 * @return {undefined}
 */
var panStop = function(e) {
  //nothing to do
};

/**
 * When dragging for drawing lines starts
 * @param  {number} x the x value of the cursor
 * @param  {number} y the y value of the cursor
 * @return {undefined}
 */
var curDragStart = function(x, y) {
  //find the x and y values in relation to the whiteboard
  cx1 = x - s_left - sx + cx;
  cy1 = y - s_top - sy + cy;
  emitMakeShape('line', [cx1/sw, cy1/sh, current_colour, current_thickness]);
};

/**
 * As line drawing drag continues
 * @param  {number} dx the difference between the x value from curDragStart and now
 * @param  {number} dy the difference between the y value from curDragStart and now
 * @param  {number} x  the x value of the cursor
 * @param  {number} y  the y value of the cursor
 * @return {undefined}
 */
var curDragging = function(dx, dy, x, y) {
  //find the x and y values in relation to the whiteboard
  cx2 = x - s_left - sx + cx;
  cy2 = y - s_top - sy + cy;
  if(shift_pressed) {
    emitUpdateShape('line', [cx2/sw, cy2/sh, false]);
  }
  else {
    path_count++;
    if(path_count < path_max) {
      emitUpdateShape('line', [cx2/sw, cy2/sh, true]);
    }
    else {
      path_count = 0;
      //save the last path of the line
      line.attrs.path.pop();
      var path = line.attrs.path.join(' ');
      line.attr({ path : (path + "L" + cx1 + " " + cy1) });
      //scale the path appropriately before sending
      emitPublishShape('path', [line.attrs.path.join(',').toScaledPath(1/gw, 1/gh), current_colour, current_thickness]);
      emitMakeShape('line', [cx1/sw, cy1/sh, current_colour, current_thickness]);
    }
    cx1 = cx2;
    cy1 = cy2;
  }
};

/**
 * Drawing line has ended
 * @param  {Event} e the mouse event
 * @return {undefined}
 */
var curDragStop = function(e) {
  var path = line.attrs.path;
  line = null; //any late updates will be blocked by this
  //scale the path appropriately before sending
  emitPublishShape('path', [path.join(',').toScaledPath(1/gw, 1/gh), current_colour, current_thickness]);
};

/**
 * Make a line on the whiteboard that could be updated shortly after
 * @param  {number} x         the x value of the line start point as a percentage of the original width
 * @param  {number} y         the y value of the line start point as a percentage of the original height
 * @param  {string} colour    the colour of the shape to be drawn
 * @param  {number} thickness the thickness of the line to be drawn
 * @return {undefined}
 */
function makeLine(x, y, colour, thickness) {
  x *= gw;
  y *= gh;
  line = paper.path("M" + x + " " + y + "L" + x + " " + y);
  if(colour) line.attr({ 'stroke' : colour, 'stroke-width' : thickness });
  current_shapes.push(line);
}

/**
 * Drawing a line from the list o
 * @param  {string} path      height of the shape as a percentage of the original height
 * @param  {string} colour    the colour of the shape to be drawn
 * @param  {number} thickness the thickness of the line to be drawn
 * @return {undefined}
 */
function drawLine(path, colour, thickness) {
  var l = paper.path(path.toScaledPath(gw, gh));
  l.attr({ 'stroke' : colour, 'stroke-width' : thickness });
  current_shapes.push(l);
}

/**
 * Updating drawing the line
 * @param  {number} x2  the next x point to be added to the line as a percentage of the original width
 * @param  {number} y2  the next y point to be added to the line as a percentage of the original height
 * @param  {boolean} add true if the line should be added to the current line, false if it should replace the last point
 * @return {undefined}
 */
function updateLine(x2, y2, add) {
  x2 *= gw;
  y2 *= gh;
  if(add) {
    //if adding to the line
    if(line) line.attr({ path : (line.attrs.path + "L" + x2 + " " + y2) });
  }
  else {
    //if simply updating the last portion (for drawing a straight line)
    if(line) {
      line.attrs.path.pop();
      var path = line.attrs.path.join(' ');
      line.attr({ path : (path + "L" + x2 + " " + y2) });
    }
  }
}

/**
 * Updating the text from the messages on the socket
 * @param  {string} t        the text of the text object
 * @param  {number} x        the x value of the object as a percentage of the original width
 * @param  {number} y        the y value of the object as a percentage of the original height
 * @param  {number} w        the width of the text box as a percentage of the original width
 * @param  {number} spacing  the spacing between the letters
 * @param  {string} colour   the colour of the text
 * @param  {string} font     the font family of the text
 * @param  {number} fontsize the size of the font (in PIXELS)
 * @return {undefined}
 */
function updateText(t, x, y, w, spacing, colour, font, fontsize) {
  x = x*gw;
  y = y*gh;
  if(!text) {
    text = paper.text(x, y, "").attr({fill: colour, 'font-family' : font, 'font-size' : fontsize});
    text.node.style['text-anchor'] = 'start'; //force left align
    text.node.style['textAnchor'] = 'start'; //for firefox, 'cause they like to be different.
    current_shapes.push(text);
  }
  else {
    text.attr({fill: colour});
    var cell = text.node;
    while(cell.hasChildNodes()) cell.removeChild(cell.firstChild);
    var dy = textFlow(t, cell, w, x, spacing, false);
  }
  cur.toFront();
}

/**
 * Drawing the text on the whiteboard from object
 * @param  {string} t        the text of the text object
 * @param  {number} x        the x value of the object as a percentage of the original width
 * @param  {number} y        the y value of the object as a percentage of the original height
 * @param  {number} w        the width of the text box as a percentage of the original width
 * @param  {number} spacing  the spacing between the letters
 * @param  {string} colour   the colour of the text
 * @param  {string} font     the font family of the text
 * @param  {number} fontsize the size of the font (in PIXELS)
 * @return {undefined}
 */
function drawText(t, x, y, w, spacing, colour, font, fontsize) {
  x = x*gw;
  y = y*gh;
  var txt = paper.text(x, y, "").attr({fill: colour, 'font-family' : font, 'font-size' : fontsize});
  txt.node.style['text-anchor'] = 'start'; //force left align
  txt.node.style['textAnchor'] = 'start'; //for firefox, 'cause they like to be different.
  var dy = textFlow(t, txt.node, w, x, spacing, false);
  current_shapes.push(txt);
}

/**
 * When first dragging the mouse to create the textbox size
 * @param  {number} x the x value of cursor at the time in relation to the left side of the browser
 * @param  {number} y the y value of cursor at the time in relation to the top of the browser
 * @return {undefined}
 */
var curTextStart = function(x, y) {
  if(text) {
    emitPublishShape('text', [textbox.value, text.attrs.x/gw, text.attrs.y/gh, textbox.clientWidth, 16, current_colour, 'Arial', 14]);
    emitDoneText();
  }
  textbox.value = "";
  textbox.style.visibility = "hidden";
  textx = x;
  texty = y;
  cx2 = (x - s_left - sx + cx)/sw;
  cy2 = (y - s_top - sy + cy)/sh;
  emitMakeShape('rect', [cx2, cy2, '#000', 1]);
};

/**
 * Finished drawing the rectangle that the text will fit into
 * @param  {Event} e the mouse event
 * @return {undefined}
 */
var curTextStop = function(e) {
  if(rect) rect.hide();
  var tboxw = (e.pageX - textx);
  var tboxh = (e.pageY - texty);
  if(tboxw >= 14 || tboxh >= 14) { //restrict size
    textbox.style.width = tboxw*(gw/sw)+"px";
    textbox.style.visibility = "visible";
    textbox.style['font-size'] = 14 + "px";
    textbox.style['fontSize'] = 14 + "px"; //firefox
    textbox.style.color = current_colour;
    textbox.value = "";
    var x = textx - s_left - sx + cx + 1; // 1px random padding
    var y = texty - s_top - sy + cy;
    textbox.focus();

    //if you click outside, it will automatically sumbit
    textbox.onblur = function(e) {
      if(text) {
        emitPublishShape('text', [this.value, text.attrs.x/gw, text.attrs.y/gh, textbox.clientWidth, 16, current_colour, 'Arial', 14]);
        emitDoneText();
      }
      textbox.value = "";
      textbox.style.visibility = "hidden";
    };

    //if user presses enter key, then automatically submit
    textbox.onkeypress = function(e) {
      if(e.keyCode == '13') {
        e.preventDefault();
        e.stopPropagation();
        this.onblur();
      }
    };

    //update everyone with the new text at every change
    textbox.onkeyup = function(e) {
      this.style.color = current_colour;
      this.value = this.value.replace(/\n{1,}/g, ' ').replace(/\s{2,}/g, ' '); //enforce no 2 or greater consecutive spaces, no new lines
      emitUpdateShape('text', [this.value, x/sw, (y+(14*(sh/gh)))/sh, tboxw*(gw/sw), 16, current_colour, 'Arial', 14]);
    };
  }
};

/**
 * The server has said the text is finished,
 * so set it to null for the next text object
 * @return {undefined}
 */
function textDone() {
  if(text) {
    text = null;
    if(rect) rect.hide();
  }
}

/**
 * Creating a rectangle has started
 * @param  {number} x the x value of cursor at the time in relation to the left side of the browser
 * @param  {number} y the y value of cursor at the time in relation to the top of the browser
 * @return {undefined}
 */
var curRectDragStart = function(x, y) {
  //find the x and y values in relation to the whiteboard
  cx2 = (x - s_left - sx + cx)/sw;
  cy2 = (y - s_top - sy + cy)/sh;
  emitMakeShape('rect', [cx2, cy2, current_colour, current_thickness]);
};

/**
 * Adjusting rectangle continues
 * @param  {number} dx the difference in the x value at the start as opposed to the x value now
 * @param  {number} dy the difference in the y value at the start as opposed to the y value now
 * @param  {number} x the x value of cursor at the time in relation to the left side of the browser
 * @param  {number} y the y value of cursor at the time in relation to the top of the browser
 * @param  {Event} e  the mouse event
 * @return {undefined}
 */
var curRectDragging = function(dx, dy, x, y, e) {
  var x1;
  var y1;
  //if shift is pressed, make it a square
  if(shift_pressed) dy = dx;
  dx = dx/sw;
  dy = dy/sh;
  //adjust for negative values as well
  if(dx >= 0) x1 = cx2;
  else {
    x1 = cx2 + dx;
    dx = -dx;
  }
  if(dy >= 0) y1 = cy2;
  else {
    y1 = cy2 + dy;
    dy = -dy;
  }
  emitUpdateShape('rect', [x1, y1, dx, dy]);
};

/**
 * When rectangle finished being drawn
 * @param  {Event} e the mouse event
 * @return {undefined}
 */
var curRectDragStop = function(e) {
  var r;
  if(rect) r = rect.attrs;
  if(r) emitPublishShape('rect', [r.x/gw, r.y/gh, r.width/gw, r.height/gh, current_colour, current_thickness]);
  rect = null;
};

/**
 * Socket response - Make rectangle on canvas
 * @param  {number} x         the x value of the object as a percentage of the original width
 * @param  {number} y         the y value of the object as a percentage of the original height
 * @param  {string} colour    the colour of the object
 * @param  {number} thickness the thickness of the object's line(s)
 * @return {undefined}
 */
function makeRect(x, y, colour, thickness) {
  rect = paper.rect(x*gw, y*gh, 0, 0);
  if(colour) rect.attr({ 'stroke' : colour, 'stroke-width' : thickness });
  current_shapes.push(rect);
}

/**
 * Draw a rectangle on the paper
 * @param  {number} x         the x value of the object as a percentage of the original width
 * @param  {number} y         the y value of the object as a percentage of the original height
 * @param  {number} w         width of the shape as a percentage of the original width
 * @param  {number} h         height of the shape as a percentage of the original height
 * @param  {string} colour    the colour of the object
 * @param  {number} thickness the thickness of the object's line(s)
 * @return {undefined}
 */
function drawRect(x, y, w, h, colour, thickness) {
  var r = paper.rect(x*gw, y*gh, w*gw, h*gh);
  if(colour) r.attr({ 'stroke' : colour, 'stroke-width' : thickness });
  current_shapes.push(r);
}

/**
 * Socket response - Update rectangle drawn
 * @param  {number} x1 the x value of the object as a percentage of the original width
 * @param  {number} y1 the y value of the object as a percentage of the original height
 * @param  {number} w  width of the shape as a percentage of the original width
 * @param  {number} h  height of the shape as a percentage of the original height
 * @return {undefined}
 */
function updateRect(x1, y1, w, h) {
  if(rect) rect.attr({ x: (x1)*gw, y: (y1)*gh, width: w*gw, height: h*gh });
}

/**
 * When first starting drawing the ellipse
 * @param  {number} x the x value of cursor at the time in relation to the left side of the browser
 * @param  {number} y the y value of cursor at the time in relation to the top of the browser
 * @return {undefined}
 */
var curEllipseDragStart = function(x, y) {
  //find the x and y values in relation to the whiteboard
  ex = (x - s_left - sx + cx);
  ey = (y - s_top - sy + cy);
  emitMakeShape('ellipse', [ex/sw, ey/sh, current_colour, current_thickness]);
};

/**
 * Make an ellipse on the whiteboard
 * @param  {[type]} cx        the x value of the center as a percentage of the original width
 * @param  {[type]} cy        the y value of the center as a percentage of the original height
 * @param  {string} colour    the colour of the object
 * @param  {number} thickness the thickness of the object's line(s)
 * @return {undefined}
 */
function makeEllipse(cx, cy, colour, thickness) {
  ellipse = paper.ellipse(cx*gw, cy*gh, 0, 0);
  if(colour) ellipse.attr({ 'stroke' : colour, 'stroke-width' : thickness });
  current_shapes.push(ellipse);
}

/**
 * Draw an ellipse on the whiteboard
 * @param  {[type]} cx        the x value of the center as a percentage of the original width
 * @param  {[type]} cy        the y value of the center as a percentage of the original height
 * @param  {[type]} rx        the radius-x of the ellipse as a percentage of the original width
 * @param  {[type]} ry        the radius-y of the ellipse as a percentage of the original height
 * @param  {string} colour    the colour of the object
 * @param  {number} thickness the thickness of the object's line(s)
 * @return {undefined}
 */
function drawEllipse(cx, cy, rx, ry, colour, thickness) {
  var elip = paper.ellipse(cx*gw, cy*gh, rx*gw, ry*gh);
  if(colour) elip.attr({ 'stroke' : colour, 'stroke-width' : thickness });
  current_shapes.push(elip);
}

/**
 * When first starting to draw an ellipse
 * @param  {number} dx the difference in the x value at the start as opposed to the x value now
 * @param  {number} dy the difference in the y value at the start as opposed to the y value now
 * @param  {number} x the x value of cursor at the time in relation to the left side of the browser
 * @param  {number} y the y value of cursor at the time in relation to the top of the browser
 * @param  {Event} e   the mouse event
 * @return {undefined}
 */
var curEllipseDragging = function(dx, dy, x, y, e) {
  //if shift is pressed, draw a circle instead of ellipse
  if(shift_pressed) dy = dx;
  dx = dx/2;
  dy = dy/2;
  //adjust for negative values as well
  x = ex+dx;
  y = ey+dy;
  dx = dx < 0 ? -dx : dx;
  dy = dy < 0 ? -dy : dy;
  emitUpdateShape('ellipse', [x/sw, y/sh, dx/sw, dy/sh]);
};

/**
 * Socket response - Update rectangle drawn
 * @param  {number} x the x value of the object as a percentage of the original width
 * @param  {number} y the y value of the object as a percentage of the original height
 * @param  {number} w width of the shape as a percentage of the original width
 * @param  {number} h height of the shape as a percentage of the original height
 * @return {undefined}
 */
function updateEllipse(x, y, w, h) {
  if(ellipse) ellipse.attr({cx: x*gw, cy: y*gh, rx: w*gw, ry: h*gh });
}

/**
 * When releasing the mouse after drawing the ellipse
 * @param  {Event} e the mouse event
 * @return {undefined}
 */
var curEllipseDragStop = function(e) {
  var attrs;
  if(ellipse) attrs = ellipse.attrs;
  if(attrs) emitPublishShape('ellipse', [attrs.cx/gw, attrs.cy/gh, attrs.rx/gw, attrs.ry/gh, current_colour, current_thickness]);
  ellipse = null; //late updates will be blocked by this
};

/**
 * Send cursor moving event to server
 * @param  {Event} e the mouse event
 * @param  {number} x the x value of cursor at the time in relation to the left side of the browser
 * @param  {number} y the y value of cursor at the time in relation to the top of the browser
 * @return {undefined}
 */
var mvingCur = function(e, x, y) {
  emMvCur((x - sx - s_left + cx)/sw, (y - sy - s_top + cy)/sh);
};

/**
 * Socket response - Update the cursor position on screen
 * @param  {number} x the x value of the cursor as a percentage of the width
 * @param  {number} y the y value of the cursor as a percentage of the height
 * @return {undefined}
 */
function mvCur(x, y) {
  cur.attr({ cx: x*gw, cy: y*gh });
}

/**
 * Socket response - Clear canvas
 * @return {undefined}
 */
function clearPaper() {
  if(current_shapes){
    current_shapes.forEach(function(element) {
      element.remove();
    });
  }
}

/**
 * Update zoom variables on all clients
 * @param  {Event} event the event that occurs when scrolling
 * @param  {number} delta the speed/direction at which the scroll occurred
 * @return {undefined}
 */
var zoomSlide = function(event, delta) {
  emZoom(delta);
};

/**
 * Socket response - Update zoom variables and viewbox
 * @param {number} d the delta value from the scroll event
 * @return {undefined}
 */
function setZoom(d) {
  var step = 0.05; //step size
  if(d < 0) zoom_level += step; //zooming out
  else zoom_level -= step; //zooming in

  var x = cx/sw, y = cy/sh, z = zoom_level > 1 ? 1 : zoom_level; //cannot zoom out further than 100%
  z = z < 0.25 ? 0.25 : z; //cannot zoom in further than 400% (1/4)
  //cannot zoom to make corner less than (x,y) = (0,0)
  x = x < 0 ? 0 : x;
  y = y < 0 ? 0 : y;
  //cannot view more than the bottom corners
  var zz = 1 - z;
  x = x > zz ? zz : x;
  y = y > zz ? zz : y;
  sendPaperUpdate(x, y, z, z); //send update to all clients
}

initPaper();

var c = document.getElementById("colourView");
var tc = document.getElementById('thicknessView');
var cptext = document.getElementById("colourText");
var ctx = c.getContext("2d");
var tctx = tc.getContext('2d');

s_left = slide_obj.offsetLeft; //the offset from the left of the page to the whiteboard frame border
s_top = slide_obj.offsetTop; // the offset from the top of the page to the whiteboard frame border
vw = slide_obj.clientWidth;
vh = slide_obj.clientHeight;

drawThicknessView(default_thickness, default_colour);
drawColourView(default_colour);

cp = Raphael.colorwheel(-75, -75, 75, default_colour); //create colour picker
cp.raphael.forEach(function(item) { item.hide(); }); //hide it
var cpVisible = false;

$(function() {
  $("#thickness").slider({ value: 1, min: 1, max: 20 });
  $("#thickness").bind("slide", function(event, ui) {
    drawThicknessView(ui.value, current_colour);
  });
});

//when the colour picker colour changes
cp.onchange = function() {
  drawColourView(this.color());
  drawThicknessView(current_thickness, this.color());
};

//when finished typing a colour into the colour text box
cptext.onkeyup = function() {
  drawColourView(this.value);
  drawThicknessView(current_thickness, this.value);
};

//when pressing down on a key at anytime
document.onkeydown = function(event) {
  var keyCode;
  if(!event) keyCode = window.event.keyCode;
  else keyCode = event.keyCode;

  switch(keyCode) {
    case 16: //shift key
      shift_pressed = true;
    break;

    default:
      //nothing
    break;
  }
};

function windowResized(div) {
  s_top = slide_obj.offsetTop;
  s_left = slide_obj.offsetLeft;

  if(div) {
    s_left += $('#presentation')[0].offsetLeft;
  }
  console.log('window resized');
}

//when releasing any key at any time
document.onkeyup = function(event) {
  var keyCode;
  if(!event) keyCode = window.event.keyCode;
  else keyCode = event.keyCode;
  switch(keyCode) {
    case 16: //shift key
      shift_pressed = false;
    break;

    default:
      //nothing
    break;
  }
};

//upload without a refresh
$('#uploadForm').submit(function() {
  $('#uploadStatus').text("Uploading...");
  $(this).ajaxSubmit({
    error: function(xhr) {
      console.log('Error: ' + xhr.status);
    },
    success: function(response) {

    }
  });
  // Have to stop the form from submitting and causing refresh
  return false;
});

//automatically upload the file if it is chosen
$('#uploadFile').change(function() {
  $("#uploadForm").submit();
});

window.onresize = function () {
  windowResized();
}

/**
 * Scales a path string to fit within a width and height of the new paper size
 * @param  {number} w width of the shape as a percentage of the original width
 * @param  {number} h height of the shape as a percentage of the original height
 * @return {string}   the path string after being manipulated to new paper size
 */
String.prototype.toScaledPath = function(w, h) {
  var path;
  var points = this.match(/(\d+[.]?\d*)/g);
  var len = points.length;
  //go through each point and multiply it by the new height and width
  for(var j = 0; j < len; j+=2) {
    if(j !== 0) path += "L" + (points[j] * w) + "," + (points[j+1] * h);
    else path = "M" + (points[j] * w) + "," + (points[j+1] * h);
  }
  return path;
};
