/*
 * SIP Communicator, the OpenSource Java VoIP and Instant Messaging client.
 *
 * Distributable under LGPL license.
 * See terms of license at gnu.org.
 */
//package net.java.sip.communicator.impl.media.codec.audio.ilbc;
package org.red5.app.sip.codecs.ilbc;

/**
 * @author Jean Lorchat
 */
public class ilbc_constants {
    /* general codec settings */

    static float FS = (float)8000.0f;
    public static int BLOCKL_20MS = 160;
    public static int BLOCKL_30MS = 240;
    static int BLOCKL_MAX = 240;
    static int NSUB_20MS = 4;
    static int NSUB_30MS = 6;
    static int NSUB_MAX = 6;
    static int NASUB_20MS = 2;
    static int NASUB_30MS = 4;
    static int NASUB_MAX = 4;
    static int SUBL = 40;
    static int STATE_LEN = 80;
    static int STATE_SHORT_LEN_30MS = 58;
    static int STATE_SHORT_LEN_20MS = 57;

    /* LPC settings */

    static int  LPC_FILTERORDER = 10;
    static float LPC_CHIRP_SYNTDENUM = (float)0.9025;
    static float LPC_CHIRP_WEIGHTDENUM = (float)0.4222;
    static int LPC_LOOKBACK = 60;
    static int LPC_N_20MS = 1;
    static int LPC_N_30MS = 2;
    static int LPC_N_MAX = 2;
    static int LPC_ASYMDIFF = 20;
    static float LPC_BW = (float)60.0f;
    static float LPC_WN = (float)1.0001f;
    static int LSF_NSPLIT = 3;
    static int LSF_NUMBER_OF_STEPS = 4;
    static int LPC_HALFORDER = (LPC_FILTERORDER/2);

    /* cb settings */

    static int CB_NSTAGES = 3;
    static int CB_EXPAND = 2;
    static int CB_MEML = 147;
    static int CB_HALFFILTERLEN = 4;
    static int CB_FILTERLEN = 2*CB_HALFFILTERLEN;
    static int CB_RESRANGE = 34;
    static float CB_MAXGAIN = (float)1.3;

    /* enhancer */

    static int ENH_BLOCKL = 80;  /* block length */
    static int ENH_BLOCKL_HALF = (ENH_BLOCKL/2);
    static int ENH_HL = 3;   /* 2*ENH_HL+1 is number blocks
				in said second sequence */
    static int ENH_SLOP = 2;   /* max difference estimated and
				  correct pitch period */
    static int ENH_PLOCSL = 20;  /* pitch-estimates and pitch-
				    locations buffer length */
    static int ENH_OVERHANG = 2;
    static int ENH_UPS0 = 4;   /* upsampling rate */
    static int ENH_FL0 = 3;   /* 2*FLO+1 is the length of
				 each filter */
    static int ENH_VECTL = (ENH_BLOCKL+2*ENH_FL0);
    static int ENH_CORRDIM = (2*ENH_SLOP+1);
    static int ENH_NBLOCKS = (BLOCKL_MAX/ENH_BLOCKL);
    static int ENH_NBLOCKS_EXTRA = 5;
    static int ENH_NBLOCKS_TOT = 8;   /* ENH_NBLOCKS +
					 ENH_NBLOCKS_EXTRA */
    static int ENH_BUFL = (ENH_NBLOCKS_TOT)*ENH_BLOCKL;
    static float ENH_ALPHA0 = (float)0.05f;

    /* Down sampling */

    static int FILTERORDER_DS = 7;
    static int DELAY_DS = 3;
    static int FACTOR_DS = 2;

    /* bit stream defs */

    public static int NO_OF_BYTES_20MS = 38;
    public static int NO_OF_BYTES_30MS = 50;
    static int NO_OF_WORDS_20MS = 19;
    static int NO_OF_WORDS_30MS = 25;
    static int STATE_BITS = 3;
    static int BYTE_LEN = 8;
    static int ULP_CLASSES = 3;

    /* help parameters */

    static float DOUBLE_MAX = (float)1.0e37;
    static float EPS = (float)2.220446049250313e-016;
    static float PI = (float)3.14159265358979323846;
    static int MIN_SAMPLE = -32768;
    static int MAX_SAMPLE = 32767;
    static float TWO_PI = (float)6.283185307;
    static float PI2 = (float)0.159154943;

    /* */

    static int lsf_bits_20ms[][] = {   {6,0,0,0,0}, {7,0,0,0,0}, {7,0,0,0,0},
				       {0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}};
    static int start_bits_20ms[] = {2,0,0,0,0};
    static int startfirst_bits_20ms[] = {1,0,0,0,0};
    static int scale_bits_20ms[] = {6,0,0,0,0};
    static int state_bits_20ms[] = {0,1,2,0,0};

    static int extra_cb_index_20ms[][] = {{6,0,1,0,0}, {0,0,7,0,0}, {0,0,7,0,0}};
    static int extra_cb_gain_20ms[][] = {{2,0,3,0,0}, {1,1,2,0,0}, {0,0,3,0,0}};

    static int cb_index_20ms[][][] = {   {{7,0,1,0,0}, {0,0,7,0,0}, {0,0,7,0,0}},
					 {{0,0,8,0,0}, {0,0,8,0,0}, {0,0,8,0,0}},
					 {{0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}},
					 {{0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}}};

    static int cb_gain_20ms[][][] = {   {{1,2,2,0,0}, {1,1,2,0,0}, {0,0,3,0,0}},
					{{1,1,3,0,0}, {0,2,2,0,0}, {0,0,3,0,0}},
					{{0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}},
					{{0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}}};


    static int lsf_bits_30ms[][] = {   {6,0,0,0,0}, {7,0,0,0,0}, {7,0,0,0,0},
				       {6,0,0,0,0}, {7,0,0,0,0}, {7,0,0,0,0}};
    static int start_bits_30ms[] = {3,0,0,0,0};
    static int startfirst_bits_30ms[] = {1,0,0,0,0};
    static int scale_bits_30ms[] = {6,0,0,0,0};
    static int state_bits_30ms[] = {0,1,2,0,0};

    static int extra_cb_index_30ms[][] = {{4,2,1,0,0}, {0,0,7,0,0}, {0,0,7,0,0}};
    static int extra_cb_gain_30ms[][] = {{1,1,3,0,0}, {1,1,2,0,0}, {0,0,3,0,0}};

    static int cb_index_30ms[][][] = {   {{6,1,1,0,0}, {0,0,7,0,0}, {0,0,7,0,0}},
					 {{0,7,1,0,0}, {0,0,8,0,0}, {0,0,8,0,0}},
					 {{0,7,1,0,0}, {0,0,8,0,0}, {0,0,8,0,0}},
					 {{0,7,1,0,0}, {0,0,8,0,0}, {0,0,8,0,0}},
					 {{0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}},
					 {{0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}}};

    static int cb_gain_30ms[][][] = {   {{1,2,2,0,0}, {1,2,1,0,0}, {0,0,3,0,0}},
					{{0,2,3,0,0}, {0,2,2,0,0}, {0,0,3,0,0}},
					{{0,1,4,0,0}, {0,1,3,0,0}, {0,0,3,0,0}},
					{{0,1,4,0,0}, {0,1,3,0,0}, {0,0,3,0,0}},
					{{0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}},
					{{0,0,0,0,0}, {0,0,0,0,0}, {0,0,0,0,0}}};

    /* HP filters */
    static float hpi_zero_coefsTbl[] = {(float)0.92727436f, (float)-1.8544941f, (float)0.92727436f};
    static float hpi_pole_coefsTbl[] = {(float)1.0f, (float)-1.9059465f, (float)0.9114024f};
    static float hpo_zero_coefsTbl[] = {(float)0.93980581f, (float)-1.8795834f, (float)0.93980581f};
    static float hpo_pole_coefsTbl[] = {(float)1.0f, (float)-1.9330735f, (float)0.93589199f};

    /* LP Filter */

    static float lpFilt_coefsTbl[] = {(float)-0.066650, (float)0.125000,
				       (float)0.316650, (float)0.414063,
				       (float)0.316650, (float)0.125000,
				       (float)-0.066650};

    /* State quantization tables */

    static float state_sq3Tbl[] = {
	(float)-3.719849, (float)-2.177490, (float)-1.130005,
	(float)-0.309692, (float)0.444214, (float)1.329712,
	(float)2.436279, (float)3.983887
    };

    static float state_frgqTbl[] = {
	(float)1.000085, (float)1.071695, (float)1.140395,
	(float)1.206868, (float)1.277188, (float)1.351503,
	(float)1.429380, (float)1.500727, (float)1.569049,
	(float)1.639599, (float)1.707071, (float)1.781531,
	(float)1.840799, (float)1.901550, (float)1.956695,
	(float)2.006750, (float)2.055474, (float)2.102787,
	(float)2.142819, (float)2.183592, (float)2.217962,
	(float)2.257177, (float)2.295739, (float)2.332967,
	(float)2.369248, (float)2.402792, (float)2.435080,
	(float)2.468598, (float)2.503394, (float)2.539284,
	(float)2.572944, (float)2.605036, (float)2.636331,
	(float)2.668939, (float)2.698780, (float)2.729101,
	(float)2.759786, (float)2.789834, (float)2.818679,
	(float)2.848074, (float)2.877470, (float)2.906899,
	(float)2.936655, (float)2.967804, (float)3.000115,
	(float)3.033367, (float)3.066355, (float)3.104231,
	(float)3.141499, (float)3.183012, (float)3.222952,
	(float)3.265433, (float)3.308441, (float)3.350823,
	(float)3.395275, (float)3.442793, (float)3.490801,
	(float)3.542514, (float)3.604064, (float)3.666050,
	(float)3.740994, (float)3.830749, (float)3.938770,
	(float)4.101764
    };

    /* CB tables */

    static int search_rangeTbl[][]={{58,58,58}, {108,44,44},
				    {108,108,108}, {108,108,108}, {108,108,108}};
    static int stMemLTbl=85;
    static int memLfTbl[]={147,147,147,147};

    /* expansion filter(s) */

    static float cbfiltersTbl[]={
	(float)-0.034180, (float)0.108887, (float)-0.184326,
	(float)0.806152,  (float)0.713379, (float)-0.144043,
	(float)0.083740,  (float)-0.033691
    };

    /* Gain Quantization */

    static float gain_sq3Tbl[]={
	(float)-1.000000,  (float)-0.659973,  (float)-0.330017,
	(float)0.000000, (float)0.250000, (float)0.500000,
	(float)0.750000, (float)1.00000};

    static float gain_sq4Tbl[]={
	(float)-1.049988, (float)-0.900024, (float)-0.750000,
	(float)-0.599976, (float)-0.450012, (float)-0.299988,
	(float)-0.150024, (float)0.000000, (float)0.150024,
	(float)0.299988, (float)0.450012, (float)0.599976,
	(float)0.750000, (float)0.900024, (float)1.049988,
	(float)1.200012};

    static float gain_sq5Tbl[]={
	(float)0.037476, (float)0.075012, (float)0.112488,
	(float)0.150024, (float)0.187500, (float)0.224976,
	(float)0.262512, (float)0.299988, (float)0.337524,
	(float)0.375000, (float)0.412476, (float)0.450012,
	(float)0.487488, (float)0.525024, (float)0.562500,
	(float)0.599976, (float)0.637512, (float)0.674988,
	(float)0.712524, (float)0.750000, (float)0.787476,
	(float)0.825012, (float)0.862488, (float)0.900024,
	(float)0.937500, (float)0.974976, (float)1.012512,
	(float)1.049988, (float)1.087524, (float)1.125000,
	(float)1.162476, (float)1.200012};

    /* Enhancer - Upsamling a factor 4 (ENH_UPS0 = 4) */
    static float polyphaserTbl[]={
	(float)0.000000, (float)0.000000, (float)0.000000,
	(float)1.000000,
	(float)0.000000, (float)0.000000, (float)0.000000,
	(float)0.015625, (float)-0.076904, (float)0.288330,
	(float)0.862061,
	(float)-0.106445, (float)0.018799, (float)-0.015625,
	(float)0.023682, (float)-0.124268, (float)0.601563,
	(float)0.601563,
	(float)-0.124268, (float)0.023682, (float)-0.023682,
	(float)0.018799, (float)-0.106445, (float)0.862061,
	(float)0.288330,
	(float)-0.076904, (float)0.015625, (float)-0.018799};

    static float enh_plocsTbl[] = {(float)40.0f, (float)120.0f,
				    (float)200.0f, (float)280.0f, (float)360.0f,
				    (float)440.0f, (float)520.0f, (float)600.0};

    /* LPC analysis and quantization */

    static int dim_lsfCbTbl[] = {3, 3, 4};
    static int size_lsfCbTbl[] = {64,128,128};

    static float lsfmeanTbl[] = {
	(float)0.281738, (float)0.445801, (float)0.663330,
	(float)0.962524, (float)1.251831, (float)1.533081,
	(float)1.850586, (float)2.137817, (float)2.481445,
	(float)2.777344};

    static float lsf_weightTbl_30ms[] = {(float)(1.0f/2.0), (float)1.0,
					  (float)(2.0f/3.0),
					  (float)(1.0f/3.0), (float)0.0f, (float)0.0};

    static float lsf_weightTbl_20ms[] = {(float)(3.0f/4.0), (float)(2.0/4.0),
					  (float)(1.0f/4.0), (float)(0.0)};

    /* Hanning LPC window */
    static float lpc_winTbl[]={
	(float)0.000183, (float)0.000671, (float)0.001526,
	(float)0.002716, (float)0.004242, (float)0.006104,
	(float)0.008301, (float)0.010834, (float)0.013702,
	(float)0.016907, (float)0.020416, (float)0.024261,
	(float)0.028442, (float)0.032928, (float)0.037750,
	(float)0.042877, (float)0.048309, (float)0.054047,
	(float)0.060089, (float)0.066437, (float)0.073090,
	(float)0.080017, (float)0.087219, (float)0.094727,
	(float)0.102509, (float)0.110535, (float)0.118835,
	(float)0.127411, (float)0.136230, (float)0.145294,
	(float)0.154602, (float)0.164154, (float)0.173920,
	(float)0.183899, (float)0.194122, (float)0.204529,
	(float)0.215149, (float)0.225952, (float)0.236938,
	(float)0.248108, (float)0.259460, (float)0.270966,
	(float)0.282654, (float)0.294464, (float)0.306396,
	(float)0.318481, (float)0.330688, (float)0.343018,
	(float)0.355438, (float)0.367981, (float)0.380585,
	(float)0.393280, (float)0.406067, (float)0.418884,
	(float)0.431763, (float)0.444702, (float)0.457672,
	(float)0.470673, (float)0.483704, (float)0.496735,
	(float)0.509766, (float)0.522797, (float)0.535828,
	(float)0.548798, (float)0.561768, (float)0.574677,
	(float)0.587524, (float)0.600342, (float)0.613068,
	(float)0.625732, (float)0.638306, (float)0.650787,
	(float)0.663147, (float)0.675415, (float)0.687561,
	(float)0.699585, (float)0.711487, (float)0.723206,
	(float)0.734802, (float)0.746216, (float)0.757477,
	(float)0.768585, (float)0.779480, (float)0.790192,
	(float)0.800720, (float)0.811005, (float)0.821106,
	(float)0.830994, (float)0.840668, (float)0.850067,
	(float)0.859253, (float)0.868225, (float)0.876892,
	(float)0.885345, (float)0.893524, (float)0.901428,
	(float)0.909058, (float)0.916412, (float)0.923492,
	(float)0.930267, (float)0.936768, (float)0.942963,
	(float)0.948853, (float)0.954437, (float)0.959717,
	(float)0.964691, (float)0.969360, (float)0.973694,
	(float)0.977692, (float)0.981384, (float)0.984741,
	(float)0.987762, (float)0.990479, (float)0.992828,
	(float)0.994873, (float)0.996552, (float)0.997925,
	(float)0.998932, (float)0.999603, (float)0.999969,
	(float)0.999969, (float)0.999603, (float)0.998932,
	(float)0.997925, (float)0.996552, (float)0.994873,
	(float)0.992828, (float)0.990479, (float)0.987762,
	(float)0.984741, (float)0.981384, (float)0.977692,
	(float)0.973694, (float)0.969360, (float)0.964691,
	(float)0.959717, (float)0.954437, (float)0.948853,
	(float)0.942963, (float)0.936768, (float)0.930267,
	(float)0.923492, (float)0.916412, (float)0.909058,
	(float)0.901428, (float)0.893524, (float)0.885345,
	(float)0.876892, (float)0.868225, (float)0.859253,
	(float)0.850067, (float)0.840668, (float)0.830994,
	(float)0.821106, (float)0.811005, (float)0.800720,
	(float)0.790192, (float)0.779480, (float)0.768585,
	(float)0.757477, (float)0.746216, (float)0.734802,
	(float)0.723206, (float)0.711487, (float)0.699585,
	(float)0.687561, (float)0.675415, (float)0.663147,
	(float)0.650787, (float)0.638306, (float)0.625732,
	(float)0.613068, (float)0.600342, (float)0.587524,
	(float)0.574677, (float)0.561768, (float)0.548798,
	(float)0.535828, (float)0.522797, (float)0.509766,
	(float)0.496735, (float)0.483704, (float)0.470673,
	(float)0.457672, (float)0.444702, (float)0.431763,
	(float)0.418884, (float)0.406067, (float)0.393280,
	(float)0.380585, (float)0.367981, (float)0.355438,
	(float)0.343018, (float)0.330688, (float)0.318481,
	(float)0.306396, (float)0.294464, (float)0.282654,
	(float)0.270966, (float)0.259460, (float)0.248108,
	(float)0.236938, (float)0.225952, (float)0.215149,
	(float)0.204529, (float)0.194122, (float)0.183899,
	(float)0.173920, (float)0.164154, (float)0.154602,
	(float)0.145294, (float)0.136230, (float)0.127411,
	(float)0.118835, (float)0.110535, (float)0.102509,
	(float)0.094727, (float)0.087219, (float)0.080017,
	(float)0.073090, (float)0.066437, (float)0.060089,
	(float)0.054047, (float)0.048309, (float)0.042877,
	(float)0.037750, (float)0.032928, (float)0.028442,
	(float)0.024261, (float)0.020416, (float)0.016907,
	(float)0.013702, (float)0.010834, (float)0.008301,
	(float)0.006104, (float)0.004242, (float)0.002716,
	(float)0.001526, (float)0.000671, (float)0.000183
    };

    /* Asymmetric LPC window */
    static float lpc_asymwinTbl[]={
	(float)0.000061, (float)0.000214, (float)0.000458,
	(float)0.000824, (float)0.001282, (float)0.001831,
	(float)0.002472, (float)0.003235, (float)0.004120,
	(float)0.005066, (float)0.006134, (float)0.007294,
	(float)0.008545, (float)0.009918, (float)0.011383,
	(float)0.012939, (float)0.014587, (float)0.016357,
	(float)0.018219, (float)0.020172, (float)0.022217,
	(float)0.024353, (float)0.026611, (float)0.028961,
	(float)0.031372, (float)0.033905, (float)0.036530,
	(float)0.039276, (float)0.042084, (float)0.044983,
	(float)0.047974, (float)0.051086, (float)0.054260,
	(float)0.057526, (float)0.060883, (float)0.064331,
	(float)0.067871, (float)0.071503, (float)0.075226,
	(float)0.079010, (float)0.082916, (float)0.086884,
	(float)0.090942, (float)0.095062, (float)0.099304,
	(float)0.103607, (float)0.107971, (float)0.112427,
	(float)0.116974, (float)0.121582, (float)0.126282,
	(float)0.131073, (float)0.135895, (float)0.140839,
	(float)0.145813, (float)0.150879, (float)0.156006,
	(float)0.161224, (float)0.166504, (float)0.171844,
	(float)0.177246, (float)0.182709, (float)0.188263,
	(float)0.193848, (float)0.199524, (float)0.205231,
	(float)0.211029, (float)0.216858, (float)0.222778,
	(float)0.228729, (float)0.234741, (float)0.240814,
	(float)0.246918, (float)0.253082, (float)0.259308,
	(float)0.265564, (float)0.271881, (float)0.278259,
	(float)0.284668, (float)0.291107, (float)0.297607,
	(float)0.304138, (float)0.310730, (float)0.317322,
	(float)0.323975, (float)0.330658, (float)0.337372,
	(float)0.344147, (float)0.350922, (float)0.357727,
	(float)0.364594, (float)0.371460, (float)0.378357,
	(float)0.385284, (float)0.392212, (float)0.399170,
	(float)0.406158, (float)0.413177, (float)0.420197,
	(float)0.427246, (float)0.434296, (float)0.441376,
	(float)0.448456, (float)0.455536, (float)0.462646,
	(float)0.469757, (float)0.476868, (float)0.483978,
	(float)0.491089, (float)0.498230, (float)0.505341,
	(float)0.512451, (float)0.519592, (float)0.526703,
	(float)0.533813, (float)0.540924, (float)0.548004,
	(float)0.555084, (float)0.562164, (float)0.569244,
	(float)0.576294, (float)0.583313, (float)0.590332,
	(float)0.597321, (float)0.604309, (float)0.611267,
	(float)0.618195, (float)0.625092, (float)0.631989,
	(float)0.638855, (float)0.645660, (float)0.652466,
	(float)0.659241, (float)0.665985, (float)0.672668,
	(float)0.679352, (float)0.685974, (float)0.692566,
	(float)0.699127, (float)0.705658, (float)0.712128,
	(float)0.718536, (float)0.724945, (float)0.731262,
	(float)0.737549, (float)0.743805, (float)0.750000,
	(float)0.756134, (float)0.762238, (float)0.768280,
	(float)0.774261, (float)0.780182, (float)0.786072,
	(float)0.791870, (float)0.797638, (float)0.803314,
	(float)0.808960, (float)0.814514, (float)0.820038,
	(float)0.825470, (float)0.830841, (float)0.836151,
	(float)0.841400, (float)0.846558, (float)0.851654,
	(float)0.856689, (float)0.861633, (float)0.866516,
	(float)0.871338, (float)0.876068, (float)0.880737,
	(float)0.885315, (float)0.889801, (float)0.894226,
	(float)0.898560, (float)0.902832, (float)0.907013,
	(float)0.911102, (float)0.915100, (float)0.919037,
	(float)0.922882, (float)0.926636, (float)0.930328,
	(float)0.933899, (float)0.937408, (float)0.940796,
	(float)0.944122, (float)0.947357, (float)0.950470,
	(float)0.953522, (float)0.956482, (float)0.959351,
	(float)0.962097, (float)0.964783, (float)0.967377,
	(float)0.969849, (float)0.972229, (float)0.974518,
	(float)0.976715, (float)0.978821, (float)0.980835,
	(float)0.982727, (float)0.984528, (float)0.986237,
	(float)0.987854, (float)0.989380, (float)0.990784,
	(float)0.992096, (float)0.993317, (float)0.994415,
	(float)0.995422, (float)0.996338, (float)0.997162,
	(float)0.997864, (float)0.998474, (float)0.998962,
	(float)0.999390, (float)0.999695, (float)0.999878,
	(float)0.999969, (float)0.999969, (float)0.996918,
	(float)0.987701, (float)0.972382, (float)0.951050,
	(float)0.923889, (float)0.891022, (float)0.852631,
	(float)0.809021, (float)0.760406, (float)0.707092,
	(float)0.649445, (float)0.587799, (float)0.522491,
	(float)0.453979, (float)0.382690, (float)0.309021,
	(float)0.233459, (float)0.156433, (float)0.078461
    };

    /* Lag window for LPC */
    static float lpc_lagwinTbl[]={
	(float)1.000100, (float)0.998890, (float)0.995569,
	(float)0.990057, (float)0.982392,
	(float)0.972623, (float)0.960816, (float)0.947047,
	(float)0.931405, (float)0.913989, (float)0.894909};

    /* LSF quantization*/
    static float lsfCbTbl[] = {
	(float)0.155396, (float)0.273193, (float)0.451172,
	(float)0.390503, (float)0.648071, (float)1.002075,
	(float)0.440186, (float)0.692261, (float)0.955688,
	(float)0.343628, (float)0.642334, (float)1.071533,
	(float)0.318359, (float)0.491577, (float)0.670532,
	(float)0.193115, (float)0.375488, (float)0.725708,
	(float)0.364136, (float)0.510376, (float)0.658691,
	(float)0.297485, (float)0.527588, (float)0.842529,
	(float)0.227173, (float)0.365967, (float)0.563110,
	(float)0.244995, (float)0.396729, (float)0.636475,
	(float)0.169434, (float)0.300171, (float)0.520264,
	(float)0.312866, (float)0.464478, (float)0.643188,
	(float)0.248535, (float)0.429932, (float)0.626099,
	(float)0.236206, (float)0.491333, (float)0.817139,
	(float)0.334961, (float)0.625122, (float)0.895752,
	(float)0.343018, (float)0.518555, (float)0.698608,
	(float)0.372803, (float)0.659790, (float)0.945435,
	(float)0.176880, (float)0.316528, (float)0.581421,
	(float)0.416382, (float)0.625977, (float)0.805176,
	(float)0.303223, (float)0.568726, (float)0.915039,
	(float)0.203613, (float)0.351440, (float)0.588135,
	(float)0.221191, (float)0.375000, (float)0.614746,
	(float)0.199951, (float)0.323364, (float)0.476074,
	(float)0.300781, (float)0.433350, (float)0.566895,
	(float)0.226196, (float)0.354004, (float)0.507568,
	(float)0.300049, (float)0.508179, (float)0.711670,
	(float)0.312012, (float)0.492676, (float)0.763428,
	(float)0.329956, (float)0.541016, (float)0.795776,
	(float)0.373779, (float)0.604614, (float)0.928833,
	(float)0.210571, (float)0.452026, (float)0.755249,
	(float)0.271118, (float)0.473267, (float)0.662476,
	(float)0.285522, (float)0.436890, (float)0.634399,
	(float)0.246704, (float)0.565552, (float)0.859009,
	(float)0.270508, (float)0.406250, (float)0.553589,
	(float)0.361450, (float)0.578491, (float)0.813843,
	(float)0.342651, (float)0.482788, (float)0.622437,
	(float)0.340332, (float)0.549438, (float)0.743164,
	(float)0.200439, (float)0.336304, (float)0.540894,
	(float)0.407837, (float)0.644775, (float)0.895142,
	(float)0.294678, (float)0.454834, (float)0.699097,
	(float)0.193115, (float)0.344482, (float)0.643188,
	(float)0.275757, (float)0.420776, (float)0.598755,
	(float)0.380493, (float)0.608643, (float)0.861084,
	(float)0.222778, (float)0.426147, (float)0.676514,
	(float)0.407471, (float)0.700195, (float)1.053101,
	(float)0.218384, (float)0.377197, (float)0.669922,
	(float)0.313232, (float)0.454102, (float)0.600952,
	(float)0.347412, (float)0.571533, (float)0.874146,
	(float)0.238037, (float)0.405396, (float)0.729492,
	(float)0.223877, (float)0.412964, (float)0.822021,
	(float)0.395264, (float)0.582153, (float)0.743896,
	(float)0.247925, (float)0.485596, (float)0.720581,
	(float)0.229126, (float)0.496582, (float)0.907715,
	(float)0.260132, (float)0.566895, (float)1.012695,
	(float)0.337402, (float)0.611572, (float)0.978149,
	(float)0.267822, (float)0.447632, (float)0.769287,
	(float)0.250610, (float)0.381714, (float)0.530029,
	(float)0.430054, (float)0.805054, (float)1.221924,
	(float)0.382568, (float)0.544067, (float)0.701660,
	(float)0.383545, (float)0.710327, (float)1.149170,
	(float)0.271362, (float)0.529053, (float)0.775513,
	(float)0.246826, (float)0.393555, (float)0.588623,
	(float)0.266846, (float)0.422119, (float)0.676758,
	(float)0.311523, (float)0.580688, (float)0.838623,
	(float)1.331177, (float)1.576782, (float)1.779541,
	(float)1.160034, (float)1.401978, (float)1.768188,
	(float)1.161865, (float)1.525146, (float)1.715332,
	(float)0.759521, (float)0.913940, (float)1.119873,
	(float)0.947144, (float)1.121338, (float)1.282471,
	(float)1.015015, (float)1.557007, (float)1.804932,
	(float)1.172974, (float)1.402100, (float)1.692627,
	(float)1.087524, (float)1.474243, (float)1.665405,
	(float)0.899536, (float)1.105225, (float)1.406250,
	(float)1.148438, (float)1.484741, (float)1.796265,
	(float)0.785645, (float)1.209839, (float)1.567749,
	(float)0.867798, (float)1.166504, (float)1.450684,
	(float)0.922485, (float)1.229858, (float)1.420898,
	(float)0.791260, (float)1.123291, (float)1.409546,
	(float)0.788940, (float)0.966064, (float)1.340332,
	(float)1.051147, (float)1.272827, (float)1.556641,
	(float)0.866821, (float)1.181152, (float)1.538818,
	(float)0.906738, (float)1.373535, (float)1.607910,
	(float)1.244751, (float)1.581421, (float)1.933838,
	(float)0.913940, (float)1.337280, (float)1.539673,
	(float)0.680542, (float)0.959229, (float)1.662720,
	(float)0.887207, (float)1.430542, (float)1.800781,
	(float)0.912598, (float)1.433594, (float)1.683960,
	(float)0.860474, (float)1.060303, (float)1.455322,
	(float)1.005127, (float)1.381104, (float)1.706909,
	(float)0.800781, (float)1.363892, (float)1.829102,
	(float)0.781860, (float)1.124390, (float)1.505981,
	(float)1.003662, (float)1.471436, (float)1.684692,
	(float)0.981323, (float)1.309570, (float)1.618042,
	(float)1.228760, (float)1.554321, (float)1.756470,
	(float)0.734375, (float)0.895752, (float)1.225586,
	(float)0.841797, (float)1.055664, (float)1.249268,
	(float)0.920166, (float)1.119385, (float)1.486206,
	(float)0.894409, (float)1.539063, (float)1.828979,
	(float)1.283691, (float)1.543335, (float)1.858276,
	(float)0.676025, (float)0.933105, (float)1.490845,
	(float)0.821289, (float)1.491821, (float)1.739868,
	(float)0.923218, (float)1.144653, (float)1.580566,
	(float)1.057251, (float)1.345581, (float)1.635864,
	(float)0.888672, (float)1.074951, (float)1.353149,
	(float)0.942749, (float)1.195435, (float)1.505493,
	(float)1.492310, (float)1.788086, (float)2.039673,
	(float)1.070313, (float)1.634399, (float)1.860962,
	(float)1.253296, (float)1.488892, (float)1.686035,
	(float)0.647095, (float)0.864014, (float)1.401855,
	(float)0.866699, (float)1.254883, (float)1.453369,
	(float)1.063965, (float)1.532593, (float)1.731323,
	(float)1.167847, (float)1.521484, (float)1.884033,
	(float)0.956055, (float)1.502075, (float)1.745605,
	(float)0.928711, (float)1.288574, (float)1.479614,
	(float)1.088013, (float)1.380737, (float)1.570801,
	(float)0.905029, (float)1.186768, (float)1.371948,
	(float)1.057861, (float)1.421021, (float)1.617432,
	(float)1.108276, (float)1.312500, (float)1.501465,
	(float)0.979492, (float)1.416992, (float)1.624268,
	(float)1.276001, (float)1.661011, (float)2.007935,
	(float)0.993042, (float)1.168579, (float)1.331665,
	(float)0.778198, (float)0.944946, (float)1.235962,
	(float)1.223755, (float)1.491333, (float)1.815674,
	(float)0.852661, (float)1.350464, (float)1.722290,
	(float)1.134766, (float)1.593140, (float)1.787354,
	(float)1.051392, (float)1.339722, (float)1.531006,
	(float)0.803589, (float)1.271240, (float)1.652100,
	(float)0.755737, (float)1.143555, (float)1.639404,
	(float)0.700928, (float)0.837280, (float)1.130371,
	(float)0.942749, (float)1.197876, (float)1.669800,
	(float)0.993286, (float)1.378296, (float)1.566528,
	(float)0.801025, (float)1.095337, (float)1.298950,
	(float)0.739990, (float)1.032959, (float)1.383667,
	(float)0.845703, (float)1.072266, (float)1.543823,
	(float)0.915649, (float)1.072266, (float)1.224487,
	(float)1.021973, (float)1.226196, (float)1.481323,
	(float)0.999878, (float)1.204102, (float)1.555908,
	(float)0.722290, (float)0.913940, (float)1.340210,
	(float)0.673340, (float)0.835938, (float)1.259521,
	(float)0.832397, (float)1.208374, (float)1.394165,
	(float)0.962158, (float)1.576172, (float)1.912842,
	(float)1.166748, (float)1.370850, (float)1.556763,
	(float)0.946289, (float)1.138550, (float)1.400391,
	(float)1.035034, (float)1.218262, (float)1.386475,
	(float)1.393799, (float)1.717773, (float)2.000244,
	(float)0.972656, (float)1.260986, (float)1.760620,
	(float)1.028198, (float)1.288452, (float)1.484619,
	(float)0.773560, (float)1.258057, (float)1.756714,
	(float)1.080322, (float)1.328003, (float)1.742676,
	(float)0.823975, (float)1.450806, (float)1.917725,
	(float)0.859009, (float)1.016602, (float)1.191895,
	(float)0.843994, (float)1.131104, (float)1.645020,
	(float)1.189697, (float)1.702759, (float)1.894409,
	(float)1.346680, (float)1.763184, (float)2.066040,
	(float)0.980469, (float)1.253784, (float)1.441650,
	(float)1.338135, (float)1.641968, (float)1.932739,
	(float)1.223267, (float)1.424194, (float)1.626465,
	(float)0.765747, (float)1.004150, (float)1.579102,
	(float)1.042847, (float)1.269165, (float)1.647461,
	(float)0.968750, (float)1.257568, (float)1.555786,
	(float)0.826294, (float)0.993408, (float)1.275146,
	(float)0.742310, (float)0.950439, (float)1.430542,
	(float)1.054321, (float)1.439819, (float)1.828003,
	(float)1.072998, (float)1.261719, (float)1.441895,
	(float)0.859375, (float)1.036377, (float)1.314819,
	(float)0.895752, (float)1.267212, (float)1.605591,
	(float)0.805420, (float)0.962891, (float)1.142334,
	(float)0.795654, (float)1.005493, (float)1.468506,
	(float)1.105347, (float)1.313843, (float)1.584839,
	(float)0.792236, (float)1.221802, (float)1.465698,
	(float)1.170532, (float)1.467651, (float)1.664063,
	(float)0.838257, (float)1.153198, (float)1.342163,
	(float)0.968018, (float)1.198242, (float)1.391235,
	(float)1.250122, (float)1.623535, (float)1.823608,
	(float)0.711670, (float)1.058350, (float)1.512085,
	(float)1.204834, (float)1.454468, (float)1.739136,
	(float)1.137451, (float)1.421753, (float)1.620117,
	(float)0.820435, (float)1.322754, (float)1.578247,
	(float)0.798706, (float)1.005005, (float)1.213867,
	(float)0.980713, (float)1.324951, (float)1.512939,
	(float)1.112305, (float)1.438843, (float)1.735596,
	(float)1.135498, (float)1.356689, (float)1.635742,
	(float)1.101318, (float)1.387451, (float)1.686523,
	(float)0.849854, (float)1.276978, (float)1.523438,
	(float)1.377930, (float)1.627563, (float)1.858154,
	(float)0.884888, (float)1.095459, (float)1.287476,
	(float)1.289795, (float)1.505859, (float)1.756592,
	(float)0.817505, (float)1.384155, (float)1.650513,
	(float)1.446655, (float)1.702148, (float)1.931885,
	(float)0.835815, (float)1.023071, (float)1.385376,
	(float)0.916626, (float)1.139038, (float)1.335327,
	(float)0.980103, (float)1.174072, (float)1.453735,
	(float)1.705688, (float)2.153809, (float)2.398315, (float)2.743408,
	(float)1.797119, (float)2.016846, (float)2.445679, (float)2.701904,
	(float)1.990356, (float)2.219116, (float)2.576416, (float)2.813477,
	(float)1.849365, (float)2.190918, (float)2.611572, (float)2.835083,
	(float)1.657959, (float)1.854370, (float)2.159058, (float)2.726196,
	(float)1.437744, (float)1.897705, (float)2.253174, (float)2.655396,
	(float)2.028687, (float)2.247314, (float)2.542358, (float)2.875854,
	(float)1.736938, (float)1.922119, (float)2.185913, (float)2.743408,
	(float)1.521606, (float)1.870972, (float)2.526855, (float)2.786987,
	(float)1.841431, (float)2.050659, (float)2.463623, (float)2.857666,
	(float)1.590088, (float)2.067261, (float)2.427979, (float)2.794434,
	(float)1.746826, (float)2.057373, (float)2.320190, (float)2.800781,
	(float)1.734619, (float)1.940552, (float)2.306030, (float)2.826416,
	(float)1.786255, (float)2.204468, (float)2.457520, (float)2.795288,
	(float)1.861084, (float)2.170532, (float)2.414551, (float)2.763672,
	(float)2.001465, (float)2.307617, (float)2.552734, (float)2.811890,
	(float)1.784424, (float)2.124146, (float)2.381592, (float)2.645508,
	(float)1.888794, (float)2.135864, (float)2.418579, (float)2.861206,
	(float)2.301147, (float)2.531250, (float)2.724976, (float)2.913086,
	(float)1.837769, (float)2.051270, (float)2.261963, (float)2.553223,
	(float)2.012939, (float)2.221191, (float)2.440186, (float)2.678101,
	(float)1.429565, (float)1.858276, (float)2.582275, (float)2.845703,
	(float)1.622803, (float)1.897705, (float)2.367310, (float)2.621094,
	(float)1.581543, (float)1.960449, (float)2.515869, (float)2.736450,
	(float)1.419434, (float)1.933960, (float)2.394653, (float)2.746704,
	(float)1.721924, (float)2.059570, (float)2.421753, (float)2.769653,
	(float)1.911011, (float)2.220703, (float)2.461060, (float)2.740723,
	(float)1.581177, (float)1.860840, (float)2.516968, (float)2.874634,
	(float)1.870361, (float)2.098755, (float)2.432373, (float)2.656494,
	(float)2.059692, (float)2.279785, (float)2.495605, (float)2.729370,
	(float)1.815674, (float)2.181519, (float)2.451538, (float)2.680542,
	(float)1.407959, (float)1.768311, (float)2.343018, (float)2.668091,
	(float)2.168701, (float)2.394653, (float)2.604736, (float)2.829346,
	(float)1.636230, (float)1.865723, (float)2.329102, (float)2.824219,
	(float)1.878906, (float)2.139526, (float)2.376709, (float)2.679810,
	(float)1.765381, (float)1.971802, (float)2.195435, (float)2.586914,
	(float)2.164795, (float)2.410889, (float)2.673706, (float)2.903198,
	(float)2.071899, (float)2.331055, (float)2.645874, (float)2.907104,
	(float)2.026001, (float)2.311523, (float)2.594849, (float)2.863892,
	(float)1.948975, (float)2.180786, (float)2.514893, (float)2.797852,
	(float)1.881836, (float)2.130859, (float)2.478149, (float)2.804199,
	(float)2.238159, (float)2.452759, (float)2.652832, (float)2.868286,
	(float)1.897949, (float)2.101685, (float)2.524292, (float)2.880127,
	(float)1.856445, (float)2.074585, (float)2.541016, (float)2.791748,
	(float)1.695557, (float)2.199097, (float)2.506226, (float)2.742676,
	(float)1.612671, (float)1.877075, (float)2.435425, (float)2.732910,
	(float)1.568848, (float)1.786499, (float)2.194580, (float)2.768555,
	(float)1.953369, (float)2.164551, (float)2.486938, (float)2.874023,
	(float)1.388306, (float)1.725342, (float)2.384521, (float)2.771851,
	(float)2.115356, (float)2.337769, (float)2.592896, (float)2.864014,
	(float)1.905762, (float)2.111328, (float)2.363525, (float)2.789307,
	(float)1.882568, (float)2.332031, (float)2.598267, (float)2.827637,
	(float)1.683594, (float)2.088745, (float)2.361938, (float)2.608643,
	(float)1.874023, (float)2.182129, (float)2.536133, (float)2.766968,
	(float)1.861938, (float)2.070435, (float)2.309692, (float)2.700562,
	(float)1.722168, (float)2.107422, (float)2.477295, (float)2.837646,
	(float)1.926880, (float)2.184692, (float)2.442627, (float)2.663818,
	(float)2.123901, (float)2.337280, (float)2.553101, (float)2.777466,
	(float)1.588135, (float)1.911499, (float)2.212769, (float)2.543945,
	(float)2.053955, (float)2.370850, (float)2.712158, (float)2.939941,
	(float)2.210449, (float)2.519653, (float)2.770386, (float)2.958618,
	(float)2.199463, (float)2.474731, (float)2.718262, (float)2.919922,
	(float)1.960083, (float)2.175415, (float)2.608032, (float)2.888794,
	(float)1.953735, (float)2.185181, (float)2.428223, (float)2.809570,
	(float)1.615234, (float)2.036499, (float)2.576538, (float)2.834595,
	(float)1.621094, (float)2.028198, (float)2.431030, (float)2.664673,
	(float)1.824951, (float)2.267456, (float)2.514526, (float)2.747925,
	(float)1.994263, (float)2.229126, (float)2.475220, (float)2.833984,
	(float)1.746338, (float)2.011353, (float)2.588257, (float)2.826904,
	(float)1.562866, (float)2.135986, (float)2.471680, (float)2.687256,
	(float)1.748901, (float)2.083496, (float)2.460938, (float)2.686279,
	(float)1.758057, (float)2.131470, (float)2.636597, (float)2.891602,
	(float)2.071289, (float)2.299072, (float)2.550781, (float)2.814331,
	(float)1.839600, (float)2.094360, (float)2.496460, (float)2.723999,
	(float)1.882202, (float)2.088257, (float)2.636841, (float)2.923096,
	(float)1.957886, (float)2.153198, (float)2.384399, (float)2.615234,
	(float)1.992920, (float)2.351196, (float)2.654419, (float)2.889771,
	(float)2.012817, (float)2.262451, (float)2.643799, (float)2.903076,
	(float)2.025635, (float)2.254761, (float)2.508423, (float)2.784058,
	(float)2.316040, (float)2.589355, (float)2.794189, (float)2.963623,
	(float)1.741211, (float)2.279541, (float)2.578491, (float)2.816284,
	(float)1.845337, (float)2.055786, (float)2.348511, (float)2.822021,
	(float)1.679932, (float)1.926514, (float)2.499756, (float)2.835693,
	(float)1.722534, (float)1.946899, (float)2.448486, (float)2.728760,
	(float)1.829834, (float)2.043213, (float)2.580444, (float)2.867676,
	(float)1.676636, (float)2.071655, (float)2.322510, (float)2.704834,
	(float)1.791504, (float)2.113525, (float)2.469727, (float)2.784058,
	(float)1.977051, (float)2.215088, (float)2.497437, (float)2.726929,
	(float)1.800171, (float)2.106689, (float)2.357788, (float)2.738892,
	(float)1.827759, (float)2.170166, (float)2.525879, (float)2.852417,
	(float)1.918335, (float)2.132813, (float)2.488403, (float)2.728149,
	(float)1.916748, (float)2.225098, (float)2.542603, (float)2.857666,
	(float)1.761230, (float)1.976074, (float)2.507446, (float)2.884521,
	(float)2.053711, (float)2.367432, (float)2.608032, (float)2.837646,
	(float)1.595337, (float)2.000977, (float)2.307129, (float)2.578247,
	(float)1.470581, (float)2.031250, (float)2.375854, (float)2.647583,
	(float)1.801392, (float)2.128052, (float)2.399780, (float)2.822876,
	(float)1.853638, (float)2.066650, (float)2.429199, (float)2.751465,
	(float)1.956299, (float)2.163696, (float)2.394775, (float)2.734253,
	(float)1.963623, (float)2.275757, (float)2.585327, (float)2.865234,
	(float)1.887451, (float)2.105469, (float)2.331787, (float)2.587402,
	(float)2.120117, (float)2.443359, (float)2.733887, (float)2.941406,
	(float)1.506348, (float)1.766968, (float)2.400513, (float)2.851807,
	(float)1.664551, (float)1.981079, (float)2.375732, (float)2.774414,
	(float)1.720703, (float)1.978882, (float)2.391479, (float)2.640991,
	(float)1.483398, (float)1.814819, (float)2.434448, (float)2.722290,
	(float)1.769043, (float)2.136597, (float)2.563721, (float)2.774414,
	(float)1.810791, (float)2.049316, (float)2.373901, (float)2.613647,
	(float)1.788330, (float)2.005981, (float)2.359131, (float)2.723145,
	(float)1.785156, (float)1.993164, (float)2.399780, (float)2.832520,
	(float)1.695313, (float)2.022949, (float)2.522583, (float)2.745117,
	(float)1.584106, (float)1.965576, (float)2.299927, (float)2.715576,
	(float)1.894897, (float)2.249878, (float)2.655884, (float)2.897705,
	(float)1.720581, (float)1.995728, (float)2.299438, (float)2.557007,
	(float)1.619385, (float)2.173950, (float)2.574219, (float)2.787964,
	(float)1.883179, (float)2.220459, (float)2.474365, (float)2.825073,
	(float)1.447632, (float)2.045044, (float)2.555542, (float)2.744873,
	(float)1.502686, (float)2.156616, (float)2.653320, (float)2.846558,
	(float)1.711548, (float)1.944092, (float)2.282959, (float)2.685791,
	(float)1.499756, (float)1.867554, (float)2.341064, (float)2.578857,
	(float)1.916870, (float)2.135132, (float)2.568237, (float)2.826050,
	(float)1.498047, (float)1.711182, (float)2.223267, (float)2.755127,
	(float)1.808716, (float)1.997559, (float)2.256470, (float)2.758545,
	(float)2.088501, (float)2.402710, (float)2.667358, (float)2.890259,
	(float)1.545044, (float)1.819214, (float)2.324097, (float)2.692993,
	(float)1.796021, (float)2.012573, (float)2.505737, (float)2.784912,
	(float)1.786499, (float)2.041748, (float)2.290405, (float)2.650757,
	(float)1.938232, (float)2.264404, (float)2.529053, (float)2.796143
    };

}

