define(["socket.io"], function(io) {

  var Connection = {}

  // Always connect to the host that's serving this page.
  // For now using the same port used to serve pages.
  // note: can't use window.location.origin, doesn't work in firefox
  var host = window.location.protocol + "//" + window.location.host;
  // to change the port:
  // host = host.replace(/:\d+/, "") + ":" + port;

  var socket = io.connect(host);

  /**
   * Emit an update to move the cursor around the canvas
   * @param  {number} x x-coord of the cursor as a percentage of page width
   * @param  {number} y y-coord of the cursor as a percentage of page height
   * @return {undefined}
   */
  Connection.emitMoveCursor = function(x, y) {
    socket.emit('mvCur', x, y);
  }

  /**
   * Requests the shapes from the server.
   * @return {undefined}
   */
  Connection.emitAllShapes = function() {
    socket.emit('all_shapes');
  }

  /**
   * Emit an update in a fit of the whiteboard
   * @param  {boolean} true for fitToPage, false for fitToWidth
   * @return {undefined}
   */
  Connection.emitFitToPage = function(fit) {
    socket.emit('fitToPage', fit);
  }

  /**
   * Emit a message to the server
   * @param  {string} the message
   * @return {undefined}
   */
  Connection.emitMsg = function(msg) {
    socket.emit('msg', msg);
  }

  /**
   * Emit the finish of a text shape
   * @return {undefined}
   */
  Connection.emitTextDone = function() {
    socket.emit('textDone');
  }

  /**
   * Emit the creation of a shape
   * @param  {string} shape type of shape
   * @param  {Array} data  all the data required to draw the shape on the client whiteboard
   * @return {undefined}
   */
  Connection.emitMakeShape = function(shape, data) {
    socket.emit('makeShape', shape, data);
  }

  /**
   * Emit the update of a shape
   * @param  {string} shape type of shape
   * @param  {Array} data  all the data required to update the shape on the client whiteboard
   * @return {undefined}
   */
  Connection.emitUpdateShape = function(shape, data) {
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
  Connection.emitPaperUpdate = function(cx, cy, sw, sh) {
    socket.emit('paper', cx, cy, sw, sh);
  }

  /**
   * Update the zoom level for the clients
   * @param  {number} delta amount of change in scroll wheel
   * @return {undefined}
   */
  Connection.emitZoom = function(delta) {
    socket.emit('zoom', delta);
  }

  /**
   * Request the next slide
   * @return {undefined}
   */
  Connection.emitNextSlide = function() {
    socket.emit('nextslide');
  }

  /**
   * Request the previous slide
   * @return {undefined}
   */
  Connection.emitPrevSlide = function() {
    socket.emit('prevslide');
  }

  /**
   * Logout of the meeting
   * @return {undefined}
   */
  Connection.emitLogout = function() {
    socket.emit('logout');
  }

  /**
   * Emit panning has stopped
   * @return {undefined}
   */
  Connection.emitPanStop = function() {
    socket.emit('panStop');
  }

  /**
   * Publish a shape to the server to be saved
   * @param  {string} shape type of shape to be saved
   * @param  {Array} data   information about shape so that it can be recreated later
   * @return {undefined}
   */
  Connection.emitPublishShape = function(shape, data) {
    socket.emit('saveShape', shape, JSON.stringify(data));
  }

  /**
   * Emit a change in the current tool
   * @param  {string} tool [description]
   * @return {undefined}
   */
  Connection.emitChangeTool = function(tool) {
    socket.emit('changeTool', tool);
  }

  /**
   * Tell the server to undo the last shape
   * @return {undefined}
   */
  Connection.emitUndo = function() {
    socket.emit('undo');
  }

  /**
   * Emit a change in the presenter
   * @return {undefined}
   */
  Connection.emitSetPresenter = function(id) {
    socket.emit('setPresenter', id);
  }

  Connection.socket = socket;

  return Connection;

});
