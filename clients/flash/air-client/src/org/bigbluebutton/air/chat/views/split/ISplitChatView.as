package org.bigbluebutton.air.chat.views.split {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.RadioButtonGroup;
	import spark.components.ViewNavigator;
	
	public interface ISplitChatView extends IView {
		function get participantDetails():ViewNavigator;
		function get participantsList():ViewNavigator;
	}
}
