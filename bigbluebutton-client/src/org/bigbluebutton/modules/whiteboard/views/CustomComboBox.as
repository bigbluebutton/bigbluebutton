package org.bigbluebutton.modules.whiteboard.views
{
	import flash.events.Event;
	import flash.events.FocusEvent;
	
	import mx.controls.ComboBox;
	
	public class CustomComboBox extends ComboBox
	{
		private var _allowClose:Boolean = true;
		
		public function CustomComboBox()
		{
			super();
		}
		
		override protected function focusOutHandler(event:FocusEvent):void {
			_allowClose = false;
			
			super.focusOutHandler(event);
			
			_allowClose = true;
		}
		
		override public function close(trigger:Event=null):void {
			if (_allowClose) {
				super.close(trigger);
			}
		}
	}
}