package org.bigbluebutton.modules.viewers.model.services
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.viewers.ViewersModuleConstants;
	import org.bigbluebutton.modules.viewers.model.business.IViewers;
	import org.bigbluebutton.modules.viewers.model.vo.User;

	public class ViewersSOService implements IViewersService
	{
		public static const NAME:String = "ViewersSOService";
		
		private var _participantsSO : SharedObject;
		private static const SO_NAME : String = "participantsSO";
		private static const PRESENTER:String = "PRESENTER";
		
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
				trace(NAME + ":Connected to the Viewers application " + user.userid + " " + user.role);
				_participants.me.role = user.role;
				_participants.me.userid = user.userid;
				_participants.me.room = user.room;
				_participants.me.authToken = user.authToken;
				join();
			} else {
				leave();
				trace(NAME + ":Disconnected from the Viewers application");
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
			trace(NAME + ":ViewersModules is connected to Shared object");
			notifyConnectionStatusListener(true);			
		}
		
	    private function leave():void
	    {
	    	if (_participantsSO != null) _participantsSO.close();
	    }

		public function addConnectionStatusListener(connectionListener:Function):void {
			_connectionStatusListener = connectionListener;
		}
		
		/**
		 * Updates the user status in the conference object, and sends the update to the server shared object 
		 * @param newStatus
		 * 
		 */		
		public function sendNewStatus(userid:Number, newStatus:String):void {
//			_participants.me.status = newStatus;
//			var id : Number = _participants.me.userid;			
	
			var aUser:User = _participants.getParticipant(userid);			
			if (aUser != null) {
				// This sets this user's status
				aUser.status = newStatus;
				_participantsSO.setProperty(userid.toString(), aUser);
				_participantsSO.setDirty(userid.toString());
			}
		}

		public function assignPresenter(userid:Number, assignedBy:Number):void {
			_participantsSO.setProperty(PRESENTER, {assignedTo:userid, assignedBy:assignedBy});
			_participantsSO.setDirty(PRESENTER);
			_participantsSO.send("assignPresenterCallback", userid, assignedBy);
		}
		
		public function assignPresenterCallback(userid:Number, assignedBy:Number):void {
			sendMessage(ViewersModuleConstants.ASSIGN_PRESENTER, {assignedTo:userid, assignedBy:assignedBy});
		}
		
		public function queryPresenter():void {
			var p:Object = _participantsSO.data[PRESENTER];
			trace('Got query presenter');
			if (p != null) {
				trace('responding to query presenter');
				sendMessage(ViewersModuleConstants.QUERY_PRESENTER_REPLY, {assignedTo:p.assignedTo, assignedBy:p.assignedBy});
			}			
		}

		/**
		 * Sends the broadcast stream to the server 
		 * @param hasStream
		 * @param streamName
		 * 
		 */		
		public function sendBroadcastStream(userid:Number, hasStream:Boolean, streamName:String):void {
//			var id : Number = _participants.me.userid;

			var aUser : User = _participants.getParticipant(userid);			
			
			if (aUser != null) {
				// This sets the users stream
				aUser.hasStream = hasStream;
				aUser.streamName = streamName;
				_participantsSO.setProperty(userid.toString(), aUser);
				_participantsSO.setDirty(userid.toString());
				
				trace( "Conference::sendBroadcastStream::found =[" + userid + "," 
						+ aUser.hasStream + "," + aUser.streamName + "]");				
			}
		}
	
		public function broadcastStream(userid:Number, hasStream:Boolean, streamName:String) : void
		{
			var aUser : User = _participants.getParticipant(userid);			
			if (aUser != null) {
				aUser.hasStream = hasStream;
				aUser.streamName = streamName;
			}		
		}



		/**
		 * Called when a sync_event is received for the SharedObject 
		 * @param event
		 * 
		 */		
		private function sharedObjectSyncHandler( event : SyncEvent) : void
		{
			trace( "Conference::sharedObjectSyncHandler " + event.changeList.length);
			
			for (var i : uint = 0; i < event.changeList.length; i++) 
			{
				trace( "Conference::handlingChanges[" + event.changeList[i].name + "][" + i + "]");
				handleChangesToSharedObject(event.changeList[i].code, 
						event.changeList[i].name, event.changeList[i].oldValue);
			}
		}

		/**
		 * See flash.events.SyncEvent
		 */
		private function handleChangesToSharedObject(code : String, name : String, oldValue : Object) : void
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
					 trace("Got clear sync event for participants");
					_participants.removeAllParticipants();
													
					break;	
																			
				case "success":
					/** From flash.events.SyncEvent doc
					 * 	 A value of "success" means the client changed the shared object. 		
					 */
					
					// do nothing... just log it 
					trace( "Conference::success =[" + name + "," 
							+ _participantsSO.data[name].status + ","
							+ _participantsSO.data[name].hasStream
							+ "]");	
					break;

				case "reject":
					/** From flash.events.SyncEvent doc
					 * 	A value of "reject" means the client tried unsuccessfully to change the 
					 *  object; instead, another client changed the object.		
					 */
					
					// do nothing... just log it 
					// Or...maybe we should check if the value is the same as what we wanted it
					// to be..if not...change it?
					trace( "Conference::reject =[" + code + "," + name + "," + oldValue + "]");	
					break;

				case "change":
					/** From flash.events.SyncEvent doc
					 * 	A value of "change" means another client changed the object or the server 
					 *  resynchronized the object.  		
					 */
					 
					if ((name != null) && (name != PRESENTER)) {						
						if (_participants.hasParticipant(_participantsSO.data[name].userid)) {
							var changedUser : User = _participants.getParticipant(Number(name));
							changedUser.status = _participantsSO.data[name].status;
							changedUser.hasStream = _participantsSO.data[name].hasStream;
							changedUser.streamName = _participantsSO.data[name].streamName;	

							trace( "Conference::change =[" + 
								name + "," + changedUser.name + "," + changedUser.hasStream + "]");
																					
						} else {
							// The server sent us a new user.
							var user : User = new User();
							user.userid = _participantsSO.data[name].userid;
							user.name = _participantsSO.data[name].name;
							user.status = _participantsSO.data[name].status;
							user.hasStream = _participantsSO.data[name].hasStream;
							user.streamName = _participantsSO.data[name].streamName;							
							user.role = _participantsSO.data[name].role;						
							
							trace( "Conference::change::newuser =[" + 
								name + "," + user.name + "," + user.hasStream + "]");
							
							_participants.addUser(user);
						}
						
					} else {
						var p:Object = _participantsSO.data[PRESENTER];
						if (p != null)
							assignPresenterCallback(p.assignedTo, p.assignedBy);
					}
																	
					break;

				case "delete":
					/** From flash.events.SyncEvent doc
					 * 	A value of "delete" means the attribute was deleted.  		
					 */
					
					trace( "Conference::delete =[" + code + "," + name + "," + oldValue + "]");	
					
					// The participant has left. Cast name (string) into a Number.
					_participants.removeParticipant(Number(name));
					break;
										
				default:	
					trace( "Conference::default[" + _participantsSO.data[name].userid
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
					trace(NAME + ":Connection Success");		
					notifyConnectionStatusListener(true);			
					break;
			
				case "NetConnection.Connect.Failed" :			
					trace(NAME + ":Connection to viewers application failed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Closed" :									
					trace(NAME + ":Connection to viewers application closed");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.InvalidApp" :				
					trace(NAME + ":Viewers application not found on server");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.AppShutDown" :
					trace(NAME + ":Viewers application has been shutdown");
					notifyConnectionStatusListener(false);
					break;
					
				case "NetConnection.Connect.Rejected" :
					trace(NAME + ":No permissions to connect to the viewers application" );
					notifyConnectionStatusListener(false);
					break;
					
				default :
				   trace(NAME + ":default - " + event.info.code );
				   notifyConnectionStatusListener(false);
				   break;
			}
		}
			
		private function asyncErrorHandler ( event : AsyncErrorEvent ) : void
		{
			trace( "participantsSO asyncErrorHandler " + event.error);
			notifyConnectionStatusListener(false);
		}
	}
}