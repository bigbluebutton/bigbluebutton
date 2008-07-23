package
{
	import flash.events.Event;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.common.red5.*;
	
	public class Red5Delegate
	{
		private var conn:Connection;
		private var nc:NetConnection;
		private var uri:String;
		
		private var view:simple_chat;
		private var sharedObject:SharedObject;
		
		public static const SEND_MESSAGE_EVENT:String = "Send Message";
		
		public function Red5Delegate(view:simple_chat, url:String)
		{
			this.view = view;
			conn = new Connection();
			this.uri = url;
			
			conn.addEventListener(Connection.SUCCESS, handleSuccessfulConnection);
			view.addEventListener(SEND_MESSAGE_EVENT, sendMessage);
			
			conn.setURI(this.uri);
			conn.connect();
		}
		
		private function handleSuccessfulConnection(e:ConnectionEvent):void{
			nc = conn.getConnection();
			sharedObject = SharedObject.getRemote("sharedObject", this.uri);
			sharedObject.client = this;
			sharedObject.connect(nc);
		}
		
		private function sendMessage(e:Event):void{
			sharedObject.send("sendMessageCallback", view.txtInput.text);
		}
		
		public function sendMessageCallback(message:String):void{
			view.txtOutput.text += "\n" + message;
			view.txtInput.text = "";
		}

	}
}