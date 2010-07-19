package org.bbb.playback.models
{
	import com.asfusion.mate.core.GlobalDispatcher;
	import mx.collections.ArrayCollection;
	import org.bbb.playback.events.ManifestEvent;

	public class ManifestManager
	{
		
		public function loadTimeline(arr:Object):void
		{
			var evt:ManifestEvent=new ManifestEvent(ManifestEvent.LOADED_TIMELINE_EVENT);
			evt.timeline=arr as ArrayCollection;
			var dispatcher:GlobalDispatcher=new GlobalDispatcher();
			dispatcher.dispatchEvent(evt);
		}
	}
}