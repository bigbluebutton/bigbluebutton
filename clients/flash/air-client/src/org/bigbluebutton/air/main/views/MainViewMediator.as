package org.bigbluebutton.air.main.views {
	import flash.display.DisplayObjectContainer;
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.poll.commands.RespondToPollSignal;
	import org.bigbluebutton.air.poll.models.PollChangeEnum;
	import org.bigbluebutton.air.poll.models.PollVO;
	import org.bigbluebutton.air.poll.views.PollPopUp;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class MainViewMediator extends Mediator {
		
		[Inject]
		public var view:MainView;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var respondToPollSignal:RespondToPollSignal;
		
		override public function initialize():void {
			meetingData.polls.pollChangeSignal.add(onPollChange);
			respondToPollSignal.add(onRespondToPollSignal);
			view.pollButton.addEventListener(MouseEvent.CLICK, onPollButtonMouseClick);
			if (meetingData.polls.getCurrentPoll() && !meetingData.polls.getCurrentPoll().answered) {
				view.showPollingButton(true);
			}
		}
		
		private function onPollButtonMouseClick(event:MouseEvent):void {
			var pollPopUp:PollPopUp = new PollPopUp();
			pollPopUp.open(view.parentApplication as DisplayObjectContainer, true);
		}
		
		private function onRespondToPollSignal(answer:String):void {
			view.showPollingButton(false);
		}
		
		private function onPollChange(poll:PollVO, enum:int):void {
			switch (enum) {
				case PollChangeEnum.START:
					view.showPollingButton(true);
					break;
				case PollChangeEnum.STOP:
					view.showPollingButton(false);
					break;
				default:
					break;
			}
		}
		
		override public function destroy():void {
			meetingData.polls.pollChangeSignal.remove(onPollChange);
		}
	}
}
