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
package org.bigbluebutton.common
{
	
	/**
	 * The main interface for a BigBlueButton Module. Implement this interface if you would like to your module to be loaded
	 * by BigBlueButton. The module provides methods for passing in important parameters to your module. It also serves as a
	 * security restriction. Only modules implementing this interface will be loaded by the main application.
	 */
	public interface IBigBlueButtonModule
	{
		/**
		 * Returns the name of your module. The name should be unique, but there is no hard requirement for that yet.
		 */
		function get moduleName():String;
	
		/**
		 * This method will be called once your module has been loaded by the main application. 
		 * @param attributes - the object that will be passed to your module containing important attributes. The attributes
		 * are specified in org.bigbluebutton.main.model.ConferenceParameters . In addition, any attributes you specified in
		 * the client's config.xml file for your module will be passed to the module as well. The attributes object is dynamic
		 * however and should not be cast into any other class.
		 */		
		function start(attributes:Object):void;
		function stop():void;
	}
}