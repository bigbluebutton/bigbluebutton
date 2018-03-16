package org.bigbluebutton.air.main.views {
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.presentation.views.PresentationView;
	import org.bigbluebutton.air.video.views.WebcamDock;
	import org.osmf.layout.HorizontalAlign;
	
	import spark.layouts.BasicLayout;
	import spark.layouts.VerticalLayout;
	
	[Style(name = "menuHeight", inherit = "no", type = "Number")]
	public class MainView extends NoTabView {
		private var _presentationView:PresentationView;
		
		private var _menuButtons:MenuButtons;
		
		private var _webcamDock:WebcamDock;
		
		public function MainView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.gap = 0;
			vLayout.horizontalAlign = HorizontalAlign.CENTER;
			//layout = vLayout;
			
			var bLayout:BasicLayout = new BasicLayout();
			layout = bLayout;
			
			_presentationView = new PresentationView();
			_presentationView.percentWidth = 100;
			_presentationView.percentHeight = 100;
			addElement(_presentationView);
			
			// add deskshare view here and position like the presentation view
			
			_webcamDock = new WebcamDock();
			_webcamDock.percentWidth = 30;
			_webcamDock.percentHeight = 30;
			_webcamDock.right = 0;
			addElement(_webcamDock);
			
			_menuButtons = new MenuButtons();
			_menuButtons.horizontalCenter = 0;
			_menuButtons.bottom = 0;
			addElement(_menuButtons);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_menuButtons.height = getStyle("menuHeight");
			
			_presentationView.width = w;
			_presentationView.height = h - _topToolbar.height - _menuButtons.height;
			_presentationView.y = _topToolbar.height;
			
			_webcamDock.bottom = _menuButtons.height;
		}
	}
}
