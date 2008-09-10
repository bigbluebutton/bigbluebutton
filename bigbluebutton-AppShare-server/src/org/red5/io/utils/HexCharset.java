package org.red5.io.utils;

import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.nio.charset.CharsetEncoder;
import java.nio.charset.CoderResult;

// TODO: Auto-generated Javadoc
/**
 * This was borrowed from the Soupdragon base64 library.
 * 
 * @author paul.gregoire
 */
public class HexCharset extends Charset {

	/**
	 * The Class Decoder.
	 */
	public class Decoder extends CharsetDecoder {

		/** The char count. */
		private int charCount;

		/* (non-Javadoc)
		 * @see java.nio.charset.CharsetDecoder#decodeLoop(java.nio.ByteBuffer, java.nio.CharBuffer)
		 */
		public CoderResult decodeLoop(ByteBuffer in, CharBuffer out) {
			while (in.remaining() > 0) {
				if (measure != null && charCount >= measure.intValue()) {
					if (out.remaining() == 0)
						return CoderResult.OVERFLOW;
					out.put('\n');
					charCount = 0;
				}
				if (out.remaining() < 2)
					return CoderResult.OVERFLOW;
				int b = in.get() & 0xff;
				out.put(codes.charAt(b >>> 4));
				out.put(codes.charAt(b & 0xf));
				charCount += 2;
			}
			return CoderResult.UNDERFLOW;
		}

		/* (non-Javadoc)
		 * @see java.nio.charset.CharsetDecoder#implReset()
		 */
		protected void implReset() {
			charCount = 0;
		}

		/**
		 * Instantiates a new decoder.
		 */
		private Decoder() {
			super(HexCharset.this, 2.0F,
					measure != null ? 2.0F + 2.0F / (float) measure.intValue()
							: 2.0F);
		}

		/**
		 * Instantiates a new decoder.
		 * 
		 * @param x1 the x1
		 */
		Decoder(_cls1 x1) {
			this();
			return;
		}

	}

	/**
	 * The Class Encoder.
	 */
	public class Encoder extends CharsetEncoder {

		/** The unpaired. */
		private boolean unpaired;

		/** The nyble. */
		private int nyble;

		/* (non-Javadoc)
		 * @see java.nio.charset.CharsetEncoder#implFlush(java.nio.ByteBuffer)
		 */
		protected CoderResult implFlush(ByteBuffer out) {
			if (!unpaired) {
				implReset();
				return CoderResult.UNDERFLOW;
			} else {
				throw new IllegalArgumentException(
						"Hex string must be an even number of digits");
			}
		}

		/* (non-Javadoc)
		 * @see java.nio.charset.CharsetEncoder#encodeLoop(java.nio.CharBuffer, java.nio.ByteBuffer)
		 */
		public CoderResult encodeLoop(CharBuffer in, ByteBuffer out) {
			do {
				if (in.remaining() <= 0)
					break;
				if (out.remaining() <= 0)
					return CoderResult.OVERFLOW;
				char inch = in.get();
				if (!Character.isWhitespace(inch)) {
					int d = Character.digit(inch, 16);
					if (d < 0)
						throw new IllegalArgumentException(
								(new StringBuilder()).append(
										"Bad hex character ").append(inch)
										.toString());
					if (unpaired)
						out.put((byte) (nyble | d));
					else
						nyble = d << 4;
					unpaired = !unpaired;
				}
			} while (true);
			return CoderResult.UNDERFLOW;
		}

		/* (non-Javadoc)
		 * @see java.nio.charset.CharsetEncoder#implReset()
		 */
		protected void implReset() {
			unpaired = false;
			nyble = 0;
		}

		/**
		 * Instantiates a new encoder.
		 */
		private Encoder() {
			super(HexCharset.this, 0.49F, 1.0F);
		}

		/**
		 * Instantiates a new encoder.
		 * 
		 * @param x1 the x1
		 */
		Encoder(_cls1 x1) {
			this();
			return;
		}

	}

	/** The Constant codeHEX. */
	private static final String codeHEX = "0123456789ABCDEF";

	/** The Constant codehex. */
	private static final String codehex = "0123456789abcdef";

	/** The codes. */
	private String codes;

	/** The measure. */
	private Integer measure;

	/**
	 * Instantiates a new hex charset.
	 * 
	 * @param caps the caps
	 */
	public HexCharset(boolean caps) {
		super(caps ? "HEX" : "hex", new String[] { "HEX" });
		codes = caps ? "0123456789ABCDEF" : "0123456789abcdef";
	}

	/**
	 * Instantiates a new hex charset.
	 * 
	 * @param caps the caps
	 * @param measure the measure
	 */
	public HexCharset(boolean caps, int measure) {
		super((new StringBuilder()).append(caps ? "HEX" : "hex").append(":")
				.append(measure).toString(), new String[] { "HEX" });
		codes = caps ? codeHEX : codehex;
		this.measure = Integer.valueOf(measure);
	}

	/* (non-Javadoc)
	 * @see java.nio.charset.Charset#newEncoder()
	 */
	public CharsetEncoder newEncoder() {
		return new Encoder();
	}

	/* (non-Javadoc)
	 * @see java.nio.charset.Charset#newDecoder()
	 */
	public CharsetDecoder newDecoder() {
		return new Decoder();
	}

	/* (non-Javadoc)
	 * @see java.nio.charset.Charset#contains(java.nio.charset.Charset)
	 */
	public boolean contains(Charset cs) {
		return cs instanceof HexCharset;
	}

	/**
	 * Access$200.
	 * 
	 * @param x0 the x0
	 * 
	 * @return the integer
	 */
	static Integer access$200(HexCharset x0) {
		return x0.measure;
	}

	/**
	 * Access$300.
	 * 
	 * @param x0 the x0
	 * 
	 * @return the string
	 */
	static String access$300(HexCharset x0) {
		return x0.codes;
	}

	// Unreferenced inner class soupdragon/codec/HexCharset$1

	/* anonymous class */
	/**
	 * The Class _cls1.
	 */
	static class _cls1 {

	}

}