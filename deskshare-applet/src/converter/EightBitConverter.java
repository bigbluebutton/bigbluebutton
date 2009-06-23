package converter;

/**
 * The EightBit converter converts a 32 bit Image to an 8 bit Image
 * The Conversion takes the following form:
 * 	- The 32bit representation is decomosed into alpha, red, green, and blue values (8 bit each)
 * 	- Alpha values are discarded
 * 	- 3 most significant bits of the red value are kept
 * 	- 3 most significant bits of the green value are kept
 * 	- 2 most significant bits of the blue value are kept
 * 	- Floyd-Steinberg Dithering is applied to create a more proper image
 * @author Snap
 * @unimplemented
 *
 */
public class EightBitConverter {
	
	public EightBitConverter(){
		
	}
	
	
}
