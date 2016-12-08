package org.bigbluebutton.air.participants.views {
	import spark.components.SkinnableContainer;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.lib.participants.views.ParticipantsViewBase;
	
	public class ParticipantsView extends NoTabView {
		public function ParticipantsView() {
			super();
			styleName = "mainView";
			
			var l:VerticalLayout = new VerticalLayout();
			l.gap = 0;
			l.horizontalAlign = "center";
			layout = l;
			
			var topToolbar:TopToolbarParticipants = new TopToolbarParticipants();
			topToolbar.percentWidth = 100;
			topToolbar.height = 80;
			addElement(topToolbar);
			
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
	}
}
