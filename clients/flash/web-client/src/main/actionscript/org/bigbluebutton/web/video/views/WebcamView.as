package org.bigbluebutton.web.video.views {
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.net.NetConnection;
	
	import mx.controls.Label;
	import mx.core.UIComponent;
	
	import org.bigbluebutton.lib.common.views.VideoView;
	import org.bigbluebutton.lib.video.models.VideoProfile;
	import org.osflash.signals.Signal;
	
	import spark.components.Button;
	
	public class WebcamView extends VideoView {
		
		private const OVERLAY_HEIGHT:int = 20;
		
		protected var _videoProfile:VideoProfile;
		
		private var nameLabel:Label;
		
		private var closeBtn:Button;
		
		private var overlayBackground:UIComponent;
		
		private var _closeSignal:Signal;
		
		public function get closeSignal():Signal {
			return _closeSignal;
		}
		
		public function WebcamView() {
			super();
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			addEventListener(Event.RESIZE, onResize);
			
			width = 100;
			height = 100;
			
			_closeSignal = new Signal();
			
			overlayBackground = new UIComponent();
			overlayBackground.height = OVERLAY_HEIGHT;
			addChild(overlayBackground);
			
			nameLabel = new Label();
			nameLabel.truncateToFit = false;
			nameLabel.height = OVERLAY_HEIGHT;
			nameLabel.setStyle("color", 0xFFFFFF);
			addChild(nameLabel);
			
			closeBtn = new Button();
			closeBtn.height = OVERLAY_HEIGHT;
			closeBtn.width = OVERLAY_HEIGHT;
			closeBtn.buttonMode = true;
			closeBtn.styleName = "webcamCloseButton";
			closeBtn.addEventListener(MouseEvent.CLICK, onCloseClick);
			addChild(closeBtn);
		}
		
		public function set videoProfile(vp:VideoProfile):void {
			_videoProfile = vp;
		}
		
		public function get videoProfile():VideoProfile {
			return _videoProfile;
		}
		
		override public function startStream(connection:NetConnection, name:String, streamName:String, userID:String):void {
			super.startStream(connection, name, streamName, userID);
			
			nameLabel.text = name;
		}
		
		private function onAddedToStage(e:Event):void {
			removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			
			positionVideo();
			addChildAt(video, 0);
		}
		
		private function onResize(e:Event):void {
			positionVideo();
		}
		
		private function positionVideo():void {
			var videoAspectRatio:Number = _videoProfile.aspectRatio;
			var containerAspectRatio:Number = width / height;
			
			if (videoAspectRatio > containerAspectRatio) {
				video.width = width;
				video.height = width / videoAspectRatio;
			} else {
				video.height = height;
				video.width = height * videoAspectRatio;
			}
			
			video.x = width / 2 - video.width / 2;
			video.y = height / 2 - video.height / 2;
			
			positionOverlay();
		}
		
		private function positionOverlay():void {
			var padding:int = 1;
			
			overlayBackground.width = width;
			overlayBackground.graphics.clear();
			overlayBackground.graphics.beginFill(0x000000, 0.5);
			overlayBackground.graphics.drawRect(0, 0, width, OVERLAY_HEIGHT);
			overlayBackground.graphics.endFill();
			
			closeBtn.y = padding;
			closeBtn.x = width - closeBtn.width - padding;
			
			nameLabel.x = padding;
			nameLabel.y = padding;
			nameLabel.width = width - padding * 3 - closeBtn.width;
		}
		
		private function onCloseClick(e:MouseEvent):void {
			_closeSignal.dispatch(userID, streamName);
		}
		
		public override function close():void {
			removeEventListener(Event.RESIZE, onResize);
			closeBtn.removeEventListener(MouseEvent.CLICK, onCloseClick);
			super.close();
		}
	}
}