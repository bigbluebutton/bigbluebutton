package org.bigbluebutton.air.participants.views {
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.lib.participants.views.ParticipantsViewBase;
	
	import spark.components.Label;
	import spark.components.SkinnableContainer;
	import spark.layouts.VerticalLayout;
	
	public class ParticipantsView extends NoTabView {
		public function ParticipantsView() {
			super();
			styleName = "mainViewStyle";
			
			var l:VerticalLayout = new VerticalLayout();
			l.gap = 0;
			l.horizontalAlign = "center";
			layout = l;
			
			var topToolbar:TopToolbarParticipants = new TopToolbarParticipants();
			topToolbar.percentWidth = 100;
			topToolbar.height = 60;
			addElement(topToolbar);
			
			var skinnableWrapper:SkinnableContainer = new SkinnableContainer();
			skinnableWrapper.styleName = "subViewContentStyle";
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
