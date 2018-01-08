package org.bigbluebutton.lib.main.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class TopToolbarMediatorBase extends Mediator {
		
		[Inject]
		public var view:TopToolbarBase;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		override public function initialize():void {
			view.leftButton.addEventListener(MouseEvent.CLICK, leftButtonClickHandler);
			view.rightButton.addEventListener(MouseEvent.CLICK, rightButtonClickHandler);
			
			setTitle();
		}
		
		protected function setTitle():void {
			view.titleLabel.text = conferenceParameters.meetingName;
		}
		
		protected function leftButtonClickHandler(e:MouseEvent):void {
		
		}
		
		protected function rightButtonClickHandler(e:MouseEvent):void {
		
		}
		
		override public function destroy():void {
			view.leftButton.removeEventListener(MouseEvent.CLICK, leftButtonClickHandler);
			view.rightButton.removeEventListener(MouseEvent.CLICK, rightButtonClickHandler);
			
			super.destroy();
			view = null;
		}
	}
}
