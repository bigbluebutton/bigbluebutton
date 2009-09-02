
package org.bigbluebutton.presentation


public class ImageMagickPageConverter implements PageConverter{

	private String IMAGEMAGICK_DIR
	
	public boolean convert(File presentationFile, File output, int page){

		def now = new Date()
		println "IMAGEMAGICK starting $now"
		
        def command = IMAGEMAGICK_DIR + "/convert -depth 8 " + presentationFile.getAbsolutePath() + " " + output.getAbsolutePath()          
		println "Executing $command"
		def process = Runtime.getRuntime().exec(command);            
		// Wait for the process to finish.
		int exitValue = process.waitFor()
		
		now = new Date()
		println "IMAGEMAGICK ends $now"
		
		if (output.exists()) return true		
		return false
	}

	public void setImageMagickDir(String dir) {
		IMAGEMAGICK_DIR = dir
	}
}
