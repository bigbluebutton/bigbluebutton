package org.bigbluebutton.modules.polling.views
{
	import com.asfusion.mate.events.Dispatcher;
	import com.asfusion.mate.events.Listener;
	
	import flash.events.MouseEvent;
	
	import mx.containers.HBox;
	import mx.containers.TitleWindow;
	import mx.controls.Button;
	import mx.controls.HRule;
	import mx.controls.Label;
	import mx.controls.TextArea;
	import mx.core.ScrollPolicy;
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
		
		private var _respondersLabel:Label;
		private var _pollGraphic:PollGraphic;
		private var _publishBtn:Button;
		private var _closeBtn:Button;
		
		public function PollResultsModal() {
			super();
			
			styleName = "micSettingsWindowStyle";
			width = 300;
			height = 300;
			setStyle("verticalGap", 15);
			showCloseButton = false;
			layout = "vertical";
			setStyle("horizontalAlign", "center");
			setStyle("verticalAlign", "middle");
			
			var modalTitle:TextArea = new TextArea();
			modalTitle.setStyle("borderSkin", null);
			modalTitle.verticalScrollPolicy = ScrollPolicy.OFF;
			modalTitle.editable = false;
			modalTitle.text = ResourceUtil.getInstance().getString('bbb.polling.pollModal.title');
			modalTitle.styleName = "micSettingsWindowTitleStyle";
			modalTitle.percentWidth = 100;
			modalTitle.height = 25;
			addChild(modalTitle);
			
			var hrule:HRule = new HRule();
			hrule.percentWidth = 100;
			addChild(hrule);
			
			_respondersLabel = new Label();
			_respondersLabel.styleName = "pollResondersLabelStyle";
			_respondersLabel.text = " ";// ResourceUtil.getInstance().getString('bbb.polling.respondersLabel.novotes');
			addChild(_respondersLabel);
			
			_pollGraphic = new PollGraphic();
			_pollGraphic.data = null;
			_pollGraphic.width = 200;
			_pollGraphic.minWidth = 130;
			addChild(_pollGraphic);
			
			hrule = new HRule();
			hrule.percentWidth = 100;
			addChild(hrule);
			
			var botBox:HBox = new HBox();
			botBox.setStyle("gap", 10);
			
			_publishBtn = new Button();
			_publishBtn.label = ResourceUtil.getInstance().getString('bbb.polling.publishButton.label');
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
			
			height = _pollGraphic.height + 220;
		}
		
		private function handlePollVotedEvent(e:PollVotedEvent):void {
			var resultData:Array = new Array();
			var answers:Array = e.result.answers; 
			for (var j:int = 0; j < answers.length; j++) {
				var a:SimpleAnswerResult = answers[j] as SimpleAnswerResult;
				resultData.push({a:a.key, v:a.numVotes});
			}
			
			_pollGraphic.data = resultData;
			_respondersLabel.text = ResourceUtil.getInstance().getString('bbb.polling.respondersLabel.text', [e.result.numResponders + "/" + e.result.numRespondents]);
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