package org.bigbluebutton.modules.caption.views
{
	import mx.controls.TextArea;
	import mx.core.IUITextField;
	import mx.core.UITextField;
	
	public class TextArea2 extends TextArea
	{
		public function TextArea2()
		{
			super();
		}
		
		public function getInternalTextField():UITextField {
			return textField as UITextField;
		}
	}
}