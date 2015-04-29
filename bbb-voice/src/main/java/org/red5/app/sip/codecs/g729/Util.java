package org.red5.app.sip.codecs.g729;
//package org.mobicents.media.server.impl.dsp.audio.g729;
import java.io.IOException;
import java.io.OutputStream;;


public class Util {

	/*-------------------------------------------------------------------*
	 * Function  set zero()                                              *
	 *           ~~~~~~~~~~                                              *
	 * Set vector x[] to zero                                            *
	 *-------------------------------------------------------------------*/

	public static void set_zero(
	  float  x[],       /* (o)    : vector to clear     */
	  int L             /* (i)    : length of vector    */
	)
	{
	   int i;

	   for (i = 0; i < L; i++)
	     x[i] = (float)0.0;

	   return;
	}

	/*-------------------------------------------------------------------*
	 * Function  copy:                                                   *
	 *           ~~~~~                                                   *
	 * Copy vector x[] to y[]                                            *
	 *-------------------------------------------------------------------*/

	public static void copy(
	  float  x[],      /* (i)   : input vector   */
	  float  y[],      /* (o)   : output vector  */
	  int L            /* (i)   : vector length  */
	)
	{
	   int i;

	   for (i = 0; i < L; i++)
	     y[i] = x[i];

	   return;
	}
	
	public static void copy(
			  float  x[],int xs,      /* (i)   : input vector   */
			  float  y[],int ys,      /* (o)   : output vector  */
			  int L            /* (i)   : vector length  */
			)
			{
			   int i;

			   for (i = 0; i < L; i++)
			     y[ys+i] = x[xs+i];

			   return;
			}

	/* Random generator  */

	public static short random_g729()
	{
	  return (short) (0xFFFF&System.currentTimeMillis());

	}
	public static byte[] floatArrayToByteArray(
			float []data,           /* input: inputdata */
			int length         /* input: length of data array */
	)
	{
		int  i;
		short sp16[] = new short[LD8KConstants.L_FRAME];
		byte[] ret;
		float temp;

		if (length > LD8KConstants.L_FRAME) {
			throw new RuntimeException("error in fwrite16\n");

		}

		for(i=0; i<length; i++)
		{
			/* round and convert to int  */
			temp = data[i];
			if (temp >= (float)0.0)
				temp += (float)0.5;
			else  temp -= (float)0.5;
			if (temp >  (float)32767.0 ) temp =  (float)32767.0;
			if (temp < (float)-32768.0 ) temp = (float)-32768.0;
			sp16[i] = (short) temp;
			
			
		}
		ret = shortArrayToByteArray(sp16);
		return ret;

	}
	/*-----------------------------------------------------------*
	 * fwrite16 - writes a float array as a Short to a a file    *
	 *-----------------------------------------------------------*/

	public static void fwrite16(
			float []data,           /* input: inputdata */
			int length,          /* input: length of data array */
			OutputStream fp               /* input: file pointer */
	)
	{
		int  i;
		short sp16[] = new short[LD8KConstants.L_FRAME];
		float temp;

		if (length > LD8KConstants.L_FRAME) {
			throw new RuntimeException("error in fwrite16\n");

		}

		for(i=0; i<length; i++)
		{
			/* round and convert to int  */
			temp = data[i];
			if (temp >= (float)0.0)
				temp += (float)0.5;
			else  temp -= (float)0.5;
			if (temp >  (float)32767.0 ) temp =  (float)32767.0;
			if (temp < (float)-32768.0 ) temp = (float)-32768.0;
			sp16[i] = (short) temp;
			try {
				fp.write(shortToBytes(sp16[i]));
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}

	}

	public static byte[] shortToBytes(int myInt) {
		byte[] bytes = new byte[2];
		int hexBase = 0xff;
		bytes[0] = (byte) (hexBase & myInt);
		bytes[1] = (byte) (((hexBase << 8)& myInt) >> 8);
		return bytes;
	}
	
	public static short bytesToShort(byte[] bytes) {
		return (short)(0xffff&((int)bytes[0] | bytes[1]<<8));
	}
	
	public static short bytesToShort(byte byte1, byte byte2) {
		return (short)(0xffff&((0xff&byte1) | ((0xff&byte2)<<8)));
	}
	
	public static short[] byteArrayToShortArray(byte[] bytes) {
		short[] s = new short[bytes.length/2];
		for(int q=0; q<s.length;q++) {
			s[q] = bytesToShort(bytes[2*q],bytes[2*q+1]);
		}
		return s;
	}
	
	public static byte[] shortArrayToByteArray(short[] values) {
		byte[] s = new byte[values.length*2];
		for(int q=0; q<values.length;q++) {
			byte[] bytes = shortToBytes(values[q]);
			s[2*q] = bytes[0];
			s[2*q+1] = bytes[1];
		}
		return s;
	}
}
