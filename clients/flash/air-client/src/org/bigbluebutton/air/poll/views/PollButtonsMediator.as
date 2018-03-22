package org.bigbluebutton.air.poll.views {
	import flash.events.MouseEvent;
	
	import spark.components.Button;
	
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.poll.commands.RespondToPollSignal;
	import org.bigbluebutton.air.poll.models.PollChangeEnum;
	import org.bigbluebutton.air.poll.models.PollVO;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class PollButtonsMediator extends Mediator {
		
		[Inject]
		public var view:PollButtons;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var respondToPollSignal:RespondToPollSignal;
		
		public override function initialize():void {
			meetingData.polls.pollChangeSignal.add(onPollChange);
			view.addEventListener(MouseEvent.CLICK, viewMouseEventHandler);
		}
		
		private function viewMouseEventHandler(event:MouseEvent):void {
			if (event.target is Button) {
				view.removeAllElements();
				respondToPollSignal.dispatch(event.target.name);
			}
		}
		
		private function onPollChange(poll:PollVO, enum:int):void {
			switch (enum) {
				case PollChangeEnum.START:
					view.removeAllElements();
					view.addButtons(poll);
					view.visible = true;
					break;
				case PollChangeEnum.STOP:
					view.removeAllElements();
					view.visible = false;
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
