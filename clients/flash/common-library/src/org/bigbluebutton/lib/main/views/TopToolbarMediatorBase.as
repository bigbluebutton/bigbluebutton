package org.bigbluebutton.lib.main.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class TopToolbarMediatorBase extends Mediator {
		[Inject]
		public var view:TopToolbarBase;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		override public function initialize():void {
			view.leftButton.addEventListener(MouseEvent.CLICK, leftButtonClickHandler);
			view.rightButton.addEventListener(MouseEvent.CLICK, rightButtonClickHandler);
			
			userSession.successJoiningMeetingSignal.add(onSuccessJoiningSignal);
		}
		
		protected function leftButtonClickHandler(e:MouseEvent):void {
			
		}
		
		protected function rightButtonClickHandler(e:MouseEvent):void {
			
		}
		
		protected function onSuccessJoiningSignal():void {
			userSession.successJoiningMeetingSignal.remove(onSuccessJoiningSignal);
			
			view.titleLabel.text = conferenceParameters.meetingName;
		}
		
		override public function destroy():void {
			view.leftButton.removeEventListener(MouseEvent.CLICK, leftButtonClickHandler);
			view.rightButton.removeEventListener(MouseEvent.CLICK, rightButtonClickHandler);
			
			userSession.successJoiningMeetingSignal.remove(onSuccessJoiningSignal);
			
			super.destroy();
			view = null;
		}
	}
}
