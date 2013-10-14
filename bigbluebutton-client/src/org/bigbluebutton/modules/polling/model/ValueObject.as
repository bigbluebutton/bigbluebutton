package org.bigbluebutton.modules.polling.model
{
	import org.bigbluebutton.modules.polling.model.PollObject;
	[Bindable]
	public class ValueObject
	{
		public var id:String;
		public var label:String;
		public var icon:String;
		public var poll:PollObject;
		
		public function ValueObject(id:String, label:String, icon:String=null)
		{
			poll = new PollObject();
			this.id = id;
			this.label = label;
			this.icon = icon;
		}
	}
}