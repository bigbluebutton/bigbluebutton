// Documented

// Object references
var chcount = document.getElementById('charcount');
var msgbox = document.getElementById("chat_messages");
var chatbox = document.getElementById('chat_input_box');

var PORT = 3000; //port that SocketIO will connect on
var SERVER_IP = window.location.hostname;

// Connect to the websocket via SocketIO
var socket = io.connect('http://'+SERVER_IP+':'+PORT);

/**
 * If the socket is connected
 * @return {undefined}
 */
socket.on('connect', function () {

  // Immediately say we are connected
  socket.emit('user connect');

  /**
   * Received event for a new public chat message
   * @param  {string} name name of user
   * @param  {string} msg  message to be displayed
   * @return {undefined}
   */
  socket.on('msg', function (name, msg) {
    msgbox.innerHTML += '<div>' + name + ': ' + msg + '</div>';
    msgbox.scrollTop = msgbox.scrollHeight;
  });

  /**
   * Received event to logout yourself
   * @return {undefined}
   */
  socket.on('logout', function () {
      post_to_url('logout');
      window.location.replace("./");
  });

  /**
   * Received event to update the user list
   * @param  {Array} names Array of names and publicIDs of connected users
   * @return {undefined}
   */
  socket.on('user list change', function (names) {
    var clickFunc = '$(\'.selected\').removeClass(\'selected\');$(this).addClass(\'selected\');';
    var currusers = document.getElementById('current_users');
    currusers.innerHTML = ''; //clear it first
    for (var i = names.length - 1; i >= 0; i--) {
      currusers.innerHTML += '<div class="user clickable" onclick="'+clickFunc+'" id= "'+names[i].id+'"><b>' + names[i].name + '</b></div>';
    }
  });

  /**
   * Received event to update all the messages in the chat box
   * @param  {Array} messages Array of messages in public chat box
   * @return {undefined}
   */
  socket.on('all_messages', function (messages) {
    //msgbox.innerHTML = '';
    for (var i = messages.length - 1; i >= 0; i--){
    msgbox.innerHTML += '<div>' + messages[i].username + ": " + messages[i].message + '</div>';
    };
    msgbox.scrollTop = msgbox.scrollHeight;
  });

  /**
   * Received event to update all the shapes in the whiteboard
   * @param  {Array} shapes Array of shapes to be drawn
   * @return {undefined}
   */
  socket.on('all_shapes', function (shapes) {
    clearPaper();
    drawListOfShapes(shapes);
  });

  /**
   * If the server is reconnected to the client
   * @return {undefined}
   */
  socket.on('reconnect', function () {
    msgbox.innerHTML += '<div><b> RECONNECTED! </b></div>';
  });

  /**
   * If the client is attempting to reconnect to the server
   * @return {undefined}
   */
  socket.on('reconnecting', function () {
    msgbox.innerHTML += '<div><b> Reconnecting... </b></div>';
  });

  /**
   * If the client cannot reconnect to the server
   * @return {undefined}
   */
  socket.on('reconnect_failed', function () {
    msgbox.innerHTML += '<div><b> Reconnect FAILED! </b></div>';
  });

  /**
   * If the server disconnects from the client or vice-versa
   * @return {undefined}
   */
  socket.on('disconnect', function() {
      window.location.replace("./");
  });

  /**
   * Received event to clear the whiteboard shapes
   * @return {undefined}
   */
  socket.on('clrPaper', function () {
    clearPaper();
  });

  /**
   * Received event to update the viewBox value
   * @param  {string} xperc Percentage of x-offset from top left corner
   * @param  {string} yperc Percentage of y-offset from top left corner
   * @param  {string} wperc Percentage of full width of image to be displayed
   * @param  {string} hperc Percentage of full height of image to be displayed
   * @return {undefined}
   */
  socket.on('viewBox', function(xperc, yperc, wperc, hperc) {
    xperc = parseFloat(xperc, 10);
    yperc = parseFloat(yperc, 10);
    wperc = parseFloat(wperc, 10);
    hperc = parseFloat(hperc, 10);
    updatePaperFromServer(xperc, yperc, wperc, hperc);
  });

  /**
   * Received event to update the cursor coordinates
   * @param  {number} x x-coord of the cursor as a percentage of page width
   * @param  {number} y y-coord of the cursor as a percentage of page height
   * @return {undefined}
   */
  socket.on('mvCur', function(x, y) {
    mvCur(x, y);
  });

  /**
   * Received event to update the slide image
   * @param  {string} url URL of image to show
   * @return {undefined}
   */
  socket.on('changeslide', function(url) {
    showImageFromPaper(url);
  });

  /**
   * Received event to update the whiteboard between fit to width and fit to page
   * @param  {boolean} fit choice of fit: true for fit to page, false for fit to width
   * @return {undefined}
   */
  socket.on('fitToPage', function(fit) {
    setFitToPage(fit);
  });

  /**
   * Received event to update the zoom level of the whiteboard.
   * @param  {number} delta amount of change in scroll wheel
   * @return {undefined}
   */
  socket.on('zoom', function(delta) {
    setZoom(delta);
  });

  /**
   * Received event when the panning action finishes
   * @return {undefined}
   */
  socket.on('panStop', function() {
    panDone();
  });

  /**
   * Received event to create a shape on the whiteboard
   * @param  {string} shape type of shape being made
   * @param  {Array} data   all information to make the shape
   * @return {undefined}
   */
  socket.on('makeShape', function(shape, data) {
    switch(shape) {
    case 'line':
      makeLine.apply(makeLine, data);
    break;

    case 'rect':
      makeRect.apply(makeRect, data);
    break;

    case 'ellipse':
      makeEllipse.apply(makeEllipse, data);
    break;

    default:
      //no other shapes allowed
    break;
    }
  });

  /**
   * Received event to update a shape being created
   * @param  {string} shape type of shape being updated
   * @param  {Array} data   all information to update the shape
   * @return {undefined}
   */
  socket.on('updShape', function(shape, data) {
    switch(shape) {
    case 'line':
      updateLine.apply(updateLine, data);
    break;

    case 'rect':
      updateRect.apply(updateRect, data);
    break;

    case 'ellipse':
      updateEllipse.apply(updateEllipse, data);
    break;

    case 'text':
      updateText.apply(updateText, data);
    break;

    default:
      console.log('shape not recognized');
    break;
  }
  });

  /**
   * Received event to denote when the text has been created
   * @return {undefined}
   */
  socket.on('textDone', function() {
    textDone();
  });

  /**
   * Received event to change the current tool
   * @param  {string} tool tool to be turned on
   * @return {undefined}
   */
  socket.on('toolChanged', function(tool) {
    turnOn(tool);
  });

  /**
   * Received event to update the whiteboard size and position
   * @param  {number} cx x-offset from top left corner as percentage of original width of paper
   * @param  {number} cy y-offset from top left corner as percentage of original height of paper
   * @param  {number} sw slide width as percentage of original width of paper
   * @param  {number} sh slide height as a percentage of original height of paper
   * @return {undefined}
   */
  socket.on('paper', function(cx, cy, sw, sh) {
  updatePaperFromServer(cx, cy, sw, sh);
  });

  /**
   * Received event to set the presenter to a user
   * @param  {string} publicID publicID of the user that is being set as the current presenter
   * @return {undefined}
   */
  socket.on('setPresenter', function(publicID) {
    $('.presenter').removeClass('presenter');
    $('#' + publicID).addClass('presenter');
  });

  /**
   * Received event to update the status of the upload progress
   * @param  {string} message  update message of status of upload progress
   * @param  {boolean} fade    true if you wish the message to automatically disappear after 3 seconds
   * @return {undefined}
   */
  socket.on('uploadStatus', function(message, fade) {
    $('#uploadStatus').text(message);
    // if a true is passed for fade, it will only stay for
    // a period of time before disappearing automatically
    if(fade) {
      setTimeout(function() {
        $('#uploadStatus').text('');
      }, 3000);
    }
  });

  /**
   * Received event to update all the slide images
   * @param  {Array} urls list of URLs to be added to the paper (after old images are removed)
   * @return {undefined}
   */
  socket.on('all_slides', function(urls) {
    $('#uploadStatus').text(""); //upload finished
    removeAllImagesFromPaper();
    var count = 0;
    var numOfSlides = urls.length;
    for (var i = 0; i < numOfSlides; i++) {
      var array = urls[i];
      var img = addImageToPaper(array[0], array[1], array[2]);
      //TODO: temporary solution for remove :3000
      var custom_src = img.attr('src');
      custom_src = custom_src.replace(':3000', ""); 
      console.log(custom_src);
      $('#slide').append('<img id="preload'+img.id+'"src="'+custom_src+'" style="display:none;" alt=""/>'); //preload images
    };
  });
});

/**
 * If an error occurs while not connected
 * @param  {string} reason Reason for the error.
 * @return {undefined}
 */
socket.on('error', function (reason) {
  console.error('Unable to connect Socket.IO', reason);
});

/**
 * POST request using javascript
 * @param  {string} path   path of submission
 * @param  {string} params parameters to submit
 * @param  {string} method method of submission ("post" is default)
 * @return {undefined}
 */
function post_to_url(path, params, method) {
  method = method || "post"; // Set method to post by default, if not specified.
  // The rest of this code assumes you are not using a library.
  // It can be made less wordy if you use one.
  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);
  for(var key in params) {
    if(params.hasOwnProperty(key)) {
      var hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", params[key]);
      form.appendChild(hiddenField);
    }
  }
  document.body.appendChild(form);
  form.submit();
}

/**
 * Sending a public chat message to users
 * @return {undefined}
 */
function sendMessage() {
  var msg = chatbox.value;
    if (msg != '') {
        socket.emit('msg', msg);
        chatbox.value = '';
    }
    chatbox.focus();
}

/**
 * Clearing the canvas drawings
 * @return {undefined}
 */
function clearCanvas() {
  socket.emit("clrPaper");
}

/**
 * Requests the shapes from the server.
 * @return {undefined}
 */
function getShapesFromServer() {
  socket.emit('all_shapes');
}

/**
 * Emit an update in a fit of the whiteboard
 * @param  {boolean} true for fitToPage, false for fitToWidth
 * @return {undefined}
 */
function sendFitToPage(fit) {
  socket.emit('fitToPage', fit);
}

/**
 * Emit the finish of a text shape
 * @return {undefined}
 */
function emitDoneText() {
  socket.emit('textDone');
}

/**
 * Emit the creation of a shape
 * @param  {string} shape type of shape
 * @param  {Array} data  all the data required to draw the shape on the client whiteboard
 * @return {undefined}
 */
function emitMakeShape(shape, data) {
  socket.emit('makeShape', shape, data);
}

/**
 * Emit the update of a shape
 * @param  {string} shape type of shape
 * @param  {Array} data  all the data required to update the shape on the client whiteboard
 * @return {undefined}
 */
function emitUpdateShape(shape, data) {
  socket.emit('updShape', shape, data);
}

/**
 * Emit an update in the whiteboard position/size values
 * @param  {number} cx x-offset from top left corner as percentage of original width of paper
 * @param  {number} cy y-offset from top left corner as percentage of original height of paper
 * @param  {number} sw slide width as percentage of original width of paper
 * @param  {number} sh slide height as a percentage of original height of paper
 * @return {undefined}
 */
function sendPaperUpdate(cx, cy, sw, sh) {
  socket.emit('paper', cx, cy, sw, sh);
}

/**
 * Emit an update to move the cursor around the canvas
 * @param  {number} x x-coord of the cursor as a percentage of page width
 * @param  {number} y y-coord of the cursor as a percentage of page height
 * @return {undefined}
 */
function emMvCur(x, y) {
  socket.emit('mvCur', x, y);
}

/**
 * Update the zoom level for the clients
 * @param  {number} delta amount of change in scroll wheel
 * @return {undefined}
 */
function emZoom(delta) {
  socket.emit('zoom', delta);
}

/**
 * Request the next slide
 * @return {undefined}
 */
function nextImg() {
  socket.emit('nextslide');
}

/**
 * Request the previous slide
 * @return {undefined}
 */
function prevImg() {
  socket.emit('prevslide');
}

/**
 * Logout of the meeting
 * @return {undefined}
 */
function logout() {
  socket.emit('logout');
}

/**
 * Emit panning has stopped
 * @return {undefined}
 */
function emPanStop() {
  socket.emit('panStop');
}

/**
 * Publish a shape to the server to be saved
 * @param  {string} shape type of shape to be saved
 * @param  {Array} data   information about shape so that it can be recreated later
 * @return {undefined}
 */
function emitPublishShape(shape, data) {
  socket.emit('saveShape', shape, JSON.stringify(data));
}

/**
 * Emit a change in the current tool
 * @param  {string} tool [description]
 * @return {undefined}
 */
function changeTool(tool) {
  socket.emit('changeTool', tool);
}

/**
 * Tell the server to undo the last shape
 * @return {undefined}
 */
function undoShape() {
  socket.emit('undo');
}

/**
 * Emit a change in the presenter
 * @return {undefined}
 */
function switchPresenter() {
  socket.emit('setPresenter', $('.selected').attr('id'));
}

/**
 * Update the character count remaining in the chat box
 * @param  {number} max maximum number of allowed characters
 * @return {undefined}
 */
function countchars(max) {
  chcount.innerHTML = max - chatbox.value.length;
}
