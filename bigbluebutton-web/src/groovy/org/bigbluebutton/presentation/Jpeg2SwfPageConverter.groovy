
package org.bigbluebutton.presentation


public class Jpeg2SwfPageConverter implements PageConverter{

	private String SWFTOOLS_DIR
	
	public boolean convert(File presentationFile, File output, int page){

		def now = new Date()
		println "JPEG2SWF starting $now"
		
        def command = SWFTOOLS_DIR + "/jpeg2swf -o " + output.getAbsolutePath() + " " + presentationFile.getAbsolutePath()
        println "Executing $command"
	    def process = Runtime.getRuntime().exec(command);            

		// Wait for the process to finish.
		int exitValue = process.waitFor()
		
		now = new Date()
		println "JPEG2SWF ended $now"
				    
		if (output.exists()) return true		
		return false
	}
	
	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir
	}
}
