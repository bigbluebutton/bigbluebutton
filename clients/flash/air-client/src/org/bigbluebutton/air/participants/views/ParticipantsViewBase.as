package org.bigbluebutton.air.participants.views {
	import mx.core.ClassFactory;
	import mx.core.IFactory;
	import mx.graphics.SolidColor;
	
	import org.bigbluebutton.air.chat.models.GroupChat;
	import org.bigbluebutton.air.chat.views.ChatRoomsItemRenderer;
	import org.bigbluebutton.air.participants.models.ParticipantTitle;
	import org.bigbluebutton.air.user.views.UserItemRenderer;
	import org.bigbluebutton.air.user.views.models.UserVM;
	
	import spark.components.Group;
	import spark.components.List;
	import spark.layouts.VerticalLayout;
	import spark.primitives.Rect;
	
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
			_participantsList.typicalItem = new GroupChat("sample", "Sample", true, "", "");
			addElement(_participantsList);
		}
		
		private function participantItemRendererFunction(item:Object):IFactory {
			var factory:ClassFactory;
			if (item is ParticipantTitle) {
				factory = new ClassFactory(ParticipantTitleItemRenderer);
			} else if (item is UserVM) {
				factory = new ClassFactory(UserItemRenderer);
			} else if (item is GroupChat) {
				factory = new ClassFactory(ChatRoomsItemRenderer);
			}
			return factory;
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			SolidColor(_background.fill).color = getStyle("backgroundColor");
		}
	}
}
