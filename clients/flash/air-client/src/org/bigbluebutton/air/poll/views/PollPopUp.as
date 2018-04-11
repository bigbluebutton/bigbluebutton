package org.bigbluebutton.air.poll.views {
	import flash.display.DisplayObjectContainer;
	import flash.events.Event;
	
	import spark.components.Application;
	import spark.components.Button;
	import spark.components.VGroup;
	import spark.layouts.HorizontalAlign;
	
	import org.bigbluebutton.air.main.views.MobilePopUp;
	import org.bigbluebutton.air.poll.models.PollVO;
	
	public class PollPopUp extends MobilePopUp {
		
		private var _closeButton:Button;
		
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
			
			contentGroup.removeAllElements();
			
			var buttonsGroup:VGroup = new VGroup();
			buttonsGroup.percentWidth = 100;
			buttonsGroup.horizontalAlign = HorizontalAlign.CENTER;
			contentGroup.addElement(buttonsGroup);
			
			for (var i:int = 0; i < numBtns; i++) {
				voteBtn = new Button();
				voteBtn.percentWidth = 80;
				// @todo: To be localised
				voteBtn.label = poll.answers[i].key;
				voteBtn.name = poll.answers[i].id;
				buttonsGroup.addElement(voteBtn);
			}
		}
		
		override public function open(owner:DisplayObjectContainer, modal:Boolean = false):void {
			super.open(owner, modal);
			maxHeight = Application(parentApplication).height - 120;
		}
		
		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);
			
			if (instance == controlBarGroup) {
				_closeButton.percentWidth = 100;
				_closeButton.label = "Close Polling Options";
				_closeButton.styleName = "mobilePopUpUniqueButton";
				controlBarGroup.addElement(_closeButton);
			}
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			if (scroller && scroller.verticalScrollBar) {
				scroller.verticalScrollBar.visible = true;
			}
		}
	}
}
