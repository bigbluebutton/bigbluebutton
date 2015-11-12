package org.bigbluebutton.air.main.views {
	
	import flash.events.MouseEvent;
	
	import spark.components.ViewNavigator;
	
	public class PagesNavigatorView extends ViewNavigator implements IPagesNavigatorView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
		public function onClick(e:MouseEvent):void {
		}
		
		public function dispose():void {
		}
	}
}
