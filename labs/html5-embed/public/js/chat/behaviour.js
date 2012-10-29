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
    windowResized();
  }, 1100);
});

users.click(function() {
  if(userclick) clearTimeout(userclick);
	layout.toggleClass("users-enabled");
	users.toggleClass("active", layout.hasClass("users-enabled"));
  userclick = setTimeout(function() {
    windowResized('users');
  }, 1100);
});

logoutBtn.click(function() { logout() });

$("#prev-slide-btn").click(function() { prevImg(); });
$("#next-slide-btn").click(function() { nextImg(); });
$("#tool-pan-btn").click(function() { changeTool('panzoom'); });
$("#tool-line-btn").click(function() { changeTool('line'); });
$("#tool-rect-btn").click(function() { changeTool('rect'); });
$("#tool-ellipse-btn").click(function() { changeTool('ellipse'); });
