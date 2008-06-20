/**
 * Load tester Viewer object
 * 
 * @author Paul Gregoire (mondain@gmail.com)
 */
package {
	
	import flash.events.*;
	import flash.media.*;
	import flash.net.*;	
	import mx.core.*;
	import mx.events.*;	
	
	public class Viewer {
		
	    public var sid:String;
		private var nc:NetConnection;
		private var ns:NetStream;	
		public var parent:Object;
		public var path:String;
		public var stream:String;

		public function toString():String {
			return '[Viewer id='+sid+']';			
		}
	
		public function stop():void {
			if (nc.connected) {
				ns.close();
				nc.close();			
			}
		}
				
		public function start():void {       	
	    	log('Trying to start viewer');	
			//  create the netConnection
			nc = new NetConnection();
			nc.objectEncoding = ObjectEncoding.AMF3;
			//  set it's client/focus to this
			nc.client = this;
			// add listeners for netstatus and security issues
			nc.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			nc.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);		
		    nc.connect(path, null);   
	    }
	    
	    public function connectStream():void {       
	    	log('Connect viewer netstream');			    	
	        ns = new NetStream(nc);
	        ns.client = this;
	        ns.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
	        ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
	        //mute children so we dont hear a strange super-echo
			ns.soundTransform = new SoundTransform(0);
	        //playerVideo = new Video();
	        //playerVideo.attachNetStream(nsPlayer);
	        ns.play(stream);
	        //playerDisplay.addChild(playerVideo);
			//playerVideo.width = 160;
			//playerVideo.height = 120;
	    }			
			
		public function onBWDone():void {
			// have to have this for an RTMP connection
			//log('onBWDone');
		}
	
		public function onBWCheck(... rest):uint {
			//log('onBWCheck');
			//have to return something, so returning anything :)
			return 0;
		}
	
	    public function onMetaData(info:Object):void {
	    	//log('Got meta data');
		}
		
	    public function onCuePoint(info:Object):void {
	        //log("cuepoint: time=" + info.time + " name=" + info.name + " type=" + info.type);
	    }	
	    
	    public function onPlayStatus(info:Object):void {
	    	//log('Got play status');
	    }
	
		private function netStatusHandler(event:NetStatusEvent):void {
			//log('Net status: '+event.info.code);
	        switch (event.info.code) {
	            case "NetConnection.Connect.Success":
	                connectStream();              
	                break;
	            case "NetStream.Play.StreamNotFound":
	                log("Unable to locate video: " + path + '/' + stream);
	                break;
	            case "NetStream.Play.Stop":
	            	log("Stop");
	                break;
	            case "NetStream.Buffer.Empty":
	                break;
	            case "NetStream.Buffer.Full":
	                break;                
	            case "NetConnection.Connect.Failed":
	            case "NetConnection.Connect.Rejected":
	            case "NetConnection.Connect.Closed":	                
	            	log("Failed / Rejected / Closed");
					break;                
	        }				
		}	
		       
		//called by the server
		public function setClientId(param:Object):void {
			log('Set client id called: '+param);
			//id = param as String;
		}		
			
		private function securityErrorHandler(e:SecurityErrorEvent):void {
			log('Security Error: '+e);
		}
	
		private function ioErrorHandler(e:IOErrorEvent):void {
			log('IO Error: '+e);
		}
		
		private function asyncErrorHandler(e:AsyncErrorEvent):void {
			log('Async Error: '+e);
		}		
		
		public function log(text:String):void {
			trace(sid + ' ' + text);
		}		
		
	}
}