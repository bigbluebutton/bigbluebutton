/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
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
