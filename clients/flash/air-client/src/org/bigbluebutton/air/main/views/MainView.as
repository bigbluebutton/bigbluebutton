package org.bigbluebutton.air.main.views {
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.lib.main.views.MenuButtonsBase;
	import org.bigbluebutton.lib.presentation.views.PresentationViewBase;
	import org.osmf.layout.HorizontalAlign;
	
	public class MainView extends NoTabView {
		private var _topToolbar:TopToolbarAIR;
		
		private var _presentationView:PresentationViewBase;
		
		private var _menuButtons:MenuButtonsBase;
		
		public function MainView() {
			super();
			styleName = "mainView";
			
			var l:VerticalLayout = new VerticalLayout();
			l.gap = 0;
			l.horizontalAlign = HorizontalAlign.CENTER;
			layout = l;
			
			_topToolbar = new TopToolbarAIR();
			_topToolbar.percentWidth = 100;
			_topToolbar.height = 80;
			addElement(_topToolbar);
			
			_presentationView = new PresentationViewBase();
			_presentationView.percentWidth = 100;
			_presentationView.percentHeight = 100;
			addElement(_presentationView);
			
			_menuButtons = new MenuButtonsBase();
			addElement(_menuButtons);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_presentationView.width = w;
			_presentationView.height = h - _topToolbar.height - _menuButtons.height;
		}
	}
}
