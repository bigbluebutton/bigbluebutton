package org.bigbluebutton.air.participants.views {
	import mx.core.ClassFactory;
	import mx.core.IFactory;
	import mx.graphics.SolidColor;
	
	import spark.components.Group;
	import spark.components.List;
	import spark.primitives.Rect;
	
	import org.bigbluebutton.air.chat.models.GroupChat;
	import org.bigbluebutton.air.chat.views.ChatRoomsItemRenderer;
	import org.bigbluebutton.air.participants.models.ParticipantTitle;
	import org.bigbluebutton.air.user.views.UserItemRenderer;
	import org.bigbluebutton.air.user.views.models.UserVM;
	
	public class ParticipantsViewBase extends Group {
		
		private var _background:Rect;
		
		private var _participantsList:List;
		
		public function get participantsList():List {
			return _participantsList;
		}
		
		public function ParticipantsViewBase() {
			super();
			
			_background = new Rect();
			_background.percentHeight = 100;
			_background.percentWidth = 100;
			_background.fill = new SolidColor();
			addElementAt(_background, 0);
			
			_participantsList = new List();
			_participantsList.percentWidth = 100;
			_participantsList.percentHeight = 100;
			_participantsList.itemRendererFunction = participantItemRendererFunction;
			addElement(_participantsList);
		}
		
		private function participantItemRendererFunction(item:Object):IFactory {
			var factory:ClassFactory;
			switch (item.constructor) {
				case ParticipantTitle:
					factory = new ClassFactory(ParticipantTitleItemRenderer);
					break;
				case UserVM:
					factory = new ClassFactory(UserItemRenderer);
					break;
				case GroupChat:
					factory = new ClassFactory(ChatRoomsItemRenderer);
					break;
				default:
					// Unknown data type
					break;
			}
			return factory;
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			SolidColor(_background.fill).color = getStyle("backgroundColor");
		}
	}
}
