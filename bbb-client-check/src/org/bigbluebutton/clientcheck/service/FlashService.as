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

package org.bigbluebutton.clientcheck.service
{
	import flash.system.Capabilities;

	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;

	public class FlashService implements IFlashService
	{
		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		public function requestFlashVersion():void
		{
			var versionNumber:String=Capabilities.version;
			var versionArray:Array=versionNumber.split(",");
			var platformAndVersion:Array=versionArray[0].split(" ");
			var majorVersion:String=platformAndVersion[1];
			var minorVersion:String=versionArray[1];
			var buildNumber:String=versionArray[2] + "." + versionArray[3];

			var parsedResult:String=majorVersion + "." + minorVersion + "." + buildNumber;

			if (parsedResult != "")
			{
				systemConfiguration.flashVersion.testResult=parsedResult;
				systemConfiguration.flashVersion.testSuccessfull=true;
			}
			else
			{
				systemConfiguration.flashVersion.testResult=null;
				systemConfiguration.flashVersion.testSuccessfull=false;
			}
		}
	}
}
