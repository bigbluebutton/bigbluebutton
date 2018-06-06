package org.bigbluebutton.air.main.views {
	
	import spark.components.Button;
	import spark.components.Label;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	
	public class ExitView extends NoTabView {
		
		public var yesButton:Button;
		
		public var noButton:Button;
		
		public function ExitView() {
			
			super();
			
			var l:VerticalLayout = new VerticalLayout();
			l.horizontalAlign = "center";
			layout = l;
			
			var messageText:Label = new Label();
			messageText.percentWidth = 90;
			messageText.text = "Exit application?";
			messageText.setStyle("textAlign", "center");
			messageText.styleName = "disconnectMessage";
			addElement(messageText);
			
			
			yesButton = new Button();
			yesButton.percentWidth = 90;
			yesButton.label = "Yes";
			addElement(yesButton);
			
			noButton = new Button();
			noButton.percentWidth = 90;
			noButton.label = "No";
			addElement(noButton);
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			this.layout["gap"] = getStyle("gap");
			this.layout["padding"] = getStyle("padding");
		}
	
	}
}
