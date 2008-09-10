package org.red5.server.webapp.appshare;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.so.ISharedObject;

public class SOHandler extends ApplicationAdapter 
{
	protected static Log log = LogFactory.getLog(SOHandler.class.getName());

    public void sendByteArray()
    {
        IScope scope = Red5.getConnectionLocal().getScope();
        ISharedObject so = this.getSharedObject(scope, "appSO", false);
   	    so.setAttribute("message", "it's in handler");
        
    }   
}