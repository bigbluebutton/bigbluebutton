package org.bigbluebutton.air.main.views.menubuttons {
	
	import mx.core.IFlexDisplayObject;
	
	import spark.components.Button;
	
	public interface IMenuButtonsView extends IFlexDisplayObject {
		function get camButton():Button
		function get micButton():Button
		function get statusButton():Button
	}
}
