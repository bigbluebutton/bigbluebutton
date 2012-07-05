package org.bigbluebutton.modules.whiteboard.business.shapes
{
	public class TextFactory extends GraphicFactory
	{
		private var _parentWidth:Number = 0;
		private var _parentHeight:Number = 0;
		
		public function TextFactory() {
			super(GraphicFactory.TEXT_FACTORY);
		}


		public function setParentDim(width:Number, height:Number):void {
			_parentWidth = width;
			_parentHeight = height;
		}
		
		override public function denormalize(val:Number, side:Number):Number {
			return (val*side)/100.0;
		}
		
		override public function normalize(val:Number, side:Number):Number {
			return (val*100.0)/side;
		}
		
		public function cloneTextObject(txt:String, txtColor:uint,
										 bgColor:uint, bgColorVisible:Boolean,
										 x:Number, y:Number):TextObject {
			var tobj:TextObject = new TextObject();
			tobj.x = x;
			tobj.y = y;
			tobj.text = txt;
			tobj.textColor = txtColor;
			tobj.bgColor = bgColor;
			tobj.bgColorVisible = bgColorVisible;
			return tobj;
		}
		
		public function createTextObject(txt:String, txtColor:uint,
										 bgColor:uint, bgColorVisible:Boolean,
										 x:Number, y:Number):TextObject {
			var tobj:TextObject = new TextObject();
			tobj.x = normalize(x,_parentWidth);
			tobj.y = normalize(y,_parentHeight);
			tobj.text = txt;
			tobj.textColor = txtColor;
			tobj.bgColor = bgColor;
			tobj.bgColorVisible = bgColorVisible;
			tobj.makeGraphic(_parentWidth,_parentHeight);
			return tobj;
		}
		
		public function makeTextObject(t:TextObject):TextObject {
			// pretty much a dummy method until further subclasses
			// of TextObject come into play
			var tobj:TextObject = new TextObject();
			tobj.text = t.text;
			tobj.textColor = t.textColor;
			tobj.bgColor = t.bgColor;
			tobj.bgColorVisible = t.bgColorVisible;
			tobj.x = normalize(t.x,_parentWidth);
			tobj.y = normalize(t.y,_parentHeight);
			tobj.makeGraphic(_parentWidth,_parentHeight);
			return tobj;
		}

		public function getParentWidth():Number {
			return _parentWidth;
		}
		
		public function getParentHeight():Number {
			return _parentHeight;
		}
	}
}