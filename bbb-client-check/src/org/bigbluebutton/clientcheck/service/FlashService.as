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
