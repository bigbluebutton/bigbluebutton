package org.bigbluebutton.modules.desktopshare.model.business
{
	import flash.events.AsyncErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import org.bigbluebutton.modules.desktopshare.model.vo.*;
	import org.bigbluebutton.modules.viewers.ViewersFacade;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	import org.bigbluebutton.modules.viewers.model.business.Conference;
	import org.bigbluebutton.modules.desktopshare.DesktopShareFacade;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	
	public class DesktopShareProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "DesktopShare Proxy";
		private var netConnectionDelegate: NetConnectionDelegate;
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		private var appSO : SharedObject;
		private var room:String;
		public function DesktopShareProxy(imageVO:ImageVO, nc:NetConnection)
		{
			super(NAME, imageVO);
			netConnectionDelegate = new NetConnectionDelegate(this);
			netConnectionDelegate.setNetConnection(nc);
			log.debug("DesktopShareProxy::Constructor()");
		}
		
		public function get imageVO():ImageVO
		{
			return this.data as ImageVO;
		}
		
		public function connectionSuccess() : void
		{
			var conf:Conference = ViewersFacade.getInstance().retrieveMediator(Conference.NAME) as Conference;
			room = conf.room;
			joinConference();
		}
		
		public function connectionFailed(message : String) : void 
		{
			if (appSO != null) appSO.close();
		}	
	    
	    public function join(userid: String, host : String, room : String):void
	    {
	    	this.imageVO.userid = userid;
	    	this.imageVO.host = host;
	    	this.imageVO.room = room;
			netConnectionDelegate.connect(host, room);
		}
	    
	    private function joinConference() : void
		{
			appSO = SharedObject.getRemote("appSO", netConnectionDelegate.connUri, false);
			appSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			appSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			appSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			appSO.client = this;
			
			appSO.connect(netConnectionDelegate.getConnection());
			log.debug("appSO: " + appSO.toString());
						
		}
		public function sendImageToSharedObject(im:ImageVO):void
		{
			//log.debug("imageString: "+im.imageString);
			appSO.send("receiveNewImage", im.isSharing);
			
		}
		
		public function receiveNewImage(isSharing:Boolean):void
		{
			//this.imageVO.imageString = imageString;
			sendNotification(DesktopShareFacade.IS_SHARING, isSharing);
			trace("proxy:receiveNewImage");
		}
		
		public function leave():void{}
		
		public function sharedObjectSyncHandler(event:SyncEvent):void
		{
			
			for (var i : uint = 0; i < event.changeList.length; i++) 
			{
				//log.debug("Desktop Share::handlingChanges[" + event.changeList[i].code + "][" + i + "]\n");
				
						if(event.changeList[i].code == "change")
						{
							//log.debug("Desktop Share: name: " + event.changeList[i].name);
							//if(event.cha
							switch(event.changeList[i].name)
							{
								case "endOfUpdate":
								//if (appSO.data.endOfUpdate == "true")
								this.imageVO.tilewidth = appSO.data.tilewidth;
								//trace("appSO.data.tilewidth: " + appSO.data.tilewidth + "imageVO.tilewidth: " +imageVO.tilewidth);
								this.imageVO.tileheight = appSO.data.tileheight;
								
								//case "imageString00":
								this.imageVO.stringArray[0][0]=appSO.data.imageString00;
								//trace("imageVO.stringArray[0][0]: " + imageVO.stringArray[0][0]);
								//this.imageVO.row = 0;
								//this.imageVO.column = 0;
						        //sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString01":
								this.imageVO.stringArray[0][1]=appSO.data.imageString01;
								//this.imageVO.row = 0;
								//this.imageVO.column = 1;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString02":
								this.imageVO.stringArray[0][2]=appSO.data.imageString02;
								//this.imageVO.row = 0;
								//this.imageVO.column = 2;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString03":
								this.imageVO.stringArray[0][3]=appSO.data.imageString03;
								//this.imageVO.row = 0;
								//this.imageVO.column = 3;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString04":
								this.imageVO.stringArray[0][4]=appSO.data.imageString04;
								//this.imageVO.row = 0;
								//this.imageVO.column = 4;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString05":
								this.imageVO.stringArray[0][5]=appSO.data.imageString05;
								//this.imageVO.row = 0;
								//this.imageVO.column = 5;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString10":
								this.imageVO.stringArray[1][0]=appSO.data.imageString10;
								//this.imageVO.row = 1;
								//this.imageVO.column = 0;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString11":
								this.imageVO.stringArray[1][1]=appSO.data.imageString11;
								//this.imageVO.row = 1;
								//this.imageVO.column = 1;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString12":
								this.imageVO.stringArray[1][2]=appSO.data.imageString12;
								//this.imageVO.row = 1;
								//this.imageVO.column = 2;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString13":
								this.imageVO.stringArray[1][3]=appSO.data.imageString13;
								//this.imageVO.row = 1;
								//this.imageVO.column = 3;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString14":
								this.imageVO.stringArray[1][4]=appSO.data.imageString14;
								//this.imageVO.row = 1;
								//this.imageVO.column = 4;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString15":
								this.imageVO.stringArray[1][5]=appSO.data.imageString15;
								//this.imageVO.row = 1;
								//this.imageVO.column = 5;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString20":
								this.imageVO.stringArray[2][0]=appSO.data.imageString20;
								//this.imageVO.row = 2;
								//this.imageVO.column = 0;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString21":
								this.imageVO.stringArray[2][1]=appSO.data.imageString21;
								//this.imageVO.row = 2;
								//this.imageVO.column = 1;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString22":
								this.imageVO.stringArray[2][2]=appSO.data.imageString22;
								//this.imageVO.row = 2;
								//this.imageVO.column = 2;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString23":
								this.imageVO.stringArray[2][3]=appSO.data.imageString23;
								//this.imageVO.row = 2;
								//this.imageVO.column = 3;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString24":
								this.imageVO.stringArray[2][4]=appSO.data.imageString24;
								//this.imageVO.row = 2;
								//this.imageVO.column = 4;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString25":
								this.imageVO.stringArray[2][5]=appSO.data.imageString25;
								//this.imageVO.row = 2;
								//this.imageVO.column = 5;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString30":
								this.imageVO.stringArray[3][0]=appSO.data.imageString30;
								//this.imageVO.row = 3;
								//this.imageVO.column = 0;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString31":
								this.imageVO.stringArray[3][1]=appSO.data.imageString31;
								//this.imageVO.row = 3;
								//this.imageVO.column = 1;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString32":
								this.imageVO.stringArray[3][2]=appSO.data.imageString32;
								//this.imageVO.row = 3;
								//this.imageVO.column = 2;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString33":
								this.imageVO.stringArray[3][3]=appSO.data.imageString33;
								//this.imageVO.row = 3;
								//this.imageVO.column = 3;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString34":
								this.imageVO.stringArray[3][4]=appSO.data.imageString34;
								//this.imageVO.row = 3;
								//this.imageVO.column = 4;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString35":
								this.imageVO.stringArray[3][5]=appSO.data.imageString35;
								//this.imageVO.row = 3;
								//this.imageVO.column = 5;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString40":
								this.imageVO.stringArray[4][0]=appSO.data.imageString40;
								//this.imageVO.row = 4;
								//this.imageVO.column = 0;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString41":
								this.imageVO.stringArray[4][1]=appSO.data.imageString41;
								//this.imageVO.row = 4;
								//this.imageVO.column = 1;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString42":
								this.imageVO.stringArray[4][2]=appSO.data.imageString42;
								//this.imageVO.row = 4;
								//this.imageVO.column = 2;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString43":
								this.imageVO.stringArray[4][3]=appSO.data.imageString43;
								//this.imageVO.row = 4;
								//this.imageVO.column = 3;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString44":
								this.imageVO.stringArray[4][4]=appSO.data.imageString44;
								//this.imageVO.row = 4;
								//this.imageVO.column = 4;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString45":
								this.imageVO.stringArray[4][5]=appSO.data.imageString45;
								//this.imageVO.row = 4;
								//this.imageVO.column = 5;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString50":
								this.imageVO.stringArray[5][0]=appSO.data.imageString50;
								//this.imageVO.row = 5;
								//this.imageVO.column = 0;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString51":
								this.imageVO.stringArray[5][1]=appSO.data.imageString51;
								//this.imageVO.row = 5;
								//this.imageVO.column = 1;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString52":
								this.imageVO.stringArray[5][2]=appSO.data.imageString52;
								//this.imageVO.row = 5;
								//this.imageVO.column = 2;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString53":
								this.imageVO.stringArray[5][3]=appSO.data.imageString53;
								//this.imageVO.row = 5;
								//this.imageVO.column = 3;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString54":
								this.imageVO.stringArray[5][4]=appSO.data.imageString54;
								//this.imageVO.row = 5;
								//this.imageVO.column = 4;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "imageString55":
								this.imageVO.stringArray[5][5]=appSO.data.imageString55;
								//this.imageVO.row = 5;
								//this.imageVO.column = 5;
								//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								//break;
								//case "tilewidth":
								
								//break;
								//case "endOfUpdate":
								//if (appSO.data.endOfUpdate == "true")
								//this.imageVO.tilewidth = appSO.data.tilewidth;
								//this.imageVO.tileheight = appSO.data.tileheight;
								sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
								trace("proxy:syncHandler");
								break;
							}
						
						//	this.imageVO.column = appSO.data.column;
						//	this.imageVO.row = appSO.data.row;
						//	this.imageVO.imageString = appSO.data.message;
							//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO);
							//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO.column);
							//sendNotification(DesktopShareFacade.NEW_IMAGE, this.imageVO.row);
						}
						
						//removeImages();
						//reflectImage(event);
						
						
						
			}
		}
		private function netStatusHandler(e:NetStatusEvent):void
		{
			trace( "netStatusHandler:code: " + e.info.code );
		}
		private function asyncErrorHandler(e:AsyncErrorEvent):void
		{
			trace( "asyncErrorHandler:code: " + e.error.name );
		}
	}
}