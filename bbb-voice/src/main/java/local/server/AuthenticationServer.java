/*
 * Copyright (C) 2005 Luca Veltri - University of Parma - Italy
 * 
 * This source code is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This source code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this source code; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 * 
 * Author(s):
 * Luca Veltri (luca.veltri@unipr.it)
 */

package local.server;


import org.zoolu.sip.header.AuthenticationInfoHeader;
import org.zoolu.sip.message.*;


/** AuthenticationServer is the interface used by a SIP server to authenticate SIP requests.
  */
public interface AuthenticationServer
{   
   /** Authenticates a SIP request.
     * @param msg is the SIP request to be authenticated
     * @return it returns the error Message in case of authentication failure,
     * or null in case of authentication success. */
   public Message authenticateRequest(Message msg);

   /** Authenticates a proxing SIP request.
     * @param msg is the SIP request to be authenticated
     * @return it returns the error Message in case of authentication failure,
     * or null in case of authentication success. */
   public Message authenticateProxyRequest(Message msg);

   /** Gets AuthenticationInfoHeader. */
   public AuthenticationInfoHeader getAuthenticationInfoHeader();

}