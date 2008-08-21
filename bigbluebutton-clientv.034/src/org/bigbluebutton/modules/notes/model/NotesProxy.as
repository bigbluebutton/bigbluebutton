package org.bigbluebutton.modules.notes.model
{
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	public class NotesProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "NotesProxy";
		
		public function NotesProxy()
		{
			super(NAME);
		}

	}
}