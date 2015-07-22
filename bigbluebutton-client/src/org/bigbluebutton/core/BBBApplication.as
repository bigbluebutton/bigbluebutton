/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.core
{
	import flash.events.Event;

	import mx.core.Application;
	import mx.events.FlexEvent;

	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.model.ShortcutOptions;

	public class BBBApplication extends Application
	{

		public var bbbShell:BigBlueButtonMainContainer;

		public function BBBApplication()
		{
			super();

			addEventListener(FlexEvent.PREINITIALIZE, preinitializeEventHandler);
		}

		private function preinitializeEventHandler(event:FlexEvent):void
		{
			EventBroadcaster.getInstance().addEventListener("configLoadedEvent", configLoadedEventHandler);
			BBB.initConfigManager();
		}

		private function configLoadedEventHandler(e:Event):void
		{
			LogUtil.debug("***** Config Loaded ****");

			bbbShell=new BigBlueButtonMainContainer();
			this.addChild(bbbShell);

			bbbShell.mainShell.initOptions(null);
			ShortcutOptions.initialize();
		}
	}
}
