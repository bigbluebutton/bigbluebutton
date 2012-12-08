define(["jquery", "chat/whiteboard", "chat/connection", "chat/whiteboard", "chat/chat"],
       function($, Whiteboard, Connection, Whiteboard, Chat) {

  var layout = $("#layout");
  var chat = $("#chat-btn");
  var users = $("#users-btn");
  var logoutBtn = $("#logout-btn");
  var userclick, chatclick;

  /* Ensure the status is set right at page load. */
  chat.toggleClass("active", layout.hasClass("chat-enabled"));
  users.toggleClass("active", layout.hasClass("chat-enabled"));

  chat.click(function() {
    if(chatclick) clearTimeout(chatclick);
    layout.toggleClass("chat-enabled");
    chat.toggleClass("active", layout.hasClass("chat-enabled"));
    chatclick = setTimeout(function(){
      Whiteboard.windowResized();
    }, 1100);
  });

  users.click(function() {
    if(userclick) clearTimeout(userclick);
    layout.toggleClass("users-enabled");
    users.toggleClass("active", layout.hasClass("users-enabled"));
    userclick = setTimeout(function() {
      Whiteboard.windowResized('users');
    }, 1100);
  });

  logoutBtn.click(function() { Connection.emitLogout() });

  $("#prev-slide-btn").click(function() { Connection.emitPrevSlide(); });
  $("#next-slide-btn").click(function() { Connection.emitNextSlide(); });
  $("#tool-pan-btn").click(function() { Connection.emitChangeTool('panzoom'); });
  $("#tool-line-btn").click(function() { Connection.emitChangeTool('line'); });
  $("#tool-rect-btn").click(function() { Connection.emitChangeTool('rect'); });
  $("#tool-ellipse-btn").click(function() { Connection.emitChangeTool('ellipse'); });

  $("button#chat-send").on("click", function(e) {
    e.preventDefault();
    Chat.sendMessage();
    return false;
  });

  // $("#chat_input_box").on("keyup", function(e) {
  //   count = $(this).attr("maxlength");
  //   chcount.innerHTML = max - chatbox.value.length;
  // });

});
