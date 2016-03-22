package org.bigbluebutton.web.presentation.views {
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.presentation.commands.LoadSlideSignal;
	import org.bigbluebutton.lib.presentation.models.Presentation;
	import org.bigbluebutton.lib.presentation.models.Slide;
	import org.bigbluebutton.lib.presentation.models.SlideModel;
	import org.bigbluebutton.lib.presentation.utils.CursorIndicator;
	import org.bigbluebutton.lib.presentation.views.PresentationMediator;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class PresentationWindowMediator extends PresentationMediator {
		
		
		override public function initialize():void {
			super.initialize();
			(view as PresentationWindow).resizeWindowSignal.add(windowResized);
		}
		
		private function windowResized() {
			_slideModel.parentChange(view.content.width, view.content.height);
			resizePresentation()
		}
		
		override public function destroy():void {
			super.destroy();
			(view as PresentationWindow).resizeWindowSignal.remove(windowResized);
		}
	}
}
