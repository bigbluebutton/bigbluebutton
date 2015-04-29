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


/** Repository is the interface used to access to a generic repository.
  * <p> A location service or AAA service are example of such repository.
  */
public interface Repository
{
   /** Syncronizes the database.
     * <p> Can be used, for example, to save the current memory image of the DB. */
   public void sync();

   /** Returns the numbers of users in the database.
     * @return the numbers of user entries */
   public int size();
   
   /** Returns an enumeration of the users in this database.
     * @return the list of user names as an Enumeration of String */
   public Enumeration getUsers();
      
   /** Whether a user is present in the database and can be used as key.
     * @param user the user name
     * @return true if the user name is present as key */
   public boolean hasUser(String user);
   
   /** Adds a new user at the database.
     * @param user the user name
     * @return this object */
   public Repository addUser(String user);
   
   /** Removes the user from the database.
     * @param user the user name
     * @return this object */
   public Repository removeUser(String user);

   /** Removes all users from the database.
     * @return this object */
   public Repository removeAllUsers();

   /** Gets the String value of this Object.
     * @return the String value */
   public String toString();

}
