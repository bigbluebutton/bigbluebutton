package org.bigbluebutton.web.shortcuthelp {
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	
	import flexlib.mdi.events.MDIWindowEvent;
	
	import mx.collections.ArrayCollection;
	import mx.collections.ArrayList;
	import mx.controls.DataGrid;
	import mx.controls.List;
	import mx.controls.dataGridClasses.DataGridColumn;
	import mx.events.CollectionEvent;
	
	import org.bigbluebutton.web.main.commands.LocaleChangedSignal;
	import org.bigbluebutton.web.util.i18n.ResourceUtil;
	import org.bigbluebutton.web.window.views.BBBWindow;
	
	import spark.components.ComboBox;
	import spark.components.DropDownList;
	import spark.components.VGroup;
	
	public class ShortcutHelpWindow extends BBBWindow {
		
		private var genKeys:ArrayList;
		
		private var presKeys:ArrayList;
		
		private var chatKeys:ArrayList;
		
		private var userKeys:ArrayList;
		
		private var pollKeys:ArrayList;
		
		private var pollVoteKeys:ArrayList;
		
		private var generalString:String = ResourceUtil.getInstance().getString("bbb.shortcuthelp.dropdown.general");
		
		private var presentationString:String = ResourceUtil.getInstance().getString("bbb.shortcuthelp.dropdown.presentation");
		
		private var chatString:String = ResourceUtil.getInstance().getString("bbb.shortcuthelp.dropdown.chat");
		
		private var userString:String = ResourceUtil.getInstance().getString("bbb.shortcuthelp.dropdown.users");
		
		private var pollString:String = ResourceUtil.getInstance().getString("bbb.shortcuthelp.dropdown.polling");
		
		private var pollVoteString:String = ResourceUtil.getInstance().getString("bbb.shortcuthelp.dropdown.polling2");
		
		private var presResource:Array = ['bbb.shortcutkey.present.focusslide', /*'bbb.shortcutkey.whiteboard.undo',*/ 'bbb.shortcutkey.present.upload', 'bbb.shortcutkey.present.previous', 'bbb.shortcutkey.present.select', 'bbb.shortcutkey.present.next', 'bbb.shortcutkey.present.fitWidth', 'bbb.shortcutkey.present.fitPage'];
		
		private var chatResource:Array = ['bbb.shortcutkey.chat.focusTabs', 'bbb.shortcutkey.chat.focusBox', 'bbb.shortcutkey.chat.sendMessage', 'bbb.shortcutkey.chat.explanation', 'bbb.shortcutkey.chat.chatbox.gofirst', 'bbb.shortcutkey.chat.chatbox.goback', 'bbb.shortcutkey.chat.chatbox.advance', 'bbb.shortcutkey.chat.chatbox.golatest', 'bbb.shortcutkey.chat.chatbox.repeat', 'bbb.shortcutkey.chat.chatbox.goread'];
		
		private var userResource:Array = ['bbb.shortcutkey.users.focusUsers', 'bbb.shortcutkey.users.makePresenter', 'bbb.shortcutkey.users.mute',
			/*'bbb.shortcutkey.users.kick',*/'bbb.shortcutkey.users.muteall'];
		
		private var pollResource:Array = ['bbb.shortcutkey.polling.focusTitle', 'bbb.shortcutkey.polling.focusQuestion', 'bbb.shortcutkey.polling.focusAnswers', 'bbb.shortcutkey.polling.focusMultipleCB', 'bbb.shortcutkey.polling.focusWebPollCB', 'bbb.shortcutkey.polling.previewClick', 'bbb.shortcutkey.polling.cancelClick', 'bbb.shortcutkey.polling.modify', 'bbb.shortcutkey.polling.publish', 'bbb.shortcutkey.polling.save', 'bbb.shortcutkey.pollStats.explanation', 'bbb.shortcutkey.polling.focusWebPoll', 'bbb.shortcutkey.polling.focusData', 'bbb.shortcutkey.polling.refresh', 'bbb.shortcutkey.polling.stopPoll', 'bbb.shortcutkey.polling.repostPoll', 'bbb.shortcutkey.polling.closeStatsWindow'];
		
		private var pollVoteResource:Array = ['bbb.shortcutkey.polling.focusVoteQuestion', 'bbb.shortcutkey.polling.vote'];
		
		private var shownKeys:ArrayCollection;
		
		private var baseIndex:int = 100;
		
		private var modifier:String;
		
		private var globalModifier:String;
		
		private var categories:DropDownList;
		
		private var categoryAC:ArrayCollection;
		
		private var keyList:DataGrid;
		
		public function ShortcutHelpWindow() {
			super();
			
			categories = new DropDownList();
			categories.labelField = "Please select an area for which to view shortcut keys: ";
			categories.tabIndex = baseIndex + 10;
			categories.addEventListener(Event.CHANGE, changeArray);
			
			categoryAC = new ArrayCollection();
			categories.dataProvider = categoryAC;
			
			keyList = new DataGrid();
			keyList.draggableColumns = false;
			keyList.dataProvider = shownKeys;
			keyList.tabIndex = baseIndex + 15;
			
			var shortcut:DataGridColumn = new DataGridColumn();
			shortcut.dataField = "shortcut";
			shortcut.headerText = "Shortcut";
			
			var func:DataGridColumn = new DataGridColumn();
			func.dataField = "func";
			func.headerText = "Function";
			
			var columns:Array = keyList.columns;
			columns.push(shortcut);
			columns.push(func);
			keyList.columns = columns;
			
			modifier = ExternalInterface.call("determineModifier");
			globalModifier = ExternalInterface.call("determineGlobalModifier");
			populateModules();
			
			var group:VGroup = new VGroup();
			group.addElement(categories);
			group.addElement(keyList);
			
			addElement(group);
			
			localeChanged();
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			keyList.width = w;
			keyList.height = h - keyList.y - titleBarOverlay.height;
		}
		
		private function populateModules():void {
			categoryAC.addItem(generalString);
			//if (ShortcutOptions.usersActive)
			categoryAC.addItem(userString);
			
			//if (ShortcutOptions.presentationActive)
			categoryAC.addItem(presentationString);
			
			//if (ShortcutOptions.chatActive)
			categoryAC.addItem(chatString);
			
			//if (ShortcutOptions.pollingActive) {
			categoryAC.addItem(pollString);
			categoryAC.addItem(pollVoteString);
			//}
		}
		
		private function reloadKeys():void {
			//genKeys = loadKeys(ShortcutOptions.genResource, true);
			presKeys = loadKeys(presResource);
			chatKeys = loadKeys(chatResource);
			userKeys = loadKeys(userResource);
			pollKeys = loadKeys(pollResource);
			pollVoteKeys = loadKeys(pollVoteResource);
			
			changeArray();
		}
		
		public override function close(event:MouseEvent = null):void {
			//var dispatcher:Dispatcher = new Dispatcher();
			//dispatcher.dispatchEvent(new ShortcutEvent(ShortcutEvent.FOCUS_SHORTCUT_BUTTON));
			super.close(event);
		}
		
		private function changeArray(e:Event = null):void {
			shownKeys = new ArrayCollection();
			
			switch (categories.selectedIndex) {
				case 0: //General
					shownKeys.addAll(genKeys);
					break;
				case categoryAC.getItemIndex(presentationString): //Presentation
					shownKeys.addAll(presKeys);
					break;
				case categoryAC.getItemIndex(chatString): //Chat
					shownKeys.addAll(chatKeys);
					break;
				case categoryAC.getItemIndex(userString): //Users
					shownKeys.addAll(userKeys);
					break;
				case categoryAC.getItemIndex(pollString): //Polling, Presenter
					shownKeys.addAll(pollKeys);
					break;
				case categoryAC.getItemIndex(pollVoteString): //Polling, Viewer
					shownKeys.addAll(pollVoteKeys);
					break;
			}
			
			keyList.dataProvider = shownKeys;
		}
		
		private function loadKeys(resource:Array, global:Boolean = false):ArrayList {
			var keyList:ArrayList = new ArrayList();
			var keyCombo:String;
			var mod:String;
			
			if (global)
				mod = globalModifier;
			else
				mod = modifier;
			
			for (var i:int = 0; i < resource.length; i++) {
				keyCombo = ResourceUtil.getInstance().getString(resource[i]);
				var key:int = int(keyCombo);
				var convKey:String;
				
				// Special cases where the keycodes don't render a sensible character
				switch (key) {
					case 32:
						convKey = ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.space');
						break;
					case 37:
						convKey = ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.left');
						break;
					case 38:
						convKey = ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.up');
						break;
					case 39:
						convKey = ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.right');
						break;
					case 40:
						convKey = ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.down');
						break;
					case 189:
						convKey = ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.minus');
						break;
					case 187:
						convKey = ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.plus');
						break;
					default:
						convKey = String.fromCharCode(key);
						break;
				}
				
				if (keyCombo == "----") {
					keyList.addItem({shortcut: (ResourceUtil.getInstance().getString(resource[i] + '.function')), func: ""});
						//} else if (convKey == "Left" || convKey == "Up" || convKey == "Right" || convKey == "Down"){
				} else if (convKey == ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.left') || convKey == ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.up') || convKey == ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.right') || convKey == ResourceUtil.getInstance().getString('bbb.shortcutkey.specialKeys.down')) {
					keyList.addItem({shortcut: convKey, func: (ResourceUtil.getInstance().getString(resource[i] + '.function'))});
				} else {
					keyList.addItem({shortcut: mod + convKey, func: (ResourceUtil.getInstance().getString(resource[i] + '.function'))});
				}
			}
			return keyList;
		}
		
		private function localeChanged():void {
			reloadKeys();
			resourcesChanged();
		}
		
		override protected function resourcesChanged():void {
			super.resourcesChanged();
			
			this.title = ResourceUtil.getInstance().getString('bbb.shortcuthelp.title');
			
			if (titleBarOverlay != null) {
				titleBarOverlay.accessibilityName = ResourceUtil.getInstance().getString('bbb.shortcuthelp.titleBar');
			}
			
			if (windowControls != null) {
				minimizeBtn.toolTip = ResourceUtil.getInstance().getString("bbb.window.minimizeBtn.toolTip");
				minimizeBtn.accessibilityName = ResourceUtil.getInstance().getString("bbb.shortcuthelp.minimizeBtn.accessibilityName");
				
				maximizeRestoreBtn.toolTip = ResourceUtil.getInstance().getString("bbb.window.maximizeRestoreBtn.toolTip");
				maximizeRestoreBtn.accessibilityName = ResourceUtil.getInstance().getString("bbb.shortcuthelp.maximizeRestoreBtn.accessibilityName");
				
				maximizeRestoreBtn.toolTip = ResourceUtil.getInstance().getString("bbb.window.closeBtn.toolTip");
				maximizeRestoreBtn.accessibilityName = ResourceUtil.getInstance().getString("bbb.shortcuthelp.closeBtn.accessibilityName");
			}
		}
		
		public function focusCategories():void { //actually focuses the datagrid instead
			focusManager.setFocus(keyList);
			keyList.drawFocus(true);
		}
		
		public function focusHead():void {
			//	focusManager.setFocus(titleBarOverlay);
		}
		
		public function focusButton(e:MDIWindowEvent):void {
			//	LogUtil.debug("Caught close event from window");
			//	var dispatcher:Dispatcher = new Dispatcher();
			//	dispatcher.dispatchEvent(new ShortcutEvent(ShortcutEvent.FOCUS_SHORTCUT_BUTTON));
		}
	}
}
