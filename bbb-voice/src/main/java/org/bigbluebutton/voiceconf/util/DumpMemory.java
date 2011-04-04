package org.bigbluebutton.voiceconf.util;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

public class DumpMemory {
	private int dumpCount;
	private	FileOutputStream dumpFile;
	String MYseperator = "                ";
    public DumpMemory(String fileName)
	{
    	this(fileName, 10);
	}
	public DumpMemory(String fileName, int num)
	{
    	try {
			dumpFile = new FileOutputStream(fileName);
		} catch (FileNotFoundException e) {
			System.out.printf("error open file %s", fileName);
			e.printStackTrace();
		}
		dumpCount = num;
	}
	public void close() {
		try {
			dumpFile.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	public void dump(byte mem[])
	{
		if (dumpCount>0){
			dumpCount--;
			try {
				dumpFile.write(mem);
//				dumpFile.write(MYseperator.getBytes());
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
}
