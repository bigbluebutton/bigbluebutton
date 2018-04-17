package org.bigbluebutton.air.main.views
{
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.main.commands.UserInactivityTimerResponseSignal;
	
	import robotlegs.bender.bundles.mvcs.Mediator;

	public class UserInactivityPopUpMediator extends Mediator
	{
		[Inject]
		public var view:UserInactivityPopUp;
		
		[Inject]
		public var userInactivityTimerResponseSignal:UserInactivityTimerResponseSignal;
		
		override public function initialize():void {
			view.okButton.visible = true;
			view.okButton.addEventListener(MouseEvent.CLICK, okButtonClicked);
		}
		
		override public function destroy():void {
			view.okButton.removeEventListener(MouseEvent.CLICK, okButtonClicked);
		}
		
		private function okButtonClicked(event:Event):void {
			userInactivityTimerResponseSignal.dispatch();
			view.close();
		}
	}
}