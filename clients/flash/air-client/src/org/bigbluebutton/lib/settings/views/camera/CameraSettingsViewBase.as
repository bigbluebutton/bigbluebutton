package org.bigbluebutton.lib.settings.views.camera {
	import mx.core.ClassFactory;
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
	import spark.layouts.VerticalLayout;
	import spark.primitives.Rect;
	
	import org.bigbluebutton.lib.user.views.UserItemRenderer;
	
	public class CameraSettingsViewBase extends VGroup {
		
		private var _cameraBackground:Rect;
		
		private var _cameraHolder:Group;
		
		private var _previewVideo:VideoDisplay;
		
		private var _noVideoMessage:Label;
		
		private var _actionsGroup:HGroup;
		
		private var _cameraProfilesList:List;
		
		private var _swapCameraButton:Button;
		
		private var _rotateCameraButton:Button;
		
		protected function get toggleButtonClass():Class {
			return ToggleButtonBase;
		}
		
		public function get cameraHolder():Group {
			return _cameraHolder;
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
			
			_cameraHolder = new Group();
			_cameraHolder.percentWidth = 100;
			addElement(_cameraHolder);
			
			_cameraBackground = new Rect();
			_cameraBackground.percentHeight = 100;
			_cameraBackground.percentWidth = 100;
			_cameraBackground.fill = new SolidColor();
			_cameraHolder.addElement(_cameraBackground);
			
			_previewVideo = new VideoDisplay();
			//_previewVideo.horizontalCenter = 0;
			_previewVideo.height = 320;
			_cameraHolder.addElement(_previewVideo);
			
			_noVideoMessage = new Label();
			_cameraHolder.addElement(_noVideoMessage);
			
			_actionsGroup = new HGroup();
			_actionsGroup.percentHeight = 100;
			_actionsGroup.percentWidth = 100;
			_actionsGroup.horizontalAlign = HorizontalAlign.CENTER;
			_cameraHolder.addElement(_actionsGroup);
			
			_swapCameraButton = new Button();
			_swapCameraButton.label = "SWAP CAMERA";
			_swapCameraButton.styleName = "actionButton";
			_actionsGroup.addElement(_swapCameraButton);
			
			_rotateCameraButton = new Button();
			_rotateCameraButton.label = "ROTATE CAMERA";
			_rotateCameraButton.styleName = "actionButton";
			_actionsGroup.addElement(_rotateCameraButton);
			
			var qualityTitle:Label = new Label();
			qualityTitle.text = "Video Quality";
			qualityTitle.percentWidth = 100;
			qualityTitle.styleName = "sectionTitle";
			addElement(qualityTitle);
			
			_cameraProfilesList = new List();
			_cameraProfilesList.percentWidth = 100;
			var listLayout:VerticalLayout = new VerticalLayout();
			listLayout.requestedRowCount = -1;
			listLayout.gap = 0;
			_cameraProfilesList.layout = listLayout;
			_cameraProfilesList.itemRenderer = new ClassFactory(getItemRendererClass());
			addElement(_cameraProfilesList);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			SolidColor(_cameraBackground.fill).color = getStyle("headerBackground");
			// @todo: use _previewVideo or _noVideoMessage depending on the state
			_previewVideo.top = getStyle("groupsPadding");
			positionActionButtons();
		}
		
		public function positionActionButtons():void {
			_actionsGroup.paddingBottom = getStyle("groupsPadding");
			_actionsGroup.y = _previewVideo.y + _previewVideo.height + getStyle("groupsPadding");
		}
		
		protected function getItemRendererClass():Class {
			return CameraProfileItemRenderer;
		}
	}
}
