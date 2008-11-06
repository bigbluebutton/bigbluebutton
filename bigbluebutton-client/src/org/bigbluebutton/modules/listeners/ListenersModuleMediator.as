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
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.listeners
{
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The ListenersModuleMediator is a mediator class for the VoiceModule. It extends the Mediator class of the
	 * PureMVC framework. 
	 * @author dzgonjan
	 * 
	 */	
	public class ListenersModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ListenersModuleMediator";

		private var _module:ListenersModule;
		
		
		/**
		 * The constructor. Registers this class with the VoiceModule 
		 * @param view
		 * 
		 */		
		public function ListenersModuleMediator(module:ListenersModule)
		{
			super(NAME);
			_module = module;
		}

	}
}