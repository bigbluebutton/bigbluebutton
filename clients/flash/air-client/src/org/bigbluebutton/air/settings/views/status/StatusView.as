package org.bigbluebutton.air.settings.views.status {
	
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.settings.views.status.StatusViewBase;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.RadioButtonGroup;
	
	public class StatusView extends StatusViewBase implements IStatusView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function dispose():void {
		}
		
		public function get moodList():List {
			return moodList0;
		}
	}
}
