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
	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.service.IDownloadBandwidthService;
	import org.bigbluebutton.clientcheck.service.IPingService;
	import org.bigbluebutton.clientcheck.service.IUploadBandwidthService;

	import robotlegs.bender.bundles.mvcs.Command;

	public class RequestBandwidthInfoCommand extends Command
	{
		[Inject]
		public var downloadBandwithService:IDownloadBandwidthService;

		[Inject]
		public var uploadBandwidthService:IUploadBandwidthService;

		[Inject]
		public var pingService:IPingService;

		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		public override function execute():void
		{
			downloadBandwithService.init();
			pingService.init();

			// commenting out upload service for now as it needs to be properly implemented
			// uploadBandwidthService.init();
		}
	}
}
