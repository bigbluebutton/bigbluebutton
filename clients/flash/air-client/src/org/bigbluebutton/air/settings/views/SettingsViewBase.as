package org.bigbluebutton.air.settings.views {
	import mx.core.ClassFactory;
	import mx.core.ScrollPolicy;
	import mx.graphics.SolidColor;
	
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.VGroup;
	import spark.layouts.VerticalLayout;
	import spark.primitives.Rect;
	
	import org.bigbluebutton.air.common.views.ParticipantIcon;
	
	public class SettingsViewBase extends VGroup {
		private var _settingsList:List;
		
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
			
			gap = 0;
			
			var participantHolder:Group = new Group();
			participantHolder.percentWidth = 100;
			addElement(participantHolder);
			
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
			_title.percentWidth = 100;
			addElement(_title);
			
			_settingsList = new List();
			_settingsList.percentWidth = 100;
			// TODO @fixme height must be dynamic depending on the resolùution
			//_settingsList.height = 560;
			_settingsList.itemRenderer = new ClassFactory(getItemRendererClass());
			
			var listLayout:VerticalLayout = new VerticalLayout();
			listLayout.requestedRowCount = -1;
			listLayout.gap = 0;
			_settingsList.layout = listLayout;
			addElement(_settingsList);
		}
		
		protected function getItemRendererClass():Class {
			return SettingsItemRenderer;
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			setParticipantStyle();
			_settingsList.scroller.setStyle('verticalScrollPolicy', ScrollPolicy.OFF);
		}
		
		private function setParticipantStyle():void {
			var groupsPadding:Number = getStyle("groupsPadding")
			
			SolidColor(_participantBackground.fill).color = getStyle("headerBackground");
			_participantIcon.top = getStyle("groupsPadding") * 1.75;
			_participantLabel.setStyle("color", _participantIcon.getStyle("color"));
			_participantLabel.setStyle("fontSize", _participantIcon.getStyle("fontSize") * 0.65);
			_participantLabel.setStyle("paddingBottom", getStyle("groupsPadding"));
			_participantLabel.y = _participantIcon.y + _participantIcon.height + getStyle("groupsPadding");
		}
	}
}
