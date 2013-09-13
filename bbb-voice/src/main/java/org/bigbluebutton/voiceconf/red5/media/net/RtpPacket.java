/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.voiceconf.red5.media.net;

public class RtpPacket {
	private static final int HEADER_LENGTH = 12;
	
	private byte[] packet;   
	private int packetLength;
	long temp;
	
	public RtpPacket(byte[] buffer, int packet_length) {  
		packet = buffer;
		packetLength = packet_length;
		setVersion(2);
		if (packetLength < HEADER_LENGTH) packetLength = HEADER_LENGTH;
	}
	   
	public byte[] getPacket() {  
		return packet;
	}

	public int getLength() {  
		return packetLength;
	}

	public void setPacketLength(int length) {
		packetLength = length;
	}
	
	public int getHeaderLength() {  
		if (packetLength >= HEADER_LENGTH) return HEADER_LENGTH + 4 * getCscrCount();
		else return packetLength; // broken packet
	}

	public int getPayloadLength() {  
		if (packetLength >= HEADER_LENGTH) return packetLength - getHeaderLength();
		else return 0; // broken packet
	}

   /** Sets the RTP payload length */
   public void setPayloadLength(int len) {  
	   packetLength = getHeaderLength() + len;
   }

   // version (V): 2 bits
   // padding (P): 1 bit
   // extension (X): 1 bit
   // CSRC count (CC): 4 bits
   // marker (M): 1 bit
   // payload type (PT): 7 bits
   // sequence number: 16 bits
   // timestamp: 32 bits
   // SSRC: 32 bits
   // CSRC list: 0 to 15 items, 32 bits each

   public int getVersion() {  
	   if (packetLength >= HEADER_LENGTH)
		   /* 0xC0 = 1100 0000 */
		   return ((packet[0] & 0xC0) >> 6);
	   else return 0; // broken packet 
   }

   public void setVersion(int v) {  
	   if (packetLength >= HEADER_LENGTH)
		   // Should check the if version is greater that 2-bits
		   packet[0] = (byte)((v << 6) | packet[0]);
   }

   public boolean hasPadding() {  
	   if (packetLength >= HEADER_LENGTH) 
		   /* 0x20 = 0010 0000 */
		   return ((packet[0] & 0x20) >> 5) == 1;
	   else return false; // broken packet 
   }

   public void setPadding(boolean p) {  
	   if (packetLength >= HEADER_LENGTH) {
		   if (p) {
			   /* 0x20 = 0010 0000 */
			   packet[0] = (byte) (packet[0] | 0x20);
		   } else {
			   /* 0xDF = 1101 1111 */
			   packet[0] = (byte) (packet[0] & 0xDF);
		   }
	   }
   }

   public boolean hasExtension() {  
	   if (packetLength >= HEADER_LENGTH) 
		   /* 0x10 = 0001 0000 */
		   return ((packet[0] & 0x10) >> 4) == 1;
	   else return false; // broken packet 
   }

   public void setExtension(boolean x) {  
	   if (packetLength >= HEADER_LENGTH) {
		   if (x) {
			   /* 0x10 = 0001 0000 */
			   packet[0] = (byte) (packet[0] | 0x10);
		   } else {
			   /* 0xEF = 1110 1111 */
			   packet[0] = (byte) (packet[0] & 0xEF);
		   }
	   }
   }

   public int getCscrCount() {  
	   if (packetLength >= HEADER_LENGTH) return (packet[0] & 0x0F);
	   else return 0; // broken packet
   }

   public void setCscrCount(int count) {  
	   if (packetLength >= HEADER_LENGTH) 
		   // Should check the if version is greater that 4-bits
		   packet[0] = (byte) ((packet[0] & 0xF0) | (count & 0x0F));

   }
   
   public boolean hasMarker() {  
	   if (packetLength >= HEADER_LENGTH) {
		   return ((packet[1] & 0x80) >> 7) == 1;
	   } else return false; // broken packet 
   }

   public void setMarker(boolean m) {  
	   if (packetLength >= HEADER_LENGTH) {
		   if (m) {
			   /* 0x80 = 1000 0000 */
			   packet[1] = (byte) (packet[1] | 0x80);
		   } else {
			   /* 0x7F = 0111 1111 */
			   packet[1] = (byte) (packet[1] & 0x7F);
		   }
	   }
   }

   public int getPayloadType() {  
	   if (packetLength >= HEADER_LENGTH) return (packet[1] & 0x7F);
	   else return -1; // broken packet
   }

   public void setPayloadType(int pt) {  
	   if (packetLength >= HEADER_LENGTH) 
		   packet[1] = (byte)((packet[1] & 0x80) | (pt & 0x7F));
   }

   public int getSeqNum() {  
	   if (packetLength >= HEADER_LENGTH) {
		   return getInt(packet, 2);
	   } else return 0; // broken packet
   }

   public void setSeqNum(int sn) {  
	   if (packetLength >= HEADER_LENGTH) {		
		   setInt(sn, packet, 2);
	   }
   }

   public long getTimestamp() {
	   if (packetLength >= HEADER_LENGTH) {
		   return getLong(packet, 4);
	   } else return 0; // broken packet
   }

   public void setTimestamp(long timestamp) {  
	   if (packetLength >= HEADER_LENGTH) {
		   setLong(timestamp, packet, 4);
	   }
   }
   
   public long getSsrc() {  
	   if (packetLength >= HEADER_LENGTH) {
		   return getLong(packet, 8);
	   } else return 0; // broken packet
   }

   public void setSsrc(long ssrc) {  
	   if (packetLength >= HEADER_LENGTH) {
		   setLong(ssrc, packet, 8);
	   }
   }

   public long[] getCscrList() {  
	   int cc = getCscrCount();
	   long[] cscr = new long[cc];
	   for (int i = 0; i < cc; i++) cscr[i] = getLong(packet, HEADER_LENGTH + 4 * i); 
	   return cscr;
   }

   public void setCscrList(long[] cscr) {  
	   if (packetLength >= HEADER_LENGTH) {  
		   int cc = cscr.length;
		   setCscrCount(cc);
		   for (int i = 0; i < cc; i++) setLong(cscr[i], packet, HEADER_LENGTH + 4 * i);   
      }
   }

   /** Sets the payload */
   public void setPayload(byte[] payload, int len) {  
	   if (packetLength >= HEADER_LENGTH) {  
		   int header_len = getHeaderLength();
		   System.arraycopy(payload, 0, packet, getHeaderLength(), len);
		   packetLength = header_len + len;
      }
   }

   /** Gets the payload */
   public byte[] getPayload() {  
	   int len = packetLength - getHeaderLength();
	   byte[] payload = new byte[len];
	   System.arraycopy(packet, getHeaderLength(), payload, 0, len); 
	   return payload;
   }

   public boolean isRtcpPacket() {
	   int payloadType = (packet[1] & 0xFF);
	   if ((payloadType >= 200) && (payloadType <= 204)) return true;
	   
	   return false;
   }
   
   public int getRtcpPayloadType() {
	   return (packet[1] & 0xFF);
   }
   
   // *********************** Private and Static ***********************

   /** Gets int value */
   private static int getInt(byte b) {  
	   return ((int) b + 256) % 256;
   }

   /** Gets long value */
   private static long getLong(byte[] data, int start) {  
	   return ((int) ((data[start] << 24) & 0xFF000000) + ((int) (data[start + 1] << 16) & 0xFF0000) 
			   + ((int) (data[start + 2] << 8) & 0xFF00) + ((int) (data[start + 3] & 0xFF)));
   }

   private static void setLong(long n, byte[] data, int start) {  
	   data[start] = (byte) ((int) n >> 24);
	   data[start + 1] = (byte) ((int) n >> 16);
	   data[start + 2] = (byte) ((int) n >> 8);
	   data[start + 3] = (byte) ((int) n & 0xFF);
   }

   /** Gets Int value */
   private static int getInt(byte[] data, int start) {  
	   return ((int) (data[start] << 8) & 0xFF00) + ((int) (data[start + 1] & 0xFF));
   }

   /** Sets Int value */
   private static void setInt(int n, byte[] data, int start) {  
	   data[start] = (byte) ((int) n >> 8);
	   data[start + 1] = (byte) ((int) n & 0xFF);
   }

   /** Gets bit value */
   private static boolean getBit(byte b, int bit) {  
	   return (b >> bit) == 1;
   }

   /** Sets bit value */
   private static void setBit(boolean value, byte b, int bit) {  
	   if (value) b = (byte)(b | (1 << bit));
	   else b = (byte)((b | (1 << bit)) ^ (1 << bit));
   }
}
