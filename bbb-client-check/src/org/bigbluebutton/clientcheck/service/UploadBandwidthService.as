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
	import flash.events.DataEvent;
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.FileFilter;
	import flash.net.FileReference;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.utils.getTimer;

	import mx.formatters.NumberBaseRoundType;
	import mx.formatters.NumberFormatter;

	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;

	public class UploadBandwidthService implements IUploadBandwidthService
	{
		private var _urlLoader:URLLoader;
		private var _urlRequest:URLRequest;

		private var fileToUpload:FileReference=new FileReference();
		private var request:URLRequest=new URLRequest();
		private var sendVars:URLVariables=new URLVariables();

		private static var NUM_OF_TESTS:Number=1;
		private static var UNDEFINED:String="Undefined";

		private static var FAKE_DATA_NUM:Number=655360;
		private static var TOTAL_BITS:Number=41943040;
		private static var BYTES_IN_MBIT:Number=125000;

		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		private var obj:Object;

		public function init():void
		{
			obj=create5MbObject();

			_urlRequest=new URLRequest(systemConfiguration.applicationAddress + "test/clientTest.php");
			_urlRequest.method=URLRequestMethod.POST;
			_urlRequest.data=obj;

			_urlLoader=new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, urlLoaderLoadCompleteHandler);
			_urlLoader.addEventListener(IOErrorEvent.IO_ERROR, urlLoaderIoErrorHandler);
			_urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, urlLoaderSecurityErrorHandler);
			_urlLoader.load(_urlRequest);
		}

		protected function progressHandler(event:ProgressEvent):void
		{
			if (event.bytesLoaded == event.bytesTotal)
			{
				systemConfiguration.uploadBandwidthTest.endTime=getTimer();

				var totalTime:Number=((systemConfiguration.uploadBandwidthTest.endTime - systemConfiguration.uploadBandwidthTest.startTime));

				// convert bits to megabits
				var totalMB:Number=(event.bytesTotal / BYTES_IN_MBIT);

				//  calculate download speed
				var uploadSpeedTime:Number=totalMB / totalTime;

				systemConfiguration.uploadBandwidthTest.testResultArray.push(uploadSpeedTime);

				calculateResults();
			}
		}

		protected function uploadCompleteHandler(event:DataEvent):void
		{

		}

		protected function onSelectFile(event:Event):void
		{
			systemConfiguration.uploadBandwidthTest.startTime=getTimer();

			fileToUpload.upload(request, "fileUpload", true);
		}

		/**
		 * fake 5 megabytes of data
		 * 5 megabytes = 41943040 bits, in order to generate it - we need to create an array of 64 bit Numbers = 64 * 655360;
		 */
		private function create5MbObject():Object
		{
			var obj:Array=new Array();
			var num:Number;

			for (var i:int=0; i < FAKE_DATA_NUM; i++)
			{
				num=new Number();
				obj.push(num);
			}

			return obj;
		}

		protected function urlLoaderSecurityErrorHandler(event:SecurityErrorEvent):void
		{
			systemConfiguration.uploadBandwidthTest.testResult=UNDEFINED;
			systemConfiguration.uploadBandwidthTest.testSuccessfull=false;
		}

		protected function urlLoaderIoErrorHandler(event:IOErrorEvent):void
		{
			if (event.errorID != 2038)
			{ //upload works despite of this error.
				systemConfiguration.uploadBandwidthTest.testResult=UNDEFINED;
				systemConfiguration.uploadBandwidthTest.testSuccessfull=false;
			}
		}

		protected function urlLoaderLoadCompleteHandler(event:Event):void
		{

		}

		private function calculateResults():void
		{
			var totalResult:Number=0;

			for (var i:int=0; i < systemConfiguration.uploadBandwidthTest.testResultArray.length; i++)
			{
				totalResult+=systemConfiguration.uploadBandwidthTest.testResultArray[i];
			}

			var formatter:NumberFormatter=new NumberFormatter();
			formatter.precision=3;
			formatter.rounding=NumberBaseRoundType.NEAREST;

			var result:String=formatter.format(totalResult / systemConfiguration.uploadBandwidthTest.testResultArray.length);

			systemConfiguration.uploadBandwidthTest.testResult=result + " Mbps";
			systemConfiguration.uploadBandwidthTest.testSuccessfull=true;
		}
	}
}
