package org.bigbluebutton.main.controller.notifiers
{
	import org.bigbluebutton.common.BigBlueButtonModule;
	
	public class NewModuleNotifier
	{
		public var module:BigBlueButtonModule;
		public var addButton:Boolean;
		
		public function NewModuleNotifier(module:BigBlueButtonModule, addButton:Boolean)
		{
			this.module = module;
			this.addButton = addButton;
		}

	}
}