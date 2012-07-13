package org.bigbluebutton.core.managers
{
    import flash.net.NetConnection;
    
    import org.bigbluebutton.main.model.ConferenceParameters;
    import org.bigbluebutton.main.model.users.IMessageListener;
    import org.bigbluebutton.main.model.users.NetConnectionDelegate;

	public class ConnectionManager
	{
        private var connDelegate:NetConnectionDelegate;
        
		public function ConnectionManager()
		{
            connDelegate = new NetConnectionDelegate();
		}
        
        public function setUri(uri:String):void {
            connDelegate.setUri(uri);
        }

        public function get connection():NetConnection {
            return connDelegate.connection;
        }
        
        public function connect(params:ConferenceParameters):void {
            connDelegate.connect(params);
        }
        
        public function disconnect(onUserAction:Boolean):void {
            connDelegate.disconnect(onUserAction);
        }
        
        public function addMessageListener(listener:IMessageListener):void {
            connDelegate.addMessageListener(listener);
        }
        
        public function removeMessageListener(listener:IMessageListener):void {
            connDelegate.removeMessageListener(listener);
        }
            
	}
}