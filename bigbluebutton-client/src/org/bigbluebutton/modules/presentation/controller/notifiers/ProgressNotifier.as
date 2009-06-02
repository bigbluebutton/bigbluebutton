/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
*59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.presentation.controller.notifiers
{
	/**
	 * This is a convinience class so that multiple pieces of data can be sent via a pureMVC notification  
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ProgressNotifier
	{
		private var _totalSlides:Number;
		private var _completedSlides:Number;
		
		/**
		 * Creates an object containing the following information 
		 * @param totalSlides - the total number of slides in a presentation
		 * @param completedSlides - the number of slides converted so far
		 * 
		 */		
		public function ProgressNotifier(totalSlides:Number, completedSlides:Number){
			this._totalSlides = totalSlides;
			this._completedSlides = completedSlides;
		}
		
		public function get totalSlides():Number{
			return this._totalSlides;
		}
		
		public function get completedSlides():Number{
			return this._completedSlides;
		}

	}
}