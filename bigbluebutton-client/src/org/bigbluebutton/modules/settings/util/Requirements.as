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
package org.bigbluebutton.modules.settings.util
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestHeader;
	import flash.net.URLRequestMethod;
	
	import mx.collections.ArrayCollection;

	public class Requirements
	{		
		public static var bbb_apps_url:String;
		public static var bbb_voice_url:String;
		public static var bbb_video_url:String;
		public static var bbb_deskshare_url:String;
		public static var flash_required_version:String;
		public static var java_required_version:String;
		public static var check_deskshare:String = "false";
		
		private static var loader:URLLoader;
		private static var isLoaded:Boolean = false;
		private static var loadingStarted:Boolean = false;
		
		
		public static function setRequirements(attributes:Object):void{
			isLoaded = true;
			
			//bbb_apps_url = xml.bigbluebutton_apps.@url;
			bbb_video_url = attributes.video;
			bbb_voice_url = attributes.voice;
			bbb_deskshare_url = attributes.deskshare;
			
			flash_required_version = attributes.flash_required;
			java_required_version = attributes.java_required;
			check_deskshare = attributes.check_deskshare;
		}
		
	}
}