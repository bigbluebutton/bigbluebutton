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


import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.SipStack;
import org.zoolu.sip.provider.SipParser;
import org.zoolu.sip.header.SipHeaders;
import org.zoolu.sip.header.ContactHeader;
import org.zoolu.tools.Parser;
import org.zoolu.tools.LogLevel;
import java.io.*;
import java.util.*;
import java.text.*;


/** LocationServiceImpl is a simple implementation of a LocationService.
  * LocationServiceImpl allows creation and maintainance of a
  * location service for registered users.
  */
public class LocationServiceImpl implements LocationService
{
   /** LocationService name. */
   String filename=null;
   
   /** Whether the Location DB has been changed without saving. */
   boolean changed=false;
   
   /** Users bindings. Set of pairs of { (String)user , (UserBindingInfo)binding }. */
   Hashtable users;

   
   /** Creates a new LocationServiceImpl */
   public LocationServiceImpl(String file_name)
   {  filename=file_name;
      users=new Hashtable();
      load();
   }


   // **************** Methods of interface Registry ****************

   /** Syncronizes the database.
     * <p> Can be used, for example, to save the current memory image of the DB. */
   public void sync()
   {  if (changed) save();
   }

   /** Returns the numbers of users in the database.
     * @return the numbers of user entries */
   public int size()
   {  return users.size();
   }
   
   /** Returns an enumeration of the users in this database.
     * @return the list of user names as an Enumeration of String */
   public Enumeration getUsers()
   {  return users.keys();
   }
      
   /** Whether a user is present in the database and can be used as key.
     * @param user the user name
     * @return true if the user name is present as key */
   public boolean hasUser(String user)
   {  return (users.containsKey(user));
   }
   
   /** Adds a new user at the database.
     * @param user the user name
     * @return this object */
   public Repository addUser(String user)
   {  if (hasUser(user)) return this;
      UserBindingInfo ur=new UserBindingInfo(user);
      users.put(user,ur);
      changed=true;
      return this;
   }
      
   /** Removes the user from the database.
     * @param user the user name
     * @return this object */
   public Repository removeUser(String user)
   {  if (!hasUser(user)) return this;
      //else
      users.remove(user);
      changed=true;
      return this;
   }
  
   /** Removes all users from the database.
     * @return this object */
   public Repository removeAllUsers()
   {  users.clear();
      changed=true;
      return this;
   }

   /** Gets the String value of this Object.
     * @return the String value */
   public String toString()
   {  String str="";
      for (Enumeration i=getUserBindings(); i.hasMoreElements(); )
      {  UserBindingInfo u=(UserBindingInfo)i.nextElement();
         str+=u.toString();
      }
      return str;
   }


   // **************** Methods of interface LocationService ****************

   /** Whether the user has contact <i>url</i>.
     * @param user the user name
     * @param url the contact URL
     * @return true if is the contact present */
   public boolean hasUserContact(String user, String url)
   {  if (!hasUser(user)) return false;
      //else
      return getUserBindingInfo(user).hasContact(url);
   }

   /** Adds a contact.
     * @param user the user name
     * @param contact the contact NameAddress
     * @param expire the contact expire Date
     * @return this object */
   public LocationService addUserContact(String user, NameAddress name_addresss, Date expire)
   {  if (!hasUser(user)) addUser(user);
      UserBindingInfo ur=getUserBindingInfo(user);
      ur.addContact(name_addresss,expire);
      changed=true;
      return this;
   }

   /** Removes a contact.
     * @param user the user name
     * @param url the contact URL
     * @return this object */
   public LocationService removeUserContact(String user, String url)
   {  if (!hasUser(user)) return this;
      //else
      UserBindingInfo ur=getUserBindingInfo(user);
      ur.removeContact(url);
      changed=true;
      return this;
   }   
   
   /** Gets the user contacts that are not expired.
     * @param user the user name
     * @return the list of contact URLs as Enumeration of String */
   public Enumeration getUserContactURLs(String user)
   {  if (!hasUser(user)) return null;
      //else
      changed=true;
      return getUserBindingInfo(user).getContacts();
   }

   /** Gets NameAddress value of the user contact.
     * @param user the user name
     * @param url the contact URL
     * @return the contact NameAddress */
   public NameAddress getUserContactNameAddress(String user, String url)
   {  if (!hasUser(user)) return null;
      //else
      return getUserBindingInfo(user).getNameAddress(url);
   }

   /** Gets expiration date of the user contact.
     * @param user the user name
     * @param url the contact URL
     * @return the contact expire Date */
   public Date getUserContactExpirationDate(String user, String url)
   {  if (!hasUser(user)) return null;
      //else
      return getUserBindingInfo(user).getExpirationDate(url);
   }
   
   /** Whether the contact is expired.
     * @param user the user name
     * @param url the contact URL
     * @return true if it has expired */
   public boolean isUserContactExpired(String user, String url)
   {  if (!hasUser(user)) return true;
      //else
      return getUserBindingInfo(user).isExpired(url);
   }
   
   /** Gets the String value of user information.
     * @return the String value for that user */
   /*public String userToString(String user)
   {  return getUserBindingInfo(user).toString();
   }*/

   /** Removes all contacts from the database.
     * @return this object */
   public LocationService removeAllContacts()
   {  for (Enumeration i=getUserBindings(); i.hasMoreElements(); )
      {  ((UserBindingInfo)i.nextElement()).removeContacts();
      }
      changed=true;
      return this;
   }


   // ***************************** Private methods *****************************

   /** Returns the name of the database. */
   private String getName() { return filename; }

   /** Whether the database is changed. */
   private boolean isChanged() { return changed; }


   /** Adds a user record in the database */
   private void addUserBindingInfo(UserBindingInfo ur)
   {  if (hasUser(ur.getName())) removeUser(ur.getName());
      users.put(ur.getName(),ur);
   }
   
   /** Adds a user record in the database */
   private UserBindingInfo getUserBindingInfo(String user)
   {  return (UserBindingInfo)users.get(user);  
   }

   /** Returns an enumeration of the values in this database */
   private Enumeration getUserBindings()
   {  return users.elements();
   }
   
   /** Loads the database */
   private void load()
   {  BufferedReader in=null;
      changed=false;
      try { in = new BufferedReader(new FileReader(filename)); }
      catch (FileNotFoundException e)
      {  System.err.println("WARNING: file \""+filename+"\" not found: created new empty DB");
         return;
      }   
      String user=null;
      NameAddress name_address=null;
      Date expire=null;
      while (true)
      {  String line=null;
         try { line=in.readLine(); }
            catch (Exception e) { e.printStackTrace(); System.exit(0); }   
         if (line==null)
            break;
         if (line.startsWith("#"))
            continue;
         if (line.startsWith("To"))
         {  Parser par=new Parser(line);
            user=par.skipString().getString();
            //System.out.println("add user: "+user);
            addUser(user);
            continue;
         }
         if (line.startsWith(SipHeaders.Contact))
         {  SipParser par=new SipParser(line);
            name_address=((SipParser)par.skipString()).getNameAddress();
            //System.out.println("DEBUG: "+name_address);
            expire=(new SipParser(par.goTo("expires=").skipN(8).getStringUnquoted())).getDate(); 
            //System.out.println("DEBUG: "+expire);
            getUserBindingInfo(user).addContact(name_address,expire);
            continue;
         }  
      }
      try { in.close(); } catch (Exception e) { e.printStackTrace(); } 
   }
 
 
   /** Saves the database */
   private void save()
   {  BufferedWriter out=null;
      changed=false;
      try
      {  out=new BufferedWriter(new FileWriter(filename));
         out.write(this.toString());
         out.close();
      }
      catch (IOException e)
      {  System.err.println("WARNING: error trying to write on file \""+filename+"\"");
         return;
      }
   }
   
}


/** User's binding info.
  * This class represents a user record of the location DB.
  * <p> A UserBindingInfo contains the user name, and a set of
  * contact information (i.e. contact and expire-time).
  * <p> Method getContacts() returns an Enumeration of String values
  * rapresenting the various contact SipURLs.
  * Such values can be used as keys for getting for each contact
  * both the contact NameAddress and the expire Date. 
  */
class UserBindingInfo
{
   /** User name */
   String name;
   
   /** Hashtable of ContactHeader with String as key. */
   Hashtable contact_list;
   
   /** Costructs a new UserBindingInfo for user <i>name</i>.
     * @param name the user name */
   public UserBindingInfo(String name)
   {  this.name=name;
      contact_list=new Hashtable();
   }
   
   /** Gets the user name.
     * @return the user name */
   public String getName()
   {  return name;
   }
  
   /** Gets the user contacts.
     * @return the user contacts as an Enumeration of String */
   public Enumeration getContacts()
   {  return contact_list.keys();
   }

   /** Whether the user has any registered contact.
     * @param url the contact url (String) 
     * @return true if one or more contacts are present */
   public boolean hasContact(String url)
   {  return contact_list.containsKey(url);
   }
   
   /** Adds a new contact.
     * @param contact the contact address (NameAddress) 
     * @param expire the expire value (Date) 
     * @return this object */
   public UserBindingInfo addContact(NameAddress contact, Date expire)
   {  contact_list.put(contact.getAddress().toString(),(new ContactHeader(contact)).setExpires(expire));
      return this;
   }
 
   /** Removes a contact.
     * @param url the contact url (String) 
     * @return this object */
   public UserBindingInfo removeContact(String url)
   {  if (contact_list.containsKey(url)) contact_list.remove(url);
      return this;
   }  
   
   /** Removes all contacts.
     * @return this object */
   public UserBindingInfo removeContacts()
   {  contact_list.clear();
      return this;
   }

   /** Gets NameAddress of a contact.
     * @param url the contact url (String) 
     * @return the contact NameAddress, or null if the contact is not present */
   public NameAddress getNameAddress(String url)
   {  if (contact_list.containsKey(url)) return ((ContactHeader)contact_list.get(url)).getNameAddress();
      else return null;
   }

   /** Whether the contact is expired.
     * @param url the contact url (String) 
     * @return true if the contact is expired or contact does not exist */
   public boolean isExpired(String url)
   {  if (contact_list.containsKey(url)) return ((ContactHeader)contact_list.get(url)).isExpired();
      else return true;
   }
   
   /** Gets expiration date.
     * @param url the contact url (String) 
     * @return the expire Date */
   public Date getExpirationDate(String url)
   {  ContactHeader contact=(ContactHeader)contact_list.get(url);
      //System.out.println("DEBUG: UserBindingInfo: ContactHeader: "+contact.toString());
      //System.out.println("DEBUG: UserBindingInfo: expires param: "+contact.getParameter("expires"));
      if (contact_list.containsKey(url)) return ((ContactHeader)contact_list.get(url)).getExpiresDate();
      else return null;
   }
   
   /** Gets the String value of this Object.
     * @return the String value */
   public String toString()
   {  String str="To: "+name+"\r\n";
      for (Enumeration i=getContacts(); i.hasMoreElements(); )
      {  ContactHeader ch=(ContactHeader)contact_list.get(i.nextElement());
         str+=ch.toString();
      }
      return str;
   }
}

