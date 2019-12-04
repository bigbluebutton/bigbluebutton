package org.bigbluebutton.air.main.views {
	
	import spark.components.Button;
	import spark.components.Label;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	
	public class DisconnectView extends NoTabView {
		
		public var messageText:Label;
		
		public var reconnectButton:Button;
		
		public var exitButton:Button;
		
		public function DisconnectView() {
			super();
			
			var l:VerticalLayout = new VerticalLayout();
			l.horizontalAlign = "center";
			layout = l;
			
			messageText = new Label();
			messageText.percentWidth = 90;
			messageText.setStyle("textAlign", "center");
			messageText.styleName = "disconnectMessage";
			
			addElement(messageText);
			
			reconnectButton = new Button();
			reconnectButton.percentWidth = 90;
			reconnectButton.label = "Reconnect";
			addElement(reconnectButton);
			
			exitButton = new Button();
			exitButton.percentWidth = 90;
			exitButton.label = "Exit";
			addElement(exitButton);
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			this.layout["gap"] = getStyle("gap");
			this.layout["padding"] = getStyle("padding");
		}
	}
}
