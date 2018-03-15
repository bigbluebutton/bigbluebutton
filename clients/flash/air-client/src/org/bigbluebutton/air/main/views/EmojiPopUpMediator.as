package org.bigbluebutton.air.main.views {
	import flash.events.MouseEvent;
	
	import mx.collections.ArrayCollection;
	import mx.events.FlexMouseEvent;
	
	import spark.components.SkinnablePopUpContainer;
	
	import org.bigbluebutton.air.main.commands.EmojiSignal;
	import org.bigbluebutton.air.main.models.IMeetingData;
	
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
			view.statusList.addEventListener(MouseEvent.CLICK, onSelectStatus);
			
			for (var i:Number = 0; i < view.statusList.dataProvider.length; i++) {
				if (meetingData.users.me.emoji == view.statusList.dataProvider.getItemAt(i).signal) {
					view.statusList.setSelectedIndex(i);
					break;
				}
			}
			updateListOrientation();
			view.addEventListener(FlexMouseEvent.MOUSE_DOWN_OUTSIDE, closePopUp);
		}
		
		private function closePopUp(e:FlexMouseEvent):void {
			(view as SkinnablePopUpContainer).close(false);
		}
		
		private function updateListOrientation():void {
		/*
		   if (FlexGlobals.topLevelApplication.aspectRatio == "landscape") {
		   view.statusList.layout = new HorizontalLayout();
		   view.statusList.width = FlexGlobals.topLevelApplication.width;
		   view.statusList.setStyle('verticalScrollPolicy', ScrollPolicy.OFF);
		   view.statusList.itemRenderer = new ClassFactory(HorizontalStatusItemRenderer);
		   } else {
		
		   }
		 */
		}
		
		private function onSelectStatus(event:MouseEvent):void {
			emojiSignal.dispatch(meetingData.users.me, view.statusList.selectedItem.signal);
			view.close();
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
