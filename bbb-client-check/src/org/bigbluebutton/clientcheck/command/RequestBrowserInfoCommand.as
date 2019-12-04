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

package org.bigbluebutton.clientcheck.command
{
	import flash.external.ExternalInterface;

	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.service.IExternalApiCalls;
	import org.bigbluebutton.clientcheck.service.IFlashService;

	import robotlegs.bender.bundles.mvcs.Command;

	public class RequestBrowserInfoCommand extends Command
	{
		[Inject]
		public var externalApiCalls:IExternalApiCalls;

		[Inject]
		public var flashService:IFlashService;

		public override function execute():void
		{
			externalApiCalls.requestUserAgent();
			externalApiCalls.requestBrowser();
			externalApiCalls.requestScreenSize();
			externalApiCalls.requestIsPepperFlash();
			externalApiCalls.requestLanguage();
			externalApiCalls.requestCookiesEnabled();
			externalApiCalls.requestIsWebRTCSupported();
			externalApiCalls.requestWebRTCEchoAndSocketTest();

			flashService.requestFlashVersion();
		}
	}
}
