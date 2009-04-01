package org.bigbluebutton.conference.service.archive.record

import org.slf4j.Logger
import org.slf4j.LoggerFactory

public class RecordService implements IRecordService{
	protected static Logger recorder = LoggerFactory.getLogger( "RECORD-BIGBLUEBUTTON" );
	
	public void record(String message){
		log.debug(message)
	}
	
}
