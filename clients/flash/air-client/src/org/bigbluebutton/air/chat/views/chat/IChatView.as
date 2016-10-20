package org.bigbluebutton.air.chat.views.chat {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.TextInput;
	
	public interface IChatView extends IView {
		function get list():List;
		function get inputMessage():TextInput;
		function get sendButton():Button;
		function get pageName():Label;
		function get newMessages():Group;
		function get newMessagesLabel():Label;
	}
}
