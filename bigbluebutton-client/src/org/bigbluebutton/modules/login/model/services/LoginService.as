/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.login.model.services
{
	import flash.events.*;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	        	
	public class LoginService
	{  
		private var request:URLRequest = new URLRequest();
		private var vars:URLVariables = new URLVariables();
		
		private var urlLoader:URLLoader;
		private var _resultListener:Function;
		
		public function LoginService()
		{
		}
		
		/**
		 * Load slides from an HTTP service. Response is received in the Responder class' onResult method 
		 * @param url
		 * 
		 */		
		public function load(url:String, fullname:String, conference:String, password:String) : void
		{
			LogUtil.debug("LoginService:load(...) " + url);
			            
            vars.fullname = fullname;
            vars.conference = conference;
            vars.password = password;
            request = new URLRequest(url);
            request.data = vars;
            request.method = URLRequestMethod.POST;		
            
            urlLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);	
            urlLoader.load(request);	
		}

		public function addLoginResultListener(listener:Function):void {
			_resultListener = listener;
		}
		
		private function handleComplete(e:Event):void{
			
			var xml:XML = new XML(e.target.data)
			LogUtil.debug("Loading complete: " + xml);
			var returncode:String = xml.returncode;
			if (returncode == 'FAILED') {
				LogUtil.debug("Result = " + returncode + " " + xml.message);
				_resultListener(false, {message:xml.message});
			} else if (returncode == 'SUCCESS') {
				LogUtil.debug(xml.returncode + " " + xml.fullname + " " + xml.conference + " " + xml.role
					+ " " + xml.room);
				_resultListener(true, {fullname:xml.fullname,conference:xml.conference,role:xml.role,room:xml.room});
			}
				
		}
	}
}