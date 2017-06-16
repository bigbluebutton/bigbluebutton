package org.bigbluebutton.core.model
{
	import mx.collections.ArrayCollection;

	public class MediaStream
	{
		public var streamId: String;
		public var intId: String;
		public var attributes: ArrayCollection = new ArrayCollection();
		public var viewers:ArrayCollection = new ArrayCollection();
		
		public function MediaStream()
		{
		}
	}
}