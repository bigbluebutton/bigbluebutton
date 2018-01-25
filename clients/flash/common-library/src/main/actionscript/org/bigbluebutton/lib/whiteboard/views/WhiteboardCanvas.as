package org.bigbluebutton.lib.whiteboard.views {
	import spark.components.Group;
	import spark.core.SpriteVisualElement;
	
	public class WhiteboardCanvas extends Group {
		public var resizeCallback:Function;
		
		public var whiteboardChangeCallback:Function;
		
		public var annotationHolder:Group;
		
		public var cursorHolder:SpriteVisualElement;
		
		public function WhiteboardCanvas() {
			super();
			
			annotationHolder = new Group();
			annotationHolder.percentWidth = 100;
			annotationHolder.percentHeight = 100;
			addElement(annotationHolder);
			
			cursorHolder = new SpriteVisualElement();
			cursorHolder.percentWidth = 100;
			cursorHolder.percentHeight = 100;
			addElement(cursorHolder);
		}
		
		public function moveCanvas(x:Number, y:Number, width:Number, height:Number):void {
			var dimensionsChanged:Boolean = this.width != width || this.height != height;
			
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.validateNow();
			if (resizeCallback != null && dimensionsChanged)
				// FIXME: component lifecyle must respected to avoid using callLater method
				//callLater(_resizeCallback);
				resizeCallback();
		}
		
		public function changeWhiteboard(wbId:String):void {
			if (whiteboardChangeCallback != null) {
				whiteboardChangeCallback(wbId);
			}
		}
		
		public function dispose():void {
		}
	}
}
