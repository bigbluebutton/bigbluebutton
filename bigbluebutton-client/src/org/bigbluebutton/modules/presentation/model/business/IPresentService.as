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
package org.bigbluebutton.modules.presentation.model.business
{
	public interface IPresentService
	{
		function connect():void;
		function disconnect():void;
		function addMessageSender(msgSender:Function):void;
		function addConnectionStatusListener(connectionListener:Function):void;	
		function gotoSlide(num:int):void;
		function sharePresentation(share:Boolean, presentationName:String):void;	
		function clearPresentation():void;
		function setPresenterName(presenterName:String):void;
		function zoom(slideHeight:Number, slideWidth:Number):void;
		function move(slideXPosition:Number, slideYPosition:Number):void;
		function getCurrentSlideNumber():void;
		function assignPresenter(userid:Number, name:String, assignedBy:Number):void;
	}
}