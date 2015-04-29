/*
 * NellyMoser ASAO codec
 * Copyright (C) 2007-2008  UAB "DKD"
 * Copyright (C) 2007-2008  Joseph Artsimovich <jart@users.sourceforge.net>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with FFmpeg; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */

package org.red5.app.sip.codecs.asao;

public class CodecImpl {

    private static class BitStream {

        private int byteOffset = 0;
        private int bitOffset = 0;

        public void push(int val, int len, byte[] buf) {

            if (bitOffset == 0) {
                buf[byteOffset] = (byte)val;
            } else {
                buf[byteOffset] |= (byte)(val << bitOffset);
            }
            bitOffset += len;
            if (bitOffset >= 8) {
                ++byteOffset;
                bitOffset -= 8;
                if (bitOffset > 0) {
                    buf[byteOffset] = (byte)(val >> (len - bitOffset));
                }
            }
        }

        public int pop(int len, byte[] buf) {

            int val = ((int)buf[byteOffset] & 0xff) >> bitOffset;
            final int bits_read = 8 - bitOffset;

            if (len >= bits_read) {
                ++byteOffset;
                if (len > bits_read) {
                    val |= buf[byteOffset] << bits_read;
                }
            }

            bitOffset = (bitOffset + len) & 7;
            return val & ((1 << len) - 1);
        }
    }

    private static class NormalizedInt32 {

        public final int value;
        public final int scale;

        public NormalizedInt32(final int val) {
            if (val == 0) {
                value = val;
                scale = 31;
                return;
            } else if (val >= (1 << 30)) {
                value = 0;
                scale = 0;
                return;
            }

            int v = val;
            int s = 0;

            if (v > 0) {
                do {
                    v <<= 1;
                    ++s;
                } while (v < (1 << 30));
            } else {
                final int floor = 1 << 31; // lowest possible 32bit value
                do {
                    v <<= 1;
                    ++s;
                } while (v > floor + (1 << 30));
            }

            value = v;
            scale = s;
        }
    }

    private static class Factor {

        public final int value;
        public final int shift;

        public Factor(final int val) {
            if (val == 124) {
                // Common case optimization.
                value = 4228;
                shift = 19;
                return;
            } else if (val == 0) {
                value = 0;
                shift = 0;
                return;
            }

            final int sign = ((~val >>> 31) << 1) - 1;

            int abs = val * sign;

            int scale = -1;
            while ((abs & (1 << 15)) == 0) {
                abs <<= 1;
                ++scale;
            }
            abs >>= 1;

            shift = 27 - scale;

            final int table_val = table9[(abs - 0x3e00) >> 10];
            int tmp = abs * table_val;
            tmp = (1 << 30) - tmp;
            tmp += (1 << 14);
            tmp >>= 15;
            tmp *= table_val;
            tmp += (1 << 14);
            tmp >>= 15;
            final int tmp2 = tmp;
            tmp *= abs;
            tmp = (1 << 29) - tmp;
            tmp += (1 << 14);
            tmp >>= 15;
            tmp *= tmp2;
            tmp += (1 << 13);
            tmp >>= 14;
            tmp *= sign;

            if (tmp > 32767 && sign == 1) {
                tmp = 32767;
            } else if (tmp < -32768 && sign == -1) {
                tmp = -32768;
            }

            value = tmp;
        }
    }

    public static float[] encode(float[] state, float[] in, byte[] out) {

        float var_8d8[] = new float[256];
        float var_2e8[] = new float[23];
        float var_268[] = new float[23];
        float var_4d8[] = new float[124];
        float var_208[] = new float[124];

        final BitStream bs = new BitStream();

        fTransfm(state, in, 0, 7, var_8d8, 0);
        fTransfm(state, in, 128, 7, var_8d8, 128);

        for (int i = 0; i < 23; ++i) {
            int bound = bandBound[i];
            final int next_bound = bandBound[i + 1];
            double acc = 0.0;
            for (; bound < next_bound; ++bound) {
                final double a = var_8d8[bound];
                final double b = var_8d8[bound + 128];
                acc += a*a + b*b;
            }
            final double tmp = Math.max(1.0, acc / (table0[i] << 1));
            var_2e8[i] = Math.round(Math.log(tmp) * (1.44269502 * 1024.0));
        };

        int idx = findClosest(var_2e8[0], table1, 0, 64);
        var_268[0] = table1[idx];
        bs.push(idx, gainBit[0], out);
        for (int i = 1; i < 23; ++i) {
            idx = findClosest(var_2e8[i] - var_268[i - 1], table2, 0, 32);
            var_268[i] = var_268[i - 1] + table2[idx];
            bs.push(idx, gainBit[i], out);
        }

        for (int i = 0; i < 23; ++i) {
            var_2e8[i] = (float)(1.0 / Math.pow(2.0, var_268[i] * (0.5 * 0.0009765625)));
        }

        for (int i = 0; i < 23; ++i) {
            int bound = bandBound[i];
            final int next_bound = bandBound[i + 1];
            for (; bound < next_bound; ++bound) {
                var_4d8[bound] = var_268[i];
                var_208[bound] = var_2e8[i];
            }
        }

        int packed_byte_sizes[] = new int[124];
        final int leftover = wc(var_4d8, 124, 198, packed_byte_sizes);
        for (int off = 0; off < 256; off += 128) {
            for (int i = 0; i < 124; ++i) {
                final int packedSize = packed_byte_sizes[i];
                if (packedSize > 0) {
                    final int pow2 = 1 << packedSize;
                    idx = findClosestOrdered(
                        var_208[i] * var_8d8[off + i],
                        table3, pow2 - 1, (pow2 << 1) - 1
                    );
                    bs.push(idx, packedSize, out);
                }
            }
            for (int i = leftover; i > 0; i -= 8) {
                if (i > 8) {
                    bs.push(0, 8, out);
                } else {
                    bs.push(0, i, out);
                    break;
                }
            }
        }

        return state;
    }

    public static float[] decode(float[] state, byte[] in, float[] out) {

        byte[] unpacked_input = new byte[124];
        float[] var_808 = new float[128];
        float[] var_608 = new float[124];
        float[] var_418 = new float[124];

        BitStream bs = new BitStream();

        int unpacked_byte = bs.pop(gainBit[0], in);
        unpacked_input[0] = (byte)unpacked_byte;
        var_808[0] = table1[unpacked_byte];

        for (int i = 1; i < 23; ++i) {
            unpacked_byte = bs.pop(gainBit[i], in);
            unpacked_input[i] = (byte)unpacked_byte;
            var_808[i] = var_808[i - 1] + table2[unpacked_byte];
        };

        for (int i = 0; i < 23; ++i) {
            final float pow = (float)Math.pow(
                2.0, var_808[i] * (0.5 * 0.0009765625)
            );

            int bound = bandBound[i];
            final int next_bound = bandBound[i + 1];
            for (; bound < next_bound; ++bound) {
                var_418[bound] = var_808[i];
                var_608[bound] = pow;
            }
        }

        int packed_byte_sizes[] = new int[124];
        final int leftover = wc(var_418, 124, 198, packed_byte_sizes);

        for (int out_off = 0; out_off < 256; out_off += 128) {
            for (int i = 0; i < 124; ++i) {
                final int packed_size = packed_byte_sizes[i];
                float val = var_608[i];
                if (packed_size > 0) {
                    final int pow2 = 1 << packed_size;
                    unpacked_byte = bs.pop(packed_size, in);
                    unpacked_input[i] = (byte)unpacked_byte;
                    val *= table3[pow2 - 1 + unpacked_byte];
                } else {
                    final double rnd_u32 = Math.random() * 4294967296.0;
                    if (rnd_u32 < (1<<30) + (1<<14)) {
                        val *= -0.707099974;
                    } else {
                        val *= 0.707099974;
                    }
                }
                var_808[i] = val;
            }

            for (int i = 124; i < 128; ++i) {
                var_808[i] = 0;
            }

            for (int i = leftover; i > 0; i -= 8) {
                if (i > 8) {
                    bs.pop(8, in);
                } else {
                    bs.pop(i, in);
                    break;
                }
            }

            iTransfm(state, var_808, 7, out, out_off);
        }

        return state;
    }

    private static void iTransfm(float[] state, float[] in,
            int len_log2, float[] out, int out_off) {

        final int len = 1 << len_log2;
        final int quarter_len = len >> 2;
        int y = len - 1;
        int x = len >> 1;
        int j = x - 1;
        int i = 0;

        /*
        i-->      <--j
        ----------------------------
                      x-->      <--y

        i, j, x, y are indexes into table7.
        table7 is defined as follows:
        for (int i = 0; i < 128; ++i) {
            table7[i] = Math.sin((i + 0.5) / 128 * (Math.PI / 2));
        }
        */

        auxceps(in, 0, len_log2, out, out_off);

        for (; i < quarter_len; ++i, --j, ++x, --y) {
            final double state_i = state[i];
            final double state_j = state[j];
            final double out_x = out[out_off + x];
            final double out_y = out[out_off + y];

            state[i] = -out[out_off + j];
            state[j] = -out[out_off + i];

            out[out_off + i] = (float)(state_i * table7[y] + out_x * table7[i]);
            out[out_off + j] = (float)(state_j * table7[x] + out_y * table7[j]);

            out[out_off + x] = (float)(table7[x] * -out_y + table7[j] * state_j);
            out[out_off + y] = (float)(table7[y] * -out_x + table7[i] * state_i);
        }
    }

    private static void fTransfm(float[] state, float[] in, int in_off,
            int len_log2, float[] out, int out_off) {

        final int len = 1 << len_log2;
        final int quarter_len = len >> 2;
        int y = len - 1;
        int x = len >> 1;
        int j = x - 1;
        int i = 0;

        /*
        i-->      <--j
        ----------------------------
                      x-->      <--y

        i, j, x, y are indexes into table7.
        table7 is defined as follows:
        for (int i = 0; i < 128; ++i) {
            table7[i] = Math.sin((i + 0.5) / 128 * (Math.PI / 2));
        }
        */

        for (; i < quarter_len; ++i, ++x, --y, --j) {
            out[out_off + x] = state[i];
            out[out_off + y] = state[j];

            out[out_off + i] = -in[in_off + j] * table7[x] - in[in_off + x] * table7[j];
            out[out_off + j] = -in[in_off + y] * table7[i] - in[in_off + i] * table7[y];

            state[i] = in[in_off + i] * table7[i] - in[in_off + y] * table7[y];
            state[j] = in[in_off + j] * table7[j] - in[in_off + x] * table7[x];
        }

        auxceps(out, out_off, len_log2, out, out_off);
    }

    private static void auxceps(
            float[] in, final int in_off, int len_log2, float[] out, final int out_off) {

        final int len = 1 << len_log2;
        final int half_len_m1 = (len >> 1) - 1;
        final int quarter_len = len >> 2;

        for (int i = 0; i < quarter_len; ++i) {
            final int i2 = i << 1;
            final int j = len - 1 - i2;
            final int k = j - 1;

            final double in_i2 = in[in_off + i2];
            final double in_i2_1 = in[in_off + i2 + 1];
            final double in_j = in[in_off + j];
            final double in_k = in[in_off + k];

            out[out_off + i2] = (float)(table4[i] * in_i2 - table6[i] * in_j);
            out[out_off + i2 + 1] = (float)(in_j * table4[i] + in_i2 * table6[i]);

            out[out_off + k] = (float)(table4[half_len_m1 - i] * in_k - table6[half_len_m1 - i] * in_i2_1);
            out[out_off + j] = (float)(in_i2_1 * table4[half_len_m1 - i] + in_k * table6[half_len_m1 - i]);
        }

        HarXfm(out, out_off, len_log2 - 1);

        final float last_out = out[out_off + len - 1];
        final float pre_last_out = out[out_off + len - 2];

        out[out_off] = table5[0] * out[out_off];
        out[out_off + len - 1] = out[out_off + 1] * -table5[0];

        out[out_off + len - 2] = table5[half_len_m1] * out[out_off + len - 2] + table5[1] * last_out;
        out[out_off + 1] = pre_last_out * table5[1] - last_out * table5[half_len_m1];

        int i_out = len - 3;
        int i_tbl = half_len_m1;
        int j = 3;
        for (int i = 1; i < quarter_len; ++i, --i_tbl, i_out -= 2, j += 2) {
            final double old_out_a = out[out_off + i_out];
            final double old_out_b = out[out_off + i_out - 1];
            final double old_out_c = out[out_off + j];
            final double old_out_d = out[out_off + j - 1];

            out[out_off + j - 1] = (float)(table5[i_tbl] * old_out_c + table5[(j - 1) >> 1] * old_out_d);
            out[out_off + j] = (float)(old_out_b * table5[(j + 1) >> 1] - old_out_a * table5[i_tbl - 1]);
            out[out_off + i_out] = (float)(old_out_d * table5[i_tbl] - old_out_c * table5[(j - 1) >> 1]);
            out[out_off + i_out - 1] = (float)(table5[(j + 1) >> 1] * old_out_a + table5[i_tbl - 1] * old_out_b);
        }
    }

    private static void HarXfm(float[] data, int data_off, int half_len_log2) {

        final int half_len = 1 << half_len_log2;

        HarXfmHelper(data, data_off, half_len);

        int j = 0;
        for (int i = half_len >> 1; i > 0; --i, j += 4) {
            final float j0 = data[data_off + j];
            final float j1 = data[data_off + j + 1];
            final float j2 = data[data_off + j + 2];
            final float j3 = data[data_off + j + 3];
            data[data_off + j] = j0 + j2;
            data[data_off + j + 1] = j1 + j3;
            data[data_off + j + 2] = j0 - j2;
            data[data_off + j + 3] = j1 - j3;
        }

        j = 0;
        for (int i = half_len >> 2; i > 0; --i, j += 8) {
            final float j0 = data[data_off + j];
            final float j1 = data[data_off + j + 1];
            final float j2 = data[data_off + j + 2];
            final float j3 = data[data_off + j + 3];
            final float j4 = data[data_off + j + 4];
            final float j5 = data[data_off + j + 5];
            final float j6 = data[data_off + j + 6];
            final float j7 = data[data_off + j + 7];
            data[data_off + j] = j0 + j4;
            data[data_off + j + 1] = j1 + j5;
            data[data_off + j + 2] = j2 + j7;
            data[data_off + j + 3] = j3 - j6;
            data[data_off + j + 4] = j0 - j4;
            data[data_off + j + 5] = j1 - j5;
            data[data_off + j + 6] = j2 - j7;
            data[data_off + j + 7] = j3 + j6;
        }

        int i = 0;
        int x = half_len >> 3;
        int y = 64;
        int z = 4;
        for (int idx1 = half_len_log2 - 2; idx1 > 0; --idx1, z <<= 1, y >>= 1, x >>= 1) {
            j = 0;
            for (int idx2 = x; idx2 != 0; --idx2, j += z << 1) {
                for (int idx3 = z >> 1; idx3 > 0; --idx3, j += 2, i += y) {
                    final int k = j + (z << 1);

                    final double j0 = data[data_off + j];
                    final double j1 = data[data_off + j + 1];
                    final double k0 = data[data_off + k];
                    final double k1 = data[data_off + k + 1];

                    data[data_off + k] = (float)(j0 - (k0 * table10[128 - i] + k1 * table10[i]));
                    data[data_off + j] = (float)(j0 + (k0 * table10[128 - i] + k1 * table10[i]));
                    data[data_off + k + 1] = (float)(j1 + (k0 * table10[i] - k1 * table10[128 - i]));
                    data[data_off + j + 1] = (float)(j1 - (k0 * table10[i] - k1 * table10[128 - i]));
                }
                for (int idx4 = z >> 1; idx4 > 0; --idx4, j += 2, i -= y) {
                    final int k = j + (z << 1);

                    final double j0 = data[data_off + j];
                    final double j1 = data[data_off + j + 1];
                    final double k0 = data[data_off + k];
                    final double k1 = data[data_off + k + 1];

                    data[data_off + k] = (float)(j0 + (k0 * table10[128 - i] - k1 * table10[i]));
                    data[data_off + j] = (float)(j0 - (k0 * table10[128 - i] - k1 * table10[i]));
                    data[data_off + k + 1] = (float)(j1 + (k1 * table10[128 - i] + k0 * table10[i]));
                    data[data_off + j + 1] = (float)(j1 - (k1 * table10[128 - i] + k0 * table10[i]));
                }
            }
        }
    }

    private static void HarXfmHelper(float[] data, int data_off, int half_len) {

        final int len = half_len << 1;

        int j = 1;
        for (int i = 1; i < len; i += 2) {
            if (i < j) {
                final float tmp1 = data[data_off + i];
                data[data_off + i] = data[data_off + j];
                data[data_off + j] = tmp1;

                final float tmp2 = data[data_off + i - 1];
                data[data_off + i - 1] = data[data_off + j - 1];
                data[data_off + j - 1] = tmp2;
            }

            int x = half_len;
            while (x > 1 && x < j) {
                j -= x;
                x >>= 1;
            }
            j += x;
        }
    }

    private static int findClosest(float target, float[] values, int from, int to) {

        int min_idx = 0;
        float min_distance = Math.abs(target - values[from]);

        for (int i = from; i < to; ++i) {
            final float distance = Math.abs(target - values[i]);
            if (distance < min_distance) {
                min_distance = distance;
                min_idx = i - from;
            }
        }

        return min_idx;
    }

    private static int findClosestOrdered(float target, float[] values, int from, int to) {

        int begin = from;
        int end = to;
        do {
            final int middle = (begin + end) >> 1;
            if (target > values[middle]) {
                begin = middle;
            } else {
                end = middle;
            }
        } while (end - begin > 1);

        if (end != to) {
            if (target - values[begin] > values[end] - target) {
                begin = end;
            }
        }
        return begin - from;
    }

    static int wc(float[] in, int len, int total_bits, int[] packed_sizes) {

        float max_input = 0;
        for (int i = 0; i < len; ++i) {
            if (in[i] > max_input) {
                max_input = in[i];
            }
        }

        int max_input_scale = 0;
        {
            NormalizedInt32 normalized = new NormalizedInt32((int)max_input);
            max_input_scale = normalized.scale - 16;
        }

        short scaled_input[] = new short[124];

        if (max_input_scale < 0) {
            for (int i = 0; i < len; ++i) {
                scaled_input[i] = (short)((int)in[i] >> -max_input_scale);
            }
        } else {
            for (int i = 0; i < len; ++i) {
                scaled_input[i] = (short)((int)in[i] << max_input_scale);
            }
        }

        final Factor factor = new Factor(len);

        for (int i = 0; i < len; ++i) {
            scaled_input[i] = (short)(((int)scaled_input[i] * 3) >> 2); // *= 0.75
        }

        int scaled_input_sum = 0;
        for (int i = 0; i < len; ++i) {
            scaled_input_sum += scaled_input[i];
        }

        max_input_scale += 11;
        scaled_input_sum -= total_bits << max_input_scale;
        int scaled_input_base = 0;
        {
            final int val = scaled_input_sum - (total_bits << max_input_scale);
            final NormalizedInt32 normalized = new NormalizedInt32(val);
            scaled_input_base = ((val >> 16) * factor.value) >> 15;

            final int shift = 31 - factor.shift - normalized.scale;
            if (shift >= 0) {
                scaled_input_base <<= shift;
            } else {
                scaled_input_base >>= -shift;
            }
        }

        int bits_used = getD(scaled_input, max_input_scale, len, 6, scaled_input_base);
        if (bits_used != total_bits) {
            int diff = bits_used - total_bits;
            int diff_scale = 0;
            if (diff <= 0) {
                for (; diff >= -16384; diff <<= 1) {
                    ++diff_scale;
                }
            } else {
                for (; diff < 16384; diff <<= 1) {
                    ++diff_scale;
                }
            }

            int base_delta = (diff * factor.value) >> 15;
            diff_scale = max_input_scale - (factor.shift + diff_scale - 15);
            if (diff_scale >= 0) {
                base_delta <<= diff_scale;
            } else {
                base_delta >>= -diff_scale;
            }

            int num_revisions = 1;
            int last_bits_used;
            int last_scaled_input_base;
            for (;;) {
                last_bits_used = bits_used;
                last_scaled_input_base = scaled_input_base;
                scaled_input_base += base_delta;
                bits_used = getD(scaled_input, max_input_scale, len, 6, scaled_input_base);
                if (++num_revisions > 19) {
                    break;
                }
                if ((bits_used - total_bits) * (last_bits_used - total_bits) <= 0) {
                    break;
                }

            }

            if (bits_used != total_bits) {
                int scaled_input_base_1;
                int bits_used_1;
                int bits_used_2;
                if (bits_used > total_bits) {
                    scaled_input_base_1 = scaled_input_base;
                    scaled_input_base = last_scaled_input_base;
                    bits_used_1 = bits_used;
                    bits_used_2 = last_bits_used;
                } else {
                    scaled_input_base_1 = last_scaled_input_base;
                    bits_used_1 = last_bits_used;
                    bits_used_2 = bits_used;
                }

                while (bits_used != total_bits && num_revisions < 20) {
                    final int avg = (scaled_input_base + scaled_input_base_1) >> 1;
                    bits_used = getD(scaled_input, max_input_scale, len, 6, avg);
                    ++num_revisions;
                    if (bits_used > total_bits) {
                        scaled_input_base_1 = avg;
                        bits_used_1 = bits_used;
                    } else {
                        scaled_input_base = avg;
                        bits_used_2 = bits_used;
                    }
                }

                final int dev_1 = Math.abs(bits_used_1 - total_bits);
                final int dev_2 = Math.abs(bits_used_2 - total_bits);

                if (dev_1 < dev_2) {
                    scaled_input_base = scaled_input_base_1;
                    bits_used = bits_used_1;
                } else {
                    bits_used = bits_used_2;
                }
            }
        }

        for (int i = 0; i < len; ++i) {
            int tmp = (int)scaled_input[i] - scaled_input_base;
            if (tmp >= 0) {
                tmp = (tmp + (1 << (max_input_scale - 1))) >> max_input_scale;
            } else {
                tmp = 0;
            }
            packed_sizes[i] = Math.min(tmp, 6);
        }

        if (bits_used > total_bits) {
            int i = 0;
            int bit_count = 0;
            for (; bit_count < total_bits; ++i) {
                bit_count += packed_sizes[i];
            }

            bit_count -= packed_sizes[i - 1];
            packed_sizes[i - 1] = total_bits - bit_count;
            bits_used = total_bits;
            for (; i < len; ++i) {
                packed_sizes[i] = 0;
            }
        }

        return total_bits - bits_used;
    }

    private static int getD(short[] in, int scale, int len, int upper_bound, int base) {
        int d = 0;
        if (len <= 0) {
            return d;
        }

        final int var_1 = 1 << (scale - 1);

        for (int i = 0; i < len; ++i) {
            int var_2 = (int)in[i] - base;
            if (var_2 < 0) {
                var_2 = 0;
            } else {
                var_2 = (var_2 + var_1) >> scale;
            }
            d += Math.min(var_2, upper_bound);
        }

        return d;
    }

    private static final int bandBound[] = {
        0, 2, 4, 6,
        8, 10, 12, 14,
        16, 18, 21, 24,
        28, 32, 37, 43,
        49, 56, 64, 73,
        83, 95, 109, 124
    };

    private static final short gainBit[] = {
        6, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 0,
        0, 0, 0, 0, 0, 0, 0, 0
    };

    private static final int table0[] = {
        2, 2, 2, 2,
        2, 2, 2, 2,
        2, 3, 3, 4,
        4, 5, 6, 6,
        7, 8, 9, 10,
        12, 14, 15, 0
    };

    private static final float table1[] = {
        3134, 5342, 6870, 7792,
        8569, 9185, 9744, 10191,
        10631, 11061, 11434, 11770,
        12116, 12513, 12925, 13300,
        13674, 14027, 14352, 14716,
        15117, 15477, 15824, 16157,
        16513, 16804, 17090, 17401,
        17679, 17948, 18238, 18520,
        18764, 19078, 19381, 19640,
        19921, 20205, 20500, 20813,
        21162, 21465, 21794, 22137,
        22453, 22756, 23067, 23350,
        23636, 23926, 24227, 24521,
        24819, 25107, 25414, 25730,
        26120, 26497, 26895, 27344,
        27877, 28463, 29426, 31355
    };

    private static final float table2[] = {
        -11725, -9420, -7910, -6801,
        -5948, -5233, -4599, -4039,
        -3507, -3030, -2596, -2170,
        -1774, -1383, -1016, -660,
        -329, -1, 337, 696,
        1085, 1512, 1962, 2433,
        2968, 3569, 4314, 5279,
        6622, 8154, 10076, 12975
    };

    private static final float table3[] = {
         0.0f,          -0.847256005f,    0.722470999f,    -1.52474797f,
        -0.453148007f,   0.375360996f,    1.47178996f,     -1.98225796f,
        -1.19293797f,   -0.582937002f,   -0.0693780035f,    0.390956998f,
         0.906920016f,   1.486274f,       2.22154093f,     -2.38878703f,
        -1.80675399f,   -1.41054201f,    -1.07736099f,     -0.799501002f,
        -0.555810988f,  -0.333402008f,   -0.132449001f,     0.0568020009f,
         0.254877001f,   0.477355003f,    0.738685012f,     1.04430604f,
         1.39544594f,    1.80987501f,     2.39187598f,     -2.38938308f,
        -1.98846805f,   -1.75140405f,    -1.56431198f,     -1.39221299f,
        -1.216465f,     -1.04694998f,    -0.890510023f,    -0.764558017f,
        -0.645457983f,  -0.52592802f,    -0.405954987f,    -0.302971989f,
        -0.209690005f,  -0.123986997f,   -0.0479229987f,    0.025773f,
         0.100134f,      0.173718005f,    0.258554012f,     0.352290004f,
         0.456988007f,   0.576775014f,    0.700316012f,     0.842552006f,
         1.00938797f,    1.18213499f,     1.35345602f,      1.53208196f,
         1.73326194f,    1.97223496f,     2.39781404f,     -2.5756309f,
        -2.05733204f,   -1.89849198f,    -1.77278101f,     -1.66626f,
        -1.57421803f,   -1.49933195f,    -1.43166399f,     -1.36522806f,
        -1.30009902f,   -1.22809303f,    -1.15885794f,     -1.09212506f,
        -1.013574f,     -0.920284986f,   -0.828705013f,    -0.737488985f,
        -0.644775987f,  -0.559094012f,   -0.485713989f,    -0.411031991f,
        -0.345970005f,  -0.285115987f,   -0.234162003f,    -0.187058002f,
        -0.144250005f,  -0.110716999f,   -0.0739680007f,   -0.0365610011f,
        -0.00732900016f, 0.0203610007f,   0.0479039997f,    0.0751969963f,
         0.0980999991f,  0.122038998f,    0.145899996f,     0.169434994f,
         0.197045997f,   0.225243002f,    0.255686998f,     0.287010014f,
         0.319709986f,   0.352582991f,    0.388906986f,     0.433492005f,
         0.476945996f,   0.520482004f,    0.564453006f,     0.612204015f,
         0.668592989f,   0.734165013f,    0.803215981f,     0.878404021f,
         0.956620991f,   1.03970695f,     1.12937701f,      1.22111595f,
         1.30802798f,    1.40248001f,     1.50568199f,      1.62277305f,
         1.77249599f,    1.94308805f,     2.29039311f,      0.0f
    };

    /**
     * Lookup table.
     * <pre>
     * for (int i = 0; i < 64; ++i) {
     *     table4[i] = Math.cos((i + 0.25) / 64 * (Math.PI / 2));
     * }
     * </pre>
     */
    private static final float table4[] = {
        0.999981225f,    0.999529421f,    0.998475611f,     0.996820271f,
        0.994564593f,    0.991709828f,    0.988257587f,     0.984210074f,
        0.979569793f,    0.974339426f,    0.968522072f,     0.962121427f,
        0.955141187f,    0.947585583f,    0.939459205f,     0.930767f,
        0.921513975f,    0.911705971f,    0.901348829f,     0.890448689f,
        0.879012227f,    0.867046177f,    0.854557991f,     0.841554999f,
        0.828045011f,    0.81403631f,     0.799537301f,     0.784556627f,
        0.769103289f,    0.753186822f,    0.736816585f,     0.720002472f,
        0.702754676f,    0.685083687f,    0.666999876f,     0.64851439f,
        0.629638195f,    0.610382795f,    0.590759695f,     0.570780694f,
        0.550458014f,    0.529803574f,    0.50883007f,      0.487550199f,
        0.465976506f,    0.444122106f,    0.422000289f,     0.399624199f,
        0.377007395f,    0.354163498f,    0.331106305f,     0.307849586f,
        0.284407496f,    0.260794103f,    0.237023607f,     0.213110298f,
        0.189068705f,    0.164913103f,    0.1406582f,       0.116318598f,
        0.0919089988f,   0.0674438998f,   0.0429382995f,    0.0184067003f
    };

    /**
     * Lookup table.
     * <pre>
     * for (int i = 0; i < 64; ++i) {
     *     table5[i] = Math.cos(i / 64.0 * (Math.PI / 2)) * Math.sqrt(2.0 / 128);
     * }
     * </pre>
     */
    private static final float table5[] = {
        0.125f,          0.124962397f,    0.124849401f,     0.124661297f,
        0.124398097f,    0.124059901f,    0.123647101f,     0.123159699f,
        0.122598201f,    0.121962801f,    0.1212539f,       0.120471999f,
        0.119617499f,    0.118690997f,    0.117693f,        0.116624102f,
        0.115484901f,    0.114276201f,    0.112998702f,     0.111653f,
        0.110240199f,    0.108760901f,    0.107216097f,     0.105606697f,
        0.103933699f,    0.102198102f,    0.100400902f,     0.0985433012f,
        0.0966262966f,   0.094651103f,    0.0926188976f,    0.0905309021f,
        0.0883883014f,   0.0861926004f,   0.0839449018f,    0.0816465989f,
        0.0792991966f,   0.076903902f,    0.0744623989f,    0.0719759986f,
        0.069446303f,    0.0668746978f,   0.0642627999f,    0.0616123006f,
        0.0589246005f,   0.0562013984f,   0.0534444004f,    0.0506552011f,
        0.0478353985f,   0.0449868999f,   0.0421111993f,    0.0392102003f,
        0.0362856016f,   0.0333391018f,   0.0303725004f,    0.0273876991f,
        0.0243862998f,   0.0213702004f,   0.0183412991f,    0.0153013002f,
        0.0122520998f,   0.0091955997f,   0.00613350002f,   0.00306769996f
    };

    /**
     * Lookup table.
     * <pre>
     * for (int i = 0; i < 64; ++i) {
     *     table6[i] = -Math.sin((i + 0.25) / 64 * (Math.PI / 2));
     * }
     * </pre>
     */
    private static final float table6[] = {
        -0.00613590004f,-0.0306748003f,  -0.0551952012f,   -0.0796824023f,
        -0.104121603f,  -0.128498107f,   -0.152797207f,    -0.177004203f,
        -0.201104596f,  -0.225083902f,   -0.248927593f,    -0.272621393f,
        -0.296150893f,  -0.319501996f,   -0.342660695f,    -0.365613014f,
        -0.388345003f,  -0.410843194f,   -0.433093786f,    -0.455083609f,
        -0.47679919f,   -0.498227686f,   -0.519356012f,    -0.540171504f,
        -0.560661614f,  -0.580814004f,   -0.600616515f,    -0.620057225f,
        -0.639124393f,  -0.657806695f,   -0.676092684f,    -0.693971515f,
        -0.711432219f,  -0.728464425f,   -0.745057821f,    -0.761202395f,
        -0.77688849f,   -0.792106628f,   -0.806847572f,    -0.8211025f,
        -0.834862888f,  -0.848120272f,   -0.860866904f,    -0.873094976f,
        -0.884797096f,  -0.895966172f,   -0.906595707f,    -0.916679084f,
        -0.926210225f,  -0.935183525f,   -0.943593502f,    -0.95143503f,
        -0.958703518f,  -0.965394378f,   -0.971503913f,    -0.977028072f,
        -0.981963873f,  -0.986308098f,   -0.990058184f,    -0.993211925f,
        -0.995767415f,  -0.997723103f,   -0.999077678f,    -0.999830604f
    };

    /**
     * Lookup table.
     * <pre>
     * for (int i = 0; i < 128; ++i) {
     *     table7[i] = Math.sin((i + 0.5) / 128 * (Math.PI / 2));
     * }
     * </pre>
     */
    private static final float table7[] = {
        0.00613590004f,  0.0184067003f,   0.0306748003f,    0.0429382995f,
        0.0551952012f,   0.0674438998f,   0.0796824023f,    0.0919089988f,
        0.104121603f,    0.116318598f,    0.128498107f,     0.1406582f,
        0.152797207f,    0.164913103f,    0.177004203f,     0.189068705f,
        0.201104596f,    0.213110298f,    0.225083902f,     0.237023607f,
        0.248927593f,    0.260794103f,    0.272621393f,     0.284407496f,
        0.296150893f,    0.307849586f,    0.319501996f,     0.331106305f,
        0.342660695f,    0.354163498f,    0.365613014f,     0.377007395f,
        0.388345003f,    0.399624199f,    0.410843194f,     0.422000289f,
        0.433093786f,    0.444122106f,    0.455083609f,     0.465976506f,
        0.47679919f,     0.487550199f,    0.498227686f,     0.50883007f,
        0.519356012f,    0.529803574f,    0.540171504f,     0.550458014f,
        0.560661614f,    0.570780694f,    0.580814004f,     0.590759695f,
        0.600616515f,    0.610382795f,    0.620057225f,     0.629638195f,
        0.639124393f,    0.64851439f,     0.657806695f,     0.666999876f,
        0.676092684f,    0.685083687f,    0.693971515f,     0.702754676f,
        0.711432219f,    0.720002472f,    0.728464425f,     0.736816585f,
        0.745057821f,    0.753186822f,    0.761202395f,     0.769103289f,
        0.77688849f,     0.784556627f,    0.792106628f,     0.799537301f,
        0.806847572f,    0.81403631f,     0.8211025f,       0.828045011f,
        0.834862888f,    0.841554999f,    0.848120272f,     0.854557991f,
        0.860866904f,    0.867046177f,    0.873094976f,     0.879012227f,
        0.884797096f,    0.890448689f,    0.895966172f,     0.901348829f,
        0.906595707f,    0.911705971f,    0.916679084f,     0.921513975f,
        0.926210225f,    0.930767f,       0.935183525f,     0.939459205f,
        0.943593502f,    0.947585583f,    0.95143503f,      0.955141187f,
        0.958703518f,    0.962121427f,    0.965394378f,     0.968522072f,
        0.971503913f,    0.974339426f,    0.977028072f,     0.979569793f,
        0.981963873f,    0.984210074f,    0.986308098f,     0.988257587f,
        0.990058184f,    0.991709828f,    0.993211925f,     0.994564593f,
        0.995767415f,    0.996820271f,    0.997723103f,     0.998475611f,
        0.999077678f,    0.999529421f,    0.999830604f,     0.999981225f
    };

    private static final short table9[] = {
        32767, 30840, 29127, 27594, 26214, 24966, 23831, 22795,
        21845, 20972, 20165, 19418, 18725, 18079, 17476, 16913,
        16384, 0,     0,     0,     0,     0,     0,     0,
        0,     0,     0,     0,     0,     0,     0,     0
    };

    /**
     * Lookup table.
     * <pre>
     * for (int i = 0; i <= 128; ++i) {
     *     table10[i] = Math.sin((i / 128.0) * (Math.PI / 2));
     * }
     * </pre>
     */
    private static final float table10[] = {
        0.0f,            0.0122715384f,   0.024541229f,     0.0368072242f,
        0.0490676723f,   0.061320737f,    0.0735645667f,    0.0857973099f,
        0.0980171412f,   0.110222213f,    0.122410677f,     0.134580716f,
        0.146730468f,    0.158858135f,    0.170961887f,     0.183039889f,
        0.195090324f,    0.207111374f,    0.219101235f,     0.231058106f,
        0.242980182f,    0.254865646f,    0.266712755f,     0.27851969f,
        0.290284693f,    0.302005947f,    0.313681751f,     0.32531029f,
        0.336889863f,    0.348418683f,    0.359895051f,     0.371317178f,
        0.382683426f,    0.393992037f,    0.405241311f,     0.416429549f,
        0.427555084f,    0.438616246f,    0.449611336f,     0.460538715f,
        0.471396744f,    0.482183784f,    0.492898196f,     0.50353837f,
        0.514102757f,    0.524589658f,    0.534997642f,     0.545324981f,
        0.555570245f,    0.565731823f,    0.575808167f,     0.585797846f,
        0.59569931f,     0.605511069f,    0.615231574f,     0.624859512f,
        0.634393275f,    0.643831551f,    0.653172851f,     0.662415802f,
        0.671558976f,    0.680601001f,    0.689540565f,     0.698376238f,
        0.707106769f,    0.715730846f,    0.724247098f,     0.732654274f,
        0.740951121f,    0.749136388f,    0.757208824f,     0.765167296f,
        0.773010433f,    0.780737221f,    0.78834641f,      0.795836926f,
        0.803207517f,    0.81045723f,     0.817584813f,     0.824589312f,
        0.831469595f,    0.838224709f,    0.84485358f,      0.851355195f,
        0.857728601f,    0.863972843f,    0.870086968f,     0.876070082f,
        0.881921232f,    0.887639642f,    0.893224299f,     0.898674488f,
        0.903989315f,    0.909168005f,    0.914209783f,     0.919113874f,
        0.923879504f,    0.928506076f,    0.932992816f,     0.937339008f,
        0.941544056f,    0.945607305f,    0.949528158f,     0.953306019f,
        0.956940353f,    0.960430503f,    0.963776052f,     0.966976464f,
        0.970031261f,    0.972939968f,    0.975702107f,     0.97831738f,
        0.980785251f,    0.983105481f,    0.985277653f,     0.987301409f,
        0.989176512f,    0.990902662f,    0.992479503f,     0.993906975f,
        0.99518472f,     0.996312618f,    0.997290432f,     0.998118103f,
        0.99879545f,     0.999322355f,    0.999698818f,     0.999924719f,
        1.0f
    };
}
