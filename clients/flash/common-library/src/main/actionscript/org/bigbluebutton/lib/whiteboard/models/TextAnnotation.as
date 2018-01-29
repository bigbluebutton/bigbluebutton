package org.bigbluebutton.lib.whiteboard.models {
	
	import flashx.textLayout.formats.VerticalAlign;
	
	import spark.components.Group;
	import spark.components.RichText;
	
	public class TextAnnotation extends Annotation {
		private var _richText:RichText;
		
		public function TextAnnotation(id:String, userId:String, type:String, status:String, annInfo:Object) {
			super(id, userId, type, status, annInfo);
		}
		
		override protected function makeGraphic():void {
			_richText.text = annInfo.text;
			trace("text: = " + annInfo.text);
			_richText.setStyle("fontSize", denormalize(annInfo.calcedFontSize, _parentHeight));
			_richText.setStyle("fontFamily", "Arial");
			_richText.setStyle("color", annInfo.color);
			_richText.setStyle("verticalAlign", VerticalAlign.TOP);
			_richText.x = denormalize(annInfo.x, _parentWidth);
			_richText.y = denormalize(annInfo.y, _parentHeight);
			_richText.width = denormalize(annInfo.textBoxWidth, _parentWidth);
			_richText.height = denormalize(annInfo.textBoxHeight, _parentHeight);
		}
		
		override public function draw(canvas:Group):void {
			if (!_richText) {
				_richText = new RichText();
			}
			
			super.draw(canvas);
			
			if (!canvas.containsElement(_richText)) {
				canvas.addElement(_richText);
			}
		}
		
		override public function remove(canvas:Group):void {
			if (!!_richText && canvas.containsElement(_richText)) {
				canvas.removeElement(_richText);
				_richText = null;
				super.remove(canvas);
			}
		}
	}
}
