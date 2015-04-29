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
	import org.bigbluebutton.clientcheck.model.test.IPortTest;
	import org.bigbluebutton.clientcheck.model.test.IRTMPAppTest;
	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.model.test.PortTest;
	import org.bigbluebutton.clientcheck.service.IRTMPTunnelingService;

	import robotlegs.bender.bundles.mvcs.Command;
	import org.bigbluebutton.clientcheck.model.test.RTMPAppTest;

	public class RequestRTMPAppsCommand extends Command
	{
		[Inject]
		public var rtmpTunnelingService:IRTMPTunnelingService;

		public override function execute():void
		{
			rtmpTunnelingService.init();
		}
	}
}
