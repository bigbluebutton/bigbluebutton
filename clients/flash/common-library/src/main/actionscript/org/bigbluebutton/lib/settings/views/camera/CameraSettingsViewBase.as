package org.bigbluebutton.lib.settings.views.camera {
	import mx.graphics.SolidColor;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.VGroup;
	import spark.components.VideoDisplay;
	import spark.components.supportClasses.ToggleButtonBase;
	import spark.layouts.HorizontalAlign;
	import spark.primitives.Rect;
	
	public class CameraSettingsViewBase extends VGroup {
		
		private var _cameraBackground:Rect;
		
		private var _previewVideo:VideoDisplay;
		
		private var _noVideoMessage:Label;
		
		private var _actionsGroup:HGroup;
		
		private var _cameraProfilesList:List;
		
		private var _swapCameraButton:Button;
		
		private var _rotateCameraButton:Button;
		
		protected function get toggleButtonClass():Class {
			return ToggleButtonBase;
		}
		
		public function get previewVideo():VideoDisplay {
			return _previewVideo;
		}
		
		public function get noVideoMessage():Label {
			return _noVideoMessage;
		}
		
		public function get cameraProfilesList():List {
			return _cameraProfilesList;
		}
		
		public function get swapCameraButton():Button {
			return _swapCameraButton;
		}
		
		public function get rotateCameraButton():Button {
			return _rotateCameraButton;
		}
		
		public function CameraSettingsViewBase() {
			super();
			
			gap = 0;
			
			var cameraHolder:Group = new Group();
			cameraHolder.percentWidth = 100;
			addElement(cameraHolder);
			
			_cameraBackground = new Rect();
			_cameraBackground.percentHeight = 100;
			_cameraBackground.percentWidth = 100;
			_cameraBackground.fill = new SolidColor();
			cameraHolder.addElement(_cameraBackground);
			
			_previewVideo = new VideoDisplay();
			_previewVideo.horizontalCenter = 0;
			cameraHolder.addElement(_previewVideo);
			
			_noVideoMessage = new Label();
			cameraHolder.addElement(_noVideoMessage);
			
			_actionsGroup = new HGroup();
			_actionsGroup.percentHeight = 100;
			_actionsGroup.percentWidth = 100;
			_actionsGroup.horizontalAlign = HorizontalAlign.CENTER;
			cameraHolder.addElement(_actionsGroup);
			
			_swapCameraButton = new Button();
			_actionsGroup.addElement(_swapCameraButton);
			
			_rotateCameraButton = new Button();
			_actionsGroup.addElement(_rotateCameraButton);
			
			_cameraProfilesList = new List();
			addElement(_cameraProfilesList);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			SolidColor(_cameraBackground.fill).color = getStyle("headerBackground");
			// @todo: use _previewVideo or _noVideoMessage depending on the state
			_actionsGroup.y = _previewVideo.y + _previewVideo.height + getStyle("groupsPadding");
		}
	}
}
