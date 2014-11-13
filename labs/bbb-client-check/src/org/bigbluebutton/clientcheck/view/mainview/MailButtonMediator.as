package org.bigbluebutton.clientcheck.view.mainview
{
	import flash.events.MouseEvent;
	import flash.net.URLRequest;
	import flash.net.URLVariables;
	import flash.net.URLRequestMethod;
	import flash.net.navigateToURL;

	import org.bigbluebutton.clientcheck.model.IXMLConfig;
	import org.bigbluebutton.clientcheck.model.IDataProvider;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class MailButtonMediator extends Mediator
	{
		[Inject]
		public var view: IMailButton;

		[Inject]
		public var config: IXMLConfig;

		[Inject]
		public var dp: IDataProvider;
		
		/**
		 * Initialize listener
		 */
		override public function initialize():void
		{
			(view as MailButton).addEventListener(MouseEvent.CLICK, mouseClickHandler);
		}
		
		/**
		 * Handle events to compose email
		 */
		private function mouseClickHandler(e:MouseEvent):void
		{
			var mailMsg:URLRequest = new URLRequest('mailto:' + config.getAdmMail());
			var variables:URLVariables = new URLVariables();
			variables.subject = "BigBlueButton Client Check";
			variables.body = dp.getAllDataAsString();
			mailMsg.data = variables;
			mailMsg.method = URLRequestMethod.GET;
			navigateToURL(mailMsg, "_self");
		}
	}
}