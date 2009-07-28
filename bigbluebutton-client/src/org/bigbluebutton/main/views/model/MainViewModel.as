package org.bigbluebutton.main.views.model
{
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	
	import org.bigbluebutton.main.managers.StatusManager;

	public class MainViewModel extends EventDispatcher
	{
		/** This property is injected by the application. */
		public var dispatcher : IEventDispatcher;
		/** This property is injected by the application. */
		[Bindable]
		public var status:StatusManager;
		
		public function MainViewModel(target:IEventDispatcher=null)
		{
			super(target);
		}
		
	}
}