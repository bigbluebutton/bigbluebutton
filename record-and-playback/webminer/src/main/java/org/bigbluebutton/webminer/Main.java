package org.bigbluebutton.webminer;

import java.io.*;

import org.bigbluebutton.webminer.index.Index;

/**
 * Reads and parses a SWF file and dumps a textual representation
 * to System.out.
 * 
 * SWFTagDumper is a class that implements the SWFTagTypes interface
 * so it can be driven by the TagParser class.
 */
public class Main
{
    /**
     * First arg is the name of the input SWF file
     * If second arg exists then actions are decompiled - the arg is ignored
     */
    public static void main( String[] args ) throws IOException 
    {
        Index index = Index.getInstance();
        //index.addIndex("test","test title");
        
    }
}
