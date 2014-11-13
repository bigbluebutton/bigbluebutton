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
	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.net.URLRequest;
	import flash.system.ApplicationDomain;
	import flash.system.LoaderContext;
	import flash.utils.getTimer;

	import mx.formatters.NumberBaseRoundType;
	import mx.formatters.NumberFormatter;

	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;

	public class DownloadBandwidthService implements IDownloadBandwidthService
	{
		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		private static var NUM_OF_TESTS:Number=5;
		private static var BYTES_IN_MBIT:Number=131072;

		private var _imageLoader:Loader;

		private static var _initiated:Boolean;

		public function init():void
		{
			_initiated=false;

			_imageLoader=new Loader;
			_imageLoader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS, contentLoaderProgressHandler);
			_imageLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, contentLoaderCompleteHandler, false, 0, true);
			_imageLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, contentLoaderIoErrorHandler, false, 0, true);
			_imageLoader.load(new URLRequest(systemConfiguration.downloadFilePath + "?t=" + Math.random().toString()));
		}

		protected function contentLoaderProgressHandler(event:ProgressEvent):void
		{
			if (!_initiated)
			{
				systemConfiguration.downloadBandwidthTest.startTime=getTimer();
				_initiated=true;
			}
		}

		protected function contentLoaderIoErrorHandler(event:IOErrorEvent):void
		{
			systemConfiguration.downloadBandwidthTest.testResult="undefined";
			systemConfiguration.downloadBandwidthTest.testSuccessfull=false;
		}

		protected function contentLoaderCompleteHandler(event:Event):void
		{
			systemConfiguration.downloadBandwidthTest.endTime=getTimer();

			// convert to seconds
			var totalDownloadTime:Number=((systemConfiguration.downloadBandwidthTest.endTime - systemConfiguration.downloadBandwidthTest.startTime) / 1000);

			// convert to megabits
			var totalMB:Number=(event.currentTarget.bytesLoaded / BYTES_IN_MBIT);

			// calculate download speed
			var downloadSpeed:Number=totalMB / totalDownloadTime;

			// add to array of test results, as we want to continiously make certain amount of tests and then get the range value
			systemConfiguration.downloadBandwidthTest.testResultArray.push(downloadSpeed);

			if (systemConfiguration.downloadBandwidthTest.testResultArray.length >= NUM_OF_TESTS)
			{
				calculateTestResult();
			}
			else
			{
				init();
			}
		}

		private function calculateTestResult():void
		{
			var totalResult:Number=0;

			for (var i:int=0; i < systemConfiguration.downloadBandwidthTest.testResultArray.length; i++)
			{
				totalResult+=systemConfiguration.downloadBandwidthTest.testResultArray[i];
			}

			var formatter:NumberFormatter=new NumberFormatter();
			formatter.precision=3;
			formatter.rounding=NumberBaseRoundType.NEAREST;

			var result:String=formatter.format(totalResult / systemConfiguration.downloadBandwidthTest.testResultArray.length);

			systemConfiguration.downloadBandwidthTest.testResult=result + " Mbps";
			systemConfiguration.downloadBandwidthTest.testSuccessfull=true;
		}
	}
}
