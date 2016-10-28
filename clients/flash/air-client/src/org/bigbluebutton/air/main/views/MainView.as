package org.bigbluebutton.air.main.views {
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.lib.main.views.MenuButtonsBase;
	import org.bigbluebutton.lib.presentation.views.PresentationViewBase;
	
	import spark.layouts.VerticalLayout;
	
	public class MainView extends NoTabView {
		private var _topToolbar:TopToolbarAIR;
		private var _presentationView:PresentationViewBase;
		private var _menuButtons:MenuButtonsBase;
		
		public function MainView() {
			super();
			styleName = "mainViewStyle";
			
			var l:VerticalLayout = new VerticalLayout();
			l.gap = 0;
			l.horizontalAlign = "center";
			layout = l;
			
			_topToolbar = new TopToolbarAIR();
			_topToolbar.percentWidth = 100;
			_topToolbar.height = 60;
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
