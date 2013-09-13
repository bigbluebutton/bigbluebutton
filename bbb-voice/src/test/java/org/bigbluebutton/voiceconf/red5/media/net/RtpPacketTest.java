package org.bigbluebutton.voiceconf.red5.media.net;

import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class RtpPacketTest {
	private RtpPacket rtpPacket;
	
	@BeforeMethod
	public void init() {
		byte[] internalBuffer = new byte[42];
		rtpPacket = new RtpPacket(internalBuffer, 42);
	}
	
	@Test
	public void testSetVersionIs2() {
		rtpPacket.setVersion(2);
		Assert.assertEquals(rtpPacket.getVersion(), 2, "Expect version = 2");
	}
	
//	@Test
//	public void testSetVersionIs0() {
//		rtpPacket.setVersion(0);
//		Assert.assertEquals(rtpPacket.getVersion(), 0, "Expect version = 0");
//	}
	
	@Test
	public void testSetVersionIs3() {
		rtpPacket.setVersion(3);
		Assert.assertEquals(rtpPacket.getVersion(), 3, "Expect version = 3");
	}
	
	@Test
	public void testHasPadding() {
		rtpPacket.setPadding(true);
		Assert.assertTrue(rtpPacket.hasPadding(), "Packet should have padding.");
	}
	
	@Test
	public void testNoPadding() {
		rtpPacket.setPadding(false);
		Assert.assertFalse(rtpPacket.hasPadding(), "Packet should not have padding.");
	}
	
	@Test
	public void testHasExtension() {
		rtpPacket.setExtension(true);
		Assert.assertTrue(rtpPacket.hasExtension(), "Packet should have extension.");
	}
	
	@Test
	public void testNoExtension() {
		rtpPacket.setExtension(false);
		Assert.assertFalse(rtpPacket.hasExtension(), "Packet should not have extension.");
	}
	
	@Test
	public void testHasMarker() {
		rtpPacket.setMarker(true);
		Assert.assertTrue(rtpPacket.hasMarker(), "Packet should have marker. " + rtpPacket.getPacket()[1]);
	}
	
	@Test
	public void testNoMarker() {
		rtpPacket.setMarker(false);
		Assert.assertFalse(rtpPacket.hasMarker(), "Packet should not have marker.");
	}
	
	@Test
	public void testSetCscrCount4() {
		rtpPacket.setCscrCount(4);
		Assert.assertEquals(rtpPacket.getCscrCount(), 4, "CSCR count should be 4.");
	}
	
	@Test
	public void testSetCscrCount3() {
		rtpPacket.setCscrCount(3);
		Assert.assertEquals(rtpPacket.getCscrCount(), 3, "CSCR count should be 3.");
	}
	
	@Test
	public void testSetPayloadType100() {
		rtpPacket.setPayloadType(100);
		Assert.assertEquals(rtpPacket.getPayloadType(), 100, "Payload type should be 100.");
	}
	
	@Test
	public void testSetPayloadType98() {
		rtpPacket.setPayloadType(98);
		Assert.assertEquals(rtpPacket.getPayloadType(), 98, "Payload type should be 98.");
	}
	
	@Test
	public void testSetSeqNum0xF0DF() {
		rtpPacket.setSeqNum(0xF0DF);
		Assert.assertEquals(rtpPacket.getSeqNum(), 0xF0DF, "Sequence number 0xF0DF. " + (int) rtpPacket.getPayload()[2] + "," + (int) rtpPacket.getPayload()[3] + "," + (byte)((int) 0xF0DF & 0xFF));
	}
	
	@Test
	public void testSetSeqNum0xDF() {
		rtpPacket.setSeqNum(0x00DF);
		Assert.assertEquals(rtpPacket.getSeqNum(), 0x00DF, "Sequence number 0xDF. " + rtpPacket.getPayload()[2] + "," + rtpPacket.getPayload()[3]);
	}
	
	@Test
	public void testSetSeqNum0xFFFF() {
		rtpPacket.setSeqNum(0xFFFF);
		Assert.assertEquals(rtpPacket.getSeqNum(), 0xFFFF, "Sequence number 0xFFFF. " + rtpPacket.getPayload()[2] + "," + rtpPacket.getPayload()[3]);
	}
	
	@Test
	public void testSetSeqNum0() {
		rtpPacket.setSeqNum(0);
		Assert.assertEquals(rtpPacket.getSeqNum(), 0, "Sequence number 0. " + rtpPacket.getPayload()[2] + "," + rtpPacket.getPayload()[3]);
	}
	
	@Test
	public void testSetTimestamp0xF0DF() {
		rtpPacket.setTimestamp(0xF0DF);
		Assert.assertEquals(rtpPacket.getTimestamp(), 0xF0DF, "Timestamp should be 0xF0DF.");
	}
	
	@Test
	public void testSetTimestamp0xDF() {
		rtpPacket.setTimestamp(0x00DF);
		Assert.assertEquals(rtpPacket.getTimestamp(), 0x00DF, "Timestamp should be 0xDF.");
	}
	
	@Test
	public void testSetTimestamp0xFFFFFFFF() {
		rtpPacket.setTimestamp(0xFFFFFFFF);
		Assert.assertEquals(rtpPacket.getTimestamp(), 0xFFFFFFFF, "Timestamp should be 0xFFFFFFFF.");
	}
	
	@Test
	public void testSetTimestamp0() {
		rtpPacket.setTimestamp(0);
		Assert.assertEquals(rtpPacket.getTimestamp(), 0, "Timestamp should be 0.");
	}
	
	@Test
	public void testSetSsrc0xF0DF() {
		rtpPacket.setSsrc(0xF0DF);
		Assert.assertEquals(rtpPacket.getSsrc(), 0xF0DF, "SSRC should be 0xF0DF.");
	}
	
	@Test
	public void testSetSsrc0xDF() {
		rtpPacket.setSsrc(0x00DF);
		Assert.assertEquals(rtpPacket.getSsrc(), 0x00DF, "SSRC should be 0xDF.");
	}
	
	@Test
	public void testSetSsrc0xFFFFFFFF() {
		rtpPacket.setSsrc(0xFFFFFFFF);
		Assert.assertEquals(rtpPacket.getSsrc(), 0xFFFFFFFF, "SSRC should be 0xFFFFFFFF.");
	}
	
	@Test
	public void testSetSsrc0() {
		rtpPacket.setSsrc(0);
		Assert.assertEquals(rtpPacket.getSsrc(), 0, "SSRC should be 0.");
	}
}
