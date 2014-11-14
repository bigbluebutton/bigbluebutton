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
	import flash.events.TimerEvent;
	import flash.net.URLRequest;
	import flash.system.ApplicationDomain;
	import flash.system.LoaderContext;
	import flash.utils.getTimer;
	import flash.utils.Timer;

	import mx.formatters.NumberBaseRoundType;
	import mx.formatters.NumberFormatter;

	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;

	public class DownloadBandwidthService implements IDownloadBandwidthService
	{
		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		private static const NUM_OF_SECONDS:Number = 10;
		private static const BYTES_IN_MBIT:Number=Math.pow(2, 17);
		private static const BYTES_IN_MBYTE:Number=Math.pow(2, 20);

		private var _imageLoader:Loader;

		private var _initiated:Boolean = false;
		private var _loading:Boolean = false;
		private var _ignoreBytes:int = 0;
		private var _startTime:int;
		private var _endTime:int;
		private var _timer:Timer;
		private var _secondsCounter:int = 0;

		public function init():void
		{
			_initiated=false;

			_timer = new Timer(1000, NUM_OF_SECONDS);
			_timer.addEventListener(TimerEvent.TIMER, onTimerListener)
			_timer.addEventListener(TimerEvent.TIMER_COMPLETE, onTimerCompleted);
			_timer.reset();
			_timer.start();

			_imageLoader=new Loader;
			_imageLoader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS, contentLoaderProgressHandler);
			_imageLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, contentLoaderCompleteHandler, false, 0, true);
			_imageLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, contentLoaderIoErrorHandler, false, 0, true);
			_loading = true;
			_imageLoader.load(new URLRequest(systemConfiguration.downloadFilePath + "?t=" + getTimer().toString()));
		}

		protected function onTimerListener(event:TimerEvent):void {
			step();
		}

		protected function step():void {
			if (_initiated) {
				_secondsCounter = Math.min(_secondsCounter + 1, NUM_OF_SECONDS);
				updateData(_secondsCounter == NUM_OF_SECONDS);
			}
		}

		protected function updateData(lastUpdate:Boolean = false):void {
			var now:int = getTimer();
			var duration:Number = ((now - _startTime) / 1000)
			var loadedSoFar:int = _imageLoader.contentLoaderInfo.bytesLoaded - _ignoreBytes;
			var loadedInMB:Number = loadedSoFar / BYTES_IN_MBYTE;
			var loadedInMb:Number = loadedSoFar / BYTES_IN_MBIT;
			var speed:Number = loadedInMb / duration;

			var dataFormatter:NumberFormatter=new NumberFormatter();
			dataFormatter.precision=3;
			dataFormatter.rounding=NumberBaseRoundType.NEAREST;

			var msg:String;
			if (lastUpdate) {
				msg = dataFormatter.format(speed) + " Mbps (" + dataFormatter.format(loadedInMB) + " MB in " + _secondsCounter + " seconds)";
			} else {
				msg = dataFormatter.format(speed) + " Mbps (" + dataFormatter.format(loadedInMB) + " MB, " + (NUM_OF_SECONDS - _secondsCounter) + " seconds remaining)";
			}
			systemConfiguration.downloadBandwidthTest.testResult=msg;
			systemConfiguration.downloadBandwidthTest.testSuccessfull=true;
		}

		protected function onTimerCompleted(event:TimerEvent):void {
			_imageLoader.close();
			step();
		}

		protected function contentLoaderProgressHandler(event:ProgressEvent):void
		{
			if (!_initiated)
			{
				_startTime = getTimer();
				_ignoreBytes = event.bytesLoaded;
				_initiated=true;
			}
		}

		protected function contentLoaderIoErrorHandler(event:IOErrorEvent):void
		{
			systemConfiguration.downloadBandwidthTest.testResult=event.text;
			systemConfiguration.downloadBandwidthTest.testSuccessfull=false;
		}

		protected function contentLoaderCompleteHandler(event:Event):void
		{
			_timer.stop();
			updateData(true);
		}
	}
}
