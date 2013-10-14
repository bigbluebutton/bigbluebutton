/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/
package org.bigbluebutton.modules.polling.service
{
	import com.asfusion.mate.events.Dispatcher;  
	import flash.events.AsyncErrorEvent;
	import flash.events.IEventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;

	import flash.net.NetConnection;
	import flash.net.SharedObject;
	import flash.net.Responder;
	import mx.collections.ArrayCollection;
    
	import mx.controls.Alert;
	import org.bigbluebutton.core.managers.UserManager;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.polling.events.PollingViewWindowEvent;
	import org.bigbluebutton.modules.polling.events.PollingStatsWindowEvent;
	import org.bigbluebutton.modules.polling.events.PollRefreshEvent;
	import org.bigbluebutton.modules.polling.events.PollGetTitlesEvent;
	import org.bigbluebutton.modules.polling.events.PollReturnTitlesEvent;
	import org.bigbluebutton.modules.polling.events.PollGetPollEvent;
	import org.bigbluebutton.modules.polling.events.GenerateWebKeyEvent;
	
	import org.bigbluebutton.modules.polling.views.PollingViewWindow;
	import org.bigbluebutton.modules.polling.views.PollingInstructionsWindow;
	
	import org.bigbluebutton.modules.polling.managers.PollingWindowManager;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.common.IBbbModuleWindow;
	
	import org.bigbluebutton.modules.polling.model.PollObject;

	public class PollingService
	{	
		public static const LOGNAME:String = "[PollingService] ";

		private var pollingSO:SharedObject;
		private var nc:NetConnection;
		private var uri:String;
		private var module:PollingModule;
		private var dispatcher:Dispatcher;
		private var attributes:Object;
		private var windowManager: PollingWindowManager;
		public var pollGlobal:PollObject;
		
		public var test:String;
		
		private static const SHARED_OBJECT:String = "pollingSO";
		private var isPolling:Boolean = false;
		private var isConnected:Boolean = false;
		
		private var viewWindow:PollingViewWindow;
					
		public function PollingService()
		{
			LogUtil.debug(LOGNAME + " Building PollingService");
			dispatcher = new Dispatcher();	
		}
		
		public function handleStartModuleEvent(module:PollingModule):void {
			this.module = module;
			nc = module.connection
			uri = module.uri;
			connect();
		}
		
		 // CONNECTION
		/*###################################################*/
		public function connect():void {
			pollingSO = SharedObject.getRemote(SHARED_OBJECT, uri, false);
	 		pollingSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			pollingSO.addEventListener(NetStatusEvent.NET_STATUS, handleResult);
				pollingSO.client = this;
				pollingSO.connect(nc); 	
		}
		
		public function getConnection():NetConnection{
			return module.connection;
		}          
        
         // Dealing with PollingViewWindow
        /*#######################################################*/
        public function sharePollingWindow(poll:PollObject):void{
        	if (isConnected = true ) {
          		pollingSO.send("openPollingWindow", buildServerPoll(poll));
        	}
        }
                  
        public function openPollingWindow(serverPoll:Array):void{
			var username:String = module.username;
	        var poll:PollObject = extractPoll(serverPoll, serverPoll[1]+"-"+serverPoll[0]);
	        if (!UserManager.getInstance().getConference().amIModerator()){
				var e:PollingViewWindowEvent = new PollingViewWindowEvent(PollingViewWindowEvent.OPEN);
			    e.poll = poll;
		        dispatcher.dispatchEvent(e);
			}
			else{
	        	var stats:PollingStatsWindowEvent = new PollingStatsWindowEvent(PollingStatsWindowEvent.OPEN);
	         	stats.poll = poll;
	         	stats.poll.status = false;
	         	dispatcher.dispatchEvent(stats);
	        }
        }

		public function closeAllPollingWindows():void{
        	if (isConnected = true ) {
         		pollingSO.send("closePollingWindow"); 
         	}
        }
        
        public function closePollingWindow():void{
         	var e:PollingViewWindowEvent = new PollingViewWindowEvent(PollingViewWindowEvent.CLOSE);
         	dispatcher.dispatchEvent(e);
        }

        //Event Handlers
        /*######################################################*/
        
 		public function setPolling(polling:Boolean):void{
	   		isPolling = polling;
	    }
	   
	   
	   	public function setStatus(pollKey:String, status:Boolean):void{
	   		if (status){
	   			openPoll(pollKey);
	   		}else{
	   			closePoll(pollKey);
	   		}
	    }
	   
	   
	    public function getPollingStatus():Boolean{
	   		return isPolling;
		}
		
		public function disconnect():void{
			if (module.connection != null) module.connection.close();
		}
		
		public function onBWDone():void{
        	//called from asc
        	trace("onBandwithDone");
        } 
	   
	   	public function handleResult(e:NetStatusEvent):void {	   		
			var statusCode : String = e.info.code;
			switch (statusCode){
			case "NetConnection.Connect.Success":
				isConnected = true;
				break;
			case "NetConnection.Connect.Failed":					
				break;
			case "NetConnection.Connect.Rejected":
				break; 
			default:
				break;
			}
		}
		
		private function sharedObjectSyncHandler(e:SyncEvent) : void{}
		
		public function savePoll(poll:PollObject):void
		{
			var serverPoll:Array = buildServerPoll(poll);
			nc.call("poll.savePoll", new Responder(success, failure), serverPoll);		
			//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME + "Responder object failure in SAVEPOLL NC.CALL"); 
			}
			//--------------------------------------//
		}
				
	   	public function  getPoll(pollKey:String, option:String):void{	   	
			nc.call("poll.getPoll", new Responder(success, failure), pollKey);
			//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{
				var itemArray:Array = obj as Array;
				extractPoll(itemArray, pollKey, option);
			}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME+"Responder object failure in GETPOLL NC.CALL");
			}
			//--------------------------------------//
	   	}  
	  
		public function publish(poll:PollObject):void{
			var pollKey:String = poll.room + "-" + poll.title;
			var webKey:String = poll.webKey;
			var serverPoll:Array = buildServerPoll(poll);
			nc.call("poll.publish", new Responder(success, failure), serverPoll, pollKey);
			//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{
				var itemArray:Array = obj as Array;
				if (webKey != null){
					itemArray[11] = webKey;
				}
				extractPoll(itemArray, pollKey, "publish");
			}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME + "Responder object failure in PUBLISH NC.CALL"); 
			}
			//--------------------------------------//
		}
		 
		public function vote(pollKey:String, answerIDs:Array, webVote:Boolean = false):void{
			// answerIDs will indicate by integer which option(s) the user voted for
		 	// i.e., they voted for 3 and 5 on multiple choice, answerIDs will hold [0] = 3, [1] = 5
		 	// It works the same regardless of if AnswerIDs holds {3,5} or {5,3} 
			nc.call("poll.vote", new Responder(success, failure), pollKey, answerIDs, webVote);			
			//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME + "Responder object failure in VOTE NC.CALL"); 
			}
			//--------------------------------------//
		}
		
		public function refreshResults(poll:PollObject):void{
			var refreshEvent:PollRefreshEvent = new PollRefreshEvent(PollRefreshEvent.REFRESH);
			refreshEvent.poll = poll;
			dispatcher.dispatchEvent(refreshEvent);
		}
		
		public function cutOffWebPoll(poll:PollObject):void{
			var pollKey:String = poll.room+"-"+poll.title;
			nc.call("poll.cutOffWebPoll", new Responder(success, failure), pollKey);			
			//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME + "Responder object failure in CUT OFF WEB POLL NC.CALL"); 
			}
			//--------------------------------------//
		}
	  	
	  	//#################################################//
	    
	    // POLLOBJECT-TO-ARRAY AND ARRAY-TO-POLLOBJECT TRANSFORMATION
	    // Reminder: When adding new fields to the Redis hash, include them here.
	    
	    private function buildServerPoll(poll:PollObject):Array{
			var builtPoll:Array = new Array(poll.title, 
											poll.room, 
											poll.isMultiple, 
											poll.question, 
											poll.answers, 
											poll.votes, 
											poll.time, 
											poll.totalVotes, 
											poll.status, 
											poll.didNotVote, 
											poll.publishToWeb, 
											poll.webKey);
			return builtPoll;
		}
	    
	    public function extractPoll(values:Array, pollKey:String, option:String = "extract"):PollObject {
			var poll:PollObject = new PollObject();
		
			poll.title 			= values[0] as String;
			poll.room 			= values[1] as String;
			poll.isMultiple 	= values[2] as Boolean;
			poll.question 		= values[3] as String;
			poll.answers 		= values[4] as Array;
			poll.votes 			= values[5] as Array;	    
			poll.time 			= values[6] as String;		    
			poll.totalVotes 	= values[7] as int;
			poll.status 		= values[8] as Boolean;
			poll.didNotVote 	= values[9] as int;
			poll.publishToWeb 	= values[10] as Boolean;
			poll.webKey			= values[11] as String;
		   
			switch (option) 
			{
		   		case "publish":
					sharePollingWindow(poll);
					break;
				case "refresh":	
					refreshResults(poll);				
					break;
				case "menu":
					var pollReturn:PollGetPollEvent = new PollGetPollEvent(PollGetPollEvent.RETURN);
					pollReturn.poll = poll;		
					pollReturn.pollKey = pollKey;
					dispatcher.dispatchEvent(pollReturn);
					break;
				case "initialize":
					var pollInitialize:PollGetPollEvent = new PollGetPollEvent(PollGetPollEvent.INIT);
			    	pollInitialize.poll = poll;
			    	pollInitialize.pollKey = pollKey;
		    		dispatcher.dispatchEvent(pollInitialize);
					break;
				case "extract":
					break;
				default:
				   	LogUtil.error(LOGNAME+"Error in extractPoll: unknown option ["+option+"]");
				   	break;
			}
			return poll;
		}
		// END OF POLLOBJECT-TO-ARRAY AND ARRAY-TO-POLLOBJECT TRANSFORMATION
		
		
		//#################################################//
		 
		// TOOLBAR/POLLING MENU
		 
		// Initialize the Polling Menu on the toolbar button
		public function initializePollingMenu(roomID:String):void{
			nc.call("poll.titleList", new Responder(titleSuccess, titleFailure));
			//--------------------------------------//
			// Responder functions
			function titleSuccess(obj:Object):void{
				LogUtil.debug("LISTINIT: Entering NC CALL SUCCESS section");
				var event:PollReturnTitlesEvent = new PollReturnTitlesEvent(PollReturnTitlesEvent.UPDATE);
				event.titleList = obj as Array;
				// Append roomID to each item in titleList, call getPoll on that key, add the result to pollList back in ToolBarButton
				for (var i:int = 0; i < event.titleList.length; i++){
					var pollKey:String = roomID +"-"+ event.titleList[i];
					getPoll(pollKey, "initialize");
				}
				// This dispatch populates the titleList back in the Menu; the pollList is populated one item at a time in the for-loop
				dispatcher.dispatchEvent(event);
			}
			function titleFailure(obj:Object):void{
				LogUtil.error(LOGNAME+"Responder object failure in INITALIZE POLLING MENU NC.CALL");
				LogUtil.error("Failure object tostring is: " + obj.toString()); 
			}
			//--------------------------------------//
		 }
		
		public function initializePollingMenuRemotely(roomID:String):void{
			nc.call("poll.titleList", new Responder(titleSuccess, titleFailure));
			//--------------------------------------//
			// Responder functions
			function titleSuccess(obj:Object):void{
				LogUtil.debug("REMOTE_POLL_MENU_INIT: Entering NC CALL SUCCESS section");
				var event:PollReturnTitlesEvent = new PollReturnTitlesEvent(PollReturnTitlesEvent.REMOTE_RETURN);
				event.titleList = obj as Array;
				// Append roomID to each item in titleList, call getPoll on that key, add the result to pollList back in ToolBarButton
				for (var i:int = 0; i < event.titleList.length; i++){
					var pollKey:String = roomID +"-"+ event.titleList[i];
					getPoll(pollKey, "initialize");
				}
				// This dispatch populates the titleList back in the Menu; the pollList is populated one item at a time in the for-loop
				LogUtil.debug("PollingService.initializePollingMenuRemotely, dispatching PollReturnTitlesEvent.REMOTE_RETURN");
				dispatcher.dispatchEvent(event);
			}
			function titleFailure(obj:Object):void{
				LogUtil.error(LOGNAME+"Responder object failure in INITALIZE POLLING MENU NC.CALL");
				LogUtil.error("Failure object tostring is: " + obj.toString());
			}
			//--------------------------------------//
		}
		 
		 public function updateTitles():void{
		 	nc.call("poll.titleList", new Responder(success, failure));
		 	//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{
				var event:PollReturnTitlesEvent = new PollReturnTitlesEvent(PollReturnTitlesEvent.UPDATE);
				event.titleList = obj as Array;
				dispatcher.dispatchEvent(event);
			}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME+"Responder object failure in UPDATE_TITLES NC.CALL");
			}
			//--------------------------------------//
		 }
		 
		 
		 public function checkTitles():void{
		 	nc.call("poll.titleList", new Responder(success, failure));
		 	//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{
				var event:PollGetTitlesEvent = new PollGetTitlesEvent(PollGetTitlesEvent.RETURN);
				event.titleList = obj as Array;
				dispatcher.dispatchEvent(event);
			}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME+"Responder object failure in CHECK_TITLES NC.CALL");
			}
			//--------------------------------------//
		 }
		 
		 // END OF TOOLBAR/POLLING MENU
		 
		 //#################################################//
		 
		 // OTHER POLL METHODS
		 
		 public function openPoll(pollKey:String):void{
		 	nc.call("poll.setStatus", new Responder(success, failure), pollKey, true);
		 	//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME+"Responder object failure in OPENPOLL NC.CALL");
			}
			//--------------------------------------//
		 }
		 
		 public function closePoll(pollKey:String):void{
		 	nc.call("poll.setStatus", new Responder(success, failure), pollKey, false);
		  	//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME+"Responder object failure in CLOSEPOLL NC.CALL");
			}
			//--------------------------------------//
		 }
		 
		 public function generate(generateEvent:GenerateWebKeyEvent):void{
		 	nc.call("poll.generate", new Responder(success, failure), generateEvent.pollKey);
		 	//--------------------------------------//
			// Responder functions
			function success(obj:Object):void{
				var webInfo:Array = obj as Array;
				
				var webKey:String = webInfo[0];
				var webHostIP:String = webInfo[1];
				var webHostPort:String = webInfo[2];
				
				var webKeyReturnEvent:GenerateWebKeyEvent = new GenerateWebKeyEvent(GenerateWebKeyEvent.RETURN);
				webKeyReturnEvent.poll = generateEvent.poll
				webKeyReturnEvent.poll.webKey = webKey;
				webKeyReturnEvent.webHostIP = webHostIP;
				webKeyReturnEvent.webHostPort = webHostPort;
				
				dispatcher.dispatchEvent(webKeyReturnEvent);
			}
			function failure(obj:Object):void{
				LogUtil.error(LOGNAME+"Responder object failure in GENERATE NC.CALL");
			}
			//--------------------------------------//
		}
	}
}