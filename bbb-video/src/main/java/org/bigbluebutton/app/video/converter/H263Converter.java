package org.bigbluebutton.app.video.converter;

import org.bigbluebutton.app.video.ffmpeg.FFmpegCommand;
import org.bigbluebutton.app.video.ffmpeg.ProcessMonitor;
import org.bigbluebutton.app.video.ffmpeg.ProcessMonitorObserver;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

/**
 * Represents a stream converter to H263. This class is responsible
 * for managing the execution of FFmpeg based on the number of listeners
 * connected to the stream. When the first listener is added FFmpef is
 * launched, and when the last listener is removed FFmpeg is stopped.
 * Converted streams are published in the same scope as the original ones,
 * with 'h263/' appended in the beginning.
 */
public class H263Converter implements ProcessMonitorObserver{

	private static Logger log = Red5LoggerFactory.getLogger(H263Converter.class, "video");

	public final static String H263PREFIX = "h263/";

	private String origin;
	private Integer numListeners = 0;

	private FFmpegCommand ffmpeg;
	private ProcessMonitor processMonitor;
	
	/**
	 * Creates a H263Converter from a given streamName. It is assumed
	 * that one listener is responsible for this creation, therefore
	 * FFmpeg is launched.
	 * 
	 * @param origin streamName of the stream that should be converted
	 */
	public H263Converter(String origin) {
		log.info("Spawn FFMpeg to convert H264 to H263 for stream [{}]", origin);
		this.origin = origin;
		IConnection conn = Red5.getConnectionLocal();
		String ip = conn.getHost();
		String conf = conn.getScope().getName();
		String inputLive = "rtmp://" + ip + "/video/" + conf + "/" + origin + " live=1";

		String output = "rtmp://" + ip + "/video/" + conf + "/" + H263PREFIX + origin;

		ffmpeg = new FFmpegCommand();
		ffmpeg.setFFmpegPath("/usr/local/bin/ffmpeg");
		ffmpeg.setInput(inputLive);
		ffmpeg.setCodec("flv1"); // Sorensen H263
		ffmpeg.setFormat("flv");
		ffmpeg.setOutput(output);
		ffmpeg.setAudioEnabled(false);
		ffmpeg.setLoglevel("quiet");
		ffmpeg.setAnalyzeDuration("10000"); // 10ms

	}

	/**
	 * Launches the process monitor responsible for FFmpeg.
	 */
	private void startConverter() {
		String[] command = ffmpeg.getFFmpegCommand(true);
		processMonitor = new ProcessMonitor(command,"FFMPEG");
		processMonitor.setProcessMonitorObserver(this);
		processMonitor.start();
	}

	/**
	 * Adds a listener to H263Converter. If there were
	 * zero listeners, FFmpeg is launched for this stream.
	 */
	public synchronized void addListener() {
		this.numListeners++;
		log.debug("Adding listener to [{}] ; [{}] current listeners ", origin, this.numListeners);

		if(this.numListeners.equals(1)) {
			log.debug("First listener just joined, must start H263Converter for [{}]", origin);
			startConverter();
		}
	}

	/**
	 * Removes a listener from H263Converter. There are
	 * zero listeners left, FFmpeg is stopped this stream.
	 */
	public synchronized void removeListener() {
		this.numListeners--;
		log.debug("Removing listener from [{}] ; [{}] current listeners ", origin, this.numListeners);

		if(this.numListeners <= 0) {
			log.debug("No more listeners, may close H263Converter for [{}]", origin);
			this.stopConverter();
		}
	}

	/**
	 * Stops FFmpeg for this stream and sets the number of
	 * listeners to zero.
	 */
	public synchronized void stopConverter() {
		this.numListeners = 0;
		if(processMonitor != null) {
			processMonitor.forceDestroy();
			processMonitor = null;
		}
	}

    private synchronized void clearConverterData(){
        if(processMonitor!=null){
            log.debug("Clearing process monitor's data.");
            this.numListeners = 0;
            processMonitor=null;
        }
    }

    @Override
    public void handleProcessFinishedUnsuccessfully(String processName, String processOutput){}

    @Override
    public void handleProcessFinishedWithSuccess(String processName, String processOutput){
        log.debug("{} finished successfully [output={}]. ",processName,processOutput);
        //clearConverterData();
    }
}
