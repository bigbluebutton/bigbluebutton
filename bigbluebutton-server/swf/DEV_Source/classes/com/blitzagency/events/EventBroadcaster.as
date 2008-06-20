/**
	This class should be used to implement the Broadcast-Listener Event Model.  The class should be inherited via composition.
	
	@class
	@author Danny Patterson
	@version 1.0.0 2005-07-23
	@availability Flash Player 7
	@see com.dannypatterson.events.IBroadcastable
	@example
		<pre>
		import com.dannypatterson.events.IBroadcastable;
		import com.dannypatterson.events.EventBroadcaster;
		
		class ClassName implements IBroadcastable {
			
			private var broadcaster:EventBroadcaster;
			
			public function ClassName() {
				broadcaster = new EventBroadcaster(this);
			}
			
			public function broadcastEvent(eventName:String, data:Object):Void {
				broadcaster.broadcastEvent(eventName, data);
			}
			
			public function addEventListener(eventName:String, listener:Object, methodName:String):Void {
				broadcaster.addEventListener(eventName, listener, methodName);
			}
			
			public function removeEventListener(eventName:String, listener:Object, methodName:String):Void {
				broadcaster.removeEventListener(eventName, listener, methodName);
			}
			
		}
		</pre>
*/

import com.blitzagency.events.IStaticBroadcastable;

class com.blitzagency.events.EventBroadcaster {
	
	private var registeredListeners:Object;
	
	
	/**
		The constuctor for the EventBroadcaster class.
		
		@param target (IBroadcastable) A reference to the class that will be using this instance of EventBroadcaster. This class must implement the IBroadcastable interface.
		@usage
			<pre>
			var broadcaster:EventBroadcaster = new EventBroadcaster(target:IBroadcastable);
			</pre>
	*/
	function EventBroadcaster(target:IStaticBroadcastable) {
		if(target == undefined) {
			throw new Error("ERROR: You must pass in the target object to the EventBroadcaster class. [broadcaster = new EventBroadcaster(this);]");
		}
		registeredListeners = new Object();
	}
	
	
	/**
		This method is called by a listener to register itself with the broadcaster.
		
		@param  eventName (String) The name of the event to broadcast.
		@param  listner (Object) The scope of the listener object.
		@param  methodName (String) Optional method name that should be called on the listener object.  If excluded, the event name will be used in its place.
		@usage
			<pre>
			broadcaster.addEventListener(eventName:String, listenerObj:Object, methodName:String):Void;
			</pre>
	*/
	public function addEventListener(eventName:String, listenerObj:Object, methodName:String):Void {
		if(registeredListeners[eventName] == undefined) {
			registeredListeners[eventName] = new Array();

		}
		registeredListeners[eventName].push({listenerObj:listenerObj, methodName:methodName});
		
	}
	
	/**
		This method is called to broadcast an event to its registered listeners.
		
		@param  eventName (String) The name of the event to broadcast.
		@param  data (Object) This allows the user to define data to be sent back to the listener.
		@usage
			<pre>
			broadcaster.broadcastEvent(eventName:String, data:Object):Void;
			</pre>
	*/
	public function broadcastEvent(eventName:String, data:Object):Void {
		var method:String;
		for(var i:Number = 0; i < registeredListeners[eventName].length; i++) {
			method = eventName;
			if(registeredListeners[eventName][i].methodName != undefined) {
				method = registeredListeners[eventName][i].methodName;
			}
			registeredListeners[eventName][i].listenerObj[method](data);
		}
	}
	
	/**
		This method is called by a listener to unregister itself with the broadcaster.
		
		@param  eventName (String) The name of the event to broadcast.
		@param  listner (Object) The scope of the listener object.
		@param  methodName (String) Optional method name that should be called on the listener object.  If excluded, the event name will be used in its place.
		@usage
			<pre>
			broadcaster.removeEventListener(eventName:String, listenerObj:Object, methodName:String):Void;
			</pre>
	*/
	public function removeEventListener(eventName:String, listenerObj:Object, methodName:String):Void 
	{
		var ary:Array = registeredListeners[eventName];
		for(var i:Number = (ary.length - 1); i >= 0; i--) 
		{
			var aryListenerObj:Object = ary[i].listenerObj;
			var aryMethodName:String = ary[i].methodName;
			
			// [CHRIS REVIEW:  there was only one "&" in the if statement that caused a funky type error

			if(aryListenerObj == listenerObj && aryMethodName == methodName) 
			{
				ary.splice(i, 1);
			}
		}
	}
	
}