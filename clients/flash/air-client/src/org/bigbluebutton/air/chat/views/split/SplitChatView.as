package org.bigbluebutton.air.chat.views.split {
	
	import flash.events.MouseEvent;
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.RadioButtonGroup;
	import spark.components.ViewNavigator;
	
	public class SplitChatView extends SplitChatViewBase implements ISplitChatView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function dispose():void {
		}
		
		public function get participantsList():ViewNavigator {
			return participantslist0;
		}
		
		public function get participantDetails():ViewNavigator {
			return participantdetails0;
		}
	}
}
