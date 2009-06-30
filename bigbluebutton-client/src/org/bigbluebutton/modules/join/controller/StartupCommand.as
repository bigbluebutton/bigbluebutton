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
package org.bigbluebutton.modules.join.controller
{
	import org.bigbluebutton.modules.join.JoinEndpointMediator;
	import org.bigbluebutton.modules.join.JoinModuleConstants;
	import org.bigbluebutton.modules.join.JoinModuleMediator;
	import org.bigbluebutton.modules.join.model.JoinProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StartupCommand extends SimpleCommand
	{
		public function StartupCommand()
		{
			super();
		}
	
		override public function execute(note:INotification):void {
			var m:JoinModule = note.getBody() as JoinModule;
			
			LogUtil.debug('facade.registerMediator(new JoinEndpointMediator(m));');
			facade.registerMediator(new JoinEndpointMediator(m));
			LogUtil.debug('facade.registerMediator(new JoinModuleMediator(m));');
			facade.registerMediator(new JoinModuleMediator(m));
//			LogUtil.debug('facade.registerMediator( new JoinWindowMediator(m) );');
//			facade.registerMediator( new JoinWindowMediator(m) );
			LogUtil.debug('facade.registerProxy(new JoinProxy(m.uri));');
			facade.registerProxy(new JoinProxy(m.uri));
			LogUtil.debug('JoinModule COnnected');
			facade.sendNotification(JoinModuleConstants.STARTED);
			proxy.join();
		}
		
		private function get proxy():JoinProxy {
			return facade.retrieveProxy(JoinProxy.NAME) as JoinProxy;
		}
	}
}