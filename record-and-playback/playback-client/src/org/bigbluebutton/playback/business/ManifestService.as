package org.bigbluebutton.playback.business
{
	import com.asfusion.mate.core.GlobalDispatcher;
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.collections.ArrayCollection;
	import mx.core.Application;
	
	import org.bigbluebutton.chat.events.ChatMessageEvent;
	import org.bigbluebutton.participants.events.ParticipantsEvent;
	import org.bigbluebutton.playback.events.ConfigEvent;
	import org.bigbluebutton.playback.events.PlaybackEvent;
	import org.bigbluebutton.playback.events.TimelineEvent;
	import org.bigbluebutton.presentation.events.PresentationEvent;
	
	public class ManifestService
	{
		public static const CONFIG_FILE:String = "assets/config.xml";
		
		private var dispatcher:Dispatcher;
		private var recording_dir:String;
		
		public function ManifestService(){
			dispatcher = new Dispatcher();
		}
		
		public function loadConfigFile():void{
			var _urlLoader:URLLoader = new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, handleConfigComplete);
			_urlLoader.load(new URLRequest(CONFIG_FILE));
		}
		
		private function handleConfigComplete(e:Event):void{
			var config:ConfigEvent=new ConfigEvent(ConfigEvent.CONFIG_EVENT);
			var xml:XML = new XML(e.target.data);
			
			config.directory=xml.recording.dir;
			config.file=xml.recording.file;
			
			dispatcher.dispatchEvent(config);
		}
		//TODO: should be only one folder with the meeting token (conference)
		public function loadManifestFile(evt:ConfigEvent):void{
			var conference:String=getConferenceParamater();
			if(conference!=null){
				recording_dir=evt.directory+"/"+conference+"/"+conference;
				var _urlLoader:URLLoader = new URLLoader();
				_urlLoader.addEventListener(Event.COMPLETE, handleManifestComplete);
				_urlLoader.load(new URLRequest(recording_dir+"/"+evt.file)); //comment this line if it's testing purpose and uncomment the line below
				//_urlLoader.load(new URLRequest(urlstr));
			}
		}
		
		private function handleManifestComplete(e:Event):void{
			parseManifest(e.target.data);
		}
		
		private function getConferenceParamater():String
		{
			var fullUrl:String = ExternalInterface.call('eval','document.location.href'); 
			var paramStr:String = fullUrl.split('?')[1];
			if (paramStr != null)
			{
				var params:Array = paramStr.split('&');
				for (var i:int = 0; i < params.length; i++)
				{
					var kv:Array = params[i].split('=');
					if(kv[0]=="conference")
						return kv[1];
				}
			} 
			return null;
		}
		
		private function handleComplete(e:Event):void{
			parseManifest(e.target.data);
		}
		
		public function parseManifest(filestr:String):void
		{
			var evt:TimelineEvent=new TimelineEvent(TimelineEvent.TIMELINE_EVENT);
			var timeline:ArrayCollection=new ArrayCollection();
			
			var xml:XML = new XML(filestr);
			
			for each(var item:XML in xml.seq.children()){
				timeline.addItem(item);
				trace("item");
			} 
			
			evt.timeline=timeline;
			dispatcher.dispatchEvent(evt);
		}
		public function dispatchPlaybackEvent(evt:org.bigbluebutton.playback.events.PlaybackEvent):void{
			
			var attribs:Object=evt.attributes;
			if((attribs as XML).name()==PlaybackConstants.PLAYBACK_CHAT)
				dispatchChatEvent(attribs);
			else if((attribs as XML).name()==PlaybackConstants.PLAYBACK_PARTICIPANTS)
				dispatchParticipantsEvent(attribs);
			else if ((attribs as XML).name() == PlaybackConstants.PLAYBACK_PRESENTATION)
				dispatchPresentationEvent(attribs);
			
		}
		private function dispatchParticipantsEvent(attribs:Object):void{
			var xmlobj:XML= attribs as XML;
			var participant_event:ParticipantsEvent;
			if(xmlobj.attribute("event")=="join"){
				participant_event=new ParticipantsEvent(ParticipantsEvent.JOIN_EVENT);
				participant_event.name=xmlobj.attribute("status");
				participant_event.userid=xmlobj.attribute("userid");
				participant_event.role=xmlobj.attribute("value");
			}
			else if(xmlobj.attribute("event")=="leave"){
				participant_event=new ParticipantsEvent(ParticipantsEvent.LEAVE_EVENT);
				participant_event.userid=xmlobj.attribute("userid");
			} else if (xmlobj.attribute("event") == "assign_presenter"){
				participant_event = new ParticipantsEvent(ParticipantsEvent.STATUS_CHANGE_EVENT);
				participant_event.userid = xmlobj.attribute("userid");
				
			}  else{
				//Unhandled event
				return;
			}
			
			dispatcher.dispatchEvent(participant_event);	
		}
		private function dispatchChatEvent(attribs:Object):void{
			var chat_event:ChatMessageEvent=new ChatMessageEvent(ChatMessageEvent.CHAT_MESSAGE_EVENT);
			
			var xmlobj:XML= attribs as XML;
			
			chat_event.timestamp=xmlobj.attribute("timestamp");
			chat_event.user=xmlobj.attribute("user");
			chat_event.color=xmlobj.attribute("color");
			chat_event.message=xmlobj.attribute("message");
			
			dispatcher.dispatchEvent(chat_event);	
		}
		
		private function dispatchPresentationEvent(attribs:Object):void{
			var xmlobj:XML = attribs as XML;
			var present_event:PresentationEvent;
			if (xmlobj.attribute("event") == "share_presentation"){
				present_event = new PresentationEvent(PresentationEvent.SHARE_PRESENTATION);
				//present_event.presentationName = xmlobj.attribute("presentationName");
				present_event.presentationName = recording_dir+"/"+xmlobj.attribute("presentationName");
				present_event.share = xmlobj.attribute("share") as Boolean;
			} else if (xmlobj.attribute("event") == "update_slide"){
				present_event = new PresentationEvent(PresentationEvent.UPDATE_SLIDE);
				present_event.pageNum = xmlobj.attribute("slide");
			} else{
				return;
			}
			
			dispatcher.dispatchEvent(present_event);
		}
	}
}