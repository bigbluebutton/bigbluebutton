package org.bigbluebutton.modules.presentation.view.fisheye.controls
{



	import mx.core.UIComponent;
	import flash.display.DisplayObject;
	import flash.filters.DropShadowFilter;
	import flash.net.URLRequest;
	import flash.utils.*;

	import mx.core.IDataRenderer;
	import flash.display.*;
	import mx.effects.*;
	import flash.events.Event;
	import mx.core.IDataRenderer;
	import flash.events.ProgressEvent;
	import flash.geom.Rectangle;
	

	[Style(name="borderColor", type="Number", inherit="no")]
	[Style(name="borderAlpha", type="Number", inherit="no")]
	[Style(name="borderWidth", type="Number", inherit="no")]
	[Event("loaded")]
	public class BitmapTile extends UIComponent implements IDataRenderer
	{
		private static var _nextId:int = 0;
		private var _id:int;
		private var _loader:Loader;
		private var _loaded:Boolean = false;
		private var _imageWidth:Number = 80;
		private var _imageHeight:Number = 80;
		private const BORDER_WIDTH:Number = 1;
		private var _border:Shape;
		
		[Bindable] public var progress:Number = 0;
		public function get loaded():Boolean
		{
			return _loaded;
		}
		
		private function loadComplete(e:Event):void
		{
			_loaded = true;
			//_imageWidth = _loader.width;
			//_imageHeight = _loader.height;
			addChildAt(_loader,0);
			invalidateSize();
			invalidateDisplayList();
			invalidateSize();
			dispatchEvent(new Event("loaded"));			
		}
		
		private var _publicAlpha:Number = 1;
		private var _fadeValue:Number = 1;
		private var _data:Object;

		public function get imageBounds():Rectangle
		{
			var unscaledWidth:Number = this.unscaledWidth - 2;
			var unscaledHeight:Number = this.unscaledHeight - 2;
			var sX:Number = unscaledWidth/_imageWidth;
			var sY:Number = unscaledHeight/_imageHeight;
			var scale:Number = Math.min(sX,sY);
			var tX:Number = 1 + unscaledWidth/2 - (_imageWidth/2)*scale;
			var tY:Number = 1 + unscaledHeight/2 - (_imageHeight/2)*scale;
			
			return new Rectangle(tX,tY,_imageWidth*scale,_imageHeight*scale);
			_loader.x = tX;
			_loader.y = tY;
		}
		
		public function set data(value:Object):void
		{
			_loaded = false;
			progress= 0;
			_data = value;
			var url:String = String((_data is String)? _data:_data.thumb);
			_loader.load(new URLRequest(url));
			_loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loadComplete);	
			_loader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS,updateProgress);	
			
			invalidateDisplayList();
			invalidateSize();
		}
		
		public function get data():Object { return _data;}
		
		public function set fadeValue(value:Number):void
		{
			_fadeValue = value;
			super.alpha = _publicAlpha*_fadeValue;
		}
		public function get fadeValue():Number {return _fadeValue;}

		private function updateProgress(e:ProgressEvent):void
		{
			progress = e.bytesLoaded / e.bytesTotal;
		}
		override public function set alpha(value:Number):void
		{
			_publicAlpha = value;
			super.alpha = _publicAlpha*_fadeValue;
		}
		public function BitmapTile()
		{
			_id= _nextId++;

			_loader = new Loader;
			
//			visible = false;
			
			_border = new Shape();
			addChild(_border);

		}

		override protected function measure():void
		{
			measuredWidth = _imageWidth+2;
			measuredHeight = _imageHeight+2;
		}
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void
		{
				
			var g:Graphics = _border.graphics;
			g.clear();

			if(_loaded == false)
				return;
			
			var borderColor:* = getStyle("borderColor");
			var borderAlpha:* = getStyle("borderAlpha");
			var borderWidth:* = getStyle("borderWidth");
			
			if(isNaN(borderColor) || borderColor == null)
				borderColor = 0xBBBBBB;
			if(isNaN(borderAlpha) || borderAlpha == null)
				borderAlpha = 1;
			if(isNaN(borderWidth) || borderWidth == null)
				borderWidth = BORDER_WIDTH;				
				
			unscaledWidth -= 2;
			unscaledHeight -= 2;
			var sX:Number = unscaledWidth/_imageWidth;
			var sY:Number = unscaledHeight/_imageHeight;
			var scale:Number = Math.min(sX,sY);
			var tX:Number = 1 + unscaledWidth/2 - (_imageWidth/2)*scale;
			var tY:Number = 1 + unscaledHeight/2 - (_imageHeight/2)*scale;

			_loader.width = _imageWidth*scale;
			_loader.height = _imageHeight*scale;
			_loader.x = tX;
			_loader.y = tY;
							
			g.lineStyle(borderWidth,borderColor,borderAlpha,false,"normal",CapsStyle.NONE,JointStyle.MITER);
			g.moveTo(tX+borderWidth/2,tY+borderWidth/2);
			g.lineTo(tX+_loader.width-borderWidth/2,tY+borderWidth/2);
			g.lineTo(tX+_loader.width-borderWidth/2,tY+_loader.height-borderWidth/2);
			g.lineTo(tX+borderWidth/2,tY+_loader.height-borderWidth/2);
			g.lineTo(tX+borderWidth/2,tY+borderWidth/2);

		}
	}
}