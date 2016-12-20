package org.bigbluebutton.web.participants.views {
	import mx.graphics.SolidColor;
	
	import org.bigbluebutton.lib.participants.views.ParticipantsViewBase;
	import org.bigbluebutton.web.common.views.IPanelAdjustable;
	
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.SkinnableContainer;
	import spark.layouts.VerticalLayout;
	import spark.primitives.Rect;
	
	public class ParticipantsPanel extends SkinnableContainer implements IPanelAdjustable {
		private var _adjustable:Boolean = false;
		
		public function set adjustable(v:Boolean):void {
			_adjustable = v;
		}
		
		public function get adjustable():Boolean {
			return _adjustable;
		}
		
		private var _title:Label;
		
		public function get title():Label {
			return _title;
		}
		
		public function ParticipantsPanel() {
			super();
			
			var l:VerticalLayout = new VerticalLayout();
			this.layout = l;
			this.minWidth = 50;
			this.styleName = "panel";
			
			var title:Label = new Label();
			title.text = "Participants";
			title.styleName = "panelTitle";
			addElement(title);
			
			var participantsView:ParticipantsViewBase = new ParticipantsViewBase();
			participantsView.percentWidth = 100;
			participantsView.percentHeight = 100;
			addElement(participantsView);
		}
	}
}
