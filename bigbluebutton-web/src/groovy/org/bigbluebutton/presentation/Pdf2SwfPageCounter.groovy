
package org.bigbluebutton.presentation


public class Pdf2SwfPageCounter implements PageCounter{

	private String SWFTOOLS_DIR
	
	public int countNumberOfPages(File presentationFile){
		def numPages = -1 //total numbers of this pdf, also used as errorcode(-1)	

		try 
		{
			def command = SWFTOOLS_DIR + "/pdf2swf -I " + presentationFile.getAbsolutePath()        
			println "Executing with waitFor $command"
			def p = Runtime.getRuntime().exec(command);            
        	
			def stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
			def stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
			def info
			def str //output information to console for stdInput and stdError
			while ((info = stdInput.readLine()) != null) {
				//The output would be something like this 'page=21 width=718.00 height=538.00'.
	    		//We need to extract the page number (i.e. 21) from it.
	    		def infoRegExp = /page=([0-9]+)(?: .+)/
	    		def matcher = (info =~ infoRegExp)
	    		if (matcher.matches()) {
	    			numPages = matcher[0][1]
	    		} else {
	    			println "no match info: ${info}"
	    		}
			}
			while ((info = stdError.readLine()) != null) {
				System.out.println("Got error getting info from file):\n");
				System.out.println(str);
			}
			stdInput.close();
			stdError.close();

			// Wait for the process to finish.
        	int exitVal = p.waitFor()
		}
		catch (IOException e) {
			System.out.println("exception happened - here's what I know: ");
			e.printStackTrace();
		}		

		return new Integer(numPages).intValue()
	}
	
	public void setSwfToolsDir(String dir) {
		SWFTOOLS_DIR = dir;
	}
}
