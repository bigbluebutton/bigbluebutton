package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	public class PresentationDownloadableChangedEvent extends Event
	{
		public static const PRESENTATION_DOWNLOADABLE_CHANGED_EVENT: String = "presentation downloadable changed event";
		
		public var podId: String;
		public var presentationId: String;
		public var downloadable: Boolean;
		
		public function PresentationDownloadableChangedEvent(podId:String, presentationId:String, downloadable:Boolean)
		{
			super(PRESENTATION_DOWNLOADABLE_CHANGED_EVENT, false, false);
			this.podId = podId;
			this.presentationId = presentationId;
			this.downloadable = downloadable;
		}
	}
}