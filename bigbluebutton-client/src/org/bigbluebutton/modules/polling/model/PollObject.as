package org.bigbluebutton.modules.polling.model
{
	import mx.collections.ArrayCollection;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.polling.model.PollStatLineObject;
	
	/*
	 *  This class has been setted his attributes to public, for serialize with the model of the bigbluebutton-apps, in order
	 *  to enable the communication. This class is used for send public and private.
	 **/
	[Bindable]
	[RemoteClass(alias="org.bigbluebutton.conference.service.poll.Poll")]
	public class PollObject
	{
		public static const LOGNAME:String = "[PollingObject] ";
		
		/* 
		 ########################################################################################
		 # KEY PLACES TO UPDATE, WHEN ADDING NEW FIELDS TO THE HASH:							#
		 # PollingService.as, buildServerPoll()													#
		 # PollingService.as, extractPoll()														#
		 # PollingInstructionsWindow.mxml, buildPoll()											#
		 # - Only necessary when the new field is involved with poll creation					#
		 # Don't forget to update the server side as well (key locations found in Poll.java)	#
		 ########################################################################################
		*/
		
		public var title:String;
		public var room:String;
		public var isMultiple:Boolean;
		public var question:String;
		public var answers:Array;
		public var votes:Array;
		public var time:String;
		public var totalVotes:int;
		public var status:Boolean;
		public var didNotVote:int;
		public var publishToWeb:Boolean;
		public var webKey:String = new String;
		
		// For developer use, this method outputs all fields of a poll into the debug log for examination.
		// Please remember to add lines for any new fields that may be added.
		public function checkObject():void{
			if (this != null){
				LogUtil.debug(LOGNAME + "Running CheckObject on the poll with title " + title);
				LogUtil.debug(LOGNAME + "Room is: " + room);
				LogUtil.debug(LOGNAME + "isMultiple is: " + isMultiple.toString());
				LogUtil.debug(LOGNAME + "Question is: " + question);
				LogUtil.debug(LOGNAME + "Answers are: " + answers);
				LogUtil.debug(LOGNAME + "Votes are: " + votes);
				LogUtil.debug(LOGNAME + "Time is: " + time);
				LogUtil.debug(LOGNAME + "TotalVotes is: " + totalVotes);
				LogUtil.debug(LOGNAME + "Status is: " + status.toString());
				LogUtil.debug(LOGNAME + "DidNotVote is: " + didNotVote);
				LogUtil.debug(LOGNAME + "PublishToWeb is: " + publishToWeb.toString());
				LogUtil.debug(LOGNAME + "WebKey is: " + webKey);
				LogUtil.debug(LOGNAME + "--------------");
			}else{
				LogUtil.error(LOGNAME + "This PollObject is NULL.");
			}
		}
		
		public function generateStats():ArrayCollection{
			var returnCollection:ArrayCollection = new ArrayCollection;
			for (var i:int = 0; i < answers.length; i++){
				var pso:PollStatLineObject = new PollStatLineObject;
				pso.answer = answers[i].toString();
				pso.votes = votes[i].toString();
				//pso.percentage =
				if (totalVotes == 0){
					pso.percentage = "";
				}
				else{
					pso.percentage = Math.round(100*(votes[i]/totalVotes)) + "%";
				}
				returnCollection.addItem(pso);
			}
			return returnCollection;
		}
		
		public function generateTestStats():ArrayCollection{
			var ds:String = "TEST STATS: ";
			var returnCollection:ArrayCollection = new ArrayCollection;
			for (var i:int = 0; i < 6; i++){
				var pso:PollStatLineObject = new PollStatLineObject;
				pso.answer = "Test answer " + i;
				pso.votes = "Test votes " + i;
				pso.percentage = "Test percent " + i;
				returnCollection.addItem(pso);
				LogUtil.debug(ds + pso.debug());
			}
			return returnCollection;
		}
		
		public function generateOneLine():ArrayCollection{
			var ds:String = "TEST LINE: ";
			var returnCollection:ArrayCollection = new ArrayCollection;
			
				var pso:PollStatLineObject = new PollStatLineObject;
				pso.answer = "ANSWER CELL";
				pso.votes = "VOTEs CELL";
				pso.percentage = "PERCENTAGE CELL";
				returnCollection.addItem(pso);
				LogUtil.debug(ds + pso.debug());
			
			return returnCollection;
		}
	}
}