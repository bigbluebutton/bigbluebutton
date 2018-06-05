package org.bigbluebutton.modules.polling.views
{
	import com.asfusion.mate.events.Dispatcher;
	import com.asfusion.mate.events.Listener;
	
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.collections.ArrayCollection;
	import mx.collections.Sort;
	import mx.collections.SortField;
	import mx.containers.Box;
	import mx.containers.HBox;
	import mx.containers.TitleWindow;
	import mx.controls.Button;
	import mx.controls.DataGrid;
	import mx.controls.HRule;
	import mx.controls.Label;
	import mx.controls.dataGridClasses.DataGridColumn;
	import mx.events.FlexEvent;
	
	import org.as3commons.lang.StringUtils;
	import org.bigbluebutton.common.AdvancedLabel;
	import org.bigbluebutton.core.PopUpUtil;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.core.model.users.User2x;
	import org.bigbluebutton.modules.polling.events.PollStoppedEvent;
	import org.bigbluebutton.modules.polling.events.PollUpdatedEvent;
	import org.bigbluebutton.modules.polling.events.PollVoteReceivedEvent;
	import org.bigbluebutton.modules.polling.events.ShowPollResultEvent;
	import org.bigbluebutton.modules.polling.events.StopPollEvent;
	import org.bigbluebutton.modules.polling.model.SimpleAnswer;
	import org.bigbluebutton.modules.polling.model.SimpleAnswerResult;
	import org.bigbluebutton.modules.polling.model.SimplePoll;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class PollResultsModal extends TitleWindow {
		private var _updatePollListener:Listener;
		private var _stopPollListener:Listener;
		private var _voteReceivedListener:Listener;
		
		private var _respondersLabel:Label;
		private var _respondersLabelDots:Label;
		private var _voteGrid:DataGrid;
		private var _pollGraphic:PollGraphic;
		private var _publishBtn:Button;
		private var _closeBtn:Button;
		
		private var _dotTimer:Timer;
		
		private var _pollInfo:SimplePoll;
		
		private var _voteArray:ArrayCollection;
		
		public function PollResultsModal() {
			super();
			
			addEventListener(FlexEvent.SHOW, showEventHandler);
			
			width = 550;
			showCloseButton = false;
			layout = "vertical";
			setStyle("horizontalAlign", "center");
			
			var modalTitle:AdvancedLabel = new AdvancedLabel();
			modalTitle.text = ResourceUtil.getInstance().getString('bbb.polling.pollModal.title');
			modalTitle.styleName = "titleWindowStyle";
			modalTitle.maxWidth = 300;
			addChild(modalTitle);
			
			var hintBox : Box = new Box();
			hintBox.percentWidth = 90;
			hintBox.styleName = "pollHintBoxStyle";
			addChild(hintBox);
			
			var hintText : AdvancedLabel = new AdvancedLabel();
			hintText.percentWidth = 90;
			hintText.styleName = "pollHintTextStyle";
			hintText.text = ResourceUtil.getInstance().getString('bbb.polling.pollModal.hint');
			hintBox.addChild(hintText);

			var hrule:HRule = new HRule();
			hrule.percentWidth = 90;
			addChild(hrule);
			
			var resultsBox:HBox = new HBox();
			resultsBox.percentWidth = 90;
			resultsBox.setStyle("verticalAlign", "middle");
			resultsBox.setStyle("horizontalGap", 24);
			
			_voteArray = new ArrayCollection();
			_voteArray.sort = new Sort();
			var sortField:SortField = new SortField("key");
			sortField.compareFunction = voteSortFunction;
			_voteArray.sort.fields = [sortField];
			
			_voteGrid = new DataGrid();
			_voteGrid.percentWidth = 50;
			_voteGrid.percentHeight = 100;
			_voteGrid.styleName = "pollVotesDataGridStyle";
			_voteGrid.dataProvider = _voteArray;
			var voteColumnArray:Array = [];
			var voteColumn:DataGridColumn = new DataGridColumn();
			voteColumn.dataField = "name";
			voteColumn.sortCompareFunction = nameSortFunction;
			voteColumn.headerText = ResourceUtil.getInstance().getString('bbb.polling.pollModal.voteGrid.userHeading');
			voteColumnArray.push(voteColumn);
			voteColumn = new DataGridColumn();
			voteColumn.dataField = "key";
			voteColumn.sortCompareFunction = voteSortFunction;
			voteColumn.headerText = ResourceUtil.getInstance().getString('bbb.polling.pollModal.voteGrid.answerHeading');
			voteColumnArray.push(voteColumn);
			_voteGrid.columns = voteColumnArray;
			resultsBox.addChild(_voteGrid);
			
			_pollGraphic = new PollGraphic();
			_pollGraphic.data = null;
			_pollGraphic.percentWidth = 50;
			//_pollGraphic.minWidth = 130;
			resultsBox.addChild(_pollGraphic);
			
			addChild(resultsBox);
			
			hrule = new HRule();
			hrule.percentWidth = 90;
			addChild(hrule);
			
			var botBox:HBox = new HBox();
			botBox.percentWidth = 90;
			botBox.setStyle("gap", 10);
			botBox.setStyle("horizontalAlign", "right");
			botBox.setStyle("verticalAlign", "middle");
			
			var respondersBox:HBox = new HBox();
			respondersBox.percentWidth = 100;
			respondersBox.setStyle("horizontalAlign", "left");
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
			
			botBox.addChild(respondersBox);
			
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
			
			_updatePollListener = new Listener();
			_updatePollListener.type = PollUpdatedEvent.POLL_UPDATED;
			_updatePollListener.method = handlePollUpdatedEvent;
			
			_stopPollListener = new Listener();
			_stopPollListener.type = PollStoppedEvent.POLL_STOPPED;
			_stopPollListener.method = handlePollStoppedEvent;
			
			_voteReceivedListener = new Listener();
			_voteReceivedListener.type = PollVoteReceivedEvent.POLL_VOTE_RECEIVED;
			_voteReceivedListener.method = handlePollVoteReceivedEvent;
			
			_dotTimer = new Timer(200, 0);
			_dotTimer.addEventListener(TimerEvent.TIMER, dotAnimate);
			_dotTimer.start();
		}
		
		public function setPoll(poll:SimplePoll):void {
			_pollInfo = poll;
			
			var resultData:Array = new Array();
			var answers:Array = poll.answers; 
			for (var j:int = 0; j < answers.length; j++) {
				var a:SimpleAnswer = answers[j] as SimpleAnswer;
				var localizedKey: String = ResourceUtil.getInstance().getString('bbb.polling.answer.' + a.key);
				
				if (StringUtils.isEmpty(localizedKey) || localizedKey == "undefined") {
					localizedKey = a.key
				} 
				resultData.push({a:localizedKey, v:0});
			}
			
			_pollGraphic.data = resultData;
			_pollGraphic.height = ((23+10)*_pollGraphic.data.length+10);
			_pollGraphic.minHeight = ((16+10)*_pollGraphic.data.length+10);
			
			var users:ArrayCollection = UsersUtil.getUsers();
			var myUserId:String = UsersUtil.getMyUserID();
			for each (var user:User2x in users) {
				if (user.intId != myUserId) {
					_voteArray.addItem({userId: user.intId, name: user.name, key: ""});
				}
			}
			_voteArray.refresh();
		}
		
		private function showEventHandler(e:FlexEvent):void {
			this.setFocus();
		}
		
		private function handlePollUpdatedEvent(e:PollUpdatedEvent):void {
			var resultData:Array = new Array();
			var answers:Array = e.result.answers; 
			for (var j:int = 0; j < answers.length; j++) {
				var a:SimpleAnswerResult = answers[j] as SimpleAnswerResult;
				var localizedKey: String = ResourceUtil.getInstance().getString('bbb.polling.answer.' + a.key);
				
				if (StringUtils.isEmpty(localizedKey) || localizedKey == "undefined") {
					localizedKey = a.key;
				} 
				
				resultData.push({a:localizedKey, v:a.numVotes});
			}
			
			_pollGraphic.data = resultData;
			if (e.result.numResponders != e.result.numRespondents) {
				_respondersLabel.text = ResourceUtil.getInstance().getString('bbb.polling.respondersLabel.novotes')+ " ("+ e.result.numResponders + "/" + e.result.numRespondents + ")";
			} else {
				_respondersLabel.text = ResourceUtil.getInstance().getString('bbb.polling.respondersLabel.finished');
				
				if (_dotTimer && _dotTimer.running) {
					_dotTimer.stop();
					_dotTimer = null;
				}
				_respondersLabelDots.visible = false;
				_respondersLabelDots.includeInLayout = false;
			}
		}
		
		private function handlePollStoppedEvent(e:PollStoppedEvent):void {
			close();
		}
		
		private function handlePollVoteReceivedEvent(e:PollVoteReceivedEvent):void {
			var user:User2x = UsersUtil.getUser(e.userId);
			if (user && _pollInfo && _pollInfo.id == e.pollId) {
				var a:SimpleAnswer = _pollInfo.answers[e.answerId] as SimpleAnswer;
				var localizedKey: String = ResourceUtil.getInstance().getString('bbb.polling.answer.' + a.key);
				
				if (StringUtils.isEmpty(localizedKey) || localizedKey == "undefined") {
					localizedKey = a.key;
				}
				
				var foundRow:Object;
				for each (var row:Object in _voteArray) {
					if (row.userId == user.intId) {
						foundRow = row;
						break;
					}
				}
				if (foundRow) {
					foundRow.key = localizedKey;
				} else {
					_voteArray.addItem({userId: user.intId, name: user.name, key: localizedKey});
				}
				_voteArray.refresh();
			}
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
			if (_dotTimer && _dotTimer.running) {
				_dotTimer.stop();
				_dotTimer = null;
			}
			
			_updatePollListener.type = null;
			_updatePollListener.method = null;
			_updatePollListener = null;
			
			_stopPollListener.type = null;
			_stopPollListener.method = null;
			_stopPollListener = null;
			
			_voteReceivedListener.type = null;
			_voteReceivedListener.method = null;
			_voteReceivedListener = null;
			
			PopUpUtil.removePopUp(this);
		}
		
		private function dotAnimate(e:TimerEvent):void {
			if (_respondersLabelDots.text.length > 5) {
				_respondersLabelDots.text = "";
			} else {
				_respondersLabelDots.text += ".";
			}
		}
		
		private function nameSortFunction(a:Object, b:Object, fields:Array = null):int {
			if (a.name > b.name) return 1;
			if (a.name < b.name) return -1;
			
			if (a.key == "" && b.key == "") {}
			else if (a.key == "") return 1;
			else if (b.key == "") return -1;
			
			if (a.key > b.key) return 1;
			if (a.key < b.key) return -1;
			
			if (a.userId > b.userId) return 1;
			if (a.userId < b.userId) return -1;
			
			return 0;
		}
		
		private function voteSortFunction(a:Object, b:Object, fields:Array = null):int {
			if (a.key == "" && b.key == "") {}
			else if (a.key == "") return 1;
			else if (b.key == "") return -1;
			
			if (a.key > b.key) return 1;
			if (a.key < b.key) return -1;
			
			if (a.name > b.name) return 1;
			if (a.name < b.name) return -1;
			
			if (a.userId > b.userId) return 1;
			if (a.userId < b.userId) return -1;
			
			return 0;
		}
	}
}