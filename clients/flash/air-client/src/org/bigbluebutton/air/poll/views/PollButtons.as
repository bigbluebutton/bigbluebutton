package org.bigbluebutton.air.poll.views {
	import spark.components.Button;
	import spark.components.TileGroup;
	import spark.layouts.ColumnAlign;
	
	import org.bigbluebutton.air.poll.models.PollVO;
	
	public class PollButtons extends TileGroup {
		public function PollButtons() {
			columnAlign = ColumnAlign.JUSTIFY_USING_GAP;
		}
		
		public function addButtons(poll:PollVO):void {
			var voteBtn:Button;
			var numBtns:int = poll.answers.length;
			var btnWidth:int = 100 / numBtns;
			for (var i:int = 0; i < numBtns; i++) {
				voteBtn = new Button();
				voteBtn.percentWidth = btnWidth;
				voteBtn.styleName = "voteButton";
				// To be localised
				voteBtn.label = poll.answers[i].key;
				voteBtn.name = poll.answers[i].id;
				this.addElement(voteBtn);
			}
		}
		
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			this.padding = getStyle("padding");
		}
	}
}
