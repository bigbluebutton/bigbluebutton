/*
 * Copyright (C) 2005 Luca Veltri - University of Parma - Italy
 * 
 * This file is part of MjSip (http://www.mjsip.org)
 * 
 * MjSip is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * MjSip is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with MjSip; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 * Author(s):
 * Luca Veltri (luca.veltri@unipr.it)
 */

package org.zoolu.sip.provider;


import org.zoolu.net.IpAddress;


/** ConnectionIdentifier is the reference for active transport connections.
  */
public class ConnectionIdentifier extends Identifier 
{
   /** Costructs a new ConnectionIdentifier. */
   public ConnectionIdentifier(String protocol, IpAddress remote_ipaddr, int remote_port)
   {  super(getId(protocol,remote_ipaddr,remote_port));
   }
   
   /** Costructs a new ConnectionIdentifier. */
   public ConnectionIdentifier(ConnectionIdentifier conn_id)
   {  super(conn_id);
   }

   /** Costructs a new ConnectionIdentifier. */
   public ConnectionIdentifier(String id)
   {  super(id);
   }
   
   /** Costructs a new ConnectionIdentifier. */
   public ConnectionIdentifier(ConnectedTransport conn)
   {  super(getId(conn.getProtocol(),conn.getRemoteAddress(),conn.getRemotePort()));
   }

   
   /** Gets the id. */
   private static String getId(String protocol, IpAddress remote_ipaddr, int remote_port)
   {  return protocol+":"+remote_ipaddr+":"+remote_port;
   }
   
}
