package org.bigbluebutton.air.main.views {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.transitions.ViewTransitionBase;
	
	public interface IPagesNavigatorView extends IView {
		function pushView(viewClass:Class,
						  data:Object = null,
						  context:Object = null,
						  transition:ViewTransitionBase = null):void
		function popView(transition:ViewTransitionBase = null):void
		function set visible(value:Boolean):void
		function set includeInLayout(value:Boolean):void
		function popAll(transition:ViewTransitionBase = null):void
	}
}
