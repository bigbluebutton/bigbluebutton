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

package local.ua;


import org.zoolu.sip.address.*;
import org.zoolu.sip.provider.*;
import org.zoolu.sip.dialog.*;
import org.zoolu.sip.header.StatusLine;
import org.zoolu.sip.message.*;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;

import java.io.*;


/** Simple Presence Agent (PA).
  * <br/> It allows a user to subscribe for a presentity acting as presence watcher, or
  * respond to subscription requests (accepting or refusiong the incoming watcher's
  * requests) acting as presentity that watchers can subscribe for.
  * <br/> In the latter case, it simply acts as authorization entity for subscription events.
  */
public class PresenceAgent implements /*SipInterfaceListener, */SubscriberDialogListener, NotifierDialogListener
{     
   /** Event logger. */
   protected Log log;

   /** UserProfile */
   protected UserAgentProfile user_profile;

   /** SipProvider */
   protected SipProvider sip_provider;

   /** SipInterface to message MESSAGE. */
   //protected SipInterface sip_interface;

   /** SubscriberDialog. */
   protected SubscriberDialog subscriber_dialog;

   /** NotifierDialog. */
   protected NotifierDialog notifier_dialog;

   /** Presence listener */
   protected PresenceAgentListener listener;

   
   /** Costructs a new PresenceAgent. */
   public PresenceAgent(SipProvider sip_provider, UserAgentProfile user_profile, PresenceAgentListener listener)
   {  this.sip_provider=sip_provider;
      this.log=sip_provider.getLog();
      this.listener=listener;
      this.user_profile=user_profile;
      // if no contact_url and/or from_url has been set, create it now
      user_profile.initContactAddress(sip_provider);
      
      notifier_dialog=new NotifierDialog(sip_provider,this);
      notifier_dialog.listen();
   }   

   
   /** Subscribes for a presentity. */
   public void subscribe(String presentity, int expires)
   {  if (subscriber_dialog==null) subscriber_dialog=new SubscriberDialog(sip_provider,"presence",null,this);
      if (expires<0) expires=SipStack.default_expires;
      subscriber_dialog.subscribe(presentity,user_profile.from_url,user_profile.contact_url,expires);
   }


   /** Notify a watcher of "pending" state. */
   /*public void pending()
   {  notifier_dialog.pending();
   }*/


   /** Notify a watcher of "active" state. */
   public void accept()
   {  notifier_dialog.accept(user_profile.expires,user_profile.contact_url);
   }


   /** Notify a watcher of "active" state. */
   public void activate()
   {  notifier_dialog.activate();
   }


   /** Notify a watcher of "terminate" state. */
   public void terminate()
   {  notifier_dialog.terminate();
   }


   /** Notify a watcher. */
   public void notify(String state, int expires, String content_type, String body)
   {  notifier_dialog.notify(state,expires,content_type,body);
   }


   // ******************* Callback functions implementation ********************


   /** When a 2xx successfull final response is received for an SUBSCRIBE transaction. */ 
   public void onDlgSubscriptionSuccess(SubscriberDialog dialog, int code, String reason, Message msg)
   {  printLog("onDlgSubscriptionSuccess()",LogLevel.MEDIUM);
      listener.onPaSubscriptionSuccess(this,dialog.getRemoteName());
   }

   /** When a 300-699 response is received for an SUBSCRIBE transaction. */ 
   public void onDlgSubscriptionFailure(SubscriberDialog dialog, int code, String reason, Message msg)
   {  printLog("onDlgSubscriptionFailure()",LogLevel.MEDIUM);
      listener.onPaSubscriptionTerminated(this,dialog.getRemoteName(),reason);
   }

   /** When SUBSCRIBE transaction expires without a final response. */ 
   public void onDlgSubscribeTimeout(SubscriberDialog dialog)
   {  printLog("onDlgSubscribeTimeout()",LogLevel.MEDIUM);
      listener.onPaSubscriptionTerminated(this,dialog.getRemoteName(),"Request Timeout");
   }

   /** When the dialog is terminated. */ 
   public void onDlgSubscriptionTerminated(SubscriberDialog dialog)
   {  printLog("onDlgSubscriptionTerminated()",LogLevel.MEDIUM);
      listener.onPaSubscriptionTerminated(this,dialog.getRemoteName(),"Terminated");
   }

   /** When an incoming NOTIFY is received. */ 
   public void onDlgNotify(SubscriberDialog dialog, NameAddress target, NameAddress notifier, NameAddress contact, String state, String content_type, String body, Message msg)
   {  printLog("onDlgNotify()",LogLevel.MEDIUM);
      listener.onPaNotificationRequest(this,target,notifier,state,content_type,body);
   }


   /** When an incoming SUBSCRIBE is received. */ 
   public void onDlgSubscribe(NotifierDialog dialog, NameAddress target, NameAddress subscriber, String event, String id, Message msg)
   {  printLog("onDlgSubscribe()",LogLevel.MEDIUM);
      notifier_dialog.pending();
      listener.onPaSubscriptionRequest(this,target,subscriber);
   }

   /** When NOTIFY transaction expires without a final response. */ 
   public void onDlgNotifyTimeout(NotifierDialog dialog)
   {  printLog("onDlgNotifyTimeout()",LogLevel.MEDIUM);
      listener.onPaNotificationFailure(this,dialog.getRemoteName(),"Request Timeout");
   }

   /** When a 300-699 response is received for a NOTIFY transaction. */ 
   public void onDlgNotificationFailure(NotifierDialog dialog, int code, String reason, Message msg)
   {  printLog("onDlgNotificationFailure()",LogLevel.MEDIUM);
      listener.onPaNotificationFailure(this,dialog.getRemoteName(),reason);
   }

   /** When a 2xx successfull final response is received for a NOTIFY transaction. */ 
   public void onDlgNotificationSuccess(NotifierDialog dialog, int code, String reason, Message msg)
   {  printLog("onDlgNotificationSuccess()",LogLevel.MEDIUM);
      // do nothing
   }


   //**************************** Logs ****************************/

   /** Adds a new string to the default Log */
   private void printLog(String str)
   {  printLog(str,LogLevel.HIGH);
   }

   /** Adds a new string to the default Log */
   private void printLog(String str, int level)
   {  if (log!=null) log.println("PresenceAgent: "+str,level+SipStack.LOG_LEVEL_UA);
      //System.out.println("PA: "+str);  
   }

}
