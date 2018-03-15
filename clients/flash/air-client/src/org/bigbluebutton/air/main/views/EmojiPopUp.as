package org.bigbluebutton.air.main.views {
	import mx.core.ScrollPolicy;
	
	import spark.components.List;
	import spark.components.SkinnablePopUpContainer;
	import spark.components.VGroup;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalAlign;
	
	public class EmojiPopUp extends SkinnablePopUpContainer {
		
		private var _statusList:List;
		
		public function get statusList():List {
			return _statusList;
		}
		
		public function EmojiPopUp() {
			super();
			
			var mainGroup:VGroup = new VGroup();
			mainGroup.horizontalAlign = HorizontalAlign.CENTER;
			mainGroup.verticalAlign = VerticalAlign.MIDDLE;
			this.addElement(mainGroup);
			
			_statusList = new List();
			_statusList.minWidth = 160;
			_statusList.styleName = "statusList";
			_statusList.percentHeight = 100;
			_statusList.labelField = "label";
			mainGroup.addElement(_statusList);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_statusList.setStyle('verticalScrollPolicy', ScrollPolicy.OFF);
			_statusList.setStyle('horizontalScrollPolicy', ScrollPolicy.OFF);
			
			this.width = _statusList.width;
		}
	}
}
