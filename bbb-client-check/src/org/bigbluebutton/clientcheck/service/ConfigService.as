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
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestHeader;
	import flash.net.URLRequestMethod;

	import mx.utils.ObjectUtil;

	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	import org.bigbluebutton.clientcheck.service.util.URLFetcher;

	public class ConfigService
	{
		protected var _successSignal:Signal=new Signal();
		protected var _unsuccessSignal:Signal=new Signal();

		public function get successSignal():ISignal
		{
			return _successSignal;
		}

		public function get unsuccessSignal():ISignal
		{
			return _unsuccessSignal;
		}

		public function getConfig(serverUrl:String, urlRequest:URLRequest):void
		{
			var configUrl:String=serverUrl;

			var fetcher:URLFetcher=new URLFetcher;
			fetcher.successSignal.add(onSuccess);
			fetcher.unsuccessSignal.add(onUnsuccess);
			fetcher.fetch(configUrl, urlRequest);
		}

		protected function onSuccess(data:Object, responseUrl:String, urlRequest:URLRequest):void
		{
			successSignal.dispatch(new XML(data));
		}

		protected function onUnsuccess(reason:String):void
		{
			unsuccessSignal.dispatch(reason);
		}
	}
}
