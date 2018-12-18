package org.bigbluebutton.air.main.views {
	import mx.core.ClassFactory;
	import mx.core.ScrollPolicy;
	
	import spark.components.Callout;
	import spark.components.List;
	import spark.components.VGroup;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalAlign;
	
	public class EmojiCallout extends Callout {
		private var _statusList:List;
		
		public function get statusList():List {
			return _statusList;
		}
		
		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);
			
			var mainGroup:VGroup = new VGroup();
			mainGroup.horizontalAlign = HorizontalAlign.CENTER;
			mainGroup.verticalAlign = VerticalAlign.MIDDLE;
			this.addElement(mainGroup);
			
			_statusList = new List();
			_statusList.percentWidth = 100;
			_statusList.percentHeight = 100;
			_statusList.itemRenderer = new ClassFactory(EmojiItemRenderer);
			_statusList.labelField = "label";
			mainGroup.addElement(_statusList);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_statusList.styleName = "statusList";
			_statusList.setStyle('verticalScrollPolicy', ScrollPolicy.OFF);
			_statusList.setStyle('horizontalScrollPolicy', ScrollPolicy.OFF);
			
			_statusList.minWidth = getStyle("minListWidth");
		}
	}
}
