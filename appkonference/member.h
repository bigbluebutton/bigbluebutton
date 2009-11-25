
// $Id: member.h 872 2007-03-05 23:43:10Z sbalea $

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

#ifndef _APP_CONF_MEMBER_H
#define _APP_CONF_MEMBER_H

//
// includes
//

#include "app_conference.h"
#include "common.h"

//
// struct declarations
//

struct ast_conf_soundq
{
	char name[256];
	struct ast_filestream *stream; // the stream
	int stopped;
	struct ast_conf_soundq *next;
};

struct ast_conf_member
{
	ast_mutex_t lock ; // member data mutex

	struct ast_channel* chan ; // member's channel
	char* channel_name ; // member's channel name

	char* uniqueid ;  // member's uniqueid

	ast_cond_t delete_var ; // delete cv
	char delete_flag ; // delete flag
	int use_count ; // use count

	// values passed to create_member () via *data
	int priority ;	// highest priority gets the channel
	char* flags ;	// raw member-type flags
	char *type ;		// conference type
	char* conf_name ;		// name of the conference that own this member
	char *spyee_channel_name ; // spyee  channel name
	int max_users ; // zero or max users for this conference

	char *callerid;
	char *callername;

	// voice flags
	int vad_flag;
	int denoise_flag;
	int agc_flag;
	int via_telephone;

	// video conference params
	int id;
#ifdef	VIDEO
	int initial_id;
	int req_id;
#endif
	// muting options - this member will not be heard/seen
	int mute_audio;
	int muted; // should incoming audio be muted while we play?
#ifdef	VIDEO
	int mute_video;
#endif
	// volume level adjustment for this member
	int talk_volume;
	int listen_volume;

	// music on hold flag
	char moh_flag;

	// hold option flag
	char hold_flag;

	// this member will not hear/see
	int norecv_audio;
#ifdef	VIDEO
	int norecv_video;
	// this member does not have a camera
	int no_camera;
#endif
	// is this person a moderator?
	int ismoderator;
	int kick_conferees;

	// vad voice probability thresholds
	float vad_prob_start ;
	float vad_prob_continue ;

	// ready flag
	short ready_for_outgoing ;

	// input frame queue
	conf_frame* inFrames ;
	conf_frame* inFramesTail ;
	unsigned int inFramesCount ;
#ifdef	VIDEO
	conf_frame* inVideoFrames ;
	conf_frame* inVideoFramesTail ;
	unsigned int inVideoFramesCount ;
#endif
#ifdef	DTMF
	conf_frame* inDTMFFrames ;
	conf_frame* inDTMFFramesTail ;
	unsigned int inDTMFFramesCount ;
#endif
#ifdef	TEXT
	conf_frame* inTextFrames ;
	conf_frame* inTextFramesTail ;
	unsigned int inTextFramesCount ;
#endif

	// input/output smoother
	struct ast_smoother *inSmoother;
	struct ast_packer *outPacker;
	int smooth_size_in;
	int smooth_size_out;
	int smooth_multiple;

	// frames needed by conference_exec
	unsigned int inFramesNeeded ;
#ifdef	VIDEO
	unsigned int inVideoFramesNeeded ;
#endif

	// used when caching last frame
	conf_frame* inFramesLast ;
	unsigned int inFramesRepeatLast ;
	unsigned short okayToCacheLast ;

	// LL output frame queue
	conf_frame* outFrames ;
	conf_frame* outFramesTail ;
	unsigned int outFramesCount ;
#ifdef	VIDEO
	conf_frame* outVideoFrames ;
	conf_frame* outVideoFramesTail ;
	unsigned int outVideoFramesCount ;
#endif
#ifdef	DTMF
	conf_frame* outDTMFFrames ;
	conf_frame* outDTMFFramesTail ;
	unsigned int outDTMFFramesCount ;
#endif
#ifdef	TEXT
	conf_frame* outTextFrames ;
	conf_frame* outTextFramesTail ;
	unsigned int outTextFramesCount ;
#endif
#ifdef	VIDEO
	// LL video switched flag
	short conference;
	// switch video by VAD?
	short vad_switch;
	// do a VAD switch even if video is not enabled?
	short force_vad_switch;
	// if member is current speaker, video will stay on it when it becomes silent
	short vad_linger;
	// switch by dtmf?
	short dtmf_switch;
#endif
	// relay dtmf to manager?
	short dtmf_relay;
	// initial nat delay flag
	short first_frame_received;
#ifdef	TEXT
	// does text messages?
	short does_text;
#endif
#ifdef	VIDEO
	// conference does chat mode (1 on 1 video when two members in conference)
	short does_chat_mode;

	// Timeouts for VAD based video switching (in ms)
	// Length of audio needed to decide that the member has started talking
	int video_start_timeout;
	// Length of silence needed to decide that the member has stopped talking
	int video_stop_timeout;
#endif

	// time we last dropped a frame
	struct timeval last_in_dropped ;
	struct timeval last_out_dropped ;

	// ( not currently used )
	// int samplesperframe ;

	// used for determining need to mix frames
	// and for management interface notification
	// and for VAD based video switching
	short speaking_state_notify ;
	short speaking_state ; // This flag will be true if this member or any of its drivers is speaking
	short local_speaking_state; // This flag will be true only if this member is speaking
	struct timeval last_state_change;
	int speaker_count; // Number of drivers (including this member) that are speaking

#ifdef	VIDEO
	// Stuff used to determine video broadcast state
	// This member's video is sent out to at least one member of the conference
	short video_broadcast_active;
	// Time when we last sent out a video frame from this member
	struct timeval last_video_frame_time;

	// Is the member supposed to be transmitting video?
	short video_started;
#endif

	// pointer to next member in linked list
	struct ast_conf_member* next ;
#ifndef	VIDEO
	// pointer to prev member in linked list
	struct ast_conf_member* prev ;
#endif
	// pointer to member's bucket list head
	struct channel_bucket *bucket;
	// list entry for member's bucket list
	AST_LIST_ENTRY(ast_conf_member) hash_entry ;

	// spyer pointer to spyee or vice versa
	struct ast_conf_member* spy_partner ;

	// accounting values
	unsigned long frames_in ;
	unsigned long frames_in_dropped ;
	unsigned long frames_out ;
	unsigned long frames_out_dropped ;

#ifdef	VIDEO
	unsigned long video_frames_in ;
	unsigned long video_frames_in_dropped ;
	unsigned long video_frames_out ;
	unsigned long video_frames_out_dropped ;
#endif
#ifdef	DTMF
	unsigned long dtmf_frames_in ;
	unsigned long dtmf_frames_in_dropped ;
	unsigned long dtmf_frames_out ;
	unsigned long dtmf_frames_out_dropped ;
#endif
#ifdef	TEXT
	unsigned long text_frames_in ;
	unsigned long text_frames_in_dropped ;
	unsigned long text_frames_out ;
	unsigned long text_frames_out_dropped ;
#endif

	// for counting sequentially dropped frames
	unsigned int sequential_drops ;
	unsigned long since_dropped ;

	// start time
	struct timeval time_entered ;
	struct timeval lastsent_timeval ;

	// flag indicating we should remove this member
	char kick_flag ;

#if ( SILDET == 2 )
	// pointer to speex preprocessor dsp
	SpeexPreprocessState *dsp ;
        // number of frames to ignore speex_preprocess()
	int ignore_speex_count;
#else
	// placeholder when preprocessing is not enabled
	void* dsp ;
#endif

	// audio format this member is using
	int write_format ;
	int read_format ;

	int write_format_index ;
	int read_format_index ;

	// member frame translators
	struct ast_trans_pvt* to_slinear ;
	struct ast_trans_pvt* from_slinear ;

	// For playing sounds
	struct ast_conf_soundq *soundq;
#ifdef	VIDEO
	// Pointer to another member that will be driven from this member's audio
	struct ast_conf_member *driven_member;
#endif
} ;

struct conf_member
{
	struct ast_conf_member* realmember ;
	struct conf_member* next ;
} ;

//
// function declarations
//

int member_exec( struct ast_channel* chan, void* data ) ;

struct ast_conf_member* check_active_video( int id, struct ast_conference *conf );

struct ast_conf_member* create_member( struct ast_channel* chan, const char* data ) ;
struct ast_conf_member* delete_member( struct ast_conf_member* member ) ;

// incoming queue
int queue_incoming_frame( struct ast_conf_member* member, struct ast_frame* fr ) ;
#ifdef	VIDEO
int queue_incoming_video_frame( struct ast_conf_member* member, const struct ast_frame* fr ) ;
#endif
#ifdef	DTMF
int queue_incoming_dtmf_frame( struct ast_conf_member* member, const struct ast_frame* fr ) ;
#endif
conf_frame* get_incoming_frame( struct ast_conf_member* member ) ;
#ifdef	VIDEO
conf_frame* get_incoming_video_frame( struct ast_conf_member* member ) ;
#endif
#ifdef	DTMF
conf_frame* get_incoming_dtmf_frame( struct ast_conf_member* member ) ;
#endif
// outgoing queue
int queue_outgoing_frame( struct ast_conf_member* member, const struct ast_frame* fr, struct timeval delivery ) ;
int __queue_outgoing_frame( struct ast_conf_member* member, const struct ast_frame* fr, struct timeval delivery ) ;
conf_frame* get_outgoing_frame( struct ast_conf_member* member ) ;

#ifdef	VIDEO
int queue_outgoing_video_frame( struct ast_conf_member* member, const struct ast_frame* fr, struct timeval delivery ) ;
#endif
conf_frame* get_outgoing_video_frame( struct ast_conf_member* member ) ;
#ifdef	DTMF
int queue_outgoing_dtmf_frame( struct ast_conf_member* member, const struct ast_frame* fr ) ;
#endif
#ifdef	TEXT
int queue_outgoing_text_frame( struct ast_conf_member* member, const struct ast_frame* fr ) ;
#endif
#ifdef	DTMF
conf_frame* get_outgoing_dtmf_frame( struct ast_conf_member* member ) ;
#endif
#ifdef	TEXT
conf_frame* get_outgoing_text_frame( struct ast_conf_member* member ) ;
#endif

void send_state_change_notifications( struct ast_conf_member* member ) ;

int increment_speaker_count(struct ast_conf_member *member, int lock);
int decrement_speaker_count(struct ast_conf_member *member, int lock);

void member_process_spoken_frames(struct ast_conference* conf,
				  struct ast_conf_member *member,
				  struct conf_frame **spoken_frames,
				  long time_diff,
				 int *listener_count,
				 int *speaker_count);

void member_process_outgoing_frames(struct ast_conference* conf,
				    struct ast_conf_member *member,
				    struct conf_frame *send_frames);

#ifdef	VIDEO
int is_video_eligible(struct ast_conf_member *member);

// Member start and stop video methods
void start_video(struct ast_conf_member *member);
void stop_video(struct ast_conf_member *member);
#endif

//
// packer functions
//

struct ast_packer;

extern struct ast_packer *ast_packer_new(int bytes);
extern void ast_packer_set_flags(struct ast_packer *packer, int flags);
extern int ast_packer_get_flags(struct ast_packer *packer);
extern void ast_packer_free(struct ast_packer *s);
extern void ast_packer_reset(struct ast_packer *s, int bytes);
extern int ast_packer_feed(struct ast_packer *s, const struct ast_frame *f);
extern struct ast_frame *ast_packer_read(struct ast_packer *s);
#endif
