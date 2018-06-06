/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.core.services {
	import mx.styles.IStyleManager2;
	import mx.styles.StyleManager;

	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.main.model.options.SkinningOptions;

	public class SkinningService {

		private static const LOGGER:ILogger = getClassLogger(SkinningService);

		private var myStyleManager:IStyleManager2;

		private var loadedSkin:String = "V2Theme";

		public function loadSkins():void {
			var skinOptions:SkinningOptions = Options.getOptions(SkinningOptions) as SkinningOptions;

			var skinNamePattern:RegExp = /\.css\.swf(\??.*)/;
			var skinToLoad:String = StringUtils.substringAfterLast(skinOptions.url, "/").replace(skinNamePattern, "");
			if (!StringUtils.isEmpty(skinOptions.url) && skinToLoad != loadedSkin) {
				LOGGER.info("Loading new skin {}", [skinToLoad]);
				myStyleManager = StyleManager.getStyleManager(null);
				myStyleManager.loadStyleDeclarations(skinOptions.url);
				loadedSkin = skinToLoad;
			}
		}
	}
}
