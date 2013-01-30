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
package org.bigbluebutton.deskshare.server;

import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.api.so.ISharedObjectService;
import org.red5.server.so.SharedObjectService;
import org.red5.server.util.ScopeUtils;


public class MultiThreadedAppAdapter extends MultiThreadedApplicationAdapter {

	/**
	 * Returns shared object from given scope by name.
	 * 
	 * @param scope
	 *            Scope that shared object belongs to
	 * @param name
	 *            Name of SharedObject
	 * @return Shared object instance with name given
	 */
/*	@Override
	public ISharedObject getSharedObject(IScope scope, String name) throws NullPointerException {
		
		ISharedObjectService service = (ISharedObjectService) ScopeUtils.getScopeService(scope, 
				ISharedObjectService.class, SharedObjectService.class, false);
		
		if (service == null) throw new NullPointerException();
		
		return service.getSharedObject(scope, name);
	}
*/	
}
