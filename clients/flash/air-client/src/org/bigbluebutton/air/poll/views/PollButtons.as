package org.bigbluebutton.air.poll.views {
	import spark.components.Button;
	import spark.components.HGroup;
	
	import org.bigbluebutton.air.poll.models.PollVO;
	
	public class PollButtons extends HGroup {
		public function addButtons(poll:PollVO):void {
			var voteBtn:Button;
			var numBtns:int = poll.answers.length;
			var btnWidth:int = 100 / numBtns;
			for (var i:int = 0; i < numBtns; i++) {
				voteBtn = new Button();
				voteBtn.percentWidth = btnWidth;
				voteBtn.height = 70;
				voteBtn.styleName = "voteButton";
				// To be localised
				voteBtn.label = poll.answers[i].key;
				voteBtn.name = poll.answers[i].id;
				this.addElement(voteBtn);
			}
		}
		
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			this.gap = getStyle("gap");
			this.padding = getStyle("padding");
		}
	}
}
