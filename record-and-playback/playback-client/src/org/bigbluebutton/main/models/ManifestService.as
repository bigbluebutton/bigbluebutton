package org.bigbluebutton.main.models
{
	import com.asfusion.mate.core.GlobalDispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.main.events.PlaybackEvent;
	import org.bigbluebutton.main.events.TimelineEvent;
	import org.bigbluebutton.modules.chat.events.ChatMessageEvent;

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