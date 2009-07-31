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

package org.zoolu.sip.dialog;


import org.zoolu.sip.address.*;
import org.zoolu.sip.message.*;
import org.zoolu.sip.header.*;
import org.zoolu.sip.provider.*;
import org.zoolu.tools.Log;
import org.zoolu.tools.LogLevel;
import org.zoolu.tools.AssertException;


import java.util.Vector;


/** Class DialogInfo maintains a complete information status of a generic SIP dialog.
  * It has the following attributes:
  * <ul>
  * <li>sip-provider</li>
  * <li>call-id</li>
  * <li>local and remote URLs</li>
  * <li>local and remote contact URLs</li>
  * <li>local and remote cseqs</li>
  * <li>local and remote tags</li> 
  * <li>dialog-id</li>
  * <li>route set</li>
  * </ul>
  */
public class DialogInfo
{  
   
   // ************************ Private attributes ************************

   /** Local name */
   NameAddress local_name;

   /** Remote name */
   NameAddress remote_name;

   /** Local contact url */
   NameAddress local_contact;

   /** Remote contact url */
   NameAddress remote_contact;

   /** Call-id */
   String call_id;

   /** Local tag */
   String local_tag;

   /** Remote tag */
   String remote_tag;
   /** Sets the remote tag */

   /** Local CSeq number */
   long local_cseq;

   /** Remote CSeq number */
   long remote_cseq;

   /** Route set (Vector of NameAddresses) */
   Vector route; 


   // **************************** Costructors *************************** 

   /** Creates a new empty DialogInfo */
   public DialogInfo()
   {  this.local_name=null;
      this.remote_name=null;
      this.local_contact=null;
      this.remote_contact=null;
      this.call_id=null;
      this.local_tag=null;
      this.remote_tag=null;
      this.local_cseq=-1;
      this.remote_cseq=-1;
      this.route=null; 
   }
 

   // ************************** Public methods **************************

   /** Sets the local name */
   public void setLocalName(NameAddress url) { local_name=url; }
   /** Gets the local name */
   public NameAddress getLocalName() { return local_name; }


   /** Sets the remote name */
   public void setRemoteName(NameAddress url) { remote_name=url; }
   /** Gets the remote name */
   public NameAddress getRemoteName() { return remote_name; }


   /** Sets the local contact url */
   public void setLocalContact(NameAddress name_address) { local_contact=name_address; }
   /** Gets the local contact url */
   public NameAddress getLocalContact() { return local_contact; }


   /** Sets the remote contact url */
   public void setRemoteContact(NameAddress name_address) { remote_contact=name_address; }
   /** Gets the remote contact url */
   public NameAddress getRemoteContact() { return remote_contact; }

  
   /** Sets the call-id */
   public void setCallID(String id) { call_id=id; }
   /** Gets the call-id */
   public String getCallID() { return call_id; }

   
   /** Sets the local tag */
   public void setLocalTag(String tag) { local_tag=tag; }
   /** Gets the local tag */
   public String getLocalTag() { return local_tag; }


   public void setRemoteTag(String tag) { remote_tag=tag; }
   /** Gets the remote tag */
   public String getRemoteTag() { return remote_tag; }

   
   /** Sets the local CSeq number */
   public void setLocalCSeq(long cseq) { local_cseq=cseq; }
   /** Increments the local CSeq number */
   public void incLocalCSeq() { local_cseq++; }
   /** Gets the local CSeq number */
   public long getLocalCSeq() { return local_cseq; }


   /** Sets the remote CSeq number */
   public void setRemoteCSeq(long cseq) { remote_cseq=cseq; }
   /** Increments the remote CSeq number */
   public void incRemoteCSeq() { remote_cseq++; }
   /** Gets the remote CSeq number */
   public long getRemoteCSeq() { return remote_cseq; }

   
   /** Sets the route set */
   public void setRoute(Vector r) { route=r; }
   /** Gets the route set */
   public Vector getRoute() { return route; }

}
