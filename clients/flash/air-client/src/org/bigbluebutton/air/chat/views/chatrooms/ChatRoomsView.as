package org.bigbluebutton.air.chat.views.chatrooms {
	
	import flash.events.MouseEvent;
	import spark.components.List;
	
	public class ChatRoomsView extends ChatRoomsViewBase implements IChatRoomsView {
		//private var _buttonTestSignal: Signal = new Signal();
		//public function get buttonTestSignal(): ISignal
		//{
		//	return _buttonTestSignal;
		//}
		public function get list():List {
			return chatroomslist;
		}
		
		override protected function childrenCreated():void {
			super.childrenCreated();
			//this.addEventListener(MouseEvent.CLICK, onClick);
		}
		
		public function onClick(e:MouseEvent):void {
			//buttonTestSignal.dispatch();
		}
		
		public function dispose():void {
		}
	}
}
