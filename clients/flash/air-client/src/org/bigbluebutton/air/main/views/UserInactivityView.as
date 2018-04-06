package org.bigbluebutton.air.main.views
{
	import spark.components.Button;
	import spark.components.Label;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;

	public class UserInactivityView extends NoTabView
	{
		public var okButton:Button;
		
		public function UserInactivityView()
		{
			super();
			
			var l:VerticalLayout = new VerticalLayout();
			l.horizontalAlign = "center";
			layout = l;
			
			var messageText:Label = new Label();
			messageText.percentWidth = 90;
			messageText.text = "Inacitivty Timer";
			messageText.setStyle("textAlign", "center");
			messageText.styleName = "disconnectMessage";
			addElement(messageText);
			
			okButton = new Button();
			okButton.percentWidth = 90;
			okButton.label = "Ok";
			addElement(okButton);
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			this.layout["gap"] = getStyle("gap");
			this.layout["padding"] = getStyle("padding");
		}
	}
}