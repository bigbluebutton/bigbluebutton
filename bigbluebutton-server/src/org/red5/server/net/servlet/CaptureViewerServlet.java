package org.red5.server.net.servlet;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.ByteOrder;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.mina.common.ByteBuffer;
import org.red5.io.object.Deserializer;
import org.red5.io.utils.HexDump;
import org.red5.server.net.protocol.ProtocolException;
import org.red5.server.net.rtmp.codec.RTMP;
import org.red5.server.net.rtmp.codec.RTMPProtocolDecoder;
import org.red5.server.net.rtmp.message.Packet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * The Class CaptureViewerServlet.
 */
public class CaptureViewerServlet extends HttpServlet {


	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -1306102075849918166L;
    
    /** Logger. */
	private static Logger log = LoggerFactory.getLogger(CaptureViewerServlet.class);
    
    /** The decoder. */
	private RTMPProtocolDecoder decoder;
    
    /** The deserializer. */
	private Deserializer deserializer;

	/** {@inheritDoc} */
    @Override
	public void init() throws ServletException {
		super.init();
		try {
			decoder = new RTMPProtocolDecoder();
			deserializer = new Deserializer();
			decoder.setDeserializer(deserializer);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			log.error("{}", e);
		}
	}

	/**
	 * Writes HTML out of dump.
	 * 
	 * @param req the req
	 * @param resp the resp
	 * 
	 * @throws ServletException the servlet exception
	 */
    @Override
	protected void service(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException {

		try {
			PrintWriter out = resp.getWriter();
			resp.setHeader("Content-type", "text/html");
			out.write("<html><head>");
			out
					.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"capture.css\" />");
			out.write("</head><body>");

			String capFileName = req.getRequestURI().substring(req.getContextPath().length() + 1);
			String rawFileName = capFileName.substring(0, capFileName.length() - 4) + ".raw";

            File capFile = new File(getServletContext()
					.getRealPath(capFileName));
			File rawFile = new File(getServletContext()
					.getRealPath(rawFileName));
			FileInputStream capFis = new FileInputStream(capFile);
			FileInputStream rawFis = new FileInputStream(rawFile);
			FileChannel capChannel = capFis.getChannel();
			FileChannel rawChannel = rawFis.getChannel();
			MappedByteBuffer capMappedFile, rawMappedFile;
			try {
				capMappedFile = capChannel.map(FileChannel.MapMode.READ_ONLY,
						0, capChannel.size());
				rawMappedFile = rawChannel.map(FileChannel.MapMode.READ_ONLY,
						0, rawChannel.size());
			} catch (IOException e) {
				log.error("error mapping file", e);
				return;
			}
			capMappedFile.order(ByteOrder.BIG_ENDIAN);
			rawMappedFile.order(ByteOrder.BIG_ENDIAN);
			ByteBuffer cap = ByteBuffer.wrap(capMappedFile);
			ByteBuffer in = ByteBuffer.wrap(rawMappedFile);

			boolean serverMode = (cap.get() == (byte) 0x01);
			out.write("Mode: " + (serverMode ? "UPSTREAM" : "DOWNSTREAM"));
			RTMP state = new RTMP(serverMode);
			int id = 0;
			try {

				int nextTimePos = 0;
				long time = 0;
				long offset = -1;
				long read = 0;

				try {
					while (true) {

						while (in.position() >= nextTimePos) {

							if (cap.remaining() >= 12) {

								time = cap.getLong();
								if (offset == -1) {
									offset = time;
								}
								time -= offset;

								read = cap.getInt();
								nextTimePos += read;

								out.write("<div class=\"time\">TIME: " + time
										+ " READ: " + read + "</div>");
							}

						}

						final int remaining = in.remaining();
						if (state.canStartDecoding(remaining)) {
							state.startDecoding();
						} else {
							break;
						}

						final Object decodedObject = decoder.decode(state, in);

						if (state.hasDecodedObject()) {
							// log.debug(decodedObject);

							if (decodedObject instanceof Packet) {
								out.write(formatHTML((Packet) decodedObject,
										id++, 0));
							} else if (decodedObject instanceof ByteBuffer) {
								ByteBuffer buf = (ByteBuffer) decodedObject;
								out
										.write("<div class=\"handshake\"><pre>"
												+ HexDump.formatHexDump(buf
														.getHexDump())
												+ "</pre></div>");
							}
						} else if (state.canContinueDecoding()) {
							continue;
						} else {
							break;
						}

						if (!in.hasRemaining()) {
							break;
						}
					}
				} catch (ProtocolException pvx) {
					log.error("Error decoding buffer", pvx);
				} catch (Exception ex) {
					log.error("Error decoding buffer", ex);
				}

			} catch (RuntimeException e) {
				log.error("Error", e);
			}
			out.flush();
		} catch (FileNotFoundException e) {
			log.error("{}", e);
		} catch (IOException e) {
			log.error("{}", e);
		}

	}


    //public void decodeBuffer(PrintWriter out, ProtocolState state,
	//		ByteBuffer buffer, long time, int id) {
    //
	//}

    /**
     * Formats HTML.
     * 
     * @param packet         RTMP packet
     * @param id             id
     * @param time           Time
     * 
     * @return               Formatted packet representation in HTML
     */
    public String formatHTML(Packet packet, int id, long time) {
		StringBuilder out = new StringBuilder();
		// classes += "sec_"+ time +
		out.append("<div id=\"packet_");
		out.append(id);
		out.append("\" class=");
		
		out.append("channel_");
		out.append(packet.getHeader().getChannelId());
		out.append(" datatype_");
		out.append(packet.getHeader().getDataType());
		
		out.append("\">\n<pre>\n");
		out.append(packet.getHeader().toString());
		out.append("\n");
		out.append(packet.getMessage().toString());
		out.append("\n<pre>\n</div>\n\n");
		return out.toString();
	}

}
