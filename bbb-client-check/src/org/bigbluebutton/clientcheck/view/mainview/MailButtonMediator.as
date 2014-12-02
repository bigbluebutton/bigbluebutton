/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */

package org.bigbluebutton.clientcheck.view.mainview
{
	import flash.events.MouseEvent;
	import flash.net.URLRequest;
	import flash.net.URLVariables;
	import flash.net.URLRequestMethod;
	import flash.net.navigateToURL;

	import mx.resources.ResourceManager;
	import mx.collections.ArrayCollection;

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
		
		private static var FAILED:int = 1;
		private static var WARNING:int = 2;
		private static var LOADING:int = 3;
		private static var SUCCEEDED:int = 4;

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
			var mailMsg:URLRequest = new URLRequest('mailto:' + config.getMail());
			var variables:URLVariables = new URLVariables();
			variables.subject = signWithVersion(ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.title'));
			variables.body = buildMailBody(dp.getData());
			mailMsg.data = variables;
			mailMsg.method = URLRequestMethod.GET;
			navigateToURL(mailMsg, "_blank");
		}

		/**
		 * Concatenate with the client-check version
		 */
		private function signWithVersion(value:String):String
		{
			return value + " " + config.getVersion();
		}

		public function buildMailBody(data:ArrayCollection):String {
			var body:String = "";
			var statusPriority:int = 0;

			for (var i:int = 0; i < data.length; i++)
			{
				if (data.getItemAt(i).StatusPriority != statusPriority)
				{
					statusPriority = data.getItemAt(i).StatusPriority;
					var statusName:String = "";
					switch (statusPriority)
					{
						case FAILED:
							statusName = ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.status.failed');
							break;
						case WARNING:
							statusName = ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.status.warning');
							break;
						case LOADING:
							statusName = ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.status.loading');
							break;
						case SUCCEEDED:
							statusName = ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.status.succeeded');
							break;
						default:
							trace("Bad status name at MailButtonMediator!")
							break;
					}
					body += "\n" + statusName + "\n";
				}
				body += data.getItemAt(i).Item + ":\t\t" + data.getItemAt(i).Result + "\n";
			}

			return body;
		}
	}
}