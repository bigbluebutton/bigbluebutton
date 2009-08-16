
// $Id: app_conference.h 839 2007-01-17 22:32:03Z sbalea $

/*
 * app_conference
 *
 * A channel independent conference application for Asterisk
 *
 * Copyright (C) 2002, 2003 Junghanns.NET GmbH
 * Copyright (C) 2003, 2004 HorizonLive.com, Inc.
 * Copyright (C) 2005, 2006 HorizonWimba, Inc.
 * Copyright (C) 2007 Wimba, Inc.
 *
 * Klaus-Peter Junghanns <kapejod@ns1.jnetdns.de>
 *
 * Video Conferencing support added by
 * Neil Stratford <neils@vipadia.com>
 * Copyright (C) 2005, 2005 Vipadia Limited
 *
 * VAD driven video conferencing, text message support
 * and miscellaneous enhancements added by
 * Mihai Balea <mihai at hates dot ms>
 *
 * This program may be modified and distributed under the
 * terms of the GNU General Public License. You should have received
 * a copy of the GNU General Public License along with this
 * program; if not, write to the Free Software Foundation, Inc.
 * 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

#ifndef _ASTERISK_CONF_H
#define _ASTERISK_CONF_H


/* standard includes */
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>
#include <stdio.h>


#include <pthread.h>

/* asterisk includes */
#include "asterisk.h"
#include <asterisk/utils.h>
#include <asterisk/pbx.h>
#include <asterisk/module.h>
#include <asterisk/logger.h>
#include <asterisk/lock.h>
#include <asterisk/frame.h>
#include <asterisk/manager.h>
#include <asterisk/dsp.h>
#include <asterisk/translate.h>
#include <asterisk/channel.h>
#include <asterisk/file.h>
//#include <asterisk/channel_pvt.h>
#include <asterisk/cli.h>


#if (SILDET == 2)
#include "libspeex/speex_preprocess.h"
#endif

//
// app_conference defines
//

// debug logging level

// LOG_NOTICE for debugging, LOG_DEBUG for production
#ifdef APP_KONFERENCE_DEBUG
#define AST_CONF_DEBUG LOG_NOTICE
#else
#define AST_CONF_DEBUG LOG_DEBUG
#endif

//
// feature defines
//

// number of times the last non-silent frame should be
// repeated after silence starts
#define AST_CONF_CACHE_LAST_FRAME 1

//
// debug defines
//

//#define DEBUG_USE_TIMELOG

//#define DEBUG_FRAME_TIMESTAMPS

// #define DEBUG_OUTPUT_PCM

//
// !!! THESE CONSTANTS SHOULD BE CLEANED UP AND CLARIFIED !!!
//

//
// sample information for AST_FORMAT_SLINEAR format
//

#define AST_CONF_SAMPLE_RATE 8000
#define AST_CONF_SAMPLE_SIZE 16
#define AST_CONF_FRAME_INTERVAL 20
//neils#define AST_CONF_FRAME_INTERVAL 30

//
// so, since we cycle approximately every 20ms,
// we can compute the following values:
//
// 160 samples per 20 ms frame -or-
// ( 8000 samples-per-second * ( 20 ms / 1000 ms-per-second ) ) = 160 samples
//
// 320 bytes ( 2560 bits ) of data  20 ms frame -or-
// ( 160 samples * 16 bits-per-sample / 8 bits-per-byte ) = 320 bytes
//

// 160 samples 16-bit signed linear
#define AST_CONF_BLOCK_SAMPLES 160

// 2 bytes per sample ( i.e. 16-bit )
#define AST_CONF_BYTES_PER_SAMPLE 2

// 320 bytes for each 160 sample frame of 16-bit audio
#define AST_CONF_FRAME_DATA_SIZE 320

// 1000 ms-per-second / 20 ms-per-frame = 50 frames-per-second
#define AST_CONF_FRAMES_PER_SECOND ( 1000 / AST_CONF_FRAME_INTERVAL )


//
// buffer and queue values
//

// account for friendly offset when allocating buffer for frame
#define AST_CONF_BUFFER_SIZE ( AST_CONF_FRAME_DATA_SIZE + AST_FRIENDLY_OFFSET )

// maximum number of frames queued per member
#define AST_CONF_MAX_QUEUE 100

#ifdef	VIDEO
// max video frames in the queue
#define AST_CONF_MAX_VIDEO_QUEUE 800
#endif

// max dtmf frames in the queue
#define AST_CONF_MAX_DTMF_QUEUE 8

#ifdef	TEXT
// max text frames in the queue
#define AST_CONF_MAX_TEXT_QUEUE 8
#endif

// minimum number of frames queued per member
#define AST_CONF_MIN_QUEUE 0

// number of queued frames before we start dropping
#define AST_CONF_QUEUE_DROP_THRESHOLD 40

// number of milliseconds between frame drops
#define AST_CONF_QUEUE_DROP_TIME_LIMIT 750

//
// timer and sleep values
//

// milliseconds we're willing to wait for a channel
// event before we check for outgoing frames
#define AST_CONF_WAITFOR_LATENCY 40

// milliseconds to sleep before trying to process frames
#define AST_CONF_CONFERENCE_SLEEP 40

// milliseconds to wait between state notification updates
#define AST_CONF_NOTIFICATION_SLEEP 200

//
// warning threshold values
//

// number of frames behind before warning
#define AST_CONF_OUTGOING_FRAMES_WARN 70

// number of milliseconds off AST_CONF_FRAME_INTERVAL before warning
#define AST_CONF_INTERVAL_WARNING 1000

//
// silence detection values
//

// toggle silence detection
#define ENABLE_SILENCE_DETECTION 1

// silence threshold
#define AST_CONF_SILENCE_THRESHOLD 128

// speech tail (delay before dropping silent frames, in ms.
// #define AST_CONF_SPEECH_TAIL 180

// number of frames to ignore speex_preprocess() after speech detected
#define AST_CONF_SKIP_SPEEX_PREPROCESS 20

// our speex probability values
#define AST_CONF_PROB_START 0.05
#define AST_CONF_PROB_CONTINUE 0.02


//
// format translation values
//
#ifdef AC_USE_G729A
	#define AC_SUPPORTED_FORMATS 6
	enum { AC_SLINEAR_INDEX = 0, AC_ULAW_INDEX, AC_ALAW_INDEX, AC_GSM_INDEX, AC_SPEEX_INDEX, AC_G729A_INDEX } ;
#else
	#define AC_SUPPORTED_FORMATS 5
	enum { AC_SLINEAR_INDEX = 0, AC_ULAW_INDEX, AC_ALAW_INDEX, AC_GSM_INDEX, AC_SPEEX_INDEX } ;
#endif

//
// Default conference max users is zero, that is, unbounded
//
#define AST_CONF_MAX_USERS 0

//
// Default conference type
//
#define AST_CONF_TYPE_DEFAULT "konference"

#ifdef	VIDEO
//
// Default VAD based video switching parameters
// All time related values are in ms
//

// Amount of silence required before we decide somebody stopped talking
#define AST_CONF_VIDEO_STOP_TIMEOUT 2000

// Amount of audio required before we decide somebody started talking
#define AST_CONF_VIDEO_START_TIMEOUT 2000

// Amount of time we wait for a video frame until we decide that
// the member has stopped broadcasting video
#define AST_CONF_VIDEO_STOP_BROADCAST_TIMEOUT 200

#ifdef	TEXT
//
// Text frame control protocol
//
#define AST_CONF_CONTROL_CAMERA_DISABLED      "CONTROL:CAMERA_DISABLED"
#define AST_CONF_CONTROL_CAMERA_ENABLED       "CONTROL:CAMERA_ENABLED"
#define AST_CONF_CONTROL_START_VIDEO          "CONTROL:STARTVIDEO"
#define AST_CONF_CONTROL_STOP_VIDEO           "CONTROL:STOPVIDEO"
#define AST_CONF_CONTROL_STOP_VIDEO_TRANSMIT  "CONTROL:STOP_VIDEO_TRANSMIT"
#define AST_CONF_CONTROL_START_VIDEO_TRANSMIT "CONTROL:START_VIDEO_TRANSMIT"
#endif

#endif

// utility functions
void add_milliseconds( struct timeval* tv, long ms ) ;

#endif


