package org.bigbluebutton.clientcheck.view.mainview
{
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class RefreshButtonMediator extends Mediator
	{
		[Inject]
		public var view: IRefreshButton;
		
		/**
		 * Initialize listener
		 */
		override public function initialize():void
		{
			(view as RefreshButton).addEventListener(MouseEvent.CLICK, mouseClickHandler);
		}
		
		/**
		 * Handle events to refresh web page
		 */
		private function mouseClickHandler(e:MouseEvent):void
		{
			var pageURL:String = ExternalInterface.call('window.location.href.toString');
			navigateToURL(new URLRequest(pageURL), "_self");
		}
	}
}