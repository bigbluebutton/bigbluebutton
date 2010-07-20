package org.bigbluebutton.webminer.swf;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.io.StringReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.zip.DataFormatException;

import org.apache.log4j.Logger;

import com.flagstone.transform.FSCharacter;
import com.flagstone.transform.FSDefineText;
import com.flagstone.transform.FSMovie;
import com.flagstone.transform.FSMovieObject;
import com.flagstone.transform.FSText;

import org.bigbluebutton.webminer.index.Index;

public class SwfParser {
	
	private StringBuffer sb = null;
	private URL url;
	private static Logger logger = Logger.getLogger(Index.class);
	/*public SwfParser(String swfExec, String swfFileName) {
		this.swfExec = swfExec;
		this.swfFileName = swfFileName;
	}*/
	
	public SwfParser(URL url){ 
		this.url = url;
	}
	
	public Reader getReader() {
		if (logger.isDebugEnabled())
			logger.debug(sb.toString());
		return new StringReader(sb.toString());
	}

	public String getContents() {
		return sb.toString();
	}
	/*public void parse() throws IOException, InterruptedException {
		Runtime runtime = Runtime.getRuntime();
        Process proc = runtime.exec(
            swfExec + " " + swfFileName);

        // put a BufferedReader on the ls output

        InputStream inputstream =
            proc.getInputStream();
        InputStreamReader inputstreamreader =
            new InputStreamReader(inputstream);
        BufferedReader bufferedreader =
            new BufferedReader(inputstreamreader);

        // read the ls output
        sb = new StringBuffer();
        String line;
        
        while ((line = bufferedreader.readLine()) 
                  != null) {
        	sb.append(line);
        }
    
        // check for ls failure

        if (proc.waitFor() != 0) {
            System.err.println("exit value = " +
                proc.exitValue());
        }
	}*/
	
	public void parse() throws IOException, InterruptedException {
				
		try {
			url.openConnection();
			InputStream is = url.openStream();
			ByteArrayOutputStream bao = new ByteArrayOutputStream();
			byte[] buf = new byte[1024];
			int numRead;
			int numWritten = 0;
			while ((numRead = is.read(buf)) != -1) {
				bao.write(buf, 0, numRead);
				numWritten += numRead;
			}

			sb = new StringBuffer();
	        	        
			FSMovie swf = new FSMovie(bao.toByteArray());
			ArrayList al = swf.getObjectsOfType(FSMovieObject.DefineText);
			if (al != null) {
				Iterator it = al.iterator();
				while (it.hasNext()) {
					FSDefineText dt = (FSDefineText) it.next();
					ArrayList texts = (ArrayList) dt.getObjects();
					Iterator textIt = texts.iterator();
					while (textIt.hasNext()) {
						Object nextText = textIt.next();
						if (nextText instanceof FSText) {
							FSText ft = (FSText) nextText;
							ArrayList chars = ft.getCharacters();
							Iterator charIt = chars.iterator();
							while (charIt.hasNext()) {
								FSCharacter fsChar = (FSCharacter) charIt.next();
								sb.append((char) fsChar.getGlyphIndex());
							}
							sb.append(' ');
						}
					}
				}
			}
		} catch (DataFormatException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
