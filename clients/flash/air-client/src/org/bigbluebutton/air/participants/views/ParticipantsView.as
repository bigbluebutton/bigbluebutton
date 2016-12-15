package org.bigbluebutton.air.participants.views {
	import spark.components.SkinnableContainer;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.lib.participants.views.ParticipantsViewBase;
	
	public class ParticipantsView extends NoTabView {
		private var _topToolbar:TopToolbarParticipants;
		
		public function ParticipantsView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			vLayout.horizontalAlign = HorizontalAlign.CENTER;
			layout = vLayout;
			
			_topToolbar = new TopToolbarParticipants();
			_topToolbar.percentWidth = 100;
			addElement(_topToolbar);
			
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
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_topToolbar.height = getStyle("toolbarHeight");
		}
	}
}
