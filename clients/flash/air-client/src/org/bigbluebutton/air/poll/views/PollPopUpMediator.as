package org.bigbluebutton.air.poll.views {
	import flash.events.MouseEvent;
	import flash.events.StageOrientationEvent;
	
	import spark.components.Application;
	import spark.components.Button;
	
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.poll.commands.RespondToPollSignal;
	import org.bigbluebutton.air.poll.models.PollChangeEnum;
	import org.bigbluebutton.air.poll.models.PollVO;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class PollPopUpMediator extends Mediator {
		
		[Inject]
		public var view:PollPopUp;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var respondToPollSignal:RespondToPollSignal;
		
		public override function initialize():void {
			meetingData.polls.pollChangeSignal.add(onPollChange);
			view.addEventListener(MouseEvent.CLICK, viewMouseEventHandler);
			
			view.removeAllElements();
			view.addButtons(meetingData.polls.getCurrentPoll());
			view.stage.addEventListener(StageOrientationEvent.ORIENTATION_CHANGE, onStageOrientation);
		}
		
		private function viewMouseEventHandler(event:MouseEvent):void {
			if (event.target == view.closeButton) {
				view.close();
			} else if (event.target is Button) {
				respondToPollSignal.dispatch(event.target.name);
				view.close();
			}
		}
		
		private function onStageOrientation(event:StageOrientationEvent):void {
			view.addButtons(meetingData.polls.getCurrentPoll());
			view.maxHeight = Application(view.parentApplication).height - 120;
		}
		
		private function onPollChange(poll:PollVO, enum:int):void {
			switch (enum) {
				case PollChangeEnum.STOP:
					view.close();
					break;
				default:
					break;
			}
		}
		
		public override function destroy():void {
			meetingData.polls.pollChangeSignal.remove(onPollChange);
			view.removeEventListener(MouseEvent.CLICK, viewMouseEventHandler);
		}
	
	}
}
