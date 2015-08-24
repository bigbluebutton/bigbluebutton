package org.bigbluebutton.web.user.views {
	import spark.components.Label;
	import spark.components.gridClasses.GridItemRenderer;
	
	public class NameItemRenderer extends GridItemRenderer {
		private var nameLabel:Label;
		
		public function NameItemRenderer() {
			super();
			
			clipAndEnableScrolling = true;
			
			nameLabel = new Label();
			nameLabel.top = 9;
			nameLabel.left = 7;
			addElement(nameLabel);
		}
		
		override public function prepare(hasBeenRecycled:Boolean):void {
			if (data != null) {
				if (data.me) {
					nameLabel.text = data.name + " (you)";
					nameLabel.styleName = "nameLabelMeStyle";
				} else {
					nameLabel.text = data.name;
					nameLabel.styleName = "nameLabelStyle";
				}
			}
		}
	}
}
