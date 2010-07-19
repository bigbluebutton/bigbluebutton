package org.bbb.playback.events
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	public class ManifestEvent extends Event
	{
		public static const LOAD_MANIFEST_EVENT:String="loadManifestFile";
		public static const LOADED_TIMELINE_EVENT:String="loadedManifestFile";
		
		public var conferenceid:String;
		public var timeline:ArrayCollection;
		
		
		public function ManifestEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}