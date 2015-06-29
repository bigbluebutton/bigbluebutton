package org.bigbluebutton.modules.polling.views
{
	import com.asfusion.mate.events.Dispatcher;
	import com.asfusion.mate.events.Listener;
	
	import flash.events.MouseEvent;
	
	import mx.containers.HBox;
	import mx.containers.TitleWindow;
	import mx.controls.Button;
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.modules.polling.events.PollVotedEvent;
	import org.bigbluebutton.modules.polling.events.ShowPollResultEvent;
	import org.bigbluebutton.modules.polling.events.StopPollEvent;
	import org.bigbluebutton.modules.polling.model.SimpleAnswer;
	import org.bigbluebutton.modules.polling.model.SimpleAnswerResult;
	import org.bigbluebutton.modules.polling.model.SimplePoll;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class PollResultsModal extends TitleWindow {
		private var _voteListener:Listener;
		
		private var _pollGraphic:PollGraphic;
		private var _publishBtn:Button;
		private var _closeBtn:Button;
		
		public function PollResultsModal() {
			super();
			
			width = 300;
			height = 300;
			showCloseButton = false;
			layout = "vertical";
			setStyle("horizontalAlign", "center");
			setStyle("verticalAlign", "middle");
			
			var topBox:HBox = new HBox();
			_publishBtn = new Button();
			_publishBtn.label = ResourceUtil.getInstance().getString('bbb.polling.publishButton.label');
			_publishBtn.addEventListener(MouseEvent.CLICK, handlePublishClick);
			topBox.addChild(_publishBtn);
			_closeBtn = new Button();
			_closeBtn.label = ResourceUtil.getInstance().getString('bbb.polling.closeButton.label');
			_closeBtn.addEventListener(MouseEvent.CLICK, handleCloseClick);
			topBox.addChild(_closeBtn);
			addChild(topBox);
			
			_pollGraphic = new PollGraphic();
			_pollGraphic.data = null;
			_pollGraphic.width = 200;
			_pollGraphic.minWidth = 130;
			addChild(_pollGraphic);
			
			_voteListener = new Listener();
			_voteListener.type = PollVotedEvent.POLL_VOTED;
			_voteListener.method = handlePollVotedEvent;
		}
		
		public function setPoll(poll:SimplePoll):void {
			var resultData:Array = new Array();
			var answers:Array = poll.answers; 
			for (var j:int = 0; j < answers.length; j++) {
				var a:SimpleAnswer = answers[j] as SimpleAnswer;
				resultData.push({a:a.key, v:0});
			}
			
			_pollGraphic.data = resultData;
			_pollGraphic.height = ((23+10)*_pollGraphic.data.length+10);
			_pollGraphic.minHeight = ((16+10)*_pollGraphic.data.length+10);
			
			height = _pollGraphic.height + 140;
		}
		
		private function handlePollVotedEvent(e:PollVotedEvent):void {
			var resultData:Array = new Array();
			var answers:Array = e.result.answers; 
			for (var j:int = 0; j < answers.length; j++) {
				var a:SimpleAnswerResult = answers[j] as SimpleAnswerResult;
				resultData.push({a:a.key, v:a.numVotes});
			}
			
			_pollGraphic.data = resultData;
		}
		
		private function handlePublishClick(e:MouseEvent):void {
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new ShowPollResultEvent(true));
			close()
		}
		
		private function handleCloseClick(e:MouseEvent):void {
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new StopPollEvent());
			close()
		}
		
		private function close():void {
			_voteListener.type = null;
			_voteListener.method = null;
			_voteListener = null;
			
			PopUpManager.removePopUp(this);
		}
	}
}