package org.bigbluebutton.common {
	import flash.events.FocusEvent;
	import flash.system.Capabilities;
	import flash.system.IME;
	import flash.text.TextField;
	
	import mx.core.IIMESupport;
	
	public class IMETextField extends TextField implements IIMESupport {
		private var _imeMode:String = null;
		
		public function IMETextField() {
			super();
			
			// Only bind to FOCUS_IN. The FOCUS_OUT doesn't matter
			addEventListener(FocusEvent.FOCUS_IN, focusInHandler);
		}
		
		public function get enableIME():Boolean {
			return true;
		}
		
		// This getter/setter pair is never used, but it's required for the interface
		public function get imeMode():String {
			return _imeMode;
		}
		
		public function set imeMode(value:String):void {
			_imeMode = value;
		}
		
		protected function focusInHandler(e:FocusEvent):void {
			/* The Adobe documentation on IME is out of date and should be ignored. 
			 * See SDK FocusManager focusInHandler() function for current method of
			 * handling. Unfortunately the TextField "focus in" is ignored by the 
			 * FocusManager so we need to handle it ourselves.
			 */
			if (Capabilities.hasIME) {
				IME.enabled = enableIME;
			}
		}
	}
}