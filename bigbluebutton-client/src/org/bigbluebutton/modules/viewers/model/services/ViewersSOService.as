package org.bigbluebutton.modules.viewers.model.services
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.SharedObject;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.viewers.ViewersModuleConstants;
	import org.bigbluebutton.modules.viewers.model.business.IViewers;
	import org.bigbluebutton.modules.viewers.model.vo.Status;
	import org.bigbluebutton.modules.viewers.model.vo.User;

	public class ViewersSOService implements IViewersService
	{
		public static const NAME:String = "ViewersSOService";
		
		private var _participantsSO : SharedObject;
		private static const SO_NAME : String = "participantsSO";
		private static const STATUS:String = "_STATUS";
		
		private var netConnectionDelegate: NetConnectionDelegate;
		
		private var _participants:IViewers;
		private var _uri:String;
		private var _connectionSuccessListener:Function;
		private var _connectionFailedListener:Function;
		private var _connectionStatusListener:Function;
		private var _messageSender:Function;
				
		public function ViewersSOService(uri:String, participants:IViewers)
		{			
			_uri = uri;
			_participants = participants;
			netConnectionDelegate = new NetConnectionDelegate(uri);			
			netConnectionDelegate.addConnectionSuccessListener(connectionSuccessListener);
			netConnectionDelegate.addConnectionFailedListener(connectionFailedListener);
		}
		
		public function connect(uri:String, room:String, username:String, password:String ):void {
			netConnectionDelegate.connect(_uri, room, username, password);
		}
			
		public function disconnect():void {
			leave();
			netConnectionDelegate.disconnect();
		}

		public function addMessageSender(msgSender:Function):void {
			_messageSender = msgSender;
		}
		
		private function sendMessage(msg:String, body:Object=null):void {
			if (_messageSender != null) _messageSender(msg, body);
		}
		
		private function connectionSuccessListener(connected:Boolean, user:Object=null, failReason:String=""):void {
			if (connected) {
				LogUtil.debug(NAME + ":Connected to the Viewers application " + user.userid + " " + user.role);
				_participants.me.role = user.role;
				_participants.me.userid = user.userid;
				_participants.me.room = user.room;
				_participants.me.authToken = user.authToken;
				join();
			} else {
				leave();
				LogUtil.debug(NAME + ":Disconnected from the Viewers application");
				notifyConnectionStatusListener(false, failReason);
			}
		}
		
		private function connectionFailedListener(reason:String):void {
			notifyConnectionStatusListener(false, reason);
		}
		
	    private function join() : void
		{
			_participantsSO = SharedObject.getRemote(SO_NAME, _uri, false);
			_participantsSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_participantsSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_participantsSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			_participantsSO.client = this;
			_participantsSO.connect(netConnectionDelegate.connection);
			LogUtil.debug(NAME + ":ViewersModules is connected to Shared object");
			notifyConnectionStatusListener(true);			
		}
		
	    private function leave():void
	    {
	    	if (_participantsSO != null) _participantsSO.close();
	    }

		public function addConnectionStatusListener(connectionListener:Function):void {
			_connectionStatusListener = connectionListener;
		}
		

		public function newStatus(userid:Number, status:Status):void {
			var aUser:User = _participants.getParticipant(userid);			
			if (aUser != null) {
				aUser.addStatus(status);
				LogUtil.debug('setting newStatus ' + status.name);
				_participantsSO.setProperty(userid.toString() + STATUS, aUser.status.source);
				_participantsSO.setDirty(userid.toString() + STATUS);
				//_participantsSO.send("addStatusCallback", userid, status);
			}
		}

		private function addStatusCallback(userid:Number, status:Status):void {
			var aUser:User = _participants.getParticipant(userid);			
			if (aUser != null) {
				aUser.addStatus(status);				
			}
		}
		
		public function changeStatus(userid:Number, status:Status):void {
			var aUser:User = _participants.getParticipant(userid);			
			if (aUser != null) {
				LogUtil.debug('setting changeStatus ' + status.name);
				aUser.changeStatus(status);
				_participantsSO.setProperty(userid.toString() + STATUS, aUser.status.source);
				_participantsSO.setDirty(userid.toString() + STATUS);
				//_participantsSO.send("changeStatusCallback", userid, status);
			}
		}
		
		public function changeStatusCallback(userid:Number, status:Status):void {
			var aUser:User = _participants.getParticipant(userid);			
			if (aUser != null) {
				aUser.changeStatus(status);
			}
		}

		public function removeStatus(userid:Number, statusName:String):void {
			var aUser:User = _participants.getParticipant(userid);			
			if (aUser != null) {
				LogUtil.debug('setting removeStatus ' + statusName);
				aUser.removeStatus(statusName);
				_participantsSO.setProperty(userid.toString() + STATUS, aUser.status.source);
				_participantsSO.setDirty(userid.toString() + STATUS);
				//_participantsSO.send("removeStatusCallback", userid, statusName);
			}
		}

		public function removeStatusCallback(userid:Number, statusName:String):void {
			var aUser:User = _participants.getParticipant(userid);			
			if (aUser != null) {
				aUser.removeStatus(statusName);
			}
		}
		
		public function iAmPresenter(userid:Number, presenter:Boolean):void {
			var aUser:User = _participants.getParticipant(userid);			
			if (aUser != null) {
				LogUtil.debug('iampresenter ' + userid);
				aUser.presenter = presenter;
				_participantsSO.setProperty(userid.toString(), aUser);
				_participantsSO.setDirty(userid.toString());
			}
		}
						
		public function assignPresenter(userid:Number, assignedBy:Number):void {
			var aUser:User = _participants.getParticipant(userid);			
			if (aUser != null) {
				LogUtil.debug('assigning presenter to ' + userid);
				aUser.presenter = true;
				_participantsSO.setProperty(userid.toString(), aUser);
				_participantsSO.setDirty(userid.toString());
			}			
			_participantsSO.send("assignPresenterCallback", userid, assignedBy);
		}
		
		public function assignPresenterCallback(userid:Number, assignedBy:Number):void {
			sendMessage(ViewersModuleConstants.ASSIGN_PRESENTER, {assignedTo:userid, assignedBy:assignedBy});
		}
		
		public function queryPresenter():void {
//			var p:Object = _participantsSO.data[PRESENTER];
//			LogUtil.debug('Got query presenter');
//			if (p != null) {
//				LogUtil.debug('responding to query presenter');
//				sendMessage(ViewersModuleConstants.QUERY_PRESENTER_REPLY, {assignedTo:p.assignedTo, assignedBy:p.assignedBy});
//			}			
		}



		public function addStream(userid:Number, streamName:String):void {
			var aUser : User = _participants.getParticipant(userid);						
			if (aUser != null) {
				// This sets the users stream
				aUser.hasStream = true;
				aUser.streamName = streamName;
				_participantsSO.setProperty(userid.toString(), aUser);
				_participantsSO.setDirty(userid.toString());
				
				LogUtil.debug( "Conference::addStream::found =[" + userid + "," 
						+ aUser.hasStream + "," + aUser.streamName + "]");				
			}
		}
		
		public function removeStream(userid:Number, streamName:String):void {
			var aUser : User = _participants.getParticipant(userid);						
			if (aUser != null) {
				// This sets the users stream
				aUser.hasStream = false;
				aUser.streamName = "";
				_participantsSO.setProperty(userid.toString(), aUser);
				_participantsSO.setDirty(userid.toString());
				
				LogUtil.debug( "Conference::removeStream::found =[" + userid + "," 
						+ aUser.hasStream + "," + aUser.streamName + "]");				
			}
		}
		
		/**
		 * Called when a sync_event is received for the SharedObject 
		 * @param event
		 * 
		 */		
		private function sharedObjectSyncHandler( event : SyncEvent) : void
		{
			LogUtil.debug( "Conference::sharedObjectSyncHandler " + event.changeList.length);
			
			for (var i : uint = 0; i < event.changeList.length; i++) 
			{
				LogUtil.debug( "Conference::handlingChanges[" + event.changeList[i].name + "][" + i + "][" + event.changeList[i].code + "]");
				handleChangesToSharedObject(event.changeList[i].code, 
						event.changeList[i].name, event.changeList[i].oldValue);
			}
		}

		/**
		 * See flash.events.SyncEvent
		 */
		private function handleChangesToSharedObject(code:String, name:String, oldValue:Object) : void
		{
			switch (code)
			{
				case "clear":
					/** From flash.events.SyncEvent doc
					 * 
					 * A value of "clear" means either that you have successfully connected 
					 * to a remote shared object that is not persistent on the server or the 
					 * client, or that all the properties of the object have been deleted -- 
					 * for example, when the client and server copies of the object are so 
					 * far out of sync that Flash Player resynchronizes the client object 
					 * with the server object. In the latter case, SyncEvent.SYNC is dispatched 
					 * and the "code" value is set to "change". 
					 */
					 LogUtil.debug("Got clear sync event for participants");
					_participants.removeAllParticipants();
													
					break;	
																			
				case "success":
					/** From flash.events.SyncEvent doc
					 * 	 A value of "success" means the client changed the shared object. 		
					 */
					
					// do nothing... just log it ;	
					LogUtil.debug( "Conference::success =[" + code + "," + name + "," + oldValue + "]");
					sendMessage(ViewersModuleConstants.CHANGE_STATUS);
					break;

				case "reject":
					/** From flash.events.SyncEvent doc
					 * 	A value of "reject" means the client tried unsuccessfully to change the 
					 *  object; instead, another client changed the object.		
					 */
					
					// do nothing... just log it 
					// Or...maybe we should check if the value is the same as what we wanted it
					// to be..if not...change it?
					LogUtil.debug( "Conference::reject =[" + code + "," + name + "," + oldValue + "]");	
					break;

				case "change":
					/** From flash.events.SyncEvent doc
					 * 	A value of "change" means another client changed the object or the server 
					 *  resynchronized the object.  		
					 */
					 
					if (name != null) {					
						LogUtil.debug('seraching status ' + name.search(STATUS));	
						var statusIndex:int = name.search(STATUS);
						if (statusIndex > -1) {
							var uid:String = name.slice(0,statusIndex);
							if (_participants.hasParticipant(Number(uid))) {
								var changedUser:User = _participants.getParticipant(Number(uid));
								changedUser.status = new ArrayCollection(_participantsSO.data[name] as Array);
								LogUtil.debug( "Conference::change =[" + name + "][" + changedUser.status.length + "]");
								//sendMessage(ViewersModuleConstants.CHANGE_STATUS, changedUser.status);
							} else {
								LogUtil.debug('User id NULL');
							}														
						} else {
							if (_participants.hasParticipant(_participantsSO.data[name].userid)) {
									LogUtil.debug('Changed user[' + _participantsSO.data[name].userid + "]");	
								var cUser:User = _participants.getParticipant(Number(name));
								cUser.presenter = _participantsSO.data[name].presenter;
								cUser.hasStream = _participantsSO.data[name].hasStream;
								cUser.streamName = _participantsSO.data[name].streamName;	
								sendMessage(ViewersModuleConstants.CHANGE_STATUS);												
							} else {
								// The server sent us a new user.
								var user:User = new User();
								user.userid = _participantsSO.data[name].userid;
								user.name = _participantsSO.data[name].name;							
								user.role = _participantsSO.data[name].role;						
								user.presenter = _participantsSO.data[name].presenter;
								user.hasStream = _participantsSO.data[name].hasStream;
								user.streamName = _participantsSO.data[name].streamName;	
								_participants.addUser(user);
								sendMessage(ViewersModuleConstants.CHANGE_STATUS);
							}	
						}					
					} 
																	
					break;

				case "delete":
					/** From flash.events.SyncEvent doc
					 * 	A value of "delete" means the attribute was deleted.  		
					 */
					
					LogUtil.debug( "Conference::delete =[" + code + "," + name + "," + oldValue + "]");	
					
					// The participant has left. Cast name (string) into a Number.
					_participants.removeParticipant(Number(name));
					break;
										
				default:	
					LogUtil.debug( "Conference::default[" + _participantsSO.data[name].userid
								+ "," + _participantsSO.data[name].name + "]");		 
					break;
			}
		}

		private function notifyConnectionStatusListener(connected:Boolean, reason:String = null):void {
			if (_connectionStatusListener != null) {
				_connectionStatusListener(connected, reason);
			}
		}

		private function netStatusHandler ( event : NetStatusEvent ) : void
		{
			var statusCode : String = event.info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success" :
					LogUtil.debug(NAME + ":Connection Success");		
					notifyConnectionStatusListener(true);			
					break;
			
				case "NetConnection.Connect.Failed" :			
					LogUtil.debug(NAME + ":Connection to viewers application failed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Closed" :									
					LogUtil.debug(NAME + ":Connection to viewers application closed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.InvalidApp" :				
					LogUtil.debug(NAME + ":Viewers application not found on server");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.AppShutDown" :
					LogUtil.debug(NAME + ":Viewers application has been shutdown");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Rejected" :
					LogUtil.debug(NAME + ":No permissions to connect to the viewers application" );
					notifyConnectionStatusListener(false);
					break;
					
				default :
				   LogUtil.debug(NAME + ":default - " + event.info.code );
				   notifyConnectionStatusListener(false);
				   break;
			}
		}
			
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			LogUtil.debug( "participantsSO asyncErrorHandler " + event.error);
			notifyConnectionStatusListener(false);
		}
	}
}