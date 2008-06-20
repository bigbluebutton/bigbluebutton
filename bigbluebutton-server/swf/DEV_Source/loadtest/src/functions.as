/**
 * Load tester main script
 * 
 * @author Paul Gregoire (mondain@gmail.com)
 */
	
	import flash.events.*;
	import flash.media.*;
	import flash.net.*;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	import mx.core.*;
	import mx.events.*;
	
	//player
	private var ncPlayer:NetConnection;
	private var nsPlayer:NetStream;
	private var playerVideo:Video;	

	[Bindable]
	private var streamName:String;		

	[Bindable]
	private var hostString:String = 'localhost';

	[Bindable]
	public var clientId:String = '';
	
	[Bindable]	
	public var viewerList:ArrayCollection = new ArrayCollection();
	
	private var timer:Timer;
	
	public function init():void {
		Security.allowDomain("*");
		
		var pattern:RegExp = new RegExp("http://([^/]*)/");				
		if (pattern.test(Application.application.url) == true) {
			var results:Array = pattern.exec(Application.application.url);
			hostString = results[1];
			//need to strip the port to avoid confusion
			if (hostString.indexOf(":") > 0) {
				hostString = hostString.split(":")[0];
			}
		}
		log('Host: ' + hostString);	
	}

	public function onBWDone():void {
		// have to have this for an RTMP connection
		log('onBWDone');
	}

	public function onBWCheck(... rest):uint {
		log('onBWCheck');
		//have to return something, so returning anything :)
		return 0;
	}

	private function playerNetStatusHandler(event:NetStatusEvent):void {
		log('Net status (player): '+event.info.code);
        switch (event.info.code) {
            case "NetConnection.Connect.Success":
                connectPlayerStream();
                connector.label = "Disconnect";
				indicatorOn.visible=true;
				indicatorOff.visible=false;                
                break;
            case "NetStream.Play.StreamNotFound":
                log("Unable to locate video: " + givenPath.text + '/' + playerStream.text);
                break;
            case "NetConnection.Connect.Failed":
                break;
            case "NetConnection.Connect.Rejected":
            	break;
            case "NetConnection.Connect.Closed":	                
				connector.label = 'Connect';	
				indicatorOn.visible=false;
				indicatorOff.visible=true;
				break;                
        }				
	}	
	       
	//called by the server
	public function setClientId(param:Object):void {
		log('Set client id called: '+param);
		clientId = param as String;
		log('Setting client id: '+clientId);
	}
	
	//called by the server in the event of a server side error
	public function setAlert(alert:Object):void {
		log('Got an alert: '+alert);
		Alert.show(String(alert), 'Server Error');
	}	
	
	public function doPlayerView():void {       	
    	log('Trying to start player');	
		if (connector.label === 'Connect') {
			//  create the netConnection
			ncPlayer = new NetConnection();
			ncPlayer.objectEncoding = ObjectEncoding.AMF3;
			//  set it's client/focus to this
			ncPlayer.client = this;
	
			// add listeners for netstatus and security issues
			ncPlayer.addEventListener(NetStatusEvent.NET_STATUS, playerNetStatusHandler);
			ncPlayer.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			ncPlayer.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			ncPlayer.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
	
		    ncPlayer.connect(givenPath.text, null);   
		} else if (connector.label === 'Disconnect') {
			if (ncPlayer.connected) {
				ncPlayer.close();
			}
		}	    					
    }
    
    public function connectPlayerStream():void {       
    	log('Connect player netstream');			    	
        nsPlayer = new NetStream(ncPlayer);
        nsPlayer.client = this;
        nsPlayer.addEventListener(NetStatusEvent.NET_STATUS, playerNetStatusHandler);
        nsPlayer.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
        playerVideo = new Video();
        playerVideo.attachNetStream(nsPlayer);
        nsPlayer.play(playerStream.text);
        playerDisplay.addChild(playerVideo);
		playerVideo.width = 160;
		playerVideo.height = 120;
    }	
    
    public function stopView():void { 
    	if (timer) {      	
    		timer.stop();
    	}
    	log('Trying to stop view');
    	if (ncPlayer && ncPlayer.connected) {
			nsPlayer.close();
			ncPlayer.close();
    	}
		//go thru list
		var viewer:Viewer;
		for (var i:int = 0; i < viewerList.length; i += 1) {
			viewer = viewerList.getItemAt(i) as Viewer;
			viewer.stop();
		}
		viewerList.removeAll();
    }	    
    
    public function onMetaData(info:Object):void {
    	log('Got meta data');
   		var key:String;
    	for (key in info) {
        	log('Meta: '+ key + ': ' + info[key]);
    	}
	}
	
    public function onCuePoint(info:Object):void {
        log("Cuepoint: time=" + info.time + " name=" + info.name + " type=" + info.type);
    }	
    
    public function onPlayStatus(info:Object):void {
    	log('Got play status');
    }
    
    public function doLoadTest():void {
    	log('Load delay: '+requestDelay.text+'s');
    	var delay:int = Number(requestDelay.text);
    	if (delay === 0) {
    		log('Invalid delay entered, setting to .1');
    		delay = .1;
    	}
    	log('Load delay: '+delay+'s');
    	timer = new Timer(delay * 1000);
	    timer.addEventListener("timer", timerHandler);
		timer.start();	
    }
    
	public function timerHandler(event:TimerEvent):void {
		var max:int = Number(numRequest.text);
		if (viewerList.length < max) {
			//start a new view
			log('Creating a new viewer');
			var viewer:Viewer = new Viewer();
			viewer.sid = String(viewerList.length);
			viewer.path = givenPath.text;
			viewer.stream = playerStream.text;
			viewer.start();
			viewerList.addItem(viewer);
		} else {
			log('Max requests reached');
			timer.stop();
		}
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
		var tmp:String = String(messages.data);
		tmp += text + '\n';
		messages.data = tmp;
	}

	public function traceObject(obj:Object, indent:uint = 0):void {
	    var indentString:String = "";
	    var i:uint;
	    var prop:String;
	    var val:*;
	    for (i = 0; i < indent; i++) {
	        indentString += "\t";
	    }
	    for (prop in obj) {
	        val = obj[prop];
	        if (typeof(val) == "object") {
	            trace(indentString + " " + i + ": [Object]");
	            traceObject(val, indent + 1);
	        } else {
	            trace(indentString + " " + prop + ": " + val);
	        }
	    }
	}    
    	
	