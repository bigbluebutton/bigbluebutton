package org.bigbluebutton.main.models
{
	import com.asfusion.mate.core.GlobalDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.main.events.PlaybackEvent;
	import org.bigbluebutton.main.events.TimelineEvent;
	import org.bigbluebutton.modules.chat.events.ChatMessageEvent;
	import org.bigbluebutton.modules.participants.events.ParticipantsEvent;

	public class ManifestService
	{
		public function parseManifest(filestr:String):void
		{
			var evt:TimelineEvent=new TimelineEvent(TimelineEvent.TIMELINE_EVENT);
			var timeline:ArrayCollection=new ArrayCollection();
			
			var xml:XML = new XML(filestr);
			
			for each(var item:XML in xml.par.seq.children()){
				timeline.addItem(item);
			} 
			
			evt.timeline=timeline;
			var dispatcher:GlobalDispatcher=new GlobalDispatcher();
			dispatcher.dispatchEvent(evt);
		}
		public function dispatchPlaybackEvent(evt:PlaybackEvent):void{
			
			var attribs:Object=evt.attributes;
			if((attribs as XML).name()==PlaybackConstants.PLAYBACK_CHAT)
				dispatchChatEvent(attribs);
			else if((attribs as XML).name()==PlaybackConstants.PLAYBACK_PARTICIPANTS)
				dispatchParticipantsEvent(attribs);
			
		}
		private function dispatchParticipantsEvent(attribs:Object):void{
			var xmlobj:XML= attribs as XML;
			var participant_event:ParticipantsEvent
			if(xmlobj.attribute("event")=="join"){
				participant_event=new ParticipantsEvent(ParticipantsEvent.JOIN_EVENT);
				participant_event.name=xmlobj.attribute("name");
				participant_event.userid=xmlobj.attribute("userid");
				participant_event.role=xmlobj.attribute("role");
			}
			else if(xmlobj.attribute("event")=="leave"){
				participant_event=new ParticipantsEvent(ParticipantsEvent.LEAVE_EVENT);
				participant_event.userid=xmlobj.attribute("userid");
			}
			
			var dispatcher:GlobalDispatcher=new GlobalDispatcher();
			dispatcher.dispatchEvent(participant_event);	
		}
		private function dispatchChatEvent(attribs:Object):void{
			var chat_event:ChatMessageEvent=new ChatMessageEvent(ChatMessageEvent.CHAT_MESSAGE_EVENT);
			
			var xmlobj:XML= attribs as XML;
			var date:Date=new Date(xmlobj.attribute("timestamp"));
			
			chat_event.timestamp=date.toTimeString();
			chat_event.user=xmlobj.attribute("user");
			chat_event.color=xmlobj.attribute("color");
			chat_event.message=xmlobj.text();
			
			var dispatcher:GlobalDispatcher=new GlobalDispatcher();
			dispatcher.dispatchEvent(chat_event);	
		}
	}
}