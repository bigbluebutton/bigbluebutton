package org.bigbluebutton.web.deskshare.views {
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.deskshare.views.DeskshareMediator;
	
	public class DeskshareWindowMediator extends DeskshareMediator {
		
		override public function onDeskshareStreamChange(isDeskshareStreaming:Boolean):void {
			if (isDeskshareStreaming) {
				(view as DeskshareWindow).showWindow();
			} else {
				(view as DeskshareWindow).hideWindow();
			}
			super.onDeskshareStreamChange(isDeskshareStreaming);
		}
	
	}
}
