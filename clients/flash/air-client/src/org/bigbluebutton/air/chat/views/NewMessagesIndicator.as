package org.bigbluebutton.air.chat.views {
	import spark.components.Button;
	import spark.components.supportClasses.SkinnableComponent;
	import spark.core.IDisplayText;
	import spark.skins.spark.ButtonSkin;
	
	public class NewMessagesIndicator extends SkinnableComponent {
		
		/**
		 *  A skin part that defines the label of the indicator
		 */
		[SkinPart(required = "true")]
		public var labelDisplay:IDisplayText;
		
		/**
		 *  Text to appear on the indicator
		 */
		private var _label:String;
		
		public function set label(value:String):void {
			_label = value;
			
			if (labelDisplay)
				labelDisplay.text = label;
		}
		
		public function get label():String {
			return _label;
		}
		
		public function NewMessagesIndicator() {
			super();
		}
		
		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);
			
			if (instance == labelDisplay) {
				if (_label == null) {
					labelDisplay.text = "";
				} else {
					labelDisplay.text = label;
				}
			}
		}
	}
}
