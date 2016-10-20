/*
 * Copyright (C) 2015 Samuel Audet
 *
 * Licensed either under the Apache License, Version 2.0, or (at your option)
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation (subject to the "Classpath" exception),
 * either version 2, or any later version (collectively, the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     http://www.gnu.org/licenses/
 *     http://www.gnu.org/software/classpath/license.html
 *
 * or as provided in the LICENSE.txt file that accompanied this code.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.bytedeco.javacv;

import java.nio.Buffer;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.DoubleBuffer;
import java.nio.FloatBuffer;
import java.nio.IntBuffer;
import java.nio.LongBuffer;
import java.nio.ShortBuffer;
import org.bytedeco.javacpp.BytePointer;
import org.bytedeco.javacpp.DoublePointer;
import org.bytedeco.javacpp.FloatPointer;
import org.bytedeco.javacpp.IntPointer;
import org.bytedeco.javacpp.LongPointer;
import org.bytedeco.javacpp.ShortPointer;
import org.bytedeco.javacpp.indexer.ByteIndexer;
import org.bytedeco.javacpp.indexer.DoubleIndexer;
import org.bytedeco.javacpp.indexer.FloatIndexer;
import org.bytedeco.javacpp.indexer.Indexable;
import org.bytedeco.javacpp.indexer.Indexer;
import org.bytedeco.javacpp.indexer.IntIndexer;
import org.bytedeco.javacpp.indexer.LongIndexer;
import org.bytedeco.javacpp.indexer.ShortIndexer;
import org.bytedeco.javacpp.indexer.UByteIndexer;
import org.bytedeco.javacpp.indexer.UShortIndexer;

/**
 * A class to manage the data of audio and video frames. It it used by
 * {@link CanvasFrame}, {@link FrameGrabber}, {@link FrameRecorder}, and their
 * subclasses. We can also make the link with other APIs, such as Android,
 * Java 2D, FFmpeg, and OpenCV, via a {@link FrameConverter}.
 *
 * @author Samuel Audet
 */
public class Frame implements Indexable {
    /** A flag set by a FrameGrabber or a FrameRecorder to indicate a key frame. */
    public boolean keyFrame;

    /** Constants to be used for {@link #imageDepth}. */
    public static final int
            DEPTH_BYTE   =  -8,
            DEPTH_UBYTE  =   8,
            DEPTH_SHORT  = -16,
            DEPTH_USHORT =  16,
            DEPTH_INT    = -32,
            DEPTH_LONG   = -64,
            DEPTH_FLOAT  =  32,
            DEPTH_DOUBLE =  64;

    /** Information associated with the {@link #image} field. */
    public int imageWidth, imageHeight, imageDepth, imageChannels, imageStride;

    /**
     * Buffers to hold image pixels from multiple channels for a video frame.
     * Most of the software supports packed data only, but an array is provided
     * to allow users to store images in a planar format as well.
     */
    public Buffer[] image;

    /** Information associated with the {@link #samples} field. */
    public int sampleRate, audioChannels;

    /** Buffers to hold audio samples from multiple channels for an audio frame. */
    public Buffer[] samples;

    /** The underlying data object, for example, AVFrame, IplImage, or Mat. */
    public Object opaque;

    /** Timestamp of the frame creation. */
    public long timestamp;

    /** Empty constructor. */
    public Frame() { }

    /** Allocates a new packed image frame in native memory where rows are 8-byte aligned. */
    public Frame(int width, int height, int depth, int channels) {
        int pixelSize = Math.abs(depth) / 8;
        this.imageWidth = width;
        this.imageHeight = height;
        this.imageDepth = depth;
        this.imageChannels = channels;
        this.imageStride = ((imageWidth * imageChannels * pixelSize + 7) & ~7) / pixelSize; // 8-byte aligned
        this.image = new Buffer[1];

        ByteBuffer buffer = ByteBuffer.allocateDirect(imageHeight * imageStride * pixelSize).order(ByteOrder.nativeOrder());
        switch (imageDepth) {
            case DEPTH_BYTE:
            case DEPTH_UBYTE:  image[0] = buffer;                  break;
            case DEPTH_SHORT:
            case DEPTH_USHORT: image[0] = buffer.asShortBuffer();  break;
            case DEPTH_INT:    image[0] = buffer.asIntBuffer();    break;
            case DEPTH_LONG:   image[0] = buffer.asLongBuffer();   break;
            case DEPTH_FLOAT:  image[0] = buffer.asFloatBuffer();  break;
            case DEPTH_DOUBLE: image[0] = buffer.asDoubleBuffer(); break;
            default: throw new UnsupportedOperationException("Unsupported depth value: " + imageDepth);
        }
    }

    /** Returns {@code createIndexer(true, 0)}. */
    public <I extends Indexer> I createIndexer() {
        return (I)createIndexer(true, 0);
    }
    @Override public <I extends Indexer> I createIndexer(boolean direct) {
        return (I)createIndexer(direct, 0);
    }
    /** Returns an {@link Indexer} for the <i>i</i>th image plane. */
    public <I extends Indexer> I createIndexer(boolean direct, int i) {
        long[] sizes = {imageHeight, imageWidth, imageChannels};
        long[] strides = {imageStride, imageChannels, 1};
        Buffer buffer = image[i];
        Object array = buffer.hasArray() ? buffer.array() : null;
        switch (imageDepth) {
            case DEPTH_UBYTE:
                return array != null ? (I)UByteIndexer.create((byte[])array, sizes, strides)
                            : direct ? (I)UByteIndexer.create((ByteBuffer)buffer, sizes, strides)
                                     : (I)UByteIndexer.create(new BytePointer((ByteBuffer)buffer), sizes, strides, false);
            case DEPTH_BYTE:
                return array != null ? (I)ByteIndexer.create((byte[])array, sizes, strides)
                            : direct ? (I)ByteIndexer.create((ByteBuffer)buffer, sizes, strides)
                                     : (I)ByteIndexer.create(new BytePointer((ByteBuffer)buffer), sizes, strides, false);
            case DEPTH_USHORT:
                return array != null ? (I)UShortIndexer.create((short[])array, sizes, strides)
                            : direct ? (I)UShortIndexer.create((ShortBuffer)buffer, sizes, strides)
                                     : (I)UShortIndexer.create(new ShortPointer((ShortBuffer)buffer), sizes, strides, false);
            case DEPTH_SHORT:
                return array != null ? (I)ShortIndexer.create((short[])array, sizes, strides)
                            : direct ? (I)ShortIndexer.create((ShortBuffer)buffer, sizes, strides)
                                     : (I)ShortIndexer.create(new ShortPointer((ShortBuffer)buffer), sizes, strides, false);
            case DEPTH_INT:
                return array != null ? (I)IntIndexer.create((int[])array, sizes, strides)
                            : direct ? (I)IntIndexer.create((IntBuffer)buffer, sizes, strides)
                                     : (I)IntIndexer.create(new IntPointer((IntBuffer)buffer), sizes, strides, false);
            case DEPTH_LONG:
                return array != null ? (I)LongIndexer.create((long[])array, sizes, strides)
                            : direct ? (I)LongIndexer.create((LongBuffer)buffer, sizes, strides)
                                     : (I)LongIndexer.create(new LongPointer((LongBuffer)buffer), sizes, strides, false);
            case DEPTH_FLOAT:
                return array != null ? (I)FloatIndexer.create((float[])array, sizes, strides)
                            : direct ? (I)FloatIndexer.create((FloatBuffer)buffer, sizes, strides)
                                     : (I)FloatIndexer.create(new FloatPointer((FloatBuffer)buffer), sizes, strides, false);
            case DEPTH_DOUBLE:
                return array != null ? (I)DoubleIndexer.create((double[])array, sizes, strides)
                            : direct ? (I)DoubleIndexer.create((DoubleBuffer)buffer, sizes, strides)
                                     : (I)DoubleIndexer.create(new DoublePointer((DoubleBuffer)buffer), sizes, strides, false);
            default: assert false;
        }
        return null;
    }

    /**Care must be taken if this method is to be used in conjunction with movie recordings.
     *  Cloning a frame containing a full HD picture (alpha channel included) would take 1920 x 1080 * 4 = 8.294.400 Bytes.
     *  Expect a heap overflow exception when using this method without cleaning up.
     *
     * @return A deep copy of this frame.
     * @see {@link #cloneBufferArray}
     *
     * @author Extension proposed by Dragos Dutu
     * */
    @Override
    public Frame clone() {
        Frame newFrame = new Frame();


        // Video part
        newFrame.imageWidth = imageWidth;
        newFrame.imageHeight = imageHeight;
        newFrame.imageDepth = imageDepth;
        newFrame.imageChannels = imageChannels;
        newFrame.imageStride = imageStride;
        newFrame.keyFrame = keyFrame;
        newFrame.opaque = opaque;
        newFrame.image = cloneBufferArray(image);

        // Audio part
        newFrame.audioChannels = audioChannels;
        newFrame.sampleRate = sampleRate;
        newFrame.samples = cloneBufferArray(samples);

        // Add timestamp
        newFrame.timestamp = timestamp;

        return newFrame;

    }

    /**
     * This private method takes a buffer array as input and returns a deep copy.
     * It is assumed that all buffers in the input array are of the same subclass.
     *
     * @param srcBuffers - Buffer array to be cloned
     * @return New buffer array
     *
     *  @author Extension proposed by Dragos Dutu
     */
    private static Buffer[] cloneBufferArray(Buffer[] srcBuffers) {

        Buffer[] clonedBuffers = null;
        int i;
        short dataSize;

        if (srcBuffers != null) {
            clonedBuffers = new Buffer[srcBuffers.length];

            for (i = 0; i < srcBuffers.length; i++)
                srcBuffers[i].rewind();

            /*
             * In order to optimize the transfer we need a type check.
             *
             * Most CPUs support hardware memory transfer for different data
             * types, so it's faster to copy more bytes at once rather
             * than one byte per iteration as in case of ByteBuffer.
             *
             * For example, Intel CPUs support MOVSB (byte transfer), MOVSW
             * (word transfer), MOVSD (double word transfer), MOVSS (32 bit
             * scalar single precision floating point), MOVSQ (quad word
             * transfer) and so on...
             *
             * Type checking may be improved by changing the order in
             * which a buffer is checked against. If it's likely that the
             * expected buffer is of type "ShortBuffer", then it should be
             * checked at first place.
             *
             */

            if (srcBuffers[0] instanceof ByteBuffer)
                // dataSize is 1
                for (i = 0; i < srcBuffers.length; i++)
                    clonedBuffers[i] = ByteBuffer.allocateDirect(srcBuffers[i].capacity())
                            .put((ByteBuffer) srcBuffers[i]).rewind();
            else if (srcBuffers[0] instanceof ShortBuffer) {
                dataSize = Short.SIZE >> 3; // dataSize is 2
                for (i = 0; i < srcBuffers.length; i++)
                    clonedBuffers[i] = ByteBuffer.allocateDirect(srcBuffers[i].capacity() * dataSize)
                            .order(ByteOrder.nativeOrder()).asShortBuffer().put((ShortBuffer) srcBuffers[i]).rewind();
            } else if (srcBuffers[0] instanceof IntBuffer) {
                dataSize = Integer.SIZE >> 3; // dataSize is 4
                for (i = 0; i < srcBuffers.length; i++)
                    clonedBuffers[i] = ByteBuffer.allocateDirect(srcBuffers[i].capacity() * dataSize)
                            .order(ByteOrder.nativeOrder()).asIntBuffer().put((IntBuffer) srcBuffers[i]).rewind();
            } else if (srcBuffers[0] instanceof LongBuffer) {
                dataSize = Long.SIZE >> 3; // dataSize is 8
                for (i = 0; i < srcBuffers.length; i++)
                    clonedBuffers[i] = ByteBuffer.allocateDirect(srcBuffers[i].capacity() * dataSize)
                            .order(ByteOrder.nativeOrder()).asLongBuffer().put((LongBuffer) srcBuffers[i]).rewind();
            } else if (srcBuffers[0] instanceof FloatBuffer) {
                dataSize = Float.SIZE >> 3; // dataSize is 4
                for (i = 0; i < srcBuffers.length; i++)
                    clonedBuffers[i] = ByteBuffer.allocateDirect(srcBuffers[i].capacity() * dataSize)
                            .order(ByteOrder.nativeOrder()).asFloatBuffer().put((FloatBuffer) srcBuffers[i]).rewind();
            } else if (srcBuffers[0] instanceof DoubleBuffer) {
                dataSize = Double.SIZE >> 3; // dataSize is 8
                for (i = 0; i < srcBuffers.length; i++)
                    clonedBuffers[i] = ByteBuffer.allocateDirect(srcBuffers[i].capacity() * dataSize)
                            .order(ByteOrder.nativeOrder()).asDoubleBuffer().put((DoubleBuffer) srcBuffers[i]).rewind();
            }

            for (i = 0; i < srcBuffers.length; i++)
                srcBuffers[i].rewind();

        }

        return clonedBuffers;

    }

}
