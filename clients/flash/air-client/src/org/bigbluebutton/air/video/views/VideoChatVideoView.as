package org.bigbluebutton.air.video.views {
	
	import flash.display.GradientType;
	import flash.display.Graphics;
	import flash.display.InterpolationMethod;
	import flash.display.Loader;
	import flash.display.Shape;
	import flash.display.SpreadMethod;
	import flash.events.Event;
	import flash.geom.*;
	import flash.net.URLRequest;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.air.common.views.VideoView;
	
	public class VideoChatVideoView extends VideoView {
		private var _userName:TextField;
		
		private var _shape:Shape;
		
		private var _loader:Loader;
		
		public function setVideoPosition(name:String):void {
			if (video && stage.contains(video)) {
				stage.removeChild(video);
			}
			resizeForPortrait();
			var topActionBarHeight:Number = FlexGlobals.topLevelApplication.topActionBar.height;
			video.y = topActionBarHeight + (screenHeight - video.height) / 2;
			video.x = (stage.stageWidth - video.width) / 2;
			addLoadingImage();
			if (!this.stage.contains(_loader)) {
				this.stage.addChild(_loader);
			}
			this.stage.addChild(video);
			identifyVideoStream(video.x, video.height + video.y, name);
		}
		
		private function identifyVideoStream(x:Number, y:Number, name:String):void {
			this.styleName = "videoTextFieldStyle";
			var nameFormat:TextFormat = new TextFormat();
			nameFormat.size = this.getStyle("fontSize");
			nameFormat.font = this.getStyle("font-family");
			nameFormat.indent = this.getStyle("indent");
			_userName = new TextField();
			_userName.autoSize = TextFieldAutoSize.LEFT;
			_userName.text = name;
			_userName.textColor = this.getStyle("color");
			_userName.setTextFormat(nameFormat, 0, name.length);
			_userName.x = x;
			_userName.y = y - _userName.textHeight * 1.5;
			var gradientMatrixWidth:Number = video.width;
			var gradientMatrixHeight:Number = _userName.height * 2;
			var gradientMatrixRotation:Number = 1.57;
			var gradientTx:Number = 0;
			var gradientTy:Number = 0;
			var gradientDrawWidth:Number = video.width;
			var gradientDrawHeight:Number = _userName.height * 2;
			var gradientOffsetX:Number = video.x;
			var gradientOffsetY:Number = video.y + video.height - gradientDrawHeight;
			var gradientMatrix:Matrix = new Matrix();
			gradientMatrix.createGradientBox(gradientMatrixWidth, gradientMatrixHeight, gradientMatrixRotation, gradientTx + gradientOffsetX, gradientTy + gradientOffsetY);
			var gradientType:String = GradientType.LINEAR;
			var gradientColors:Array = [0x606060, 0x393939, 0x1C1C1C, 0x000000];
			var gradientAlphas:Array = [0, 0.3, 0.6, 1];
			var gradientRatios:Array = [0, 90, 180, 255];
			var gradientSpreadMethod:String = SpreadMethod.PAD;
			var gradientInterpolationMethod:String = InterpolationMethod.LINEAR_RGB;
			var gradientFocalPoint:Number = 0;
			_shape = new Shape();
			var gradientGraphics:Graphics = _shape.graphics;
			gradientGraphics.beginGradientFill(gradientType, gradientColors, gradientAlphas, gradientRatios, gradientMatrix, gradientSpreadMethod, gradientInterpolationMethod, gradientFocalPoint);
			gradientGraphics.drawRect(gradientOffsetX, gradientOffsetY, gradientDrawWidth, gradientDrawHeight);
			gradientGraphics.endFill();
			this.stage.addChild(_shape);
			this.stage.addChild(_userName);
		}
		
		override public function close():void {
			super.close();
			if (_userName && this.stage.contains(_userName)) {
				this.stage.removeChild(_userName);
			}
			if (_shape && this.stage.contains(_shape)) {
				this.stage.removeChild(_shape);
			}
			if (_loader && this.stage.contains(_loader)) {
				this.stage.removeChild(_loader);
			}
		}
		
		private function addLoadingImage():void {
			this.styleName = "videoTextFieldStyle";
			var url:URLRequest = new URLRequest(this.getStyle("loadingImageSource"));
			_loader = new Loader();
			_loader.contentLoaderInfo.addEventListener(Event.COMPLETE, onImageLoaded);
			_loader.load(url);
		}
		
		private function onImageLoaded(e:Event):void {
			_loader.x = (screenWidth - _loader.content.width) / 2;
			_loader.y = (screenHeight - _loader.content.height) / 2;
			_loader.alpha = 0.5;
			_loader.contentLoaderInfo.removeEventListener(Event.COMPLETE, onImageLoaded);
		}
	}
}
