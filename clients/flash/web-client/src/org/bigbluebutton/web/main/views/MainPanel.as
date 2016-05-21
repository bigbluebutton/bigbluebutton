package org.bigbluebutton.web.main.views {
	import mx.graphics.SolidColor;
	
	import org.bigbluebutton.lib.main.views.MenuButtonsBase;
	import org.bigbluebutton.lib.main.views.TopToolbarBase;
	import org.bigbluebutton.lib.presentation.models.Presentation;
	import org.bigbluebutton.lib.presentation.views.PresentationViewBase;
	import org.bigbluebutton.web.video.views.WebcamGroup;
	
	import spark.components.Group;
	import spark.layouts.VerticalLayout;
	import spark.primitives.Rect;
	
	public class MainPanel extends Group {
		private var _presentationView:PresentationViewBase;
		private var _menuButtons:MenuButtonsBase;
		private var _topToolbar:TopToolbarBase;
		private var _videoContainer:WebcamGroup;
		
		public function MainPanel() {
			super();
			
			var l:VerticalLayout = new VerticalLayout();
			l.gap = 0;
			l.horizontalAlign = "center";
			layout = l;
			
			_topToolbar = new TopToolbarBase();
			_topToolbar.percentWidth = 100;
			_topToolbar.height = 60;
			addElement(_topToolbar);
			
			_presentationView = new PresentationViewBase();
			_presentationView.percentWidth = 100;
			_presentationView.percentHeight = 100;
			addElement(_presentationView);
			
			_videoContainer = new WebcamGroup();
			_videoContainer.percentWidth = 100;
			addElement(_videoContainer);			
			
			_menuButtons = new MenuButtonsBase();
			addElement(_menuButtons);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_presentationView.width = w;
			_presentationView.height = h - _topToolbar.height - _menuButtons.height - _videoContainer.height;
		}
	}
}