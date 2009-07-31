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


import org.zoolu.net.SocketAddress;
import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.*;
import org.zoolu.sip.header.SipHeaders;
import org.zoolu.sip.header.Header;
import org.zoolu.sip.header.ToHeader;
import org.zoolu.sip.header.ViaHeader;
import org.zoolu.sip.header.ExpiresHeader;
import org.zoolu.sip.header.StatusLine;
import org.zoolu.sip.header.ContactHeader;
import org.zoolu.sip.header.MultipleHeader;
import org.zoolu.sip.header.WwwAuthenticateHeader;
import org.zoolu.sip.header.AuthorizationHeader;
import org.zoolu.sip.header.AuthenticationInfoHeader;
import org.zoolu.sip.transaction.TransactionServer;
import org.zoolu.sip.message.Message;
import org.zoolu.sip.message.MessageFactory;
import org.zoolu.sip.message.SipResponses;
import org.zoolu.tools.Parser;
import org.zoolu.tools.LogLevel;
import org.zoolu.tools.DateFormat;

import java.util.Date;
//import java.util.Locale;
//import java.text.DateFormat;
//import java.text.SimpleDateFormat;
import java.util.Vector;
import java.util.Enumeration;


/** Class Registrar implements a Registrar SIP Server.
  * It extends class ServerEngine.
  */
public class Registrar extends ServerEngine
{   
   /** LocationService. */
   protected LocationService location_service;

   /** AuthenticationService (i.e. the repository with authentication credentials). */
   protected AuthenticationService authentication_service;

   /** AuthenticationServer. */
   protected AuthenticationServer as;
   
   /** List of already supported location services */
   protected static final String[] LOCATION_SERVICES={ "local", "ldap" };
   /** List of location service Classes (ordered as in <i>LOCATION_SERVICES</i>) */
   protected static final String[] LOCATION_SERVICE_CLASSES={ "local.server.LocationServiceImpl", "local.ldap.LdapLocationServiceImpl" };

   /** List of already supported authentication services */
   protected static final String[] AUTHENTICATION_SERVICES={ "local", "ldap" };
   /** List of authentication service Classes (ordered as in <i>AUTHENTICATION_SERVICES</i>) */
   protected static final String[] AUTHENTICATION_SERVICE_CLASSES={ "local.server.AuthenticationServiceImpl", "local.ldap.LdapAuthenticationServiceImpl" };

   /** List of already supported authentication schemes */
   protected static final String[] AUTHENTICATION_SCHEMES={ "Digest" };
   /** List of authentication server Classes (ordered as in <i>AUTHENTICATION_SCHEMES</i>) */
   protected static final String[] AUTHENTICATION_SERVER_CLASSES={ "local.server.AuthenticationServerImpl" };

   
   /** Costructs a void Registrar. */
   protected Registrar() {}
   
   
   /** Costructs a new Registrar. The Location Service is stored within the file <i>db_name</i> */
   //public Registrar(SipProvider provider, String db_class, String db_name)
   public Registrar(SipProvider provider, ServerProfile profile)
   {  super(provider,profile);
      printLog("Domains="+getLocalDomains(),LogLevel.HIGH);

      // location service
      String location_service_class=profile.location_service;
      for (int i=0; i<LOCATION_SERVICES.length; i++)
         if (LOCATION_SERVICES[i].equalsIgnoreCase(profile.location_service)) {  location_service_class=LOCATION_SERVICE_CLASSES[i];  break;  }
      try
      {  Class myclass=Class.forName(location_service_class);
         Class[] parameter_types={ Class.forName("java.lang.String") };
         Object[] parameters={ profile.location_db };
         try 
         {  java.lang.reflect.Constructor constructor=myclass.getConstructor(parameter_types);
            location_service=(LocationService)constructor.newInstance(parameters);
         }
         catch (NoSuchMethodException e)
         {  printException(e,LogLevel.MEDIUM);
            location_service=(LocationService)myclass.newInstance();
         }
      }
      catch (Exception e)
      {  printException(e,LogLevel.HIGH);
         printLog("Error trying to use location service '"+location_service_class+"': use default class.",LogLevel.HIGH);
      }
      // use default location service
      if (location_service==null) location_service=new LocationServiceImpl(profile.location_db);   
      // do clean all?
      if (profile.clean_location_db) 
      {  printLog("LocationService \""+profile.location_db+"\": cleaned\r\n",LogLevel.MEDIUM);
         location_service.removeAllContacts();
         location_service.sync();
      }
      else
      { // remove all expired contacts
         boolean changed=false;    
         for (Enumeration u=location_service.getUsers(); u.hasMoreElements(); )
         {  String user=(String)u.nextElement();
            for (Enumeration c=location_service.getUserContactURLs(user); c.hasMoreElements(); )
            {  String contact=(String)c.nextElement();
               if ((changed=location_service.isUserContactExpired(user,contact))==true) location_service.removeUserContact(user,contact);
            }
            // Note: uncomment the next line, if you want that 'unbound' users (i.e. without registered contacts) are automatically removed
            //if (!location_service.getUserContacts(user).hasMoreElements()) location_service.removeUser(user);   
         }
         if (changed) location_service.sync();
      }  
      printLog("LocationService ("+profile.authentication_service+"): size="+location_service.size()+"\r\n"+location_service.toString(),LogLevel.MEDIUM);

      // authentication server
      if (server_profile.do_authentication || server_profile.do_proxy_authentication)
      {  // first, init the proper authentication service
         String realm=(server_profile.authentication_realm!=null)? server_profile.authentication_realm : sip_provider.getViaAddress();
         String authentication_service_class=profile.authentication_service;
         for (int i=0; i<AUTHENTICATION_SERVICES.length; i++)
            if (AUTHENTICATION_SERVICES[i].equalsIgnoreCase(profile.authentication_service)) {  authentication_service_class=AUTHENTICATION_SERVICE_CLASSES[i];  break;  }
         try
         {  Class myclass=Class.forName(authentication_service_class);
            Class[] parameter_types={ Class.forName("java.lang.String") };
            Object[] parameters={ profile.authentication_db };
            try 
            {  java.lang.reflect.Constructor constructor=myclass.getConstructor(parameter_types);
               authentication_service=(AuthenticationService)constructor.newInstance(parameters);
            }
            catch (NoSuchMethodException e)
            {  printException(e,LogLevel.MEDIUM);
               authentication_service=(AuthenticationService)myclass.newInstance();
            }
         }
         catch (Exception e)
         {  printException(e,LogLevel.HIGH);
            printLog("Error trying to use authentication service '"+authentication_service_class+"': use default class.",LogLevel.HIGH);
         }
         // use default authentication service
         if (authentication_service==null) authentication_service=new AuthenticationServiceImpl(server_profile.authentication_db);
         printLog("AuthenticationService ("+profile.authentication_service+"): size="+authentication_service.size()+"\r\n"+authentication_service.toString(),LogLevel.MEDIUM);
         
         // now, init the proper authentication server
         String authentication_server_class=profile.authentication_scheme;
         for (int i=0; i<AUTHENTICATION_SCHEMES.length; i++)
            if (AUTHENTICATION_SCHEMES[i].equalsIgnoreCase(profile.authentication_scheme)) {  authentication_server_class=AUTHENTICATION_SERVER_CLASSES[i];  break;  }
         try
         {  Class myclass=Class.forName(authentication_server_class);
            Class[] parameter_types={ Class.forName("java.lang.String"), Class.forName("local.server.AuthenticationService"), Class.forName("org.zoolu.tools.Log") };
            Object[] parameters={ realm, authentication_service, sip_provider.getLog() };
            try
            {  java.lang.reflect.Constructor constructor=myclass.getConstructor(parameter_types);
               as=(AuthenticationServer)constructor.newInstance(parameters);
            }
            catch (NoSuchMethodException e)
            {  printException(e,LogLevel.MEDIUM);
               as=(AuthenticationServer)myclass.newInstance();
            }
         }
         catch (Exception e)
         {  printException(e,LogLevel.HIGH);
            printLog("Error trying to use authentication server '"+authentication_server_class+"': use default class.",LogLevel.HIGH);
         }
         // use default authentication service
         if (as==null) as=new AuthenticationServerImpl(realm,authentication_service,sip_provider.getLog());
         printLog("AuthenticationServer: scheme: "+profile.authentication_scheme,LogLevel.MEDIUM);
         printLog("AuthenticationServer: realm: "+profile.authentication_realm,LogLevel.MEDIUM);
      }
      else as=null;
   }
 
   
   /** When a new request is received for the local server. */
   public void processRequestToLocalServer(Message msg)
   {  
      printLog("inside processRequestToLocalServer(msg)",LogLevel.MEDIUM);
      if (server_profile.is_registrar && msg.isRegister())
      {  TransactionServer t=new TransactionServer(sip_provider,msg,null);
         //t.listen();
   
         if (server_profile.do_authentication)
         {  // check message authentication
            Message err_resp=as.authenticateRequest(msg);  
            if (err_resp!=null)
            {  t.respondWith(err_resp);
               return;
            }
         }
         
         Message resp=updateRegistration(msg);
         if (resp==null) return;
         
         if (server_profile.do_authentication)
         {  // add Authentication-Info header field
            resp.setAuthenticationInfoHeader(as.getAuthenticationInfoHeader());
         }
         
         t.respondWith(resp);
      }
      else
      if (!msg.isAck())
      {  // send a stateless error response
         int result=501; // response code 501 ("Not Implemented")
         Message resp=MessageFactory.createResponse(msg,result,SipResponses.reasonOf(result),null);
         sip_provider.sendMessage(resp);
      }     
   }


   /** When a new request message is received for a local user. */
   public void processRequestToLocalUser(Message msg)
   {  printLog("inside processRequestToLocalUser(msg)",LogLevel.MEDIUM);
      // stateless-response (in order to avoid DoS attacks)
      if (!msg.isAck()) sip_provider.sendMessage(MessageFactory.createResponse(msg,404,SipResponses.reasonOf(404),null));
      else printLog("message discarded",LogLevel.HIGH);
   }
 
   
   /** When a new request message is received for a remote UA. */
   public void processRequestToRemoteUA(Message msg)
   {  printLog("inside processRequestToRemoteUA(msg)",LogLevel.MEDIUM);
      // stateless-response (in order to avoid DoS attacks)
      if (!msg.isAck()) sip_provider.sendMessage(MessageFactory.createResponse(msg,404,SipResponses.reasonOf(404),null));
      else printLog("message discarded",LogLevel.HIGH);
   }


   /** When a new response message is received. */
   public void processResponse(Message resp)
   {  printLog("inside processResponse(msg)",LogLevel.MEDIUM);
      // no actions..
      printLog("message discarded",LogLevel.HIGH);
   }
   
   
   // *********************** protected methods ***********************

   /** Gets the request's targets as Vector of String.
     * @return It returns a Vector of String representing the target URLs. */
   protected Vector getTargets(Message msg)
   {  printLog("inside getTargets(msg)",LogLevel.LOW);

      Vector targets=new Vector();
      
      if (location_service==null)
      {  printLog("Location service is not active",LogLevel.HIGH);
         return targets;
      }           

      SipURL request_uri=msg.getRequestLine().getAddress();
      String username=request_uri.getUserName();
      if (username==null)
      {  printLog("no username found",LogLevel.HIGH);
         return targets;
      }
      String user=username+"@"+request_uri.getHost();
      printLog("user: "+user,LogLevel.MEDIUM); 
           
      if (!location_service.hasUser(user))
      {  printLog("user "+user+" not found",LogLevel.HIGH);
         return targets;
      }

      SipURL to_url=msg.getToHeader().getNameAddress().getAddress();
      
      Enumeration e=location_service.getUserContactURLs(user);
      printLog("message targets: ",LogLevel.LOW);  
      for (int i=0; e.hasMoreElements(); i++)
      {  // if exipred, remove the contact url
         String url=(String)e.nextElement();
         if (location_service.isUserContactExpired(user,url))
         {  location_service.removeUserContact(user,url);
            printLog("target"+i+" expired: contact url removed",LogLevel.LOW);
         }
         // otherwise add the url to the target list
         else
         {  targets.addElement(url);
            printLog("target"+i+"="+targets.elementAt(i),LogLevel.LOW);
         }
      }       
      return targets;
   }


   /** Updates the registration of a local user.
     * @return it returns the response message for the registration. */
   protected Message updateRegistration(Message msg)
   {  ToHeader th=msg.getToHeader();
      if (th==null)  
      {  printLog("ToHeader missed: message discarded",LogLevel.HIGH);
         int result=400;
         return MessageFactory.createResponse(msg,result,SipResponses.reasonOf(result),null);  
      }         
      SipURL dest_uri=th.getNameAddress().getAddress();
      String user=dest_uri.getUserName()+"@"+dest_uri.getHost();

      int exp_secs=server_profile.expires;
      // set the expire value
      ExpiresHeader eh=msg.getExpiresHeader();
      if (eh!=null)
      {  exp_secs=eh.getDeltaSeconds();
      }
      // limit the expire value
      if (exp_secs<0) exp_secs=0;
      else
      if (exp_secs>server_profile.expires) exp_secs=server_profile.expires;

      // known user?
      if (!location_service.hasUser(user))
      {  if (server_profile.register_new_users)
         {  location_service.addUser(user);
            printLog("new user '"+user+"' added.",LogLevel.HIGH);
         } 
         else
         {  printLog("user '"+user+"' unknown: message discarded.",LogLevel.HIGH);
            int result=404;
            return MessageFactory.createResponse(msg,result,SipResponses.reasonOf(result),null);  
         }
      }

      // Get the "device" parameter. Set device=null if not present or not supported
      //String device=null;
      // if (msg.hasApplicationHeader()) app=msg.getApplicationHeader().getApplication();
      SipURL to_url=msg.getToHeader().getNameAddress().getAddress();
      //if (to_url.hasParameter("device")) device=to_url.getParameter("device");

      if (!msg.hasContactHeader())  
      {  //printLog("ContactHeader missed: message discarded",LogLevel.HIGH);
         //int result=484;
         //return MessageFactory.createResponse(msg,result,SipResponses.reasonOf(result),null,null);  
         printLog("no contact found: fetching bindings..",LogLevel.MEDIUM);
         int result=200;
         Message resp=MessageFactory.createResponse(msg,result,SipResponses.reasonOf(result),null);  
         // add current contacts
         Vector v=new Vector();
         for (Enumeration e=location_service.getUserContactURLs(user); e.hasMoreElements(); )
         {  String url=(String)e.nextElement();
            int expires=(int)(location_service.getUserContactExpirationDate(user,url).getTime()-System.currentTimeMillis())/1000;
            if (expires>0)
            {  // not expired
               ContactHeader ch=new ContactHeader(location_service.getUserContactNameAddress(user,url));
               ch.setExpires(expires);
               v.addElement(ch);
            }
         }
         if (v.size()>0) resp.setContacts(new MultipleHeader(v));
         return resp;
      }
      // else     

      Vector contacts=msg.getContacts().getHeaders();
      int result=200;
      Message resp=MessageFactory.createResponse(msg,result,SipResponses.reasonOf(result),null);  

      ContactHeader contact_0=new ContactHeader((Header)contacts.elementAt(0));
      if (contact_0.isStar())
      {  printLog("DEBUG: ContactHeader is star",LogLevel.LOW);
         Vector resp_contacts=new Vector();
         for (Enumeration e=location_service.getUserContactURLs(user); e.hasMoreElements();) 
         {  String url=(String)(e.nextElement());
            NameAddress name_address=location_service.getUserContactNameAddress(user,url);
            // update db
            location_service.removeUserContact(user,url);
            printLog("contact removed: "+url,LogLevel.LOW);
            if (exp_secs>0)
            {  Date exp_date=new Date(System.currentTimeMillis()+((long)exp_secs)*1000);
               location_service.addUserContact(user,name_address,exp_date);
               //DateFormat df=new SimpleDateFormat("EEE, dd MMM yyyy hh:mm:ss 'GMT'",Locale.ITALIAN);
               //printLog("contact added: "+url+"; expire: "+df.format(location_service.getUserContactExpire(user,url)),LogLevel.LOW);
               printLog("contact added: "+url+"; expire: "+DateFormat.formatEEEddMMM(location_service.getUserContactExpirationDate(user,url)),LogLevel.LOW);
            }
            ContactHeader contact_i=new ContactHeader(name_address.getAddress());
            contact_i.setExpires(exp_secs);
            resp_contacts.addElement(contact_i);
         }
         if (resp_contacts.size()>0) resp.setContacts(new MultipleHeader(resp_contacts));
      }
      else
      {  Vector resp_contacts=new Vector();
         for (int i=0; i<contacts.size(); i++)     
         {  ContactHeader contact_i=new ContactHeader((Header)contacts.elementAt(i));
            NameAddress name_address=contact_i.getNameAddress();     
            String url=name_address.getAddress().toString();     
            int exp_secs_i=exp_secs;
            if (contact_i.hasExpires()) 
            {  exp_secs_i=contact_i.getExpires();
            }
            // limit the expire value
            if (exp_secs_i<0) exp_secs_i=0;
            else
            if (exp_secs_i>server_profile.expires) exp_secs_i=server_profile.expires;
                        
            // update db
            location_service.removeUserContact(user,url);
            if (exp_secs_i>0)
            {  Date exp_date=new Date(System.currentTimeMillis()+((long)exp_secs)*1000);
               location_service.addUserContact(user,name_address,exp_date);
               printLog("registration of user "+user+" updated",LogLevel.HIGH);
            }           
            contact_i.setExpires(exp_secs_i);
            resp_contacts.addElement(contact_i);
         }
         if (resp_contacts.size()>0) resp.setContacts(new MultipleHeader(resp_contacts));
      }

      location_service.sync();  
      return resp;
   }


   // ****************************** Logs *****************************

   /** Adds a new string to the default Log. */
   private void printLog(String str, int level)
   {  if (log!=null) log.println("Registrar: "+str,level+SipStack.LOG_LEVEL_UA);  
   }

   /** Adds the Exception message to the default Log */
   private final void printException(Exception e, int level)
   {  if (log!=null) log.printException(e,level+SipStack.LOG_LEVEL_UA);
   }
  

   // ****************************** MAIN *****************************

   /** The main method. */
   public static void main(String[] args)
   {  
         
      String file=null;
      
      for (int i=0; i<args.length; i++)
      {  if (args[i].equals("-f") && args.length>(i+1))
         {  file=args[++i];
            continue;
         }
         if (args[i].equals("-h"))
         {  System.out.println("usage:\n   java Registrar [-f <config_file>] \n");
            System.exit(0);
         }
      }
                  
      SipStack.init(file);
      SipProvider sip_provider=new SipProvider(file);
      ServerProfile server_profile=new ServerProfile(file);
      
      new Registrar(sip_provider,server_profile);
   }
}