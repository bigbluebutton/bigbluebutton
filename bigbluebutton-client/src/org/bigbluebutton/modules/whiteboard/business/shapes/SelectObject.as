package org.bigbluebutton.modules.whiteboard.business.shapes
{
	public class SelectObject {
		public static const SELECT_TOOL:String = "selector";
		public static const DELETE_TOOL:String = "deletor";
		
		public var selection_type:String;
		
		public function SelectObject(type:String) {
			this.selection_type = type;
		}
	}
}