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