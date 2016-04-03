package org.bigbluebutton.web.shortcuthelp {
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	
	import mx.collections.ArrayCollection;
	import mx.collections.ArrayList;
	import mx.controls.DataGrid;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.web.main.models.IShortcutOptions;
	import org.bigbluebutton.web.shortcuthelp.ShortcutHelpWindow;
	import org.bigbluebutton.web.util.i18n.ResourceUtil;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	import spark.components.DropDownList;
	
	public class ShortcutHelpWindowMediator extends Mediator {
		
		[Inject]
		public var view:ShortcutHelpWindow;
		
		[Inject]
		public var shortcutOptions:IShortcutOptions;
		
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
		
		private var categoryAC:ArrayCollection;
		
		private var globalModifier:String;
		
		private var modifier:String;
		
		private var shownKeys:ArrayCollection;
		
		override public function initialize():void {
			shortcutOptions.initKeys();
			view.categories.addEventListener(Event.CHANGE, changeArray);
			categoryAC = new ArrayCollection();
			view.categories.dataProvider = categoryAC;
			view.categories.setSelectedIndex(0);
			view.keyList.dataProvider = shownKeys;
			
			//TODO: following lines are not working:
			modifier = ExternalInterface.call("determineModifier");
			globalModifier = ExternalInterface.call("determineGlobalModifier");
			
			populateModules();
			localeChanged();
		}
		
		private function loadKeys(resource:Array, global:Boolean = false):ArrayList {
			var keyList:ArrayList = new ArrayList();
			var keyCombo:String;
			var mod:String;
			
			if (global)
				mod = globalModifier;
			else
				mod = modifier;
			trace("{{ " + mod);
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
		
		private function reloadKeys():void {
			genKeys = loadKeys(shortcutOptions.genResource, true);
			presKeys = loadKeys(presResource);
			chatKeys = loadKeys(chatResource);
			userKeys = loadKeys(userResource);
			pollKeys = loadKeys(pollResource);
			pollVoteKeys = loadKeys(pollVoteResource);
			
			changeArray();
		}
		
		private function localeChanged():void {
			reloadKeys();
			view.updateResources();
		}
		
		private function changeArray(e:Event = null):void {
			shownKeys = new ArrayCollection();
			
			switch (view.categories.selectedIndex) {
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
			
			view.keyList.dataProvider = shownKeys;
		}
		
		private function populateModules():void {
			categoryAC.addItem(generalString);
			if (shortcutOptions.usersActive)
				categoryAC.addItem(userString);
			
			if (shortcutOptions.presentationActive)
				categoryAC.addItem(presentationString);
			
			if (shortcutOptions.chatActive)
				categoryAC.addItem(chatString);
			
			if (shortcutOptions.pollingActive) {
				//categoryAC.addItem(pollString);
				//categoryAC.addItem(pollVoteString);
			}
		}
		
		override public function destroy():void {
			super.destroy();
			view = null;
		}
	}
}
