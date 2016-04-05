package org.bigbluebutton.air.main.views.menubuttons.changestatus {
	import flash.events.MouseEvent;
	
	import mx.collections.ArrayCollection;
	import mx.core.ClassFactory;
	import mx.core.FlexGlobals;
	import mx.events.FlexMouseEvent;
	
	import spark.components.SkinnablePopUpContainer;
	import spark.layouts.HorizontalLayout;
	
	import flashx.textLayout.container.ScrollPolicy;
	
	import org.bigbluebutton.lib.main.commands.EmojiSignal;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ChangeStatusPopUpMediator extends Mediator {
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var view:IChangeStatusPopUp;
		
		[Inject]
		public var emojiSignal:EmojiSignal;
		
		protected var dataProvider:ArrayCollection;
		
		override public function initialize():void {
			view.statusList.addEventListener(MouseEvent.CLICK, onSelectStatus);
			
			for (var i:Number = 0; i < view.statusList.dataProvider.length; i++) {
				if (userSession.userList.me.status == view.statusList.dataProvider.getItemAt(i).signal) {
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
			if (FlexGlobals.topLevelApplication.aspectRatio == "landscape") {
				view.statusList.layout = new HorizontalLayout();
				view.statusList.width = FlexGlobals.topLevelApplication.width;
				view.statusList.setStyle('verticalScrollPolicy', ScrollPolicy.OFF);
				view.statusList.itemRenderer = new ClassFactory(HorizontalStatusItemRenderer);
			} else {
				
			}
		}
		
		private function onSelectStatus(event:MouseEvent):void {
			var obj:Object;
			obj = view.statusList.selectedItem;
			emojiSignal.dispatch(view.statusList.selectedItem.signal);
			(view as SkinnablePopUpContainer).close();
		}
		
		override public function destroy():void {
			view.statusList.addEventListener(MouseEvent.CLICK, onSelectStatus);
			view.dispose();
			view = null;
			super.destroy();
		}
	
	}
}
