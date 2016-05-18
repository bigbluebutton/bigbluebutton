package org.bigbluebutton.air.common.views {
	import flash.events.IEventDispatcher;
	
	public interface IView extends IEventDispatcher {
		function dispose():void;
	}
}
