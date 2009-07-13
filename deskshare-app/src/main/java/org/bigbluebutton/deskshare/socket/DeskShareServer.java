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
package org.bigbluebutton.deskshare.socket;

import java.io.IOException;
import java.net.InetSocketAddress;

import org.apache.mina.core.service.IoAcceptor;
import org.apache.mina.core.session.IdleStatus;
import org.apache.mina.filter.codec.ProtocolCodecFilter;
import org.apache.mina.transport.socket.nio.NioSocketAcceptor;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;


public class DeskShareServer {
	final private Logger log = Red5LoggerFactory.getLogger(DeskShareServer.class, "deskshare");
	
    private static final int PORT = 9123;

    private ScreenCaptureMessageHandler screenCaptureHandler;
    private IoAcceptor acceptor;
    
    public void start()
    {
        acceptor = new NioSocketAcceptor();
        acceptor.getFilterChain().addLast( "codec",  new ProtocolCodecFilter(new ScreenCaptureProtocolCodecFactory()));

        acceptor.setHandler( screenCaptureHandler);
        acceptor.getSessionConfig().setIdleTime( IdleStatus.BOTH_IDLE, 10 );
        try {
			acceptor.bind( new InetSocketAddress(PORT) );
		} catch (IOException e) {
			log.error("IOException while binding to port {}", PORT);
		}
    }

	public void setScreenCaptureHandler(ScreenCaptureMessageHandler screenCaptureHandler) {
		this.screenCaptureHandler = screenCaptureHandler;
	}
	
	public void stop() {
		acceptor.unbind();
		acceptor.dispose();
	}
}
