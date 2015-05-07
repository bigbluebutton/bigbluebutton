package org.bigbluebutton.air.main.views {
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class RecordingStatusMediator extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var view:IRecordingStatus;
		
		override public function initialize():void {
			userSession.recordingStatusChangedSignal.add(setRecordingStatus);
		}
		
		public function setRecordingStatus(recording:Boolean):void {
			view.setVisibility(recording);
			//try to keep page title center
			if (recording) {
				FlexGlobals.topLevelApplication.pageName.setStyle("paddingLeft", FlexGlobals.topLevelApplication.recordingStatus.getStyle("width"));
			} else {
				FlexGlobals.topLevelApplication.pageName.setStyle("paddingLeft", 0);
			}
		}
		
		override public function destroy():void {
			userSession.recordingStatusChangedSignal.remove(setRecordingStatus);
		}
	}
}
