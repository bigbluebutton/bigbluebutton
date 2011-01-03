/*
	This file is part of BBB-Notes.
	
	Copyright (c) Islam El-Ashi. All rights reserved.
	
	BBB-Notes is free software: you can redistribute it and/or modify
	it under the terms of the Lesser GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or 
	any later version.
	
	BBB-Notes is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	Lesser GNU General Public License for more details.
	
	You should have received a copy of the Lesser GNU General Public License
	along with BBB-Notes.  If not, see <http://www.gnu.org/licenses/>.
	
	Author: Islam El-Ashi <ielashi@gmail.com>, <http://www.ielashi.com>
*/
package org.bigbluebutton.modules.sharednotes.infrastructure
{
	public class Patch
	{
		public var version:int, data:String;
		
		public function Patch(version:int, data:String)
		{
			this.version = version;
			this.data = data;
		}
	}
}