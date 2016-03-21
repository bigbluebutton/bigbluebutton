package org.bigbluebutton.screenshare.client.javacv;

import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.awt.image.ComponentSampleModel;
import java.awt.image.DataBuffer;
import java.awt.image.DataBufferByte;
import java.awt.image.DataBufferDouble;
import java.awt.image.DataBufferFloat;
import java.awt.image.DataBufferInt;
import java.awt.image.DataBufferShort;
import java.awt.image.DataBufferUShort;
import java.awt.image.MultiPixelPackedSampleModel;
import java.awt.image.Raster;
import java.awt.image.SampleModel;
import java.awt.image.SinglePixelPackedSampleModel;
import java.io.File;
import java.util.Map.Entry;
import org.bytedeco.javacpp.BytePointer;
import org.bytedeco.javacpp.DoublePointer;
import org.bytedeco.javacpp.Loader;
import org.bytedeco.javacpp.PointerPointer;
import static org.bytedeco.javacpp.avcodec.*;
import static org.bytedeco.javacpp.avformat.*;
import static org.bytedeco.javacpp.avutil.*;
import static org.bytedeco.javacpp.swresample.*;
import static org.bytedeco.javacpp.swscale.*;

/**
 *
 * @author Samuel Audet
 */
public class BBBFFmpegFrameRecorder extends BBBFrameRecorder {
  public static BBBFFmpegFrameRecorder createDefault(File f, int w, int h)   throws Exception { return new BBBFFmpegFrameRecorder(f, w, h); }
  public static BBBFFmpegFrameRecorder createDefault(String f, int w, int h) throws Exception { return new BBBFFmpegFrameRecorder(f, w, h); }

  private static Exception loadingException = null;

  public static void tryLoad() throws Exception {
    if (loadingException != null) {
      throw loadingException;
    } else {
      try {
        Loader.load(org.bytedeco.javacpp.avutil.class);
        Loader.load(org.bytedeco.javacpp.swresample.class);
        Loader.load(org.bytedeco.javacpp.avcodec.class);
        Loader.load(org.bytedeco.javacpp.avformat.class);
        Loader.load(org.bytedeco.javacpp.swscale.class);

        /* initialize libavcodec, and register all codecs and formats */
        av_register_all();
        avformat_network_init();
      } catch (Throwable t) {
        if (t instanceof Exception) {
          throw loadingException = (Exception)t;
        } else {
          throw loadingException = new Exception("Failed to load " + BBBFFmpegFrameRecorder.class, t);
        }
      }
    }
  }

  static {
    try {
      tryLoad();
    } catch (Exception ex) { }
  }

  public BBBFFmpegFrameRecorder(File file, int audioChannels) {
    this(file, 0, 0, audioChannels);
  }

  public BBBFFmpegFrameRecorder(String filename, int audioChannels) {
    this(filename, 0, 0, audioChannels);
  }

  public BBBFFmpegFrameRecorder(File file, int imageWidth, int imageHeight) {
    this(file, imageWidth, imageHeight, 0);
  }

  public BBBFFmpegFrameRecorder(String filename, int imageWidth, int imageHeight) {
    this(filename, imageWidth, imageHeight, 0);
  }

  public BBBFFmpegFrameRecorder(File file, int imageWidth, int imageHeight, int audioChannels) {
    this(file.getAbsolutePath(), imageWidth, imageHeight, audioChannels);
  }

  public BBBFFmpegFrameRecorder(String filename, int imageWidth, int imageHeight, int audioChannels) {
    this.filename      = filename;
    this.imageWidth    = imageWidth;
    this.imageHeight   = imageHeight;

    this.pixelFormat   = AV_PIX_FMT_NONE;
    this.videoCodec    = AV_CODEC_ID_NONE;
    this.videoBitrate  = 400000;
    this.frameRate     = 30;

    this.videoPacket = new AVPacket();
  }

  public void release() throws Exception {
    synchronized (org.bytedeco.javacpp.avcodec.class) {
      releaseUnsafe();
    }
  }

  public void releaseUnsafe() throws Exception {
    /* close each codec */
    if (avCodecContext != null) {
      avcodec_close(avCodecContext);
      avCodecContext = null;
    }

    if (picture_buf != null) {
      av_free(picture_buf);
      picture_buf = null;
    }
    if (picture != null) {
      av_frame_free(picture);
      picture = null;
    }
    if (tmp_picture != null) {
      av_frame_free(tmp_picture);
      tmp_picture = null;
    }
    if (videoOutBuf != null) {
      av_free(videoOutBuf);
      videoOutBuf = null;
    }
    if (frame != null) {
      av_frame_free(frame);
      frame = null;
    }

    videoStream = null;

    if (outFormatContext != null && !outFormatContext.isNull()) {
      if ((outFormat.flags() & AVFMT_NOFILE) == 0) {
        /* close the output file */
        avio_close(outFormatContext.pb());
      }

      /* free the streams */
      int nb_streams = outFormatContext.nb_streams();
      for(int i = 0; i < nb_streams; i++) {
        av_free(outFormatContext.streams(i).codec());
        av_free(outFormatContext.streams(i));
      }

      /* free the stream */
      av_free(outFormatContext);
      outFormatContext = null;
    }

    if (img_convert_ctx != null) {
      sws_freeContext(img_convert_ctx);
      img_convert_ctx = null;
    }

    if (samples_convert_ctx != null) {
      swr_free(samples_convert_ctx);
      samples_convert_ctx = null;
    }
  }

  @Override protected void finalize() throws Throwable {
    super.finalize();
    release();
  }

  private String filename;
  private AVFrame picture, tmp_picture;
  private BytePointer picture_buf;
  private BytePointer videoOutBuf;
  private int video_outbuf_size;
  private AVFrame frame;
  private AVOutputFormat outFormat;
  private AVFormatContext outFormatContext;
  private AVCodec video_codec;
  private AVCodecContext avCodecContext;
  private AVStream videoStream;
  private SwsContext img_convert_ctx;
  private SwrContext samples_convert_ctx;
  private AVPacket videoPacket;
  private int[] got_video_packet;

  @Override public int getFrameNumber() {
    return picture == null ? super.getFrameNumber() : (int)picture.pts();
  }

  @Override public void setFrameNumber(int frameNumber) {
    if (picture == null) { super.setFrameNumber(frameNumber); } else { picture.pts(frameNumber); }
  }

  // best guess for timestamp in microseconds...
  @Override public long getTimestamp() {
    return Math.round(getFrameNumber() * 1000000L / getFrameRate());
  }

  @Override public void setTimestamp(long timestamp)  {
    setFrameNumber((int)Math.round(timestamp * getFrameRate() / 1000000L));
  }

  public void start() throws Exception {
    synchronized (org.bytedeco.javacpp.avcodec.class) {
      startUnsafe();
    }
  }

  public void startUnsafe() throws Exception {
    int ret;
    picture = null;
    tmp_picture = null;
    picture_buf = null;
    frame = null;
    videoOutBuf = null;
    outFormatContext = null;
    avCodecContext = null;
    videoStream = null;
    got_video_packet = new int[1];

    /* auto detect the output format from the name. */
    String format_name = format == null || format.length() == 0 ? null : format;
    if ((outFormat = av_guess_format(format_name, filename, null)) == null) {
      int proto = filename.indexOf("://");
      if (proto > 0) {
        format_name = filename.substring(0, proto);
      }
      if ((outFormat = av_guess_format(format_name, filename, null)) == null) {
        throw new Exception("av_guess_format() error: Could not guess output format for \"" + filename + "\" and " + format + " format.");
      }
    }
    format_name = outFormat.name().getString();

    /* allocate the output media context */
    if ((outFormatContext = avformat_alloc_context()) == null) {
      throw new Exception("avformat_alloc_context() error: Could not allocate format context");
    }

    outFormatContext.oformat(outFormat);
    outFormatContext.filename().putString(filename);

    /* add the audio and video streams using the format codecs
           and initialize the codecs */

    if (imageWidth > 0 && imageHeight > 0) {
      if (videoCodec != AV_CODEC_ID_NONE) {
        outFormat.video_codec(videoCodec);
      } else if ("flv".equals(format_name)) {
        outFormat.video_codec(AV_CODEC_ID_FLV1);
      } else if ("mp4".equals(format_name)) {
        outFormat.video_codec(AV_CODEC_ID_MPEG4);
      } else if ("3gp".equals(format_name)) {
        outFormat.video_codec(AV_CODEC_ID_H263);
      } else if ("avi".equals(format_name)) {
        outFormat.video_codec(AV_CODEC_ID_HUFFYUV);
      }

      /* find the video encoder */
      if ((video_codec = avcodec_find_encoder_by_name(videoCodecName)) == null &&
          (video_codec = avcodec_find_encoder(outFormat.video_codec())) == null) {
        release();
        throw new Exception("avcodec_find_encoder() error: Video codec not found.");
      }

      AVRational frame_rate = av_d2q(frameRate, 1001000);
      AVRational supported_framerates = video_codec.supported_framerates();
      if (supported_framerates != null) {
        int idx = av_find_nearest_q_idx(frame_rate, supported_framerates);
        frame_rate = supported_framerates.position(idx);
      }

      /* add a video output stream */
      if ((videoStream = avformat_new_stream(outFormatContext, video_codec)) == null) {
        release();
        throw new Exception("avformat_new_stream() error: Could not allocate video stream.");
      }
      avCodecContext = videoStream.codec();
      avCodecContext.codec_id(outFormat.video_codec());
      avCodecContext.codec_type(AVMEDIA_TYPE_VIDEO);

      /* put sample parameters */
      avCodecContext.bit_rate(videoBitrate);
      /* resolution must be a multiple of two, but round up to 16 as often required */
      avCodecContext.width((imageWidth + 15) / 16 * 16);
      avCodecContext.height(imageHeight);
      /* time base: this is the fundamental unit of time (in seconds) in terms
               of which frame timestamps are represented. for fixed-fps content,
               timebase should be 1/framerate and timestamp increments should be
               identically 1. */
      avCodecContext.time_base(av_inv_q(frame_rate));
      videoStream.time_base(av_inv_q(frame_rate));
      if (gopSize >= 0) {
        avCodecContext.gop_size(gopSize); /* emit one intra frame every gopSize frames at most */
      }
      if (videoQuality >= 0) {
        avCodecContext.flags(avCodecContext.flags() | CODEC_FLAG_QSCALE);
        avCodecContext.global_quality((int)Math.round(FF_QP2LAMBDA * videoQuality));
      }

      if (pixelFormat != AV_PIX_FMT_NONE) {
        avCodecContext.pix_fmt(pixelFormat);
      } else if (avCodecContext.codec_id() == AV_CODEC_ID_RAWVIDEO || avCodecContext.codec_id() == AV_CODEC_ID_PNG ||
          avCodecContext.codec_id() == AV_CODEC_ID_HUFFYUV  || avCodecContext.codec_id() == AV_CODEC_ID_FFV1) {
        avCodecContext.pix_fmt(AV_PIX_FMT_RGB32);   // appropriate for common lossless formats
      } else {
        avCodecContext.pix_fmt(AV_PIX_FMT_YUV420P); // lossy, but works with about everything
      }

      if (avCodecContext.codec_id() == AV_CODEC_ID_MPEG2VIDEO) {
        /* just for testing, we also add B frames */
        avCodecContext.max_b_frames(2);
      } else if (avCodecContext.codec_id() == AV_CODEC_ID_MPEG1VIDEO) {
        /* Needed to avoid using macroblocks in which some coeffs overflow.
                   This does not happen with normal video, it just happens here as
                   the motion of the chroma plane does not match the luma plane. */
        avCodecContext.mb_decision(2);
      } else if (avCodecContext.codec_id() == AV_CODEC_ID_H263) {
        // H.263 does not support any other resolution than the following
        if (imageWidth <= 128 && imageHeight <= 96) {
          avCodecContext.width(128).height(96);
        } else if (imageWidth <= 176 && imageHeight <= 144) {
          avCodecContext.width(176).height(144);
        } else if (imageWidth <= 352 && imageHeight <= 288) {
          avCodecContext.width(352).height(288);
        } else if (imageWidth <= 704 && imageHeight <= 576) {
          avCodecContext.width(704).height(576);
        } else {
          avCodecContext.width(1408).height(1152);
        }
      } else if (avCodecContext.codec_id() == AV_CODEC_ID_H264) {
        // default to constrained baseline to produce content that plays back on anything,
        // without any significant tradeoffs for most use cases
        //video_c.profile(AVCodecContext.FF_PROFILE_H264_HIGH);
        avCodecContext.profile(AVCodecContext.FF_PROFILE_H264_CONSTRAINED_BASELINE);

      }

      // some formats want stream headers to be separate
      if ((outFormat.flags() & AVFMT_GLOBALHEADER) != 0) {
        avCodecContext.flags(avCodecContext.flags() | CODEC_FLAG_GLOBAL_HEADER);
      }

      if ((video_codec.capabilities() & CODEC_CAP_EXPERIMENTAL) != 0) {
        avCodecContext.strict_std_compliance(AVCodecContext.FF_COMPLIANCE_EXPERIMENTAL);
      }
    }

    av_dump_format(outFormatContext, 0, filename, 1);

    /* now that all the parameters are set, we can open the audio and
           video codecs and allocate the necessary encode buffers */
    if (videoStream != null) {
      AVDictionary options = new AVDictionary(null);
      if (videoQuality >= 0) {
        av_dict_set(options, "crf", "" + videoQuality, 0);
      }
      for (Entry<String, String> e : videoOptions.entrySet()) {
        av_dict_set(options, e.getKey(), e.getValue(), 0);
      }
      /* open the codec */
      if ((ret = avcodec_open2(avCodecContext, video_codec, options)) < 0) {
        release();
        throw new Exception("avcodec_open2() error " + ret + ": Could not open video codec.");
      }
      av_dict_free(options);

      videoOutBuf = null;
      if ((outFormat.flags() & AVFMT_RAWPICTURE) == 0) {
        /* allocate output buffer */
        /* XXX: API change will be done */
        /* buffers passed into lav* can be allocated any way you prefer,
                   as long as they're aligned enough for the architecture, and
                   they're freed appropriately (such as using av_free for buffers
                   allocated with av_malloc) */
        video_outbuf_size = Math.max(256 * 1024, 8 * avCodecContext.width() * avCodecContext.height()); // a la ffmpeg.c
        videoOutBuf = new BytePointer(av_malloc(video_outbuf_size));
      }

      /* allocate the encoded raw picture */
      if ((picture = av_frame_alloc()) == null) {
        release();
        throw new Exception("av_frame_alloc() error: Could not allocate picture.");
      }
      picture.pts(0); // magic required by libx264

      int size = avpicture_get_size(avCodecContext.pix_fmt(), avCodecContext.width(), avCodecContext.height());
      if ((picture_buf = new BytePointer(av_malloc(size))).isNull()) {
        release();
        throw new Exception("av_malloc() error: Could not allocate picture buffer.");
      }

      /* if the output format is not equal to the image format, then a temporary
               picture is needed too. It is then converted to the required output format */
      if ((tmp_picture = av_frame_alloc()) == null) {
        release();
        throw new Exception("av_frame_alloc() error: Could not allocate temporary picture.");
      }
    }

    /* open the output file, if needed */
    if ((outFormat.flags() & AVFMT_NOFILE) == 0) {
      AVIOContext pb = new AVIOContext(null);
      if ((ret = avio_open(pb, filename, AVIO_FLAG_WRITE)) < 0) {
        release();
        throw new Exception("avio_open error() error " + ret + ": Could not open '" + filename + "'");
      }
      outFormatContext.pb(pb);
    }

    /* write the stream header, if any */
    avformat_write_header(outFormatContext, (PointerPointer)null);
  }

  public void stop() throws Exception {
    if (outFormatContext != null) {
      try {
        /* ralam TODO: flush all the buffers */
        //                while (video_st != null && record((IplImage)null, AV_PIX_FMT_NONE));
        av_write_frame(outFormatContext, null);

        /* write the trailer, if any */
        av_write_trailer(outFormatContext);
      } finally {
        release();
      }
    }
  }

  public boolean record(BytePointer data, int width, int height, int pixelFormat) throws Exception {
    if (videoStream == null) {
      throw new Exception("No video output stream (Is imageWidth > 0 && imageHeight > 0 and has start() been called?)");
    }
    int ret;

    if (data == null) {
      /* no more frame to compress. The codec has a latency of a few
             frames if using B frames, so we get the last frames by
             passing the same picture again */
    } else {
      // Should get the step programatically. 3 comes from RGB bytes x width (ralam jan 22, 2014)
      int step = 3 * width;

      //          System.out.println("PIXEL FORMAT=[" + pixelFormat + "] step=[" + step + "]");

      if (avCodecContext.pix_fmt() != pixelFormat || avCodecContext.width() != width || avCodecContext.height() != height) {
        //            System.out.println("Converting picture: vcfmt=[" + avCodecContext.pix_fmt() + " pxfmt=[" + pixelFormat + "]" +
        //                 "vcw=[" + avCodecContext.width() + "] width=[" + width + "] vch=[" + avCodecContext.height() + "] height=[" + height + "]");

        /* convert to the codec pixel format if needed */
        img_convert_ctx = sws_getCachedContext(img_convert_ctx, width, height, pixelFormat,
            avCodecContext.width(), avCodecContext.height(), avCodecContext.pix_fmt(), SWS_BILINEAR,
            null, null, (DoublePointer)null);
        if (img_convert_ctx == null) {
          throw new Exception("sws_getCachedContext() error: Cannot initialize the conversion context.");
        }
        avpicture_fill(new AVPicture(tmp_picture), data, pixelFormat, width, height);
        avpicture_fill(new AVPicture(picture), picture_buf, avCodecContext.pix_fmt(), avCodecContext.width(), avCodecContext.height());
        tmp_picture.linesize(0, step);
        sws_scale(img_convert_ctx, new PointerPointer(tmp_picture), tmp_picture.linesize(),
            0, height, new PointerPointer(picture), picture.linesize());
      } else {
        avpicture_fill(new AVPicture(picture), data, pixelFormat, width, height);
        picture.linesize(0, step);
      }
    }

    if ((outFormat.flags() & AVFMT_RAWPICTURE) != 0) {
      if (data == null) {
        return false;
      }
      /* raw video case. The API may change slightly in the future for that? */
      av_init_packet(videoPacket);
      videoPacket.flags(videoPacket.flags() | AV_PKT_FLAG_KEY);
      videoPacket.stream_index(videoStream.index());
      videoPacket.data(new BytePointer(picture));
      videoPacket.size(Loader.sizeof(AVPicture.class));
    } else {
      /* encode the image */
      av_init_packet(videoPacket);
      videoPacket.data(videoOutBuf);
      videoPacket.size(video_outbuf_size);
      picture.quality(avCodecContext.global_quality());
      if ((ret = avcodec_encode_video2(avCodecContext, videoPacket, data == null ? null : picture, got_video_packet)) < 0) {
        throw new Exception("avcodec_encode_video2() error " + ret + ": Could not encode video packet.");
      }
      picture.pts(picture.pts() + 1); // magic required by libx264

      /* if zero size, it means the image was buffered */
      if (got_video_packet[0] != 0) {
        if (videoPacket.pts() != AV_NOPTS_VALUE) {
          videoPacket.pts(av_rescale_q(videoPacket.pts(), avCodecContext.time_base(), videoStream.time_base()));
        }
        if (videoPacket.dts() != AV_NOPTS_VALUE) {
          videoPacket.dts(av_rescale_q(videoPacket.dts(), avCodecContext.time_base(), videoStream.time_base()));
        }
        videoPacket.stream_index(videoStream.index());
      } else {
        return false;
      }
    }

    synchronized (outFormatContext) {
      /* write the compressed frame in the media file */
      if ((ret = av_write_frame(outFormatContext, videoPacket)) < 0) {
        throw new Exception("av_write_frame() error " + ret + " while writing video frame.");
      }
    }
    return (videoPacket.flags() & AV_PKT_FLAG_KEY) == 1;
  }


  public void copyFrom(BufferedImage image, double gamma, boolean flipChannels) {
    Rectangle r = new Rectangle(0, 0, image.getWidth(), image.getHeight());
    copyFrom(image, gamma, flipChannels, r);
  }

  public void copyFrom(BufferedImage image, double gamma, boolean flipChannels, Rectangle roi) {

    //      ByteBuffer out = getByteBuffer(roi == null ? 0 : roi.y*arrayStep() + roi.x);
    SampleModel sm = image.getSampleModel();
    Raster r       = image.getRaster();
    DataBuffer in  = r.getDataBuffer();
    int x = -r.getSampleModelTranslateX();
    int y = -r.getSampleModelTranslateY();
    int step = sm.getWidth()*sm.getNumBands();
    int channels = sm.getNumBands();

    if (sm instanceof ComponentSampleModel) {
      step = ((ComponentSampleModel)sm).getScanlineStride();
      channels = ((ComponentSampleModel)sm).getPixelStride();
    } else if (sm instanceof SinglePixelPackedSampleModel) {
      step = ((SinglePixelPackedSampleModel)sm).getScanlineStride();
      channels = 1;
    } else if (sm instanceof MultiPixelPackedSampleModel) {
      step = ((MultiPixelPackedSampleModel)sm).getScanlineStride();
      channels = ((MultiPixelPackedSampleModel)sm).getPixelBitStride()/8; // ??
    }
    int start = y*step + x*channels;

    if (in instanceof DataBufferByte) {
      System.out.println("DataBufferByte");
      //          byte[] a = ((DataBufferByte)in).getData();
      //          flipCopyWithGamma(ByteBuffer.wrap(a, start, a.length - start), step, out, arrayStep(), false, gamma, false, flipChannels ? channels : 0);
    } else if (in instanceof DataBufferDouble) {
      System.out.println("DataBufferDouble");
      //          double[] a = ((DataBufferDouble)in).getData();
      //          flipCopyWithGamma(DoubleBuffer.wrap(a, start, a.length - start), step, out.asDoubleBuffer(), arrayStep()/8, gamma, false, flipChannels ? channels : 0);
    } else if (in instanceof DataBufferFloat) {
      System.out.println("DataBufferFloat");
      //          float[] a = ((DataBufferFloat)in).getData();
      //          flipCopyWithGamma(FloatBuffer.wrap(a, start, a.length - start), step, out.asFloatBuffer(), arrayStep()/4, gamma, false, flipChannels ? channels : 0);
    } else if (in instanceof DataBufferInt) {
      System.out.println("DataBufferInt");
      //          int[] a = ((DataBufferInt)in).getData();
      //          flipCopyWithGamma(IntBuffer.wrap(a, start, a.length - start), step, out.asIntBuffer(), arrayStep()/4, gamma, false, flipChannels ? channels : 0);
    } else if (in instanceof DataBufferShort) {
      System.out.println("DataBufferShort");
      //          short[] a = ((DataBufferShort)in).getData();
      //          flipCopyWithGamma(ShortBuffer.wrap(a, start, a.length - start), step, out.asShortBuffer(), arrayStep()/2, true, gamma, false, flipChannels ? channels : 0);
    } else if (in instanceof DataBufferUShort) {
      System.out.println("DataBufferUShort");
      //          short[] a = ((DataBufferUShort)in).getData();
      //          flipCopyWithGamma(ShortBuffer.wrap(a, start, a.length - start), step, out.asShortBuffer(), arrayStep()/2, false, gamma, false, flipChannels ? channels : 0);
    } else {
      assert false;
    }

    //      if (bufferedImage == null && roi == null &&
    //              image.getWidth() == arrayWidth() && image.getHeight() == arrayHeight()) {
    //          bufferedImage = image;
    //      }

  }

  /**
  public static void flipCopyWithGamma(ByteBuffer srcBuf, int srcStep,
      ByteBuffer dstBuf, int dstStep, boolean signed, double gamma, boolean flip, int channels) {
  assert srcBuf != dstBuf;
  int w = Math.min(srcStep, dstStep);
  int srcLine = srcBuf.position(), dstLine = dstBuf.position();
  byte[] buffer = new byte[channels];
  while (srcLine < srcBuf.capacity() && dstLine < dstBuf.capacity()) {
      if (flip) {
          srcBuf.position(srcBuf.capacity() - srcLine - srcStep);
      } else {
          srcBuf.position(srcLine);
      }
      dstBuf.position(dstLine);
      w = Math.min(Math.min(w, srcBuf.remaining()), dstBuf.remaining());
      if (signed) {
          if (channels > 1) {
              for (int x = 0; x < w; x+=channels) {
                  for (int z = 0; z < channels; z++) {
                      int in = srcBuf.get();
                      byte out;
                      if (gamma == 1.0) {
                          out = (byte)in;
                      } else {
                          out = (byte)Math.round(Math.pow((double)in/Byte.MAX_VALUE, gamma)*Byte.MAX_VALUE);
                      }
                      buffer[z] = out;
                  }
                  for (int z = channels-1; z >= 0; z--) {
                      dstBuf.put(buffer[z]);
                  }
              }
          } else {
              for (int x = 0; x < w; x++) {
                  int in = srcBuf.get();
                  byte out;
                  if (gamma == 1.0) {
                      out = (byte)in;
                  } else {
                      out = (byte)Math.round(Math.pow((double)in/Byte.MAX_VALUE, gamma)*Byte.MAX_VALUE);
                  }
                  dstBuf.put(out);
              }
          }
      } else {
          if (channels > 1) {
              for (int x = 0; x < w; x+=channels) {
                  for (int z = 0; z < channels; z++) {
                      byte out;
                      int in = srcBuf.get() & 0xFF;
                      if (gamma == 1.0) {
                          out = (byte)in;
                      } else if (gamma == 2.2) {
                          out = gamma22[in];
                      } else if (gamma == 1/2.2) {
                          out = gamma22inv[in];
                      } else {
                          out = (byte)Math.round(Math.pow((double)in/0xFF, gamma)*0xFF);
                      }
                      buffer[z] = out;
                  }
                  for (int z = channels-1; z >= 0; z--) {
                      dstBuf.put(buffer[z]);
                  }
              }
          } else {
              for (int x = 0; x < w; x++) {
                  byte out;
                  int in = srcBuf.get() & 0xFF;
                  if (gamma == 1.0) {
                      out = (byte)in;
                  } else if (gamma == 2.2) {
                      out = gamma22[in];
                  } else if (gamma == 1/2.2) {
                      out = gamma22inv[in];
                  } else {
                      out = (byte)Math.round(Math.pow((double)in/0xFF, gamma)*0xFF);
                  }
                  dstBuf.put(out);
              }
          }
      }
      srcLine += srcStep;
      dstLine += dstStep;
  }
}

   **/



}