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


import java.util.Enumeration;
//import org.zoolu.sip.provider.SipStack;
//import org.zoolu.tools.Parser;
//import org.zoolu.tools.Base64;
//import java.util.Hashtable;
//import java.io.*;


/** AuthenticationService is the interface used by a SIP server to access to
  * an AAA repository.
  */
public interface AuthenticationService extends Repository
{
   /** Adds a new user at the database.
     * @param user the user name
     * @param key the user key
     * @return this object */
   public AuthenticationService addUser(String user, byte[] key);

   /** Adds a new user at the database.
     * @param user the user name
     * @param key the user key
     * @param seqn the current user SQN value
     * @return this object */
   //public AuthenticationService addUser(String user, byte[] key, int seqn);

   
   /** Sets the user key.
     * @param user the user name
     * @param key the user key
     * @return this object */
   public AuthenticationService setUserKey(String user, byte[] key);
      
   /** Gets the user key.
     * @param user the user name
     * @return the user key */
   public byte[] getUserKey(String user);

    
   /** Sets the user sequence number.
     * @param user the user name
     * @param rand the user sequence number
     * @return this object */
   //public AuthenticationService setUserSeqn(String user, int seqn);

   /** Gets the user sequence number.
     * @param user the user name
     * @return the user sequence number */
   //public int getUserSeqn(String user);
   
   /** Increments the user sequence number.
     * @param user the user name
     * @return the new user sequence number */
   //public int incUserSeqn(String user);
   
}
