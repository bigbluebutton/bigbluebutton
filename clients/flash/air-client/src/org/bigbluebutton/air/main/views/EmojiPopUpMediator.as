package org.bigbluebutton.air.main.views {
	import flash.events.MouseEvent;
	
	import mx.collections.ArrayCollection;
	import mx.events.FlexMouseEvent;
	
	import spark.components.SkinnablePopUpContainer;
	
	import org.bigbluebutton.air.main.commands.EmojiSignal;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.user.models.EmojiStatus;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class EmojiPopUpMediator extends Mediator {
		
		[Inject]
		public var meetingData:IMeetingData;
		
		[Inject]
		public var view:EmojiPopUp;
		
		[Inject]
		public var emojiSignal:EmojiSignal;
		
		protected var dataProvider:ArrayCollection;
		
		override public function initialize():void {
			fillEmojiData();
			
			for (var i:Number = 0; i < view.statusList.dataProvider.length; i++) {
				if (meetingData.users.me.emoji == view.statusList.dataProvider.getItemAt(i).signal) {
					view.statusList.setSelectedIndex(i);
					break;
				}
			}
			
			view.statusList.addEventListener(MouseEvent.CLICK, onSelectStatus);
			view.addEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, closePopUp);
		}
		
		private function closePopUp(e:FlexMouseEvent):void {
			(view as SkinnablePopUpContainer).close(false);
		}
		
		private function onSelectStatus(event:MouseEvent):void {
			emojiSignal.dispatch(meetingData.users.me, view.statusList.selectedItem.signal);
			view.close();
		}
		
		private function fillEmojiData():void {
			view.statusList.dataProvider = new ArrayCollection([{label: "Raise", signal: EmojiStatus.RAISE_HAND}, {label: "Happy", signal: EmojiStatus.HAPPY}, {label: "Undecided", signal: EmojiStatus.NEUTRAL}, {label: "Sad", signal: EmojiStatus.SAD}, {label: "Confused", signal: EmojiStatus.CONFUSED}, {label: "Away", signal: EmojiStatus.AWAY}, {label: "Thumbs up", signal: EmojiStatus.THUMBS_UP}, {label: "Thumbs down", signal: EmojiStatus.THUMBS_DOWN}, {label: "Applause", signal: EmojiStatus.APPLAUSE}]);
			
			if (meetingData.users.me.emoji != EmojiStatus.NO_STATUS) {
				ArrayCollection(view.statusList.dataProvider).addItem({label: "Clear", signal: EmojiStatus.NO_STATUS});
			}
		}
		
		override public function destroy():void {
			view.statusList.addEventListener(MouseEvent.CLICK, onSelectStatus);
			view.removeEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, closePopUp);
			view.close();
			view = null;
			super.destroy();
		}
	
	}
}
