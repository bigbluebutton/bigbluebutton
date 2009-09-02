
package org.bigbluebutton.presentation


public class GhostscriptPageExtractor implements PageExtractor{

	private String GHOSTSCRIPT_EXEC
	private String noPdfMarkWorkaround
	
	public boolean extractPage(File presentationFile, File output, int page){
		
		String OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH"
		String PAGE = "-dFirstPage=${page} -dLastPage=${page}"
		String dest = output.getAbsolutePath()
		
		//extract that specific page and create a temp-pdf(only one page) with GhostScript
		def command = GHOSTSCRIPT_EXEC + " " + OPTIONS + " " + PAGE + " " + "-sOutputFile=${dest}" + " " + noPdfMarkWorkaround + " " + presentationFile          
        println "Executing $command"
        
        def process
        int exitVal = -1
        
        try {
        	process = Runtime.getRuntime().exec(command);            
        	
        	// Wait for the process to finish.
        	exitVal = process.waitFor()
    				
        } catch (InterruptedException e) {
        	System.out.println(e.toString());
        }
        
	    if (exitVal == 0) {
	    	return true
	    } else {
	    	return false
	    }
	}	
	
	public void setGhostscriptExec(String exec) {
		GHOSTSCRIPT_EXEC = exec
	}
	
	public void setNoPdfMarkWorkaround(String noPdfMarkWorkaround) {
		this.noPdfMarkWorkaround = noPdfMarkWorkaround
	}
}
