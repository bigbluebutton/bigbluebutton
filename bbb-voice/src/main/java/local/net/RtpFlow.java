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

package local.net;


import java.net.DatagramSocket;
//import java.net.InetAddress;
//import java.net.UnknownHostException; 
//import org.zoolu.tools.Random;


/** This abstract class represents a RTP flow for sending or receiving rtp packets. 
 *  <p> A RtpFlow is always associated to a SSRC number that represents the source end point (the S-SAP).
 */
public abstract class RtpFlow
{

   /* version (V): 2 bits
      This field identifies the version of RTP.  The version defined by
      this specification is two (2). */
   static final int version=2;
     
   /* padding (P): 1 bit
      If the padding bit is set, the packet contains one or more
      additional padding octets at the end which are not part of the
      payload.  The last octet of the padding contains a count of how
      many padding octets should be ignored, including itself. */
   boolean padding;
          
   /* extension (X): 1 bit
      If the extension bit is set, the fixed header MUST be followed by
      exactly one header extension. */   
   boolean extension;

   /* CSRC count (CC): 4 bits
      The CSRC count contains the number of CSRC identifiers that follow
      the fixed header. */   
   int csrc_count;

   /* marker (M): 1 bit
      The interpretation of the marker is defined by a profile.  It is
      intended to allow significant events such as frame boundaries to
      be marked in the packet stream. */   
   boolean marker;

   /* payload type (PT): 7 bits
      This field identifies the format of the RTP payload and determines
      its interpretation by the application.  A profile MAY specify a
      default static mapping of payload type codes to payload formats.
      Additional payload type codes MAY be defined dynamically through
      non-RTP means. */   
   int payload_type;

   /* sequence number: 16 bits
      The sequence number increments by one for each RTP data packet
      sent, and may be used by the receiver to detect packet loss and to
      restore packet sequence.  The initial value of the sequence number
      SHOULD be random (unpredictable). */   
   int sequence_number;

   /* timestamp: 32 bits
      The timestamp reflects the sampling instant of the first octet in
      the RTP data packet.  The sampling instant MUST be derived from a
      clock that increments monotonically and linearly in time to allow
      synchronization and jitter calculations.  If
      RTP packets are generated periodically, the nominal sampling
      instant as determined from the sampling clock is to be used, not a
      reading of the system clock.  
      The initial value of the timestamp SHOULD be random, as for the
      sequence number.  Several consecutive RTP packets will have equal
      timestamps if they are (logically) generated at once, e.g., belong
      to the same video frame.  */   
   long timestamp;

   /* SSRC: 32 bits
      The SSRC field identifies the synchronization source.  This
      identifier SHOULD be chosen randomly, with the intent that no two
      synchronization sources within the same RTP session will have the
      same SSRC identifier. */   
   long ssrc;

   /* CSRC list: 0 to 15 items, 32 bits each
      The CSRC list identifies the contributing sources for the payload
      contained in this packet.  CSRC identifiers are inserted by
      mixers, using the SSRC identifiers of
      contributing sources. */   
   long[] csrc_list;




   /** The RTP socket used for send or receive RTP packet */
   RtpSocket socket;

   /** Whether the RTP flow has been initialized,
       i.e. it has been associated with a PT, SSRC, sequence number, and timestamp. */
   boolean initialized;




   /** Whether the RTP flow has been already initialized */
   public boolean isInitialized()
   {  return initialized;
   }

   /** Gets the payload type (PT) */
   public int getPayloadType()
   {  return payload_type;
   }

   /** Gets the last sequence number */
   public int getSequenceNumber()
   {  return sequence_number;
   }
   
   /** Gets the last timestamp */
   public long getTimestamp()
   {  return timestamp;
   }

   /** Gets the SSCR */
   public long getSscr()
   {  return ssrc;
   }

   /** Gets the CSCR list */
   public long[] getCscrList()
   {  return csrc_list;
   }


   /** Creates a new RTP flow */ 
   public RtpFlow()
   {  padding=false;
      extension=false;
      csrc_count=0;
      marker=false;
      payload_type=0;
      sequence_number=0;
      timestamp=0;
      ssrc=0;
      csrc_list=null;
      
      initialized=false;
   }

}
