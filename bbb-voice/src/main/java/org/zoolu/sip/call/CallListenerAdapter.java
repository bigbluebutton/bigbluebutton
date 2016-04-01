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

package org.zoolu.sip.call;

import org.zoolu.sip.address.NameAddress;
import org.zoolu.sip.message.Message;
import org.zoolu.sdp.*;
import java.util.Vector;


/** Class CallListenerAdapter implements CallListener interface
  * providing a dummy implementation of all Call callback functions used to capture Call events.
  * <p> CallListenerAdapter can be extended to manage basic SIP calls.
  * The callback methods defined in this class have basically a void implementation.
  * This class exists as convenience for creating call listener objects. 
  * <br> You can extend this class overriding only methods corresponding to events
  * you want to handle.
  * <p> <i>onCallIncoming(NameAddress,String)</i> is the only non-empty method.
  * It signals the receiver the ring status (by using method Call.ring()),
  * adapts the sdp body and accepts the call (by using method Call.accept(sdp)). 
  */
public abstract class CallListenerAdapter implements ExtendedCallListener
{   
      
   // ************************** Costructors ***************************

   /** Creates a new dummy call listener */
   protected CallListenerAdapter()
   {
   }
   
   
   // ************************* Static methods *************************
  
   /** Changes the current session descriptor specifing the receiving RTP/UDP port number, the AVP format, the codec, and the clock rate */
   /*public static String audioSession(int port, int avp, String codec, int rate)
   {  
   		SessionDescriptor sdp=new SessionDescriptor();
      	sdp.addMedia(new MediaField("audio ",port,0,"RTP/AVP",String.valueOf(avp)),new AttributeField("rtpmap",avp+" "+codec+"/"+rate));
      	return sdp.toString();
   }*/

   /** Changes the current session descriptor specifing the receiving RTP/UDP port number, the AVP format, the codec, and the clock rate */
   /*public static String audioSession(int port)
   {  
   		return audioSession(port,0,"PCMU",8000);
   }*/


   // *********************** Callback functions ***********************

   /** Accepts an incoming call.
     * Callback function called when arriving a new INVITE method (incoming call) */
   public void onCallIncoming(Call call, NameAddress callee, NameAddress caller, String sdp, Message invite)
   {  
	   //printLog("INCOMING");
	   call.ring();
	   String local_session;
	   if (sdp!=null && sdp.length()>0)
	   {  
		   SessionDescriptor remote_sdp = new SessionDescriptor(sdp);     
		   SessionDescriptor local_sdp = new SessionDescriptor(call.getLocalSessionDescriptor());
		   SessionDescriptor new_sdp = new SessionDescriptor(remote_sdp.getOrigin(),remote_sdp.getSessionName(),local_sdp.getConnection(),local_sdp.getTime());
		   new_sdp.addMediaDescriptors(local_sdp.getMediaDescriptors());
		   new_sdp = SdpTools.sdpMediaProduct(new_sdp,remote_sdp.getMediaDescriptors());
		   new_sdp = SdpTools.sdpAttirbuteSelection(new_sdp,"rtpmap");
		   local_session = new_sdp.toString();
      }
      else local_session=call.getLocalSessionDescriptor();
      // accept immediatly
      call.accept(local_session);
   }

   /** Changes the call when remotly requested.
     * Callback function called when arriving a new Re-INVITE method (re-inviting/call modify) */
   public void onCallModifying(Call call, String sdp, Message invite)
   {  
	   //printLog("RE-INVITE/MODIFY");
	   String local_session;
      local_session=call.getLocalSessionDescriptor();
      // accept immediatly
      call.accept(local_session);
   }

   /** Does nothing.
     * Callback function called when arriving a 180 Ringing */
   public void onCallRinging(Call call, Message resp)
   {  //printLog("RINGING");
   }

   /** Does nothing.
     * Callback function called when arriving a 2xx (call accepted) */
   public void onCallAccepted(Call call, String sdp, Message resp)
   {  //printLog("ACCEPTED/CALL");
   }

   /** Does nothing.
     * Callback function called when arriving a 4xx (call failure) */
   public void onCallRefused(Call call, String reason, Message resp)
   {  //printLog("REFUSED ("+reason+")");
   }

   /** Redirects the call when remotly requested.
     * Callback function called when arriving a 3xx (call redirection) */
   public void onCallRedirection(Call call, String reason, Vector contact_list, Message resp)
   {  //printLog("REDIRECTION ("+reason+")");
      call.call((String)contact_list.elementAt(0)); 
   }

   /** Does nothing.
     * Callback function called when arriving an ACK method (call confirmed) */
   public void onCallConfirmed(Call call, String sdp, Message ack)
   {  //printLog("CONFIRMED/CALL");
   }

   /** Does nothing.
     * Callback function called when the invite expires */
   public void onCallTimeout(Call call)
   {  //printLog("TIMEOUT/CLOSE");
   }   

   /** Does nothing.
     * Callback function called when arriving a 2xx (re-invite/modify accepted) */
   public void onCallReInviteAccepted(Call call, String sdp, Message resp)
   {  //printLog("RE-INVITE-ACCEPTED/CALL");
   }

   /** Does nothing.
     * Callback function called when arriving a 4xx (re-invite/modify failure) */
   public void onCallReInviteRefused(Call call, String reason, Message resp)
   {  //printLog("RE-INVITE-REFUSED ("+reason+")/CALL");
   }

   /** Does nothing.
     * Callback function called when a re-invite expires */
   public void onCallReInviteTimeout(Call call)
   {  //printLog("RE-INVITE-TIMEOUT/CALL");
   }   

   /** Does nothing.
     * Callback function called when arriving a CANCEL request */
   public void onCallCanceling(Call call, Message cancel)
   {  //printLog("CANCELING");
   }

   /** Does nothing.
     * Callback function that may be overloaded (extended). Called when arriving a BYE request */
   public void onCallClosing(Call call, Message bye)
   {  //printLog("CLOSING");
   }

   /** Does nothing.
     * Callback function that may be overloaded (extended). Called when arriving a response for a BYE request (call closed) */
   public void onCallClosed(Call call, Message resp)
   {  //printLog("CLOSED");
   }


   /** Does nothing.
     * Callback function called when arriving a new REFER method (transfer request) */
   public void onCallTransfer(ExtendedCall call, NameAddress refer_to, NameAddress refered_by, Message refer)
   {  //printLog("REFER-TO/TRANSFER");
   }

   /** Does nothing.
     * Callback function called when a call transfer is accepted. */
   public void onCallTransferAccepted(ExtendedCall call, Message resp)
   {
   }

   /** Does nothing.
     * Callback function called when a call transfer is refused. */
   public void onCallTransferRefused(ExtendedCall call, String reason, Message resp)
   {
   }

   /** Does nothing.
     * Callback function called when a call transfer is successfully completed */
   public void onCallTransferSuccess(ExtendedCall call, Message notify)
   {  //printLog("TRANSFER SUCCESS");
   }

   /** Does nothing.
     * Callback function called when a call transfer is NOT sucessfully completed */
   public void onCallTransferFailure(ExtendedCall call, String reason, Message notify)
   {  //printLog("TRANSFER FAILURE");
   }

}
