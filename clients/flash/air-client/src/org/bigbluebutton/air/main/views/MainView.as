package org.bigbluebutton.air.main.views {
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.presentation.views.PresentationViewBase;
	import org.osmf.layout.HorizontalAlign;
	
	import spark.layouts.VerticalLayout;
	
	[Style(name = "menuHeight", inherit = "no", type = "Number")]
	public class MainView extends NoTabView {
		private var _presentationView:PresentationViewBase;
		
		private var _menuButtons:MenuButtonsBase;
		
		public function MainView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			vLayout.horizontalAlign = HorizontalAlign.CENTER;
			layout = vLayout;
			
			_presentationView = new PresentationViewBase();
			_presentationView.percentWidth = 100;
			_presentationView.percentHeight = 100;
			addElement(_presentationView);
			
			_menuButtons = new MenuButtonsBase();
			addElement(_menuButtons);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_menuButtons.height = getStyle("menuHeight");
			
			_presentationView.width = w;
			_presentationView.height = h - _topToolbar.height - _menuButtons.height;
		}
	}
}
