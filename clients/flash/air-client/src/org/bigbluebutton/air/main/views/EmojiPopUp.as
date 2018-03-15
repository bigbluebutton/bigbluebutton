package org.bigbluebutton.air.main.views {
	import mx.collections.ArrayCollection;
	import mx.core.ScrollPolicy;
	
	import spark.components.List;
	import spark.components.SkinnablePopUpContainer;
	import spark.components.VGroup;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalAlign;
	
	import org.bigbluebutton.air.user.models.EmojiStatus;
	
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
			_statusList.percentWidth = 100;
			_statusList.minWidth = 160;
			_statusList.styleName = "statusList";
			_statusList.percentHeight = 100;
			_statusList.labelField = "label";
			_statusList.dataProvider = new ArrayCollection([
				{label: "Raise", signal: EmojiStatus.RAISE_HAND, icon: "hand"},
				{label: "Happy", signal: EmojiStatus.HAPPY, icon: "happy"},
				{label: "Undecided", signal: EmojiStatus.NEUTRAL, icon: "undecided"},
				{label: "Sad", signal: EmojiStatus.SAD, icon: "sad"},
				{label: "Confused", signal: EmojiStatus.CONFUSED, icon: "confused"},
				{label: "Away", signal: EmojiStatus.AWAY, icon: "hand"},
				{label: "Thumbs up", signal: EmojiStatus.THUMBS_UP, icon: "thumbs-up"},
				{label: "Thumbs down", signal: EmojiStatus.THUMBS_DOWN, icon: "thumbs-down"},
				{label: "Applause", signal: EmojiStatus.APPLAUSE, icon: "applause"},
				{label: "Clear", signal: EmojiStatus.NO_STATUS, icon: "clear-status"}]
				);
			mainGroup.addElement(_statusList);
		}
		
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_statusList.setStyle('verticalScrollPolicy', ScrollPolicy.OFF);
			_statusList.setStyle('horizontalScrollPolicy', ScrollPolicy.OFF);
		}
	}
}
