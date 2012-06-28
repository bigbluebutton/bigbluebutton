package org.bigbluebutton.core.services
{
    import flash.events.AsyncErrorEvent;
    import flash.events.IEventDispatcher;
    import flash.events.IOErrorEvent;
    import flash.events.NetStatusEvent;
    import flash.events.SecurityErrorEvent;
    import flash.events.TimerEvent;
    import flash.net.NetConnection;
    import flash.net.Responder;
    import flash.utils.Timer;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.core.controllers.events.ConnectedToRed5Event;
    import org.bigbluebutton.core.controllers.events.ConnectionEvent;
    import org.bigbluebutton.core.controllers.events.ConnectionFailedEvent;
    import org.bigbluebutton.core.controllers.events.UsersConnectionEvent;
    import org.bigbluebutton.core.model.ConfigModel;
    import org.bigbluebutton.core.model.MeetingModel;
    import org.bigbluebutton.core.model.UsersModel;
    import org.bigbluebutton.core.vo.ConnectParameters;

    public class Red5BBBAppConnectionService
    {
        private var _dispatcher:IEventDispatcher;
        public var meetingModel:MeetingModel;   
        public var configModel:ConfigModel; 
        public var usersModel:UsersModel;
        
        private var _netConnection:NetConnection = new NetConnection();	        
        private var _connectParams:ConnectParameters;
        private var _connUri:String;
        private var rtmpTimedOut:Boolean = false;
        
        public function Red5BBBAppConnectionService(dispatcher:IEventDispatcher) {
            _dispatcher = dispatcher;
        }
        
        public function get connectionUri():String {
            return _connUri;
        }
        
        public function get connection():NetConnection {
            return _netConnection;
        }
        

        public function connect():void
        {	
            _connectParams = getConnectParams();
            connectToRed5();	
        }
        
        private function getConnectParams():ConnectParameters {
            var params:ConnectParameters = new ConnectParameters();
            params.conference = usersModel.loggedInUser.conference;
            params.server = configModel.applicationServer;
            params.app = configModel.applicationApp;
            params.forceTunnel = configModel.applicationForceTunnel;
            params.externUserID = usersModel.loggedInUser.externUserID;
            params.internalUserID = usersModel.loggedInUser.internalUserID;
            params.room = usersModel.loggedInUser.room;
            params.username = usersModel.loggedInUser.username;
            params.role = usersModel.loggedInUser.role;
            params.record = usersModel.loggedInUser.record;
            params.voicebridge = usersModel.loggedInUser.voicebridge;
            
            return params;
        }
        
        private var rtmpTimer:Timer = null;
        private const ConnectionTimeout:int = 5000;
        
        private function connectToRed5(rtmpt:Boolean=false):void
        {
            var uri:String = _connectParams.server + "/" + _connectParams.app + "/" + _connectParams.room;
                       
            _netConnection.client = this;
            _netConnection.addEventListener(NetStatusEvent.NET_STATUS, connectionHandler);
            _netConnection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, netASyncError);
            _netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, netSecurityError);
            _netConnection.addEventListener(IOErrorEvent.IO_ERROR, netIOError);
            
            if (_connectParams.forceTunnel) rtmpt = true;
            
            _connUri = (rtmpt ? "rtmpt:" : "rtmp:") + "//" + uri

            try {	
                LogUtil.debug("Connecting to " + _connUri + " params[user=" + _connectParams.username + ",role=" + _connectParams.role + ",meetingid=" + 
                                    _connectParams.conference + ",record=" + _connectParams.record + "]");	
                _netConnection.connect(_connUri, _connectParams.username, _connectParams.role, _connectParams.conference, _connectParams.room, 
                                    _connectParams.voicebridge, _connectParams.record, _connectParams.externUserID, _connectParams.internalUserID);		
                
                if (!rtmpt) {
                    rtmpTimer = new Timer(ConnectionTimeout, 1);
                    rtmpTimer.addEventListener(TimerEvent.TIMER_COMPLETE, rtmpTimeoutHandler);
                    rtmpTimer.start();
                }
            } catch(e:ArgumentError) {
                // Invalid parameters.
                switch (e.errorID) {
                    case 2004 :						
                        LogUtil.debug("Error! Invalid server location: " + _connUri);											   
                        break;						
                    default :
                        LogUtil.debug("UNKNOWN Error! Invalid server location: " + _connUri);
                        break;
                }
            }
        }
        
        private function rtmpTimeoutHandler(e:TimerEvent):void
        {
            rtmpTimedOut = true;
            LogUtil.debug("RTMP connection attempt timedout. Trying RTMPT.");
            _netConnection.close();
            _netConnection = new NetConnection();;
            
            connectToRed5(true);
        }
        
        private function connectionHandler(e:NetStatusEvent):void
        {
            if (rtmpTimer) {
                rtmpTimer.stop();
                rtmpTimer = null;
            }
            
            handleResult(e);
        }
        
        public function disconnect(logoutOnUserCommand:Boolean):void
        {
            _netConnection.close();
        }
                
        private function getMyUserID():void {
            LogUtil.debug("Getting user id");
            _netConnection.call(
                "getMyUserId",// Remote function name
                new Responder(
                    // result - On successful result
                    function(result:Object):void { 
                        var useridString:String = result as String;
                        meetingModel.myUserID = useridString;
                        LogUtil.debug("Got my userid [" + meetingModel.myUserID + "]");
                        var e:UsersConnectionEvent = new UsersConnectionEvent(UsersConnectionEvent.CONNECTION_SUCCESS);
                        e.userid = useridString;
                        _dispatcher.dispatchEvent(e);
                    },	
                    // status - On error occurred
                    function(status:Object):void { 
                        LogUtil.error("getMyUserID Error occurred:"); 
                    }
                )//new Responder
            ); //_netConnection.call            
        }
        
        public function handleResult(event:NetStatusEvent):void {
            var info:Object = event.info;
            var statusCode:String = info.code;
            
            switch (statusCode) 
            {
                case "NetConnection.Connect.Success":
                    LogUtil.debug("NetConnection.Connect.Success");
                    getMyUserID();
                    break;
                
                case "NetConnection.Connect.Failed":
                    LogUtil.debug("NetConnection.Connect.Failed");
                    _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.CONNECTION_FAILED));								
                    break;
                
                case "NetConnection.Connect.Closed":	
                    LogUtil.debug("NetConnection.Connect.Closed");
                    if (!rtmpTimedOut) {
                        _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.CONNECTION_CLOSED));	
                    }                    							
                    break;
                
                case "NetConnection.Connect.InvalidApp":	
                    LogUtil.debug("NetConnection.Connect.InvalidApp");
                    _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.INVALID_APP));				
                    break;
                
                case "NetConnection.Connect.AppShutDown":
                    LogUtil.debug("NetConnection.Connect.AppShutDown");
                    _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.APP_SHUTDOWN));	
                    break;
                
                case "NetConnection.Connect.Rejected":
                    LogUtil.debug("NetConnection.Connect.Rejected");
                    _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.CONNECTION_REJECTED));		
                    break;
                
                case "NetConnection.Connect.NetworkChange":
                    LogUtil.debug("NetConnection.Connect.NetworkChange");
                    _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.CONNECTION_NETWORK_CHANGE_EVENT));
                    break;
                
                default:       
                    LogUtil.debug(ConnectionEvent.UNKNOWN_REASON);
                    _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.UNKNOWN_REASON));
                    break;
            }
        }
        
        protected function netSecurityError(event:SecurityErrorEvent):void 
        {
            _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.UNKNOWN_REASON));
        }
        
        protected function netIOError(event:IOErrorEvent):void 
        {
            LogUtil.debug("Input/output error - " + event.text);
            _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.UNKNOWN_REASON));
        }
        
        protected function netASyncError(event:AsyncErrorEvent):void 
        {
            LogUtil.debug("Asynchronous code error - " + event.error);
            _dispatcher.dispatchEvent(new ConnectionEvent(ConnectionEvent.UNKNOWN_REASON));
        }	
        
        /**
         *  Callback from server
         */
        public function setUserId(id:Number, role:String):String
        {
            LogUtil.debug( "ViewersNetDelegate::setConnectionId: id=[" + id + "," + role + "]");
            if (isNaN(id)) return "FAILED";
            
            // We should be receiving authToken and room from the server here.
            //_userid = id;								
            return "OK";
        }
               
        public function onBWCheck(... rest):Number { 
            return 0; 
        } 
        
        public function onBWDone(... rest):void { 
            var p_bw:Number; 
            if (rest.length > 0) p_bw = rest[0]; 
            // your application should do something here 
            // when the bandwidth check is complete 
            trace("bandwidth = " + p_bw + " Kbps."); 
        }
    }
}