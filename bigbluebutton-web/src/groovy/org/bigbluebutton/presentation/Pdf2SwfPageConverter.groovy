
package org.bigbluebutton.presentation

import org.springframework.util.FileCopyUtils

public class Pdf2SwfPageConverter implements PageConverter {

	private String SWFTOOLS_DIR;
	private String blankSlide;
	
	public boolean convert(File presentation, File output, int page) {
	    String source = presentation.getAbsolutePath();
	    //String dest = presentation.getParent() + File.separatorChar + "slide-" + page + ".swf";
	    String dest = output.getAbsolutePath()
	    
	    String command = SWFTOOLS_DIR + File.separator + "pdf2swf -p " + page + " " + source + " -o " + dest;    
	    System.out.println("Executing $command");
	    
		Process process;
		int exitValue = -1;
		
		try {
			process = Runtime.getRuntime().exec(command);
			
			// Wait for the process to finish
			exitValue = process.waitFor();
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

//		if (exitValue != 0) {
//			generateBlankSlide(dest);
//		}
		
		File destFile = new File(dest);
		if (destFile.exists()) return true;		
		return false;
	}

	public void generateBlankSlide(String dest) {
		File slide = new File(dest);
		
		FileCopyUtils.copy(new File(blankSlide), slide);		
	}
	
	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir;
	}
	
	public void setBlankSlide(String slide) {
		blankSlide = slide;
	}
}
