package org.bigbluebutton.deskshare.server;

import static org.red5.server.api.ScopeUtils.getScopeService;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IScope;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.api.so.ISharedObjectService;
import org.red5.server.so.SharedObjectService;

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
	@Override
	public ISharedObject getSharedObject(IScope scope, String name) throws NullPointerException {
		
		ISharedObjectService service = (ISharedObjectService) getScopeService(scope, 
				ISharedObjectService.class, SharedObjectService.class, false);
		
		if (service == null) throw new NullPointerException();
		
		return service.getSharedObject(scope, name);
	}
	
}
