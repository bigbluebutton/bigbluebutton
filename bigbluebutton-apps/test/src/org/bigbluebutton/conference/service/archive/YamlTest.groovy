/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */

package org.bigbluebutton.conference.service.archive

import org.testng.annotations.BeforeMethodimport org.testng.annotations.Testimport org.ho.yaml.Yaml
import org.ho.yaml.YamlEncoderimport org.ho.yaml.YamlDecoder
public class YamlTest{
	File f 
	File yamlOutFile
	FileOutputStream fout
	@BeforeMethod
	public void setUp() {
		f = new File('test/resources/recordings.yaml')
		println f.absolutePath
		File yamlOutFileDir = new File('build/test/resources')
		if (! yamlOutFileDir.exists())
			yamlOutFileDir.mkdirs()
		yamlOutFile = new File('build/test/resources/yaml-output.yaml')
		if (yamlOutFile.exists()) {
			// delete the file so we start fresh
			yamlOutFile.delete()
			yamlOutFile = new File('build/test/resources/yaml-output.yaml')
		}
		println yamlOutFile.canonicalPath
		fout = new FileOutputStream(yamlOutFile, true /*append*/)
	}

//	@Test
	public void writeYamlToFileTest() {
		Map event = new HashMap()
		event.put("date", 1236202122980)
		event.put("application", "PARTICIPANT")
		event.put("event", "ParticipantJoinedEvent")
		Map status = new HashMap()
		event.put("status", status)
		status.put("raiseHand", true)
		status.put("presenter", true)
		status.put("stream", "my-video-stream")
    
		Map event1 = new HashMap()
		event1.put("date", 1236202132980)
		event1.put("application", "PARTICIPANT")
		event1.put("event", "ParticipantJoinedEvent")
		event1.put("message", "Las Vegas, Nevada, USA")

		// We'll save multiple YAML document into the file. 
		YamlEncoder enc = new YamlEncoder(fout);
        enc.writeObject(event);
        enc.writeObject(event1);
        enc.close();
        
        // Let's read back the saved data.
        YamlDecoder dec = new YamlDecoder(yamlOutFile.newInputStream());
        def eventList = []
        try{
          while (true){
            Map eventRead = dec.readObject();
            println eventRead.date
            eventList.add(eventRead)
          }
        }catch (EOFException e){
          println("Finished reading stream.");
        }finally {
          dec.close();
        }
        
        assert eventList.size() == 2
		assert eventList[0].date == 1236202122980
		assert eventList[0]['application'] == 'PARTICIPANT'

		Map event3 = new HashMap()
		event3.put("date", 1236202122980)
		event3.put("application", "PARTICIPANT")
		event3.put("event", "ParticipantJoinedEvent")
		Map status1 = new HashMap()
		event3.put("status", status1)
		status1.put("raiseHand", false)
		status1.put("presenter", false)
		status1.put("stream", "my-video-stream-1")
		
		// Need to create another outpurstream to be able to write to the file.
		// Perhaps the stream was closed when the encoder was closed above?
		FileOutputStream fout2 = new FileOutputStream(yamlOutFile, true /*append*/) 
		YamlEncoder enc1 = new YamlEncoder(fout2);
        enc1.writeObject(event3);
        enc1.close();

        // Let's read back the saved data.
        YamlDecoder dec2 = new YamlDecoder(yamlOutFile.newInputStream());
        def eventList2 = []
        try{
          while (true){
            Map eventRead = dec2.readObject();
            eventList2.add(eventRead)
          }
        }catch (EOFException e){
          println("Finished reading stream.");
        }finally {
          dec2.close();
        }
        
        // Let's check if we successfully added the third entry.
        assert eventList2.size() == 3
		assert !eventList2[2].status.raiseHand 
		assert eventList2[2]['application'] == 'PARTICIPANT'	
	}	
}
