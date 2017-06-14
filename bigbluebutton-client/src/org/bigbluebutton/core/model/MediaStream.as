package org.bigbluebutton.core.model
{
	public class MediaStream
	{
		var streamId: String;
		var intId: String;
		var attributes: ArrayCollection = new ArrayCollection();
		var viewers:ArrayCollection = new ArrayCollection();
		
		public function MediaStream()
		{
		}
	}
}