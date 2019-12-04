package org.bigbluebutton.air.main.views {
	
	import mx.graphics.SolidColor;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalAlign;
	import spark.primitives.Rect;
	
	public class TopToolbarBase extends Group {
		private var _leftButton:Button;
		
		public function get leftButton():Button {
			return _leftButton;
		}
		
		private var _titleLabel:Label;
		
		public function get titleLabel():Label {
			return _titleLabel;
		}
		
		private var _rightButton:Button;
		
		public function get rightButton():Button {
			return _rightButton;
		}
		
		private var _recordingIcon:Label;
		
		public function get recordingIcon():Label {
			return _recordingIcon;
		}
		
		private var titleGroup:HGroup;
		
		private var _background:Rect;
		
		/**
		 *
		 */
		public function TopToolbarBase() {
			super();
			
			_leftButton = new Button();
			_leftButton.styleName = "icon-user topButton topLeftButton";
			_leftButton.verticalCenter = 0;
			addElement(_leftButton);
			
			_rightButton = new Button();
			_rightButton.styleName = "icon-more topButton topRightButton";
			_rightButton.verticalCenter = 0;
			addElement(_rightButton);
			
			titleGroup = new HGroup();
			titleGroup.styleName = "titleGroup";
			titleGroup.verticalCenter = 0;
			titleGroup.horizontalAlign = HorizontalAlign.CENTER;
			titleGroup.verticalAlign = VerticalAlign.MIDDLE;
			addElement(titleGroup);
			
			_titleLabel = new Label();
			_titleLabel.verticalCenter = 0;
			titleGroup.addElement(_titleLabel);
			
			_recordingIcon = new Label();
			_recordingIcon.styleName = "icon-record recordIcon";
			titleGroup.addElement(_recordingIcon);
			
			_background = new Rect();
			_background.percentHeight = 100;
			_background.percentWidth = 100;
			_background.fill = new SolidColor();
			addElementAt(_background, 0);
		}
		
		public function showRecording(isRecording:Boolean):void {
			_recordingIcon.visible = _recordingIcon.includeInLayout = isRecording;
		
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			_recordingIcon.text = _recordingIcon.getStyle("content");
			SolidColor(_background.fill).color = getStyle("backgroundColor");
		}
	}
}
