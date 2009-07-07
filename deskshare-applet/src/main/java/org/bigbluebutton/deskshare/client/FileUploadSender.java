package org.bigbluebutton.deskshare.client;

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

import javax.imageio.ImageIO;

public class FileUploadSender implements IScreenCaptureSender {
	  HttpURLConnection conn = null;
	  BufferedReader br = null;
	  DataOutputStream dos = null;
	  DataInputStream inStream = null;

	  InputStream is = null;
	  OutputStream os = null;
	  boolean ret = false;
	  String StrMessage = "";
	  String exsistingFileName = "C:///service.txt";

	  String lineEnd = "\r\n";
	  String twoHyphens = "--";
	  String boundary =  "*****";


	  int bytesRead, bytesAvailable, bufferSize;

	  byte[] buffer;

	  int maxBufferSize = 1*1024*1024;


	  String responseFromServer = "";

	  String urlString = "http://192.168.0.136/deskshare/sample/showslides";
	  
	@Override
	public void connect(String host, String room, int videoWidth,
			int videoHeight, int frameRate) {
		// TODO Auto-generated method stub

	}

	@Override
	public void disconnect() {
		// TODO Auto-generated method stub

	}

	@Override
	public void send(BufferedImage screenCapture) {
		try
		  {
		   URL url = new URL(urlString);
		   conn = (HttpURLConnection) url.openConnection();
		   conn.setDoInput(true);
		   conn.setDoOutput(true);
		   conn.setUseCaches(false);
		   conn.setRequestMethod("POST");
		   conn.setRequestProperty("Connection", "Keep-Alive");		  
		   conn.setRequestProperty("Content-Type", "multipart/form-data;boundary="+boundary);

		   dos = new DataOutputStream( conn.getOutputStream() );

		   dos.writeBytes(twoHyphens + boundary + lineEnd);
		   dos.writeBytes("Content-Disposition: form-data; name=\"upload\";"
		      + " filename=\"" + exsistingFileName +"\"" + lineEnd);
		   dos.writeBytes(lineEnd);

		   ByteArrayOutputStream byteConvert = new ByteArrayOutputStream();
			try {
				ImageIO.write(screenCapture, "jpeg", byteConvert);
				buffer = byteConvert.toByteArray();
				System.out.println("Http-Sent: "+ buffer.length);
			} catch (IOException e) {
				System.out.println("IOException while converting screen capture.");
			}

		   dos.write(buffer, 0, buffer.length);
		   
		   // send multipart form data necesssary after file data...

		   dos.writeBytes(lineEnd);
		   dos.writeBytes(twoHyphens + boundary + twoHyphens + lineEnd);

		   dos.flush();
		   dos.close();


		  }
		  catch (MalformedURLException ex)
		  {
		   System.out.println("From ServletCom CLIENT REQUEST:"+ex);
		  }

		  catch (IOException ioe)
		  {
		   System.out.println("From ServletCom CLIENT REQUEST:"+ioe);
		  }


		  //------------------ read the SERVER RESPONSE


		  try
		  {
		   inStream = new DataInputStream ( conn.getInputStream() );
		   String str;
		   while (( str = inStream.readLine()) != null)
		   {
		    System.out.println("Server response is: "+str);
		    System.out.println("");
		   }
		   inStream.close();

		  }
		  catch (IOException ioex)
		  {
		   System.out.println("From (ServerResponse): "+ioex);

		  }

	  }


}
