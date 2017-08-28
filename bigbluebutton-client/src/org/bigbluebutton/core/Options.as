/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.core {
	import flash.utils.Dictionary;
	import flash.utils.getQualifiedClassName;

	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.model.Config;

	public class Options {
		private static const LOGGER:ILogger = getClassLogger(Options);

		private static const storage:Dictionary = new Dictionary(true);

		private static const parsedOptions:Dictionary = new Dictionary(true);

		protected var name:String;

		public static function getOptions(clazz:Class):Options {
			var options:Options;
			if (Options.storage[clazz] == undefined) {
				options = new clazz();
				Options.storage[clazz] = options;
			} else {
				options = Options.storage[clazz];
			}
			options.parseOptions();
			return options;
		}

		public static function isParsed(optionName:String):Boolean {
			return parsedOptions[optionName] != undefined;
		}

		public function parseOptions():void {
			if (Options.parsedOptions[name] == undefined) {
				readOptions();
			}
		}

		private function readOptions():void {
			var vxml:XML;
			var config:Config = BBB.getConfigManager().config;
			if (config) {
				if (StringUtils.endsWith(name, "Module")) {
					vxml = BBB.getConfigForModule(name);
				} else {
					vxml = config.getOptionsFor(name);
				}
			}
			if (vxml != null) {
				var logData:Object = UsersUtil.initLogData();
				logData.option = name;
				logData.tags = ["options", "config", "xml"];
				logData.message = "Parsing XML options";
				//LOGGER.info(JSON.stringify(logData));
				for each (var att:XML in vxml.@*) {
					var property:String = att.name().localName;
					if (property != "name" && this.hasOwnProperty(property)) {
						var type:String = getQualifiedClassName(this[property]);
						switch (type) {
							case "Boolean":
								this[property] = (att.valueOf().toString().toUpperCase() == "TRUE") ? true : false;
								break;
							case "String":
								this[property] = att.valueOf().toString();
								break;
							case "int":
								this[property] = parseInt(att.valueOf().toString());
								break;
							case "uint":
								this[property] = parseInt(att.valueOf().toString());
								break;
							case "Number":
								this[property] = parseFloat(att.valueOf().toString());
								break;
							case "Array":
								var f:Array = att.valueOf().split(",");
								var fint:Array = new Array();
								for (var i:int = 0; i < f.length; i++) {
									this[property][i] = parseFloat(f[i]);
								}
								break;
							default:
								throw new Error("Cannot parse undefined property type");
								break;
						}
					}
				}
				handleExtraData();
				Options.parsedOptions[name] = true;
			}
		}

		protected function handleExtraData():void {
			// To be implemented in sub classes if needed
		}

	}
}
