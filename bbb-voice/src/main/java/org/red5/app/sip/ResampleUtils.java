package org.red5.app.sip;

public class ResampleUtils {

    public static byte[] resample( float sampleRateFactor, float[] s1 ) {
        int o1 = 0;
        int l1 = s1.length;
        int resampledLength = (int) ( (float) l1 / sampleRateFactor );
        float[] tmp = new float[ resampledLength ];
        double oldIndex = o1;

        for ( int i = o1; i < o1 + resampledLength; i++ ) {
            if ( ( (int) oldIndex + 1 ) < s1.length ) {
                tmp[ i ] = interpolate0( s1, (float) oldIndex );
            }
            else {
                break; // end of source
            }
            oldIndex += sampleRateFactor;
        }

        oldIndex = o1;

        for ( int i = o1; i < o1 + resampledLength; i++ ) {
            if ( ( (int) oldIndex + 1 ) < s1.length ) {
                tmp[ i ] = interpolate1( s1, (float) oldIndex );
            }
            else {
                break; // end of source
            }
            oldIndex += sampleRateFactor;
        }

        byte[] outSample = new byte[ resampledLength * 2 ];
        int pos = 0;

        for ( int z = o1; z < o1 + resampledLength; z++ ) {
            outSample[ pos++ ] = (byte) ( (int) tmp[ z ] & 0xFF );
            outSample[ pos++ ] = (byte) ( ( (int) tmp[ z ] & 0xFF00 ) >> 8 );
        }

        return outSample;
    }


    public static int byte2int( byte b ) { // return (b>=0)? b : -((b^0xFF)+1);
        // return (b>=0)? b : b+0x100;
        return ( b + 0x100 ) % 0x100;
    }

    public static int byte2int( byte b1, byte b2 ) {
        return ( ( ( b1 + 0x100 ) % 0x100 ) << 8 ) + ( b2 + 0x100 ) % 0x100;
    }


    /**
     * zeroth order interpolation
     *
     * @param data
     *            seen as circular buffer when array out of bounds
     */
    public static float interpolate0( float[] data, float index ) {
        try {
            return data[ ( (int) index ) % data.length ];
        }
        catch ( ArrayIndexOutOfBoundsException e ) {
            return 0;
        }
    }


    /**
     * first order interpolation
     *
     * @param data
     *            seen as circular buffer when array out of bounds
     */
    public static float interpolate1( float[] data, float index ) {
        try {
            int ip = ( (int) index );
            float fp = index - ip;

            return data[ ip % data.length ] * ( 1 - fp ) + data[ ( ip + 1 ) % data.length ] * fp;
        }
        catch ( ArrayIndexOutOfBoundsException e ) {
            return 0;
        }
    }


    /**
     * second order interpolation
     *
     * @param data
     *            seen as circular buffer when array out of bounds
     */
    public static float interpolate2( float[] data, float index ) {
        try {
            // Newton's 2nd order interpolation
            int ip = ( (int) index );
            float fp = index - ip;

            float d0 = data[ ip % data.length ];
            float d1 = data[ ( ip + 1 ) % data.length ];
            float d2 = data[ ( ip + 2 ) % data.length ];

            float a0 = d0;
            float a1 = d1 - d0;
            float a2 = ( d2 - d1 - a1 ) / 2;

            return a0 + a1 * fp + a2 * fp * ( fp - 1 );

        }
        catch ( ArrayIndexOutOfBoundsException e ) {
            return 0;
        }
    }


    /**
     * third order interpolation
     *
     * @param data
     *            seen as circular buffer when array out of bounds
     */
    public static float interpolate3( float[] data, float index ) {
        try {
            // cubic hermite interpolation
            int ip = (int) index;
            float fp = index - ip;

            float dm1 = data[ ( ip - 1 ) % data.length ];
            float d0 = data[ ip % data.length ];
            float d1 = data[ ( ip + 1 ) % data.length ];
            float d2 = data[ ( ip + 2 ) % data.length ];

            float a = ( 3 * ( d0 - d1 ) - dm1 + d2 ) / 2;
            float b = 2 * d1 + dm1 - ( 5 * d0 + d2 ) / 2;
            float c = ( d1 - dm1 ) / 2;

            return ( ( ( a * fp ) + b ) * fp + c ) * fp + data[ ip % data.length ];

        }
        catch ( ArrayIndexOutOfBoundsException e ) {
            return 0;
        }
    }


   	public static float[] normalize(float[] audio, int length)
   	{
	    // Scan for max peak value here
	    float peak = 0;
		for (int n = 0; n < length; n++)
		{
			float val = Math.abs(audio[n]);
			if (val > peak)
			{
				peak = val;
			}
		}

		// Peak is now the loudest point, calculate ratio
		float r1 = 32768 / peak;

		// Don't increase by over 500% to prevent loud background noise, and normalize to 98%
		float ratio = Math.min(r1, 5) * .98f;

		for (int n = 0; n < length; n++)
		{
			audio[n] *= ratio;
		}

		return audio;
   	}
}
