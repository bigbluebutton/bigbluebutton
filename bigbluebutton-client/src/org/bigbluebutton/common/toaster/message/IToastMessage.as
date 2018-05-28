/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.common.toaster.message {
	import org.bigbluebutton.common.toaster.container.IToastContainer;

	public interface IToastMessage {
		function set container(value:IToastContainer):void;
		function set message(value:String):void;
		function get message():String;
		function set type(value:String):void;
		function get type():String;
		function set iconName(value:String):void;
		function get iconName():String;
		function get markedForDeletion():Boolean;
		function set markedForDeletion(value:Boolean):void;
		function get markedForAddition():Boolean;
		function set markedForAddition(value:Boolean):void;
	}
}
