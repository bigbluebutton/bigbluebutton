package org.bigbluebutton.modules.layout.services {
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.events.ModuleLoadEvent;
	import org.bigbluebutton.main.model.users.IMessageListener;
	import org.bigbluebutton.modules.layout.events.LayoutEvent;
	import org.bigbluebutton.modules.layout.events.LayoutFromRemoteEvent;
	import org.bigbluebutton.modules.layout.events.RemoteSyncLayoutEvent;
	import org.bigbluebutton.modules.layout.model.LayoutDefinition;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public class MessageReceiver implements IMessageListener {
		private static const LOGGER:ILogger = getClassLogger(MessageReceiver);

		private var _dispatcher:Dispatcher;

		public function MessageReceiver() {
			BBB.initConnectionManager().addMessageListener(this);
			_dispatcher = new Dispatcher();
		}

		public function onMessage(messageName:String, message:Object):void {
			//      trace("LAYOUT: received message " + messageName);

			switch (messageName) {
				case "GetCurrentLayoutRespMsg":
					handleGetCurrentLayoutRespMsg(message);
					break;
				case "BroadcastLayoutEvtMsg":
					handleBroadcastLayoutEvtMsg(message);
					break;
				default:
					break;
					/*
				case "getCurrentLayoutResponse":
					handleGetCurrentLayoutResponse(message);
					break;
				case "layoutLocked":
					handleLayoutLocked(message);
					break;
				case "syncLayout":
					handleSyncLayout(message);
					break;
					*/
			}
		}

		private function handleGetCurrentLayoutRespMsg(message:Object):void {
			_applyFirstLayoutTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
				onReceivedFirstLayout(message.body);
			});
			_applyFirstLayoutTimer.start();
		}

		private function handleBroadcastLayoutEvtMsg(message:Object):void {
			var affectedUsers:Array = message.body.applyTo as Array;
			var appliesToMe:Boolean = false;
			var myUserId:String = UsersUtil.getMyUserID();
			
			for (var i:int = 0; i < affectedUsers.length; i++) {
				if (affectedUsers[i] == myUserId) {
					appliesToMe = true;
					break;
				}
			}
			
			if (appliesToMe) 
				handleSyncLayout(message.body);
		}

		/*
		 * the application of the first layout should be delayed to avoid
		 * strange movements of the windows before set the correct position
		 * TDJ: increasing from 750 to 1000 because in some computers the initial layout was not applying correctly
		 */
		private var _applyFirstLayoutTimer:Timer = new Timer(1000, 1);

		private function handleGetCurrentLayoutResponse(message:Object):void {
			_applyFirstLayoutTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
				onReceivedFirstLayout(message);
			});
			_applyFirstLayoutTimer.start();
		}

		private function onReceivedFirstLayout(message:Object):void {
			LOGGER.debug("LayoutService: handling the first layout. locked = [{0}] layout = [{1}]", [message.locked, message.layout]);
			trace("LayoutService: handling the first layout. locked = [" + message.locked + "] layout = [" + message.layout + "], moderator = [" + UsersUtil.amIModerator() + "]");
			if (StringUtils.isEmpty(message.layout) || UsersUtil.amIModerator())
				_dispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.APPLY_DEFAULT_LAYOUT_EVENT));
			else {
				handleSyncLayout(message);
			}

			_dispatcher.dispatchEvent(new ModuleLoadEvent(ModuleLoadEvent.LAYOUT_MODULE_STARTED));
		}

		private function handleSyncLayout(message:Object):void {
			// is this event needed? Doesn't seem to do anything becasue it only applies to the original layout and then it's changed right afterwards once the new one is loaded
			_dispatcher.dispatchEvent(new RemoteSyncLayoutEvent(message.layout));

			if (StringUtils.isEmpty(message.layout))
				return;

			var layoutDefinition:LayoutDefinition = new LayoutDefinition();
			layoutDefinition.load(new XML(message.layout));
			var translatedName:String = ResourceUtil.getInstance().getString(layoutDefinition.name)
			if (translatedName == "undefined")
				translatedName = layoutDefinition.name;
			// remove previously added [Remote] mark
			var pattern:RegExp = /^\[.*\] /g;
			translatedName = translatedName.replace(pattern, "");
			layoutDefinition.name = "[" + ResourceUtil.getInstance().getString('bbb.layout.combo.remote') + "] " + translatedName;
			var redefineLayout:LayoutFromRemoteEvent = new LayoutFromRemoteEvent();
			redefineLayout.layout = layoutDefinition;
			redefineLayout.remote = true;

			_dispatcher.dispatchEvent(redefineLayout);
		}
	}
}

