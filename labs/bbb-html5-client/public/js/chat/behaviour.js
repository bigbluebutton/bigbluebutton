define(["jquery", "chat/whiteboard", "chat/connection", "chat/whiteboard", "chat/chat"],
       function($, Whiteboard, Connection, Whiteboard, Chat) {

  var layout = $("#layout");
  var chatToogleBtn = $("#chat-btn");
  var usersToogleBtn = $("#users-btn");
  var logoutBtn = $("#logout-btn");
  var userclick, chatclick;

  /* Ensure the status is set right at page load. */
  chatToogleBtn.toggleClass("active", layout.hasClass("chat-enabled"));
  usersToogleBtn.toggleClass("active", layout.hasClass("users-enabled"));

  chatToogleBtn.on("click", function() {
    if(chatclick) clearTimeout(chatclick);
    layout.toggleClass("chat-enabled");
    chatToogleBtn.toggleClass("active", layout.hasClass("chat-enabled"));
    chatclick = setTimeout(function(){
      Whiteboard.windowResized();
    }, 1100);
  });

  usersToogleBtn.on("click", function() {
    if(userclick) clearTimeout(userclick);
    layout.toggleClass("users-enabled");
    usersToogleBtn.toggleClass("active", layout.hasClass("users-enabled"));
    userclick = setTimeout(function() {
      Whiteboard.windowResized('users');
    }, 1100);
  });

  logoutBtn.on("click", function() {
    Connection.emitLogout();
  });

  $("#prev-slide-btn").on("click", function() {
    Connection.emitPrevSlide();
    return false;
  });

  $("#next-slide-btn").on("click", function() {
    Connection.emitNextSlide();
    return false;
  });

  $("#tool-pan-btn").on("click", function() {
    Connection.emitChangeTool('panzoom');
    return false;
  });

  $("#tool-line-btn").on("click", function() {
    Connection.emitChangeTool('line');
    return false;
  });

  $("#tool-rect-btn").on("click", function() {
    Connection.emitChangeTool('rect');
    return false;
  });

  $("#tool-ellipse-btn").on("click", function() {
    Connection.emitChangeTool('ellipse');
    return false;
  });

  $("button#chat-send").on("click", function() {
    Chat.sendMessage();
    return false;
  });

  $("#colourView").on("click", function() {
    Whiteboard.toggleColourPicker();
    return false;
  });

  $("#switch-presenter").on("click", function() {
    Chat.switchPresenter();
    return false;
  });

  // $("#chat_input_box").on("keyup", function(e) {
  //   count = $(this).attr("maxlength");
  //   chcount.innerHTML = max - chatbox.value.length;
  // });

});
