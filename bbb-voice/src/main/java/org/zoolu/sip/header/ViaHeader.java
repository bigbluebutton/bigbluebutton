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

package org.zoolu.sip.header;


import org.zoolu.sip.address.SipURL;
import org.zoolu.sip.provider.SipParser;


/** SIP Header Via.
  * The Via header field indicates the transport used for the transaction
  * and identifies the location where the response is to be sent. 
  * <BR> When the UAC creates a request, it MUST insert a Via into that
  * request.  The protocol name and protocol version in the header field
  * is SIP and 2.0, respectively.
  * <BR> The Via header field value MUST
  * contain a branch parameter.  This parameter is used to identify the
  * transaction created by that request.  This parameter is used by both
  * the client and the server.
  * <BR> The branch parameter value MUST be unique across space and time for
  * all requests sent by the UA.  The exceptions to this rule are CANCEL
  * and ACK for non-2xx responses.  A CANCEL request
  * will have the same value of the branch parameter as the request it
  * cancels.  An ACK for a non-2xx
  * response will also have the same branch ID as the INVITE whose
  * response it acknowledges.
  */
public class ViaHeader extends ParametricHeader
{
   protected static final String received_param="received";
   protected static final String rport_param="rport";
   protected static final String branch_param="branch";
   protected static final String maddr_param="maddr";
   protected static final String ttl_param="ttl";

   //public ViaHeader()
   //{  super(SipHeaders.Via);
   //}

   public ViaHeader(String hvalue)
   {  super(SipHeaders.Via,hvalue);
   }

   public ViaHeader(Header hd)
   {  super(hd);
   }

   public ViaHeader(String host, int port)
   {  super(SipHeaders.Via,"SIP/2.0/UDP "+host+":"+port);
   }

   /*public ViaHeader(String host, int port, String branch)
   {  super(SipHeaders.Via,"SIP/2.0/UDP "+host+":"+port+";branch="+branch);
   }*/

   public ViaHeader(String proto, String host, int port)
   {  super(SipHeaders.Via,"SIP/2.0/"+proto.toUpperCase()+" "+host+":"+port);
   }

   /*public ViaHeader(String proto, String host, int port, String branch)
   {  super(SipHeaders.Via,"SIP/2.0/"+proto.toUpperCase()+" "+host+":"+port+";branch="+branch);
   }*/

   /** Gets the transport protocol */
   public String getProtocol()
   {  SipParser par=new SipParser(value);
      return par.goTo('/').skipChar().goTo('/').skipChar().skipWSP().getString();
   }

   /** Gets "sent-by" parameter */
   public String getSentBy()
   {  SipParser par=new SipParser(value);
      par.goTo('/').skipChar().goTo('/').skipString().skipWSP();
      if (!par.hasMore()) return null;
      String sentby=value.substring(par.getPos(),par.indexOfSeparator());
      return sentby;
   }

   /** Gets host of ViaHeader */
   public String getHost()
   {  String sentby=getSentBy();
      SipParser par=new SipParser(sentby);
      par.goTo(':');
      if (par.hasMore()) return sentby.substring(0,par.getPos());
      else return sentby;
   }

   /** Returns boolean value indicating if ViaHeader has port */
   public boolean hasPort()
   {  String sentby=getSentBy();
      if (sentby.indexOf(":")>0) return true;
      return false;
   }
   
   /** Gets port of ViaHeader */
   public int getPort()
   {  SipParser par=new SipParser(getSentBy());
      par.goTo(':');
      if (par.hasMore()) return par.skipChar().getInt();
      return -1;
   }
   
   /** Makes a SipURL from ViaHeader */
   public SipURL getSipURL()
   {  return new SipURL(getHost(),getPort());
   }   
   
   /** Checks if "branch" parameter is present */
   public boolean hasBranch()
   {  return hasParameter(branch_param);
   }
   /** Gets "branch" parameter */
   public String getBranch()
   {  return getParameter(branch_param);
   }   
   /** Sets "branch" parameter */
   public void setBranch(String value)
   {  setParameter(branch_param,value);
   }   
          
   /** Checks if "received" parameter is present */
   public boolean hasReceived()
   {  return hasParameter(received_param);
   }
   /** Gets "received" parameter */
   public String getReceived()
   {  return getParameter(received_param);
   }     
   /** Sets "received" parameter */
   public void setReceived(String value)
   {  setParameter(received_param,value);
   }   

   /** Checks if "rport" parameter is present */
   public boolean hasRport()
   {  return hasParameter(rport_param);
   }
   /** Gets "rport" parameter */
   public int getRport()
   {  String value=getParameter(rport_param);
      if (value!=null) return Integer.parseInt(value);
      else return -1;
   }     
   /** Sets "rport" parameter */
   public void setRport()
   {  setParameter(rport_param,null);
   }   
   /** Sets "rport" parameter */
   public void setRport(int port)
   {  if (port<0) setParameter(rport_param,null);
      else setParameter(rport_param,Integer.toString(port));
   }

   /** Checks if "maddr" parameter is present */
   public boolean hasMaddr()
   {  return hasParameter(maddr_param);
   }
   /** Gets "maddr" parameter */
   public String getMaddr()
   {  return getParameter(maddr_param);
   }     
   /** Sets "maddr" parameter */
   public void setMaddr(String value)
   {  setParameter(maddr_param,value);
   }   

   /** Checks if "ttl" parameter is present */
   public boolean hasTtl()
   {  return hasParameter(ttl_param);
   }
   /** Gets "ttl" parameter */
   public int getTtl()
   {  String value=getParameter(ttl_param);
      if (value!=null) return Integer.parseInt(value);
      else return -1;
   }     
   /** Sets "ttl" parameter */
   public void setTtl(int ttl)
   {  setParameter(ttl_param,Integer.toString(ttl));
   } 

}
