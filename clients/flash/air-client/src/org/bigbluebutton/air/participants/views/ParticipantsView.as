package org.bigbluebutton.air.participants.views {
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	
	import spark.components.SkinnableContainer;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalLayout;
	
	public class ParticipantsView extends NoTabView {
		public function ParticipantsView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			vLayout.horizontalAlign = HorizontalAlign.CENTER;
			layout = vLayout;
			
			var skinnableWrapper:SkinnableContainer = new SkinnableContainer();
			skinnableWrapper.styleName = "subViewContent";
			skinnableWrapper.percentWidth = 100;
			skinnableWrapper.percentHeight = 100;
			
			var participantsView:ParticipantsViewBase = new ParticipantsViewBase();
			participantsView.percentWidth = 100;
			participantsView.percentHeight = 100;
			skinnableWrapper.addElement(participantsView);
			
			addElement(skinnableWrapper);
		}
		
		override protected function createToolbar():TopToolbarAIR {
			return new TopToolbarParticipants();
		}
	}
}
