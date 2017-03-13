package org.bigbluebutton.common {
	import mx.controls.NumericStepper;
	import mx.controls.TextInput;
	import mx.core.mx_internal;
	
	/* The purpose of this class is to propagate the toolTip value to the internal 
	 * text field so screen readers can read out the description.
	 */
	
	public class AccessibleNumericStepper extends NumericStepper {
		public function AccessibleNumericStepper() {
			super();
		}
		
		override protected function createChildren():void {
			var inputFieldCreated:Boolean = !mx_internal::inputField;
			
			super.createChildren();
			
			if (inputFieldCreated && toolTip && mx_internal::inputField is TextInput) {
				(mx_internal::inputField as TextInput).toolTip = toolTip;
			}
		}
		
		override public function set toolTip(value:String):void {
			super.toolTip = value;
			
			if (mx_internal::inputField && mx_internal::inputField is TextInput) {
				(mx_internal::inputField as TextInput).toolTip = toolTip;
			}
		}
	}
}