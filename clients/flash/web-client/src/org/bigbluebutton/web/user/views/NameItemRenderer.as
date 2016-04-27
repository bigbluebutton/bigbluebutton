package org.bigbluebutton.web.user.views {
	import org.bigbluebutton.web.util.i18n.ResourceUtil;
	
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
					nameLabel.text = data.name + ' (' + ResourceUtil.getInstance().getString('bbb.users.usersGrid.nameItemRenderer.youIdentifier') + ')';
					nameLabel.styleName = "nameLabelMeStyle";
				} else {
					nameLabel.text = data.name;
					nameLabel.styleName = "nameLabelStyle";
				}
			}
		}
	}
}
