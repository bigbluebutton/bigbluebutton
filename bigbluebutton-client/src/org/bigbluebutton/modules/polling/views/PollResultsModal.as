package org.bigbluebutton.modules.polling.views
{
	import com.asfusion.mate.events.Dispatcher;
	import com.asfusion.mate.events.Listener;
	
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.containers.Box;
	import mx.containers.HBox;
	import mx.containers.TitleWindow;
	import mx.controls.Button;
	import mx.controls.HRule;
	import mx.controls.Label;
	
	import org.bigbluebutton.common.AdvancedLabel;
	import org.bigbluebutton.core.PopUpUtil;
	import org.bigbluebutton.modules.polling.events.PollStoppedEvent;
	import org.bigbluebutton.modules.polling.events.PollVotedEvent;
	import org.bigbluebutton.modules.polling.events.ShowPollResultEvent;
	import org.bigbluebutton.modules.polling.events.StopPollEvent;
	import org.bigbluebutton.modules.polling.model.SimpleAnswer;
	import org.bigbluebutton.modules.polling.model.SimpleAnswerResult;
	import org.bigbluebutton.modules.polling.model.SimplePoll;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class PollResultsModal extends TitleWindow {
		private var _voteListener:Listener;
		private var _stopPollListener:Listener;
		
		private var _respondersLabel:Label;
		private var _respondersLabelDots:Label;
		private var _pollGraphic:PollGraphic;
		private var _publishBtn:Button;
		private var _closeBtn:Button;
		
		private var _dotTimer:Timer;
		
		public function PollResultsModal() {
			super();
			
			width = 400;
			showCloseButton = false;
			layout = "vertical";
			setStyle("horizontalAlign", "center");
			
			var modalTitle:AdvancedLabel = new AdvancedLabel();
			modalTitle.text = ResourceUtil.getInstance().getString('bbb.polling.pollModal.title');
			modalTitle.styleName = "titleWindowStyle";
			modalTitle.maxWidth = 300;
			addChild(modalTitle);
			
			var hintBox : Box = new Box();
			hintBox.percentWidth = 100;
			hintBox.styleName = "pollHintBoxStyle";
			addChild(hintBox);
			
			var hintText : AdvancedLabel = new AdvancedLabel();
			hintText.percentWidth = 100;
			hintText.styleName = "pollHintTextStyle";
			hintText.text = ResourceUtil.getInstance().getString('bbb.polling.pollModal.hint');
			hintBox.addChild(hintText);

			var hrule:HRule = new HRule();
			hrule.percentWidth = 100;
			addChild(hrule);
			
			_pollGraphic = new PollGraphic();
			_pollGraphic.data = null;
			_pollGraphic.width = 300;
			_pollGraphic.minWidth = 130;
			addChild(_pollGraphic);
			
			var respondersBox:HBox = new HBox();
			respondersBox.setStyle("horizontalGap", 0);
			
			_respondersLabel = new Label();
			_respondersLabel.setStyle("textAlign", "right");
			_respondersLabel.styleName = "pollResondersLabelStyle";
			_respondersLabel.text = ResourceUtil.getInstance().getString('bbb.polling.respondersLabel.novotes');
			respondersBox.addChild(_respondersLabel);
			
			_respondersLabelDots = new Label();
			_respondersLabelDots.width = 20;
			_respondersLabelDots.setStyle("textAlign", "left");
			_respondersLabelDots.styleName="pollResondersLabelStyle";
			_respondersLabelDots.text = "";
			respondersBox.addChild(_respondersLabelDots);
			
			addChild(respondersBox);
			
			hrule = new HRule();
			hrule.percentWidth = 100;
			addChild(hrule);
			
			var botBox:HBox = new HBox();
			botBox.percentWidth = 90;
			botBox.setStyle("gap", 10);
			botBox.setStyle("horizontalAlign", "right");
			
			_publishBtn = new Button();
			_publishBtn.label = ResourceUtil.getInstance().getString('bbb.polling.publishButton.label');
			_publishBtn.styleName = "mainActionButton";
			_publishBtn.addEventListener(MouseEvent.CLICK, handlePublishClick);
			botBox.addChild(_publishBtn);
			_closeBtn = new Button();
			_closeBtn.label = ResourceUtil.getInstance().getString('bbb.polling.closeButton.label');
			_closeBtn.addEventListener(MouseEvent.CLICK, handleCloseClick);
			botBox.addChild(_closeBtn);
			addChild(botBox);
			
			_voteListener = new Listener();
			_voteListener.type = PollVotedEvent.POLL_VOTED;
			_voteListener.method = handlePollVotedEvent;
			
			_stopPollListener = new Listener();
			_stopPollListener.type = PollStoppedEvent.POLL_STOPPED;
			_stopPollListener.method = handlePollStoppedEvent;
			
			_dotTimer = new Timer(200, 0);
			_dotTimer.addEventListener(TimerEvent.TIMER, dotAnimate);
			_dotTimer.start();
		}
		
		public function setPoll(poll:SimplePoll):void {
			var resultData:Array = new Array();
			var answers:Array = poll.answers; 
			for (var j:int = 0; j < answers.length; j++) {
				var a:SimpleAnswer = answers[j] as SimpleAnswer;
				var localizedKey: String = ResourceUtil.getInstance().getString('bbb.polling.answer.' + a.key);
				
				if (localizedKey == null || localizedKey == "" || localizedKey == "undefined") {
					localizedKey = a.key
				} 
				resultData.push({a:localizedKey, v:0});
			}
			
			_pollGraphic.data = resultData;
			_pollGraphic.height = ((23+10)*_pollGraphic.data.length+10);
			_pollGraphic.minHeight = ((16+10)*_pollGraphic.data.length+10);
		}
		
		private function handlePollVotedEvent(e:PollVotedEvent):void {
			if (_dotTimer && _dotTimer.running) {
				_dotTimer.stop();
				_dotTimer = null;
			}
			_respondersLabelDots.visible = false;
			_respondersLabelDots.includeInLayout = false;
			
			var resultData:Array = new Array();
			var answers:Array = e.result.answers; 
			for (var j:int = 0; j < answers.length; j++) {
				var a:SimpleAnswerResult = answers[j] as SimpleAnswerResult;
				var localizedKey: String = ResourceUtil.getInstance().getString('bbb.polling.answer.' + a.key);
				
				if (localizedKey == null || localizedKey == "" || localizedKey == "undefined") {
					localizedKey = a.key;
				} 
				
				resultData.push({a:localizedKey, v:a.numVotes});
			}
			
			_pollGraphic.data = resultData;
			if (e.result.numResponders != e.result.numRespondents) {
				_respondersLabel.text = e.result.numResponders + "/" + e.result.numRespondents;
			} else {
				_respondersLabel.text = ResourceUtil.getInstance().getString('bbb.polling.respondersLabel.finished');
			}
		}
		
		private function handlePollStoppedEvent(e:PollStoppedEvent):void {
			close();
		}
		
		private function handlePublishClick(e:MouseEvent):void {
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new ShowPollResultEvent());
			close();
		}
		
		private function handleCloseClick(e:MouseEvent):void {
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new StopPollEvent());
			close();
		}
		
		private function close():void {
			_voteListener.type = null;
			_voteListener.method = null;
			_voteListener = null;
			
			_stopPollListener.type = null;
			_stopPollListener.method = null;
			_stopPollListener = null;
			
			PopUpUtil.removePopUp(this);
		}
		
		private function dotAnimate(e:TimerEvent):void {
			if (_respondersLabelDots.text.length > 5) {
				_respondersLabelDots.text = "";
			} else {
				_respondersLabelDots.text += ".";
			}
		}
	}
}