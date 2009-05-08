/*
 * Copyright (c) 2008-2009 by Xuggle Inc. All rights reserved.
 *
 * It is REQUESTED BUT NOT REQUIRED if you use this library, that you let 
 * us know by sending e-mail to info@xuggle.com telling us briefly how you're
 * using the library and what you like or don't like about it.
 *
 * This library is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
 * version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this library; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 */
package deskShare;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.IStreamPacket;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.net.rtmp.event.VideoData;
import org.slf4j.Logger;

import com.xuggle.xuggler.ICodec;
import com.xuggle.xuggler.IContainer;
import com.xuggle.xuggler.IContainerFormat;
import com.xuggle.xuggler.IVideoPicture;
import com.xuggle.xuggler.IPacket;
import com.xuggle.xuggler.IRational;
import com.xuggle.xuggler.ISimpleMediaFile;
import com.xuggle.xuggler.IStream;
import com.xuggle.xuggler.IStreamCoder;
import com.xuggle.xuggler.IVideoResampler;
import com.xuggle.xuggler.SimpleMediaFile;

import com.xuggle.red5.IPacketListener;
import com.xuggle.red5.IVideoPictureListener;
import com.xuggle.red5.io.BroadcastStream;
import com.xuggle.red5.io.IRTMPEventIOHandler;
import com.xuggle.red5.io.Red5HandlerFactory;
import com.xuggle.red5.io.Red5Message;
import com.xuggle.red5.io.Red5StreamingQueue;

/**
 * Transcodes video and audio of a particular type from a red5 stream
 * into a new audio and video red5 stream.
 * <p>
 * It does this by opening an input URL, decoding all packets
 * in the container, resampling the decoded data if needed,
 * and then encoding into a new container.
 * </p>
 * <p>
 * It also allows hooking of call-back
 * listeners so you can be notified of key event and
 * potentially modify decoded data before re-encoding.
 * </p>
 */
public class StreamConverter implements Runnable
{
  final private Logger log = Red5LoggerFactory.getLogger(this.getClass());

  // This line initializes the AAFFMPEG IO libraries and gets a factory
  // we can register streams with.
  final static private Red5HandlerFactory mFactory = Red5HandlerFactory.getFactory();

  //private final IBroadcastStream mInputStream;
  private final Red5StreamingQueue mInputQueue;
  private final IStreamListener mInputListener;
  private final BroadcastStream mOutputStream;
  private final ISimpleMediaFile mOutputInfo;
  private final IRTMPEventIOHandler mOutputHandler;
  private final IPacketListener mPacketListener;
  private final IVideoPictureListener mVideoPictureListener;

  private volatile boolean mIsRunning=false;
  private volatile boolean mKeepRunning=true;

  private String mInputURL;
  private String mOutputURL;
  private IContainer mOutContainer;
  private IStreamCoder mOutVideoCoder;
  private IContainer mInContainer;
  private IStreamCoder mInVideoCoder;
  private IVideoResampler mVideoResampler;
  private int mVideoStreamId;

  /**
   * Create a new transcoder object.
   * 
   * All listeners are set to null.
   *  
   * @param aInputStream The stream to get input packets from.
   * @param aOutputStream The stream to publish output packets to.
   * @param aOutputInfo Meta data about what type of packets you want to publish.
   */
  public StreamConverter(
      IContainer inContainer,
      BroadcastStream aOutputStream,
      ISimpleMediaFile aOutputInfo
  )
  {
    this(inContainer, aOutputStream, aOutputInfo, null, null);
  }
  
  /**
   * Create a new transcoder object.
   * 
   * All listeners are set to null.
   *  
   * @param aInputStream The stream to get input packets from.
   * @param aOutputStream The stream to publish output packets to.
   * @param aOutputInfo Meta data about what type of packets you want to publish.
   * @param aPacketListener A packet listener that will be called for interesting events.  Or null to disable.
   * @param aSamplesListener A Audio Samples listener that will be called for interesting events.  Or null to disable.
   * @param aPictureListener A Video Picture listener that will be called for interesting events.  Or null to disable.
   */
  public StreamConverter(
      IContainer inContainer,
      BroadcastStream aOutputStream,
      ISimpleMediaFile aOutputInfo,
      IPacketListener aPacketListener,
      IVideoPictureListener aPictureListener
  )
  {
    
    //mInputStream = aInputStream;
    mOutputStream = aOutputStream;
    mOutputInfo = aOutputInfo;
    mInputQueue = new Red5StreamingQueue();
    mPacketListener = aPacketListener;
    mVideoPictureListener = aPictureListener;
    
    mVideoStreamId = -1;

    // Check that we have valid input and output formats if specified
    if (mOutputInfo.getContainerFormat() != null)
    {
      IContainerFormat fmt = mOutputInfo.getContainerFormat();
      if (fmt.getInputFormatShortName() != "flv")
        throw new IllegalArgumentException("currently we only support inputs from FLV files");
    }
    // Make sure if specifying audio that we have all required parameters set.
    if (mOutputInfo.hasAudio())
    {
      if (!mOutputInfo.isAudioBitRateKnown() || mOutputInfo.getAudioBitRate() <= 0)
        throw new IllegalArgumentException("must set audio bit rate when outputting audio");
      if (!mOutputInfo.isAudioChannelsKnown() || mOutputInfo.getAudioChannels() <= 0)
        throw new IllegalArgumentException("must set audio channels when outputting audio");
      if (!mOutputInfo.isAudioSampleRateKnown() || mOutputInfo.getAudioSampleRate() <= 0)
        throw new IllegalArgumentException("must set audio sample rate when outputting audio");
      if (mOutputInfo.getAudioCodec() == ICodec.ID.CODEC_ID_NONE)
        throw new IllegalArgumentException("must set audio code when outputting audio");
    }
    if (mOutputInfo.hasVideo())
    {
      if (!mOutputInfo.isVideoBitRateKnown() || mOutputInfo.getVideoBitRate() <= 0)
        throw new IllegalArgumentException("must set video bit rate when outputting video");
      if (!mOutputInfo.isVideoHeightKnown() || mOutputInfo.getVideoHeight() <= 0)
        throw new IllegalArgumentException("must set video height when outputting video");
      if (!mOutputInfo.isVideoWidthKnown() || mOutputInfo.getVideoWidth() <= 0)
        throw new IllegalArgumentException("must set video width when outputting video");
      if (mOutputInfo.getVideoCodec() == ICodec.ID.CODEC_ID_NONE)
        throw new IllegalArgumentException("must set video codec when outputting video");
      if (!IVideoResampler.isSupported(IVideoResampler.Feature.FEATURE_IMAGERESCALING))
        log.warn("Your installed version of AAFFMPEG doesn't support video resampling; Transcoding will fail if resizing is required");
    }
    if (!(mOutputInfo.hasAudio() || mOutputInfo.hasVideo()))
      throw new IllegalArgumentException("must output either audio or video");
    
    // Make FFMPEG return back if a read takes longer than 2 seconds.  Unfortunately
    // it means FFMPEG will think the stream has ended, but them's the breaks.
    //mInputQueue.setReadTimeout(new TimeValue(2, TimeUnit.SECONDS));
    mInputListener = new IStreamListener(){
      public void packetReceived(IBroadcastStream aStream, IStreamPacket aPacket)
      {
        try {
          
          if (aPacket instanceof VideoData)
          {
            Red5Message.Type type = Red5Message.Type.INTERFRAME;
            VideoData dataPacket = (VideoData)aPacket;
            switch(dataPacket.getFrameType())
            {
            case DISPOSABLE_INTERFRAME:
              type = Red5Message.Type.DISPOSABLE_INTERFRAME;
              break;
            case INTERFRAME:
              type = Red5Message.Type.INTERFRAME;
              break;
            case KEYFRAME:
            case UNKNOWN:
              type = Red5Message.Type.KEY_FRAME;
              break;
            }
            if (type != Red5Message.Type.DISPOSABLE_INTERFRAME) // The FFMPEG FLV decoder doesn't handle disposable frames
            {
              log.debug("  adding packet type: {}; ts: {}; on stream: {}",
                  new Object[]{dataPacket.getFrameType(), aPacket.getTimestamp(), aStream.getPublishedName()});
              mInputQueue.put(new Red5Message(type, dataPacket));
            }
          } else if (aPacket instanceof IRTMPEvent)
          {
            log.debug("  adding packet type: {}; ts: {}; on stream: {}",
                new Object[]{"OTHER", aPacket.getTimestamp(), aStream.getPublishedName()});
            Red5Message.Type type = Red5Message.Type.OTHER;
            IRTMPEvent dataPacket = (IRTMPEvent)aPacket;
            mInputQueue.put(new Red5Message(type, dataPacket));
          }
          else
          {
            log.debug("dropping packet type: {}; ts: {}; on stream: {}",
                new Object[]{"UNKNOWN", aPacket.getTimestamp(), aStream.getPublishedName()});
          }
        } catch (InterruptedException ex)
        {
          log.error("exception: {}", ex);
        } finally {
        }
      }

    };
    mOutputHandler = new IRTMPEventIOHandler()
    {
      /**
       * Reading not supported on this handler.
       * @return null
       */
      public Red5Message read() throws InterruptedException
      {
        return null;
      }

      public void write(Red5Message aMsg) throws InterruptedException
      {
        try {

          IRTMPEvent event = aMsg.getData();
          if (event != null)
          {
            mOutputStream.dispatchEvent(event);
            event.release();
          }
        } finally {
        }
      }
    };

  }

  /**
   * Is the main loop running?
   * 
   * @see #run()
   * @return true if the loop is running, false otherwise.
   */
  public boolean isRunning()
  {
    return mIsRunning;
  }

  /**
   * Stop the {@link Transcoder} loop if it's running
   * on a separate thread.
   * <p>
   * It does this by sending a
   * {@link Red5Message} for the end of stream 
   * 
   * to the {@link Transcoder} and allowing it to
   * exit gracefully.
   * </p>
   * @see #run()
   */
  public void stop()
  {
    try
    {
      mInputQueue.put(new Red5Message(Red5Message.Type.END_STREAM, null));
    }
    catch (InterruptedException e)
    {
      log.error("exception: {}", e);
    }
    mKeepRunning = false;
  }

  /**
   * Open up all input and ouput containers (files)
   * and being transcoding.
   * <p>
   * The {@link Transcoder} requires its own thread to
   * do work on, and callers are responsible for
   * allocating the {@link Thread}.
   * </p>
   * <p>
   * This method does not return unless another thread
   * calls {@link Transcoder#stop()}, or it reaches
   * the end of a Red5 stream.  It is meant to
   * be passed as the {@link Runnable#run()} method
   * for a thread.
   * </p>
   */
  public void run()
  {
    try
    {
      openContainer();
      transcode();
    }
    catch (Throwable e)
    {
      log.error("uncaught exception: " + e.getMessage());
      e.printStackTrace();
    }
    finally
    {
      closeContainer();
    }
  }

  private void transcode()
  {
    int retval = -1;
    synchronized(this)
    {
      mIsRunning = true;
      notifyAll();
    }
  
    IPacket iPacket = IPacket.make();
    log.debug("Packets and Audio buffers created");
  
    while (mKeepRunning) {
  
      try {
        try {
          retval = mInContainer.readNextPacket(iPacket);
        } finally {
        }
        if (retval <0)
        {
          log.debug("container is empty; exiting transcoding thread");
          mKeepRunning = false;
          break;
        }
        log.debug("next packet read");
        IPacket decodePacket = iPacket;
        if (mPacketListener != null)
        {
          try {
            decodePacket = mPacketListener.preDecode(iPacket);
            if (decodePacket == null)
              decodePacket = iPacket;
          } finally {
          }
        }
        openInputCoders(decodePacket); // reopen the input coders if we need to
        int i = decodePacket.getStreamIndex();
        if (i == mVideoStreamId) {
          log.debug("video stream id matches: {}", i);
          if (mInVideoCoder == null)
            throw new RuntimeException("video coder not set up");

          if (mOutputInfo.hasVideo())
            decodeVideo(decodePacket);
          else
            log.debug("dropping video because output has no video");
        } else {
          log.debug("dropping packet from stream we haven't set-up: {}", i);
        }
      } finally {
      }
    }
  }

  private void openContainer()
  {
    try {
      // set out thread name
      String threadName = "Transcoder[]";
      log.debug("Changing thread name: {}; to {};", Thread.currentThread().getName(), threadName);
      Thread.currentThread().setName(threadName);
      int retval = -1;
  
      // First let's setup our input URL
      {
        // Register a new listener; should hopefully start getting audio packets immediately
        //mInputStream.addStreamListener(mInputListener);
  
        // Tell AAFFMPEG about our new input URL; we use the unique Red5 names for the url
        mInputURL = Red5HandlerFactory.DEFAULT_PROTOCOL;
        ISimpleMediaFile inputInfo = new SimpleMediaFile();
        inputInfo.setURL(mInputURL);
        mFactory.registerStream(mInputQueue, inputInfo);
  
        mInContainer = IContainer.make();
        // NOTE: This will block until we get the later of the first audio if it has audio, or first video
        // if it has video
        log.debug("About to open input url: {}", mInputURL);
        IContainerFormat inFormat = IContainerFormat.make();
        inFormat.setInputFormat("flv"); // set the input format to avoid FFMPEG probing
        retval = mInContainer.open(mInputURL, IContainer.Type.READ, inFormat, true, false);
        if (retval < 0)
        {
          throw new RuntimeException("Could not open input: " + mInputURL);
        }
      }
      // Now, let's first set up our output URL
      {
        // Tell AAFFMPEG about out output URL
        mOutputURL = Red5HandlerFactory.DEFAULT_PROTOCOL+":"+mOutputStream.getName();
        mOutputInfo.setURL(mOutputURL);
        // For the output URL, every time we get a packet we just dispatch it to
        // a stream; you also use a Red5StreamingQueue here if you wanted to
        // have another thread deal with broadcasting.
        mFactory.registerStream(mOutputHandler, mOutputInfo);
  
        mOutContainer = IContainer.make();
        IContainerFormat outFormat = IContainerFormat.make();
        outFormat.setOutputFormat("flv", mOutputURL, null);
        retval = mOutContainer.open(mOutputURL, IContainer.Type.WRITE, outFormat);
        if (retval < 0)
          throw new RuntimeException("could not open output: "+mOutputURL);
  
        if (mOutputInfo.hasVideo())
        {
          // Add a video stream
          IStream outStream = mOutContainer.addNewStream(1);
          if (outStream == null)
            throw new RuntimeException("could not add video stream to output: "+mOutputURL);
          IStreamCoder outCoder = outStream.getStreamCoder();
          ICodec.ID outCodecId = mOutputInfo.getVideoCodec();
          ICodec outCodec = ICodec.findEncodingCodec(outCodecId);
          if (outCodec == null)
          {
            log.error("Could not encode using the codec: {}", mOutputInfo.getAudioCodec());
            throw new RuntimeException("Could not encode using the codec: "+mOutputInfo.getAudioCodec());
          }
          outCoder.setCodec(outCodec);
          outCoder.setWidth(mOutputInfo.getVideoWidth());
          outCoder.setHeight(mOutputInfo.getVideoHeight());
          outCoder.setPixelType(mOutputInfo.getVideoPixelFormat());
          outCoder.setGlobalQuality(mOutputInfo.getVideoGlobalQuality());
          outCoder.setBitRate(mOutputInfo.getVideoBitRate());
          outCoder.setNumPicturesInGroupOfPictures(mOutputInfo.getVideoNumPicturesInGroupOfPictures());
          outCoder.setFlag(IStreamCoder.Flags.FLAG_QSCALE, true);

          if (mOutputInfo.getVideoTimeBase() != null)
            outCoder.setTimeBase(mOutputInfo.getVideoTimeBase());
          else
            outCoder.setTimeBase(IRational.make(1, 1000)); // default to FLV

          outCoder.open();
          // if we get here w/o an exception, record the coder
          mOutVideoCoder = outCoder;
        }
      }
      retval = mOutContainer.writeHeader();
      if (retval < 0)
      {
        throw new RuntimeException("could not write header for output");
      }
    } finally {
    }
  
  }

  private void openInputCoders(IPacket packet)
  {
    {
      IStreamCoder videoCoder = null;
      if (mVideoStreamId == -1)
      {
        int numStreams = mInContainer.getNumStreams();
        log.debug("found {} streams in {}", numStreams, mInputURL);

        for(int i  = 0; i < numStreams; i++)
        {
          IStream stream = mInContainer.getStream(i);
          if (stream != null)
          {
            log.debug("found stream #{} in {}", i, mInputURL);
            IStreamCoder coder = stream.getStreamCoder();
            if (coder != null)
            {
              log.debug("got stream coder {} (type: {}) in {}",
                  new Object[]{coder, coder.getCodecType(), mInputURL});
              
              if (coder.getCodecType()==ICodec.Type.CODEC_TYPE_VIDEO // if video
                  && mVideoStreamId == -1 // and we haven't already initialized
                  && packet.getStreamIndex() == i // and this packet is also video
                  )
              {
                log.debug("found video stream: {} in {}", i, mInputURL);
                if (coder.getCodec() != null)
                {
                  videoCoder = coder;
                  mVideoStreamId = i;
                } else {
                  log.error("could not find codec for video stream: {}, {}", i, coder.getCodecID());
                  throw new RuntimeException("Could not find codec for video stream");
                }
              }
            }
          }
        }
      }
      
      if (mVideoStreamId != -1 &&  mInVideoCoder == null)
      {
        log.debug("opening input video coder; codec id: {}; actual codec: {}; width: {}; height: {}",
            new Object[]{
            videoCoder.getCodecID(),
            videoCoder.getCodec().getID(),
            videoCoder.getWidth(),
            videoCoder.getHeight()
        });

        if (videoCoder.open() < 0)
          throw new RuntimeException("could not open video coder for stream: " + mVideoStreamId);
        mInVideoCoder = videoCoder;
      }
    }
  }

  private void openVideoResampler(IVideoPicture picture)
  {
    if (mVideoResampler == null && mOutVideoCoder != null)
    {
      if (picture.getWidth() <= 0 || picture.getHeight()<=0)
        throw new RuntimeException("frame has no data in it so cannot resample");

      // We set up our resampler.
      if (mOutVideoCoder.getPixelType() != picture.getPixelType() ||
          mOutVideoCoder.getWidth() != picture.getWidth() ||
          mOutVideoCoder.getHeight() != picture.getHeight())
      {
        mVideoResampler = IVideoResampler.make(
            mOutVideoCoder.getWidth(),
            mOutVideoCoder.getHeight(),
            mOutVideoCoder.getPixelType(),
            picture.getWidth(),
            picture.getHeight(),
            picture.getPixelType());
        if (mVideoResampler == null)
        {
          log.error("Could not create a video resampler; this object is only available in the GPL version of aaffmpeg");
          throw new RuntimeException("needed to resample video but couldn't allocate a resampler; you need the GPL version of AAFFMPEG installed?");
        }
      }
    }
  }

  private void closeContainer()
  {
    try
    {
      try
      {
        //mInputStream.removeStreamListener(mInputListener);
        if (mOutContainer != null)
          mOutContainer.writeTrailer();
        if (mOutVideoCoder != null)
          mOutVideoCoder.close();
        mOutVideoCoder = null;
        if (mInVideoCoder != null)
          mInVideoCoder.close();
        mInVideoCoder = null;
        if (mOutContainer != null)
          mOutContainer.close();
        mOutContainer = null;
      }
      finally
      {
        synchronized(this)
        {
          mIsRunning = false;
          notifyAll();
        }
      }
    } finally {
    }
  
  }

  private void writePacket(IPacket oPacket)
  {
    int retval;
    IPacket encodedPacket = oPacket;
    if (mPacketListener != null)
    {
      try {
        encodedPacket = mPacketListener.postEncode(oPacket);
        if (encodedPacket == null)
          encodedPacket = oPacket;
      } finally {
      }
    }
  
    // Don't force interleaving of data
    try {
      retval = mOutContainer.writePacket(encodedPacket,
          false);
    } finally {
    }
  
    if (retval < 0) {
      throw new RuntimeException(
      "could not write output packet");
    }
  }

  private void decodeVideo(IPacket decodePacket)
  {
    int retval = -1;
    // Note that we don't specify the input width and height; the StreamCoder will fill that
    // in when it decodes
    IVideoPicture inPicture = IVideoPicture.make(mInVideoCoder.getPixelType(), mInVideoCoder.getWidth(), mInVideoCoder.getHeight());
    // resampled video
    IVideoPicture reSample = null;
  
    int offset = 0;
  
    while (offset < decodePacket.getSize()) {
      log.debug("ready to decode video; keyframe: {}", decodePacket.isKey());
      try{
        retval = mInVideoCoder.decodeVideo(inPicture, decodePacket, offset);
      } finally {
      }
      log.debug("decode video completed; packet size: {}; offset: {}; bytes consumed: {}; frame complete: {}; width: {}; height: {}",
          new Object[]{
          decodePacket.getSize(),
          offset,
          retval,
          inPicture.isComplete(),
          inPicture.getWidth(),
          inPicture.getHeight()
      });
      if (retval <= 0) {
        throw new RuntimeException("could not decode video");
      }
      offset += retval;
      
      IVideoPicture postDecode = inPicture;
      if (mVideoPictureListener != null)
      {
        try {
          postDecode = mVideoPictureListener.postDecode(inPicture);
          if (postDecode == null)
            postDecode = inPicture;
        } finally {
        }
      }
      
      if (postDecode.isComplete())
      {
        reSample = resampleVideo(postDecode);
      }
      else
      {
        reSample = postDecode;
      }
      if (reSample.isComplete())
      {
        encodeVideo(reSample);
      }
    }
  }

  private void encodeVideo(IVideoPicture picture)
  {
    int retval;
    IPacket oPacket = IPacket.make();

    /**
     * NOTE: At this point reSamples contains the actual unencoded raw samples.
     * 
     * The next step does an encoding, but you PROBABLY don't need to do that.
     * Instead, you could copy the reSamples.getSamples().getData(...) bytes
     * into your own structure and hand them off, but for now, we'll
     * try re-encoding as FLV with PCM embedded.
     */
    IVideoPicture preEncode= picture;
    if (mVideoPictureListener != null)
    {
      try {
        preEncode = mVideoPictureListener.preEncode(picture);
        if (preEncode == null)
          preEncode = picture;
      } finally {
      }
    }

    int numBytesConsumed = 0;
    if (preEncode.isComplete()) {
      log.debug("ready to encode video");

      try {
        retval = mOutVideoCoder.encodeVideo(oPacket, preEncode, 0);
      } finally {
      }
      if (retval <= 0) {
        // If we fail to encode, complain loudly but still keep going
        log.error("could not encode video picture; continuing anyway");
      } else {
        log.debug("encode video completed");
        numBytesConsumed += retval;
      }
      if (oPacket.isComplete()) {
        writePacket(oPacket);
      }
    }
  }

  private IVideoPicture resampleVideo(IVideoPicture picture)
  {
    IVideoPicture reSample;
    
    openVideoResampler(picture);

    if (mVideoResampler != null) {
      log.debug("ready to resample video");

      IVideoPicture outPicture = IVideoPicture.make(mOutVideoCoder.getPixelType(), mOutVideoCoder.getWidth(), mOutVideoCoder.getHeight());

      IVideoPicture preResample= picture;
      if (mVideoPictureListener != null)
      {
        try {
          preResample = mVideoPictureListener.preResample(picture);
          if (preResample == null)
            preResample = picture;
        } finally {
        }
      }

      int retval = -1;
      try{
        retval = mVideoResampler.resample(outPicture, preResample);
      } finally {
      }
      if (retval < 0)
        throw new RuntimeException("could not resample video");
      log.debug("resampled input picture (type: {}; width: {}; height: {}) to output (type: {}; width: {}; height: {})",
          new Object[]{
            preResample.getPixelType(),
            preResample.getWidth(),
            preResample.getHeight(),
            outPicture.getPixelType(),
            outPicture.getWidth(),
            outPicture.getHeight()
      });
      IVideoPicture postResample= outPicture;
      if (mVideoPictureListener != null)
      {
        try {
          postResample = mVideoPictureListener.postResample(outPicture);
          if (postResample == null)
            postResample = outPicture;
        } finally {
        }
      }

      reSample = postResample;
    } else {
      reSample = picture;
    }
    return reSample;
  }
  
}
