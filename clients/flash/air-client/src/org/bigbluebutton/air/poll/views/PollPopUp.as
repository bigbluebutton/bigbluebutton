package org.bigbluebutton.air.poll.views {
	import flash.display.DisplayObjectContainer;
	
	import mx.core.InteractionMode;
	
	import spark.components.Application;
	import spark.components.Button;
	import spark.components.Scroller;
	import spark.components.VGroup;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalAlign;
	
	import org.bigbluebutton.air.main.views.MobilePopUp;
	import org.bigbluebutton.air.main.views.skins.AlwaysVisibleScrollerSkin;
	import org.bigbluebutton.air.poll.models.PollVO;
	
	public class PollPopUp extends MobilePopUp {
		
		private var _closeButton:Button;
		
		public var buttonsGroup:VGroup;
		
		public function get closeButton():Button {
			return _closeButton;
		}
		
		public function PollPopUp() {
			super();
			_closeButton = new Button();
			_title = "Polling";
			_text = "Provide your response to the poll by selecting an option below.";
		}
		
		public function addButtons(poll:PollVO):void {
			var voteBtn:Button;
			var numBtns:int = poll.answers.length;
			
			buttonsGroup = new VGroup();
			buttonsGroup.percentWidth = 100;
			buttonsGroup.percentHeight = 100;
			buttonsGroup.horizontalAlign = HorizontalAlign.CENTER;
			buttonsGroup.verticalAlign = VerticalAlign.MIDDLE;
			
			for (var i:int = 0; i < numBtns; i++) {
				voteBtn = new Button();
				voteBtn.percentWidth = 80;
				// @todo: To be localised
				voteBtn.label = poll.answers[i].key;
				voteBtn.name = poll.answers[i].id;
				buttonsGroup.addElement(voteBtn);
			}
			
			contentGroup.addElement(buttonsGroup);
		}
		
		override public function open(owner:DisplayObjectContainer, modal:Boolean = false):void {
			super.open(owner, modal);
			updateButtonGoupHeight();
		}
		
		public function updateButtonGoupHeight():void {
			var maxHeight:Number = Application(parentApplication).height - 100;
			var compHeight:Number = titleDisplay.height + textDisplay.height + controlBarGroup.height + buttonsGroup.height + 30;
			this.height = Math.min(maxHeight, compHeight);
			// Force showing non fading scrollbars
			Scroller(buttonsGroup.parent.parent.parent).setStyle("interactionMode", InteractionMode.MOUSE);
			Scroller(buttonsGroup.parent.parent.parent).setStyle("interactionMode", InteractionMode.TOUCH);
		}
		
		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);
			
			if (instance == controlBarGroup) {
				_closeButton.percentWidth = 100;
				_closeButton.label = "Close Polling Options";
				_closeButton.styleName = "mobilePopUpUniqueButton";
				controlBarGroup.addElement(_closeButton);
			}
			
			if (instance == scroller) {
				scroller.setStyle("skinClass", AlwaysVisibleScrollerSkin);
			}
		}
	}
}
