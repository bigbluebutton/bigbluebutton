package org.bigbluebutton.api.domain;

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement;

@JacksonXmlRootElement(localName = "recording")
public class RecordingMetadata {
  /**
   * <recording>
   <id>32ee8bcccfad34f85c58a12f87fc4268130a4fd3-1489173065780</id>
   <state>published</state>
   <published>true</published>
   <start_time>1489173065780</start_time>
   <end_time>1489173199386</end_time>
   <breakout parentMeetingId="f3ffe06acedf425565cc024c8ebe89a6552e8782-1489172964374" sequence="2" meetingId="f2041d123b6a4b994e7ad87ee9d348496a73472c-1489173065780"/>
   <meta>
   <meetingId>f2041d123b6a4b994e7ad87ee9d348496a73472c-1489173065780</meetingId>
   <meetingName>random-2810069 (Room - 2)</meetingName>
   <isBreakout>true</isBreakout>
   </meta>
   <playback>
   <format>presentation</format>
   <link>http://192.168.23.22/playback/presentation/0.9.0/playback.html?meetingId=32ee8bcccfad34f85c58a12f87fc4268130a4fd3-1489173065780</link>
   <processing_time>9841</processing_time>
   <duration>126376</duration>
   <extensions>
   <preview>
   <images>
   <image width="176" height="136" alt="Welcome to">http://192.168.23.22/presentation/32ee8bcccfad34f85c58a12f87fc4268130a4fd3-1489173065780/presentation/743dd59a958334b4cdcdaa302846d0c0eadcf9ff-1489173070800/thumbnails/thumb-1.png</image>
   </images>
   </preview>
   </extensions>
   </playback>
   </recording>
   */

  private String metadataXml;
  private Boolean processingError = false;

  private String id;
  private String state;
  private boolean published;

  @JacksonXmlProperty(localName = "start_time")
  private String startTime;

  @JacksonXmlProperty(localName = "end_time")
  private String endTime;

  @JacksonXmlProperty(localName = "participants")
  private int participants;

  @JacksonXmlProperty(localName = "meeting")
  private MeetingInfo meetingInfo;

  private String meetingId = "";

  private String meetingName = "";

  @JacksonXmlProperty(localName = "raw_size")
  private String rawSize;

  private String size;

  private Breakout breakout;

  @JacksonXmlElementWrapper(localName = "breakoutRooms")
  @JacksonXmlProperty(localName = "breakoutRoom")
  private BreakoutRoom[] breakoutRooms;

  private Metadata meta;

  private RecordingMetadataPlayback playback;

  public void setId(String id) {
    this.id = id;
  }

  public String getId() {
    return id;
  }

  public String getMeetingId() {
    MeetingInfo info = getMeeting();
    if (info == null) {
      // return the recording id
      return id;
    }
    return info.getId();
  }

  public String getMeetingName() {
    MeetingInfo info = getMeeting();
    if (info == null) {
      return getMeta().get().get("meetingName");
    }
    return info.getName();
  }

  public Boolean isBreakout() {
    MeetingInfo info = getMeeting();
    if (info == null) {
      return Boolean.parseBoolean(getMeta().get().get("isBreakout"));
    }
    return info.isBreakout();
  }

  public void setRawSize(String rawSize) {
    this.rawSize = rawSize;
  }

  public String getRawSize() {
    return rawSize;
  }

  public void setSize(String size) {
    this.size = size;
  }

  public String getSize() {
    return size;
  }

  public void setState(String state) {
    this.state = state;
  }

  public String getState() {
    return state;
  }

  public void setPublished(boolean published) {
    this.published = published;
  }

  public boolean getPublished() {
    return published;
  }

  public void setStartTime(String startTime) {
    this.startTime = startTime;
  }

  public String getStartTime() {
    return startTime;
  }

  public void setEndTime(String endTime) {
    this.endTime = endTime;
  }

  public String getEndTime() {
    return endTime;
  }

  public void setParticipants(int participants) {
    this.participants = participants;
  }

  public int getParticipants() {
    return participants;
  }

  public void setMeeting(MeetingInfo meetingInfo) {
    this.meetingInfo = meetingInfo;
  }

  public MeetingInfo getMeeting() {
    return meetingInfo;
  }

  public void setBreakout(Breakout breakout) {
    this.breakout = breakout;
  }

  public Breakout getBreakout() {
    return breakout;
  }

  public void setBreakoutRooms(BreakoutRoom[] breakoutRooms) {
    this.breakoutRooms = breakoutRooms;
  }

  public BreakoutRoom[] getBreakoutRooms() {
    return breakoutRooms;
  }

  public void setMeta(Metadata meta) {
    this.meta = meta;
  }

  public Metadata getMeta() {
    return meta;
  }

  public RecordingMetadataPlayback getPlayback() {
    return playback;
  }

  public void setMetadataXml(String metadataXml) {
    this.metadataXml = metadataXml;
  }

  public String getMetadataXml() {
    return metadataXml;
  }

  public void setProcessingError(Boolean error) {
    processingError = error;
  }

  public Boolean hasError() {
    return processingError;
  }

  public Integer calculateDuration() {
    if ((endTime == null) || (endTime == "") || (startTime == null) || (startTime == "")) return 0;

    int start = (int) Math.ceil((Long.parseLong(startTime)) / 60000.0);
    int end = (int) Math.ceil((Long.parseLong(endTime)) / 60000.0);

    return end - start;
  }
}
