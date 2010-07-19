package org.bbb.playback.models
{
	import mx.collections.ArrayCollection;

	public class ManifestServiceParser
	{
		public function parseManifest(filestr:String):Object
		{
			var xml:XML = new XML(filestr);
			var sequence_events:XMLList=xml.par.seq;
			var timeline:ArrayCollection=new ArrayCollection();
			var xmllist:XMLList=sequence_events.children();
			
			for each(var evt:XML in xmllist){
				 //if(evt.name()=="chat")
					timeline.addItem(evt);
			} 
			
			return timeline;
		}
	}
}