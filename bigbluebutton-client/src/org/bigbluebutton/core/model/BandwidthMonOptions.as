package org.bigbluebutton.core.model
{
	import org.bigbluebutton.core.Options;
	
	public class BandwidthMonOptions extends Options
	{
		[Bindable]
		public var server:String = "";
		
		[Bindable]
		public var application:String = "";
		
		public function BandwidthMonOptions()
		{
			name = "bwMon";
		}
	}
}