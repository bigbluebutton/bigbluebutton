package org.bigbluebutton.modules.viewers.model
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.viewers.ViewersModuleConstants;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.bigbluebutton.modules.viewers.model.business.IViewers;
	import org.bigbluebutton.modules.viewers.model.services.IViewersService;
	import org.bigbluebutton.modules.viewers.model.services.ViewersSOService;
	import org.bigbluebutton.modules.viewers.model.vo.User;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class ViewersProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "ViewersProxy";

		private var _uri:String;		
		private var _viewersService:IViewersService;
		private var _participants:IViewers = null;
		
		private var isPresenter:Boolean = false;
				
		public function ViewersProxy(uri:String)
		{
			super(NAME);
		}
		
		override public function getProxyName():String
		{
			return NAME;
		}
		
		public function connect(uri:String, room:String, username:String, password:String ):void {
			_uri = uri;
			_participants = new Conference();
			_viewersService = new ViewersSOService(_uri, _participants);
			_viewersService.addConnectionStatusListener(connectionStatusListener);
			_viewersService.addMessageSender(messageSender);
			_participants.me.name = username;	
			_viewersService.connect(_uri, room, username, password);		
		}
		
		public function stop():void {
			_viewersService.disconnect();
		}
		
		public function get me():User {
			return _participants.me;
		}
		
		public function isModerator():Boolean {
			if (me.role == "MODERATOR") {
				return true;
			}
			
			return false;
		}
		
		public function get participants():ArrayCollection {
			return _participants.users;
		}
		
		public function assignPresenter(assignTo:Number):void {
			_viewersService.assignPresenter(assignTo, me.userid);
		}
		
		private function connectionStatusListener(connected:Boolean, reason:String = null):void {
			if (connected) {
				sendNotification(ViewersModuleConstants.LOGGED_IN);
			} else {
				_participants = null;
				if (reason == null) reason = ViewersModuleConstants.UNKNOWN_REASON;
				sendNotification(ViewersModuleConstants.LOGGED_OUT, reason);
			}
		}
		
		private function messageSender(msg:String, body:Object=null):void {
			if (msg == ViewersModuleConstants.ASSIGN_PRESENTER) {
				if (me.userid == body.assignedTo) {
					// I've been assigned as presenter.
					trace('I have become presenter');
					isPresenter = true;
					sendNotification(msg, body);
				} else {
					// Somebody else has become presenter.
					if (isPresenter) {
						trace('Somebody else has become presenter.');
						isPresenter = false;
						sendNotification(ViewersModuleConstants.BECOME_VIEWER);
					}
				}
			} else {
				sendNotification(msg, body);
			}
		}		
	}
}