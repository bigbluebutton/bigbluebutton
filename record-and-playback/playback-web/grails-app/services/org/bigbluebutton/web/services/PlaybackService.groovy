package org.bigbluebutton.web.services

import org.bigbluebutton.playback.Conference;

class PlaybackService {

    boolean transactional = false
    def recordingDir
    def recordingFile

    public PlaybackService(){

    }

    public ArrayList getConferences(){
        File f = new File(recordingDir)
        String[] files=f.list()
        ArrayList confs=new ArrayList()

        for(String token in files){
            String filepath=recordingDir+File.separatorChar+token+File.separatorChar+token+File.separatorChar+recordingFile
            File manifest=new File(filepath)
            if(manifest.exists()){
                XmlParser parser = new XmlParser()
                def xmldata = parser.parse(manifest)

                Conference con=new Conference(xmldata.@token,xmldata.@name,xmldata.@date)
                confs.add(con);
            }
        }

        return confs;
    }

    public StringWriter getManifestFile(String conference){
        String filepath=recordingDir+File.separatorChar+conference+File.separatorChar+conference+File.separatorChar+recordingFile
        File manifest=new File(filepath)
        if(manifest.exists()){
            XmlParser parser = new XmlParser()
            def xmldata = parser.parse(manifest)
            def writer = new StringWriter()
            new XmlNodePrinter(new PrintWriter(writer)).print(xmldata)
            return writer;
        }
        return null;
    }
}
