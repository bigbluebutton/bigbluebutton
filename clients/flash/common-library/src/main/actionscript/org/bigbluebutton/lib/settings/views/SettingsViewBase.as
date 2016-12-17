package org.bigbluebutton.lib.settings.views {
	import mx.core.ClassFactory;
	import mx.graphics.SolidColor;
	
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.Scroller;
	import spark.components.VGroup;
	import spark.layouts.VerticalLayout;
	import spark.primitives.Rect;
	
	import org.bigbluebutton.lib.common.views.ParticipantIcon;
	
	public class SettingsViewBase extends Group {
		private var _settingsList:List;
		
		private var _background:Rect;
		
		private var _participantBackground:Rect;
		
		private var _participantIcon:ParticipantIcon;
		
		private var _participantLabel:Label;
		
		private var _title:Label;
		
		private var _leaveLabel:Label;
		
		public function get settingsList():List {
			return _settingsList;
		}
		
		public function get participantLabel():Label {
			return _participantLabel;
		}
		
		public function get participantIcon():ParticipantIcon {
			return _participantIcon;
		}
		
		public function SettingsViewBase() {
			super();
			
			_background = new Rect();
			_background.percentHeight = 100;
			_background.percentWidth = 100;
			_background.fill = new SolidColor();
			addElement(_background);
			
			var scroller:Scroller = new Scroller();
			scroller.percentHeight = 100;
			scroller.percentWidth = 100;
			addElement(scroller);
			
			var elementsHolder:VGroup = new VGroup();
			elementsHolder.percentHeight = 100
			elementsHolder.percentWidth = 100
			scroller.viewport = elementsHolder;
			
			var participantHolder:Group = new Group();
			participantHolder.percentWidth = 100;
			elementsHolder.addElement(participantHolder);
			
			_participantBackground = new Rect();
			_participantBackground.percentHeight = 100;
			_participantBackground.percentWidth = 100;
			_participantBackground.fill = new SolidColor();
			participantHolder.addElement(_participantBackground);
			
			_participantIcon = new ParticipantIcon();
			_participantIcon.horizontalCenter = 0;
			_participantIcon.styleName = "participantIconSettings";
			participantHolder.addElement(_participantIcon);
			
			_participantLabel = new Label();
			_participantLabel.horizontalCenter = 0;
			participantHolder.addElement(_participantLabel);
			
			_title = new Label();
			_title.text = "Session Settings";
			_title.styleName = "sectionTitle";
			elementsHolder.addElement(_title);
			
			_settingsList = new List();
			_settingsList.percentWidth = 100;
			_settingsList.percentHeight = 100;
			_settingsList.itemRenderer = new ClassFactory(getItemRendererClass());
			
			var listLayout:VerticalLayout = new VerticalLayout();
			listLayout.requestedRowCount = -1;
			listLayout.gap = 1;
			_settingsList.layout = listLayout;
			elementsHolder.addElement(_settingsList);
		}
		
		protected function getItemRendererClass():Class {
			return SettingsItemRenderer;
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			SolidColor(_background.fill).color = getStyle("backgroundColor");
			SolidColor(_participantBackground.fill).color = getStyle("participantBackground");
			_participantIcon.top = getStyle("paritcipantPadding") * 1.75;
			_participantLabel.setStyle("color", _participantIcon.getStyle("color"));
			_participantLabel.setStyle("fontSize", _participantIcon.getStyle("fontSize") * 0.65);
			_participantLabel.setStyle("paddingBottom", getStyle("paritcipantPadding"));
			_participantLabel.y = _participantIcon.y + _participantIcon.height + getStyle("paritcipantPadding");
		}
	}
}
