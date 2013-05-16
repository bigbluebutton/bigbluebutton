package org.bigbluebutton.modules.phone
{
	import org.bigbluebutton.core.BBB;

	public class PhoneOptions {
		[Bindable]
		public var showButton:Boolean = true;

		[Bindable]
		public var autoJoin:Boolean = false;
		
		[Bindable]
		public var skipCheck:Boolean = false;
		
		[Bindable]
		public var enabledEchoCancel:Boolean = false;

		[Bindable]
		public var joinGlobal:Boolean = true;

		[Bindable]
		public var presenterShareOnly:Boolean = false;

		public function PhoneOptions() {
			var vxml:XML = BBB.getConfigForModule("PhoneModule");
			if (vxml != null) {
				this.showButton = (vxml.@showButton.toString().toUpperCase() == "TRUE") ? true : false;
				this.autoJoin = (vxml.@autoJoin.toString().toUpperCase() == "TRUE") ? true : false;
				this.skipCheck = (vxml.@skipCheck.toString().toUpperCase() == "TRUE") ? true : false;
				this.joinGlobal = (vxml.@joinGlobal.toString().toUpperCase() == "TRUE") ? true : false;
				this.presenterShareOnly = (vxml.@presenterShareOnly.toString().toUpperCase() == "TRUE") ? true : false;
			}
		}
	}
}