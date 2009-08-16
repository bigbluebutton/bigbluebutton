
// $Id: member.c 885 2007-06-27 15:41:18Z sbalea $

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

#include <stdio.h>
#include "asterisk/autoconfig.h"
#include "member.h"

#include "asterisk/musiconhold.h"

// process an incoming frame.  Returns 0 normally, 1 if hangup was received.
static int process_incoming(struct ast_conf_member *member, struct ast_conference *conf, struct ast_frame *f)
{
	int silent_frame = 0;
#ifdef	VIDEO
	struct ast_conf_member *src_member ;
#endif

	// In Asterisk 1.4 AST_FRAME_DTMF is equivalent to AST_FRAME_DTMF_END
	if (f->frametype == AST_FRAME_DTMF)
	{
#ifdef	VIDEO
		if (member->dtmf_switch)
		{
			ast_mutex_lock( &member->lock ) ;
			switch (f->subclass) {
			case '0' :member->req_id=0;
				break;
			case '1' :member->req_id=1;
				break;
			case '2' :member->req_id=2;
				break;
			case '3' :member->req_id=3;
				break;
			case '4' :member->req_id=4;
				break;
			case '5' :member->req_id=5;
				break;
			case '6' :member->req_id=6;
				break;
			case '7' :member->req_id=7;
				break;
			case '8' :member->req_id=8;
				break;
			case '9' :member->req_id=9;
				break;
			case '*' :
				if (member->mute_video == 0 && member->mute_audio == 0)
				{
					member->mute_video = 1;
					member->mute_audio = 1;
				}
				else if (member->mute_video == 1 && member->mute_audio == 1)
				{
					member->mute_video = 0;
					member->mute_audio = 0;
				}
				break;
			}
			member->conference = 1; // switch me
			ast_mutex_unlock( &member->lock ) ;
		}
#endif
		if (member->dtmf_relay)
		{
			// output to manager...
			manager_event(
				EVENT_FLAG_CALL,
				"ConferenceDTMF",
				"ConferenceName: %s\r\n"
				"Type: %s\r\n"
				"UniqueID: %s\r\n"
				"Channel: %s\r\n"
				"CallerID: %s\r\n"
				"CallerIDName: %s\r\n"
				"Key: %c\r\n"
				"Count: %d\r\n"
				"Flags: %s\r\n"
				"Mute: %d\r\n",
				conf->name,
				member->type,
				member->uniqueid,
				member->channel_name,
				member->chan->cid.cid_num ? member->chan->cid.cid_num : "unknown",
				member->chan->cid.cid_name ? member->chan->cid.cid_name : "unknown",
				f->subclass,
				conf->membercount,
				member->flags,
				member->mute_audio
				) ;

		}
#ifdef	DTMF
		if (!member->mute_audio &&
#ifdef	VIDEO
			!member->dtmf_switch &&
#endif
			!member->dtmf_relay)
		{
			// relay this to the listening channels
			queue_incoming_dtmf_frame( member, f );
		}
#endif
	}
#ifdef	DTMF
	else if (f->frametype == AST_FRAME_DTMF_BEGIN)
	{
		if (!member->mute_audio &&
#ifdef	VIDEO
			!member->dtmf_switch &&
#endif
			!member->dtmf_relay)
		{
			// relay this to the listening channels
			queue_incoming_dtmf_frame( member, f );
		}
	}
#endif
#ifdef	VIDEO
	ast_mutex_lock( &member->lock ) ;
	// Handle a local or remote conference
	if (member->conference)
	{
		int req_id = member->req_id;
		ast_mutex_unlock( &member->lock );
		// this will return NULL or a locked member
		src_member = check_active_video(req_id,conf);
		// Stream a picture to the recipient if no active video
		if (!src_member)
		{
			// Mihai: we don't want to send video here, we cannot negotiate codec
			// and we don't know what codec the conference is using
			//if (member->norecv_video == 0)
			//{
			//	if(!ast_streamfile(member->chan,"novideo",member->chan->language))
			//	{
			//		ast_waitstream(member->chan,"");
			//	}
			//}
		}
		else
		{
			// Send a FIR to the new sender
			ast_indicate(src_member->chan,AST_CONTROL_VIDUPDATE);
			// we will have locked in check_active_video()
			ast_mutex_unlock( &src_member->lock);
		}
		ast_mutex_lock( &member->lock );
		member->conference = 0;
	}
	ast_mutex_unlock( &member->lock );
#endif
	if ((f->frametype == AST_FRAME_VOICE && (member->mute_audio == 1 ||
#ifdef	VIDEO
		(f->frametype == AST_FRAME_VIDEO && member->mute_video == 1) ||
#endif
		(member->soundq && member->muted))))
	{
		// this is a listen-only user, ignore the frame
		//ast_log( AST_CONF_DEBUG, "Listen only user frame");
		ast_frfree( f ) ;
		f = NULL ;
	}
	else if ( f->frametype == AST_FRAME_VOICE )
	{	//ast_log( AST_CONF_DEBUG, "Got voice frame");
		// reset silence detection flag
		silent_frame = 0 ;

		// accounting: count the incoming frame
		member->frames_in++ ;

#if ( SILDET == 2 )
		//
		// make sure we have a valid dsp and frame type
		//
		if (
			member->dsp != NULL
			&& f->subclass == AST_FORMAT_SLINEAR
			&& f->datalen == AST_CONF_FRAME_DATA_SIZE
			)
		{
			// send the frame to the preprocessor
			int spx_ret;
			spx_ret = speex_preprocess( member->dsp, CASTDATA2PTR(f->data, void), NULL );
#ifdef DEBUG_USE_TIMELOG
			TIMELOG(spx_ret, 3, "speex_preprocess");
#endif
			if ( spx_ret == 0 )
			{
				//
				// we ignore the preprocessor's outcome if we've seen voice frames
				// in within the last AST_CONF_SKIP_SPEEX_PREPROCESS frames
				//
				if ( member->ignore_speex_count > 0 )
				{
					// ast_log( AST_CONF_DEBUG, "ignore_speex_count => %d\n", ignore_speex_count ) ;

					// skip speex_preprocess(), and decrement counter
					--member->ignore_speex_count ;
				}
				else
				{
					// set silent_frame flag
					silent_frame = 1 ;
				}
			}
			else
			{
				// voice detected, reset skip count
				member->ignore_speex_count = AST_CONF_SKIP_SPEEX_PREPROCESS ;
			}
		}
#endif
		if ( !silent_frame )
			queue_incoming_frame( member, f );

		// free the original frame
		ast_frfree( f ) ;
		f = NULL ;

	}
#ifdef	VIDEO
	else if (f->frametype == AST_FRAME_VIDEO)
	{
		queue_incoming_video_frame( member, f );

		// free the original frame
		ast_frfree( f ) ;
		f = NULL ;

	}
#endif
	else if (
		f->frametype == AST_FRAME_CONTROL
		&& f->subclass == AST_CONTROL_HANGUP
		)
	{
		// hangup received

		// free the frame
		ast_frfree( f ) ;
		f = NULL ;

		// break out of the while ( 42 == 42 )
		return 1;
	}
#ifdef	VIDEO
	else if (
		f->frametype == AST_FRAME_CONTROL
		&& f->subclass == AST_CONTROL_VIDUPDATE
		)
	{
		// say we have switched to cause a FIR to
		// be sent to the sender
		ast_mutex_lock( &member->lock ) ;
		member->conference = 1;
		ast_mutex_unlock( &member->lock ) ;

		// free the original frame
		ast_frfree( f ) ;
		f = NULL ;
	}
#endif
#ifdef	VIDEO
#ifdef	TEXT
	else if ( f->frametype == AST_FRAME_TEXT  && member->does_text )
	{
		if ( strncmp(CASTDATA2PTR(f->data, char), AST_CONF_CONTROL_CAMERA_DISABLED, strlen(AST_CONF_CONTROL_CAMERA_DISABLED)) == 0 )
		{
			ast_mutex_lock(&member->lock);
			manager_event(EVENT_FLAG_CALL,
			              "ConferenceCameraDisabled",
			              "ConferenceName: %s\r\nChannel: %s\r\n",
			              conf->name,
			              member->channel_name);
			member->no_camera = 1;
			ast_mutex_unlock(&member->lock);
		} else if ( strncmp(CASTDATA2PTR(f->data, char), AST_CONF_CONTROL_CAMERA_ENABLED, strlen(AST_CONF_CONTROL_CAMERA_ENABLED)) == 0 )
		{
			ast_mutex_lock(&member->lock);
			manager_event(EVENT_FLAG_CALL,
			              "ConferenceCameraEnabled",
			              "ConferenceName: %s\r\nChannel: %s\r\n",
			              conf->name,
			              member->channel_name);
			member->no_camera = 0;
			ast_mutex_unlock(&member->lock);
		} else if ( strncmp(CASTDATA2PTR(f->data, char), AST_CONF_CONTROL_STOP_VIDEO_TRANSMIT, strlen(AST_CONF_CONTROL_STOP_VIDEO_TRANSMIT)) == 0 )
		{
			ast_mutex_lock(&member->lock);
			manager_event(EVENT_FLAG_CALL,
			              "ConferenceStopVideoTransmit",
			              "ConferenceName: %s\r\nChannel: %s\r\n",
			              conf->name,
			              member->channel_name);
			member->norecv_video = 1;
			ast_mutex_unlock(&member->lock);
		} else if ( strncmp(CASTDATA2PTR(f->data, char), AST_CONF_CONTROL_START_VIDEO_TRANSMIT, strlen(AST_CONF_CONTROL_START_VIDEO_TRANSMIT)) == 0 )
		{
			ast_mutex_lock(&member->lock);
			manager_event(EVENT_FLAG_CALL,
			              "ConferenceStartVideoTransmit",
			              "ConferenceName: %s\r\nChannel: %s\r\n",
			              conf->name,
			              member->channel_name);
			member->norecv_video = 0;
			ast_mutex_unlock(&member->lock);
		}
		ast_frfree(f);
		f = NULL;
	}
#endif
#endif
	else {
		// undesirables
		ast_frfree( f ) ;
		f = NULL ;
	}

	return 0;
}

// get the next frame from the soundq;  must be called with member locked.
static struct ast_frame *get_next_soundframe(struct ast_conf_member *member, struct ast_frame
    *exampleframe) {
    struct ast_frame *f;

again:
	ast_mutex_unlock(&member->lock);
    f=(member->soundq->stream && !member->soundq->stopped ? ast_readframe(member->soundq->stream) : NULL);

    if(!f) { // we're done with this sound; remove it from the queue, and try again
	struct ast_conf_soundq *toboot = member->soundq;

	if (!toboot->stopped && !toboot->stream)
	{
		toboot->stream = ast_openstream(member->chan, toboot->name, NULL);
		//ast_log( LOG_WARNING, "trying to play sound: name = %s, stream = %p\n", toboot->name, toboot->stream);
		if (toboot->stream)
		{
			member->chan->stream = NULL;
			goto again;
		}
		//ast_log( LOG_WARNING, "trying to play sound, %s not found!?", toboot->name);
	}

	if (toboot->stream) {
		ast_closestream(toboot->stream);
		//ast_log( LOG_WARNING, "finished playing a sound: name = %s, stream = %p\n", toboot->name, toboot->stream);
		// notify applications via mgr interface that this sound has been played
		manager_event(
			EVENT_FLAG_CALL,
			"ConferenceSoundComplete",
			"Channel: %s\r\n"
			"Sound: %s\r\n",
			member->channel_name,
			toboot->name
		);
	}

	ast_mutex_lock( &member->lock ) ;
	member->soundq = toboot->next;

	free(toboot);
	if(member->soundq) goto again;

	ast_mutex_unlock(&member->lock);

	// if we get here, we've gotten to the end of the queue; reset write format
	if ( ast_set_write_format( member->chan, member->write_format ) < 0 )
	{
		ast_log( LOG_ERROR, "unable to set write format to %d\n",
		    member->write_format ) ;
	}
    } else {
	// copy delivery from exampleframe
	f->delivery = exampleframe->delivery;
    }

    return f;
}


// process outgoing frames for the channel, playing either normal conference audio,
// or requested sounds
static int process_outgoing(struct ast_conf_member *member)
{
	conf_frame* cf ; // frame read from the output queue
	struct ast_frame *f;

	for(;;)
	{
		// acquire member mutex and grab a frame.
		cf = get_outgoing_frame( member ) ;

                // if there's no frames exit the loop.
		if ( !cf )
		{
			break;
		}


		struct ast_frame *realframe = f = cf->fr;

		// if we're playing sounds, we can just replace the frame with the
		// next sound frame, and send it instead
		ast_mutex_lock( &member->lock ) ;
		if ( member->soundq )
		{
			f = get_next_soundframe(member, f);
			if ( !f )
			{
				// if we didn't get anything, just revert to "normal"
				f = realframe;
			}
		} else {
			if (member->moh_flag) {
				member->muted = 1;
				member->ready_for_outgoing = 0;
				delete_conf_frame( cf ) ;
				ast_moh_start(member->chan, NULL, NULL);
				ast_mutex_unlock(&member->lock);
				return 0;
			}
			ast_mutex_unlock(&member->lock);
		}


#ifdef DEBUG_FRAME_TIMESTAMPS
		// !!! TESTING !!!
		int delivery_diff = usecdiff( &f->delivery, &member->lastsent_timeval ) ;
		if ( delivery_diff != AST_CONF_FRAME_INTERVAL )
		{
			ast_log( AST_CONF_DEBUG, "unanticipated delivery time, delivery_diff => %d, delivery.tv_usec => %ld\n",
				 delivery_diff, f->delivery.tv_usec ) ;
		}

		// !!! TESTING !!!
		if (
			f->delivery.tv_sec < member->lastsent_timeval.tv_sec
			|| (
				f->delivery.tv_sec == member->lastsent_timeval.tv_sec
				&& f->delivery.tv_usec <= member->lastsent_timeval.tv_usec
				)
			)
		{
			ast_log( LOG_WARNING, "queued frame timestamped in the past, %ld.%ld <= %ld.%ld\n",
				 f->delivery.tv_sec, f->delivery.tv_usec,
				 member->lastsent_timeval.tv_sec, member->lastsent_timeval.tv_usec ) ;
		}
		member->lastsent_timeval = f->delivery ;
#endif

#ifdef DEBUG_USE_TIMELOG
		TIMELOG( ast_write( member->chan, f ), 10, "member: ast_write");
#else

		// send the voice frame
		if ( ast_write( member->chan, f ) == 0 )
		{
			struct timeval tv = ast_tvnow();
			ast_log( AST_CONF_DEBUG, "SENT VOICE FRAME, channel => %s, frames_out => %ld, s => %ld, ms => %ld\n",
				 member->channel_name, member->frames_out, tv.tv_sec, tv.tv_usec ) ;
		}
		else
		{
			if ( member->chan->_softhangup )
				return 1;

			// log 'dropped' outgoing frame
			ast_log( LOG_ERROR, "unable to write voice frame to channel, channel => %s\n", member->channel_name ) ;

			// accounting: count dropped outgoing frames
			member->frames_out_dropped++ ;
		}
#endif
		// clean up frame
		delete_conf_frame( cf ) ;
		
		// free sound frame
		if ( f != realframe )
			ast_frfree(f) ;

	}
#ifdef	VIDEO
	// Do the same for video, suck it dry
	for(;;)
	{
		// grab a frame.
		cf = get_outgoing_video_frame( member ) ;

                // if there's no frames exit the loop.
		if(!cf){
			break;
		}

		f = cf->fr;

		// send the video frame
		if ( ast_write_video( member->chan, f ) == 1 )
		{
			struct timeval tv = ast_tvnow();
			ast_log( AST_CONF_DEBUG, "SENT VIDEO FRAME, channel => %s, frames_out => %ld, s => %ld, ms => %ld\n",
				 member->channel_name, member->frames_out, tv.tv_sec, tv.tv_usec ) ;
		}
		else
		{
			if ( member->chan->_softhangup )
				return 1;

			// log 'dropped' outgoing frame
			ast_log( AST_CONF_DEBUG, "unable to write video frame to channel, channel => %s\n", member->channel_name ) ;

			// accounting: count dropped outgoing frames
			member->video_frames_out_dropped++ ;
		}

		// clean up frame
		delete_conf_frame( cf ) ;

	}
#endif
#ifdef	DTMF
        // Do the same for dtmf, suck it dry
	for(;;)
	{
		// acquire member mutex and grab a frame.
		cf = get_outgoing_dtmf_frame( member ) ;

		// if there's no frames exit the loop.
		if(!cf) break;

		// send the dtmf frame
		if ( ast_write( member->chan, cf->fr ) == 0 )
		{
			struct timeval tv = ast_tvnow();
			ast_log( AST_CONF_DEBUG, "SENT DTMF FRAME, channel => %s, frames_out => %ld, s => %ld, ms => %ld\n",
				 member->channel_name, member->frames_out, tv.tv_sec, tv.tv_usec ) ;

		}
		else
		{
			if ( member->chan->_softhangup )
				return 1;

			// log 'dropped' outgoing frame
			ast_log( AST_CONF_DEBUG, "unable to write dtmf frame to channel, channel => %s\n", member->channel_name ) ;

			// accounting: count dropped outgoing frames
			member->dtmf_frames_out_dropped++ ;
		}

		// clean up frame
		delete_conf_frame( cf ) ;
	}
#endif
#ifdef	TEXT
        // Do the same for text, hell, why not?
	for(;;)
	{
		// acquire member mutex and grab a frame.
		cf = get_outgoing_text_frame( member ) ;

		// if there's no frames exit the loop.
		if(!cf) break;

		// send the text frame
		if ( ast_write( member->chan, cf->fr ) == 0 )
		{
			struct timeval tv = ast_tvnow();
			ast_log( AST_CONF_DEBUG, "SENT TEXT FRAME, channel => %s, frames_out => %ld, s => %ld, ms => %ld\n",
				 member->channel_name, member->frames_out, tv.tv_sec, tv.tv_usec ) ;

		}
		else
		{
			if ( member->chan->_softhangup )
				return 1;

			// log 'dropped' outgoing frame
			ast_log( AST_CONF_DEBUG, "unable to write text frame to channel, channel => %s\n", member->channel_name ) ;

			// accounting: count dropped outgoing frames
			member->text_frames_out_dropped++ ;
		}

		// clean up frame
		delete_conf_frame( cf ) ;
	}
#endif

	return 0;
}

//
// main member thread function
//

int member_exec( struct ast_channel* chan, void* data )
{
//	struct timeval start, end ;
//	start = ast_tvnow();

	struct ast_conference *conf ;
	struct ast_conf_member *member ;

	struct ast_frame *f ; // frame received from ast_read()

	int left = 0 ;
	int res;

	ast_log( AST_CONF_DEBUG, "Begin processing member thread, channel => %s\n", chan->name ) ;

	//
	// If the call has not yet been answered, answer the call
	// Note: asterisk apps seem to check _state, but it seems like it's safe
	// to just call ast_answer.  It will just do nothing if it is up.
	// it will also return -1 if the channel is a zombie, or has hung up.
	//

	res = ast_answer( chan ) ;
	if ( res )
	{
		ast_log( LOG_ERROR, "unable to answer call\n" ) ;
		return -1 ;
	}

	//
	// create a new member for the conference
 	//

//	ast_log( AST_CONF_DEBUG, "creating new member, id => %s, flags => %s, p => %s\n",
//		id, flags, priority ) ;

	member = create_member( chan, (const char*)( data ) ) ; // flags, atoi( priority ) ) ;

	// unable to create member, return an error
	if ( member == NULL )
	{
		ast_log( LOG_ERROR, "unable to create member\n" ) ;
		return -1 ;
	}

	//
	// setup asterisk read/write formats
	//
#if 0
	ast_log( AST_CONF_DEBUG, "CHANNEL INFO, CHANNEL => %s, DNID => %s, CALLER_ID => %s, ANI => %s\n",
		chan->name, chan->dnid, chan->callerid, chan->ani ) ;

	ast_log( AST_CONF_DEBUG, "CHANNEL CODECS, CHANNEL => %s, NATIVE => %d, READ => %d, WRITE => %d\n",
		chan->name, chan->nativeformats, member->read_format, member->write_format ) ;
#endif
	if ( ast_set_read_format( chan, member->read_format ) < 0 )
	{
		ast_log( LOG_ERROR, "unable to set read format to signed linear\n" ) ;
		delete_member( member ) ;
		return -1 ;
	}

	if ( ast_set_write_format( chan, member->write_format ) < 0 ) // AST_FORMAT_SLINEAR, chan->nativeformats
	{
		ast_log( LOG_ERROR, "unable to set write format to signed linear\n" ) ;
		delete_member( member ) ;
		return -1 ;
	}

	//
	// setup a conference for the new member
	//

	conf = join_conference( member ) ;

	if ( conf == NULL )
	{
		ast_log( LOG_ERROR, "unable to setup member conference\n" ) ;
		int res = (member->max_users_flag ? 0 : -1 ) ;
		delete_member( member) ;
		return res ;
	}

	// add member to channel table
	member->bucket = &(channel_table[hash(member->chan->name) % CHANNEL_TABLE_SIZE]);

	AST_LIST_LOCK (member->bucket ) ;
	AST_LIST_INSERT_HEAD (member->bucket, member, hash_entry) ;
	AST_LIST_UNLOCK (member->bucket ) ;

	//ast_log( AST_CONF_DEBUG, "Added %s to the channel table, bucket => %ld\n", member->chan->name, member->bucket - channel_table) ;

	manager_event(
		EVENT_FLAG_CALL,
		"ConferenceJoin",
		"ConferenceName: %s\r\n"
		"Type: %s\r\n"
		"UniqueID: %s\r\n"
		"Member: %d\r\n"
		"Flags: %s\r\n"
		"Channel: %s\r\n"
		"CallerID: %s\r\n"
		"CallerIDName: %s\r\n"
		"Moderators: %d\r\n"
		"Count: %d\r\n",
		conf->name,
		member->type,
		member->uniqueid,
		member->id,
		member->flags,
		member->channel_name,
		member->chan->cid.cid_num ? member->chan->cid.cid_num : "unknown",
		member->chan->cid.cid_name ? member->chan->cid.cid_name: "unknown",
		conf->stats.moderators,
		conf->membercount
	) ;

	// Store the CID information
	if ( member->chan->cid.cid_num )
	{
		if ( (member->callerid = malloc(strlen(member->chan->cid.cid_num)+1)) )
			memcpy(member->callerid,member->chan->cid.cid_num, strlen(member->chan->cid.cid_num)+1);
	} else
		member->callerid = NULL;

	if ( member->chan->cid.cid_name )
	{
		if ( (member->callername = malloc(strlen(member->chan->cid.cid_name)+1)) )
			memcpy(member->callername, member->chan->cid.cid_name, strlen(member->chan->cid.cid_name)+1);
	} else
		member->callername = NULL;


	//
	// process loop for new member ( this runs in it's own thread )
	//

	ast_log( AST_CONF_DEBUG, "begin member event loop, channel => %s\n", chan->name ) ;

	// timer timestamps
	struct timeval base, curr ;
	base = ast_tvnow();

	// tell conference_exec we're ready for frames
	member->ready_for_outgoing = 1 ;
	while ( 42 == 42 )
	{
		// make sure we have a channel to process
		if ( chan == NULL )
		{
			ast_log( LOG_NOTICE, "member channel has closed\n" ) ;
			break ;
		}

		//-----------------//
		// INCOMING FRAMES //
		//-----------------//

		// wait for an event on this channel
		left = ast_waitfor( chan, AST_CONF_WAITFOR_LATENCY ) ;

		//ast_log( AST_CONF_DEBUG, "received event on channel, name => %s, left => %d\n", chan->name, left ) ;

		if ( left < 0 )
		{
			// an error occured
			ast_log(
				LOG_NOTICE,
				"an error occured waiting for a frame, channel => %s, error => %d\n",
				chan->name, left
			) ;
			break; // out of the 42==42
		}
		else if ( left == 0 )
		{
			// no frame has arrived yet
			// ast_log( LOG_NOTICE, "no frame available from channel, channel => %s\n", chan->name ) ;
		}
		else if ( left > 0 )
		{
			// a frame has come in before the latency timeout
			// was reached, so we process the frame

			f = ast_read( chan ) ;

			if ( f == NULL )
			{
				if (conf->debug_flag)
				{
					ast_log( LOG_NOTICE, "unable to read from channel, channel => %s\n", chan->name ) ;
				// They probably want to hangup...
				}
				break ;
			}

			// actually process the frame: break if we got hangup.
			if(process_incoming(member, conf, f)) break;

		}

		if (conf->kick_flag || member->kick_flag) {
			pbx_builtin_setvar_helper(member->chan, "KONFERENCE", "KICKED" );
			break;
		}

		//-----------------//
		// OUTGOING FRAMES //
		//-----------------//

		// update the current timestamps
		curr = ast_tvnow();

		if ( !process_outgoing(member) )
			// back to process incoming frames
			continue ;
		else
			// they probably hungup...
			break ;
	}

	ast_log( AST_CONF_DEBUG, "end member event loop, time_entered => %ld\n", member->time_entered.tv_sec ) ;

	//
	// clean up
	//

#ifdef DEBUG_OUTPUT_PCM
	// !!! TESTING !!!
	if ( incoming_fh != NULL )
		fclose( incoming_fh ) ;
#endif
//	end = ast_tvnow();
//	int expected_frames = ( int )( floor( (double)( msecdiff( &end, &start ) / AST_CONF_FRAME_INTERVAL ) ) ) ;
//	ast_log( AST_CONF_DEBUG, "expected_frames => %d\n", expected_frames ) ;

	remove_member( member, conf ) ;
	return 0 ;
}


#ifdef	VIDEO
struct ast_conf_member *check_active_video( int id, struct ast_conference *conf )
{
     struct ast_conf_member *member;

     // acquire the conference lock
     ast_rwlock_rdlock( &conf->lock ) ;

     member = conf->memberlist;
     while (member)
     {
	     if (member->id == id)
	     {
		     // lock this member
		     ast_mutex_lock( &member->lock ) ;
	      	     ast_rwlock_unlock( &conf->lock ) ;
		     return member;
	     }
	     member = member->next;
     }
     ast_rwlock_unlock( &conf->lock ) ;
     return NULL;
}
#endif
//
// manange member functions
//

struct ast_conf_member* create_member( struct ast_channel *chan, const char* data )
{
	//
	// check input
	//

	if ( chan == NULL )
	{
		ast_log( LOG_ERROR, "unable to create member with null channel\n" ) ;
		return NULL ;
	}

	if ( chan->name == NULL )
	{
		ast_log( LOG_ERROR, "unable to create member with null channel name\n" ) ;
		return NULL ;
	}

	//
	// allocate memory for new conference member
	//

	struct ast_conf_member *member = calloc( 1,  sizeof( struct ast_conf_member ) ) ;

	if ( member == NULL )
	{
		ast_log( LOG_ERROR, "unable to malloc ast_conf_member\n" ) ;
		return NULL ;
	}

	// initialize mutex
	ast_mutex_init( &member->lock ) ;

	// initialize cv
	ast_cond_init( &member->delete_var, NULL ) ;
	// initialize flag and count
	member->delete_flag = member->use_count = 0 ;

	// Default values for parameters that can get overwritten by dialplan arguments
#ifdef	VIDEO
	member->video_start_timeout = AST_CONF_VIDEO_START_TIMEOUT;
	member->video_stop_timeout = AST_CONF_VIDEO_STOP_TIMEOUT;
#endif
	member->priority = 0;
	member->vad_prob_start = AST_CONF_PROB_START;
	member->vad_prob_continue = AST_CONF_PROB_CONTINUE;
	member->max_users = AST_CONF_MAX_USERS;
	member->type = NULL;

	//
	// initialize member with passed data values
	//
	char argstr[256] ;

	// copy the passed data
	strncpy( argstr, data, sizeof(argstr) - 1 ) ;

	// point to the copied data
	char *stringp = argstr;

	ast_log( AST_CONF_DEBUG, "attempting to parse passed params, stringp => %s\n", stringp ) ;

	// parse the id
	char *token;
	if ( ( token = strsep( &stringp, "/" ) ) != NULL )
	{
		member->conf_name = malloc( strlen( token ) + 1 ) ;
		strcpy( member->conf_name, token ) ;
	}
	else
	{
		ast_log( LOG_ERROR, "unable to parse member id\n" ) ;
		free( member ) ;
		return NULL ;
	}

	// parse the flags
	if ( ( token = strsep( &stringp, "/" ) ) != NULL )
	{
		member->flags = malloc( strlen( token ) + 1 ) ;
		strcpy( member->flags, token ) ;
	}
	else
	{
		// make member->flags something
		member->flags = malloc( sizeof( char ) ) ;
		memset( member->flags, 0x0, sizeof( char ) ) ;
	}

	while ( (token = strsep(&stringp, "/")) != NULL )
	{
		static const char arg_priority[] = "priority";
		static const char arg_vad_prob_start[] = "vad_prob_start";
		static const char arg_vad_prob_continue[] = "vad_prob_continue";
#ifdef	VIDEO
		static const char arg_video_start_timeout[] = "video_start_timeout";
		static const char arg_video_stop_timeout[] = "video_stop_timeout";
#endif
		static const char arg_max_users[] = "max_users";
		static const char arg_conf_type[] = "type";

		char *value = token;
		const char *key = strsep(&value, "=");
		
		if ( key == NULL || value == NULL )
		{
			ast_log(LOG_WARNING, "Incorrect argument %s\n", token);
			continue;
		}
		if ( strncasecmp(key, arg_priority, sizeof(arg_priority) - 1) == 0 )
		{
			member->priority = strtol(value, (char **)NULL, 10);
			ast_log(AST_CONF_DEBUG, "priority = %d\n", member->priority);
		} else if ( strncasecmp(key, arg_vad_prob_start, sizeof(arg_vad_prob_start) - 1) == 0 )
		{
			member->vad_prob_start = strtof(value, (char **)NULL);
			ast_log(AST_CONF_DEBUG, "vad_prob_start = %f\n", member->vad_prob_start);
		} else if ( strncasecmp(key, arg_vad_prob_continue, sizeof(arg_vad_prob_continue) - 1) == 0 )
		{
			member->vad_prob_continue = strtof(value, (char **)NULL);
			ast_log(AST_CONF_DEBUG, "vad_prob_continue = %f\n", member->vad_prob_continue);
#ifdef	VIDEO
		} else if ( strncasecmp(key, arg_video_start_timeout, sizeof(arg_video_start_timeout) - 1) == 0 )
		{
			member->video_start_timeout = strtol(value, (char **)NULL, 10);
			ast_log(AST_CONF_DEBUG, "video_start_timeout = %d\n", member->video_start_timeout);
		} else if ( strncasecmp(key, arg_video_stop_timeout, sizeof(arg_video_stop_timeout) - 1) == 0 )
		{
			member->video_stop_timeout = strtol(value, (char **)NULL, 10);
			ast_log(AST_CONF_DEBUG, "video_stop_timeout = %d\n", member->video_stop_timeout);
#endif
		} else if ( strncasecmp(key, arg_max_users, sizeof(arg_max_users) - 1) == 0 )
		{
			member->max_users = strtol(value, (char **)NULL, 10);
			ast_log(AST_CONF_DEBUG, "max_users = %d\n", member->max_users);
		} else if ( strncasecmp(key, arg_conf_type, sizeof(arg_conf_type) - 1) == 0 )
		{
			member->type = malloc( strlen( value ) + 1 ) ;
			strcpy( member->type, value ) ;
			ast_log(AST_CONF_DEBUG, "type = %s\n", member->type);
		} else
		{
			ast_log(LOG_WARNING, "unknown parameter %s with value %s\n", key, value);
		}
	}

	//
	// initialize member with default values
	//

	// keep pointer to member's channel
	member->chan = chan ;

	// copy the channel name
	member->channel_name = malloc( strlen( chan->name ) + 1 ) ;
	strcpy( member->channel_name, chan->name ) ;

	// copy the uniqueid
	member->uniqueid = malloc( strlen( chan->uniqueid ) + 1 ) ;
	strcpy( member->uniqueid, chan->uniqueid ) ;

	// set default if no type parameter
	if (!member->type) {
		member->type = malloc( strlen( AST_CONF_TYPE_DEFAULT ) + 1 ) ;
		strcpy( member->type, AST_CONF_TYPE_DEFAULT ) ;
		ast_log(AST_CONF_DEBUG, "type = %s\n", member->type);
	}

	// ( default can be overridden by passed flags )
	member->mute_audio = 0;
#ifdef	VIDEO
	member->mute_video = 0;
#endif
	member->talk_volume = 0;
	member->listen_volume = 0;
	member->norecv_audio = 0;
#ifdef	VIDEO
	member->norecv_video = 0;
	member->no_camera = 0;
#endif
	// moderator?
	member->ismoderator = 0;
	member->kick_conferees = 0;

	// ready flag
	member->ready_for_outgoing = 0 ;

	// incoming frame queue
	member->inFrames = NULL ;
	member->inFramesTail = NULL ;
	member->inFramesCount = 0 ;
#ifdef	VIDEO
	member->inVideoFrames = NULL ;
	member->inVideoFramesTail = NULL ;
	member->inVideoFramesCount = 0 ;
#endif
#ifdef	DTMF
	member->inDTMFFrames = NULL ;
	member->inDTMFFramesTail = NULL ;
	member->inDTMFFramesCount = 0 ;
#endif
#ifdef	TEXT
	member->inTextFrames = NULL ;
	member->inTextFramesTail = NULL ;
	member->inTextFramesCount = 0 ;
#endif
#ifdef	VIDEO
	member->conference = 1; // we have switched req_id
	member->dtmf_switch = 0; // no dtmf switch by default
#endif
	member->dtmf_relay = 0; // no dtmf relay by default

	// start of day video ids
#ifdef	VIDEO
	member->req_id = -1;
#endif
	member->id = -1;

	member->first_frame_received = 0; // cause a FIR after NAT delay

	// last frame caching
	member->inFramesRepeatLast = 0 ;
	member->inFramesLast = NULL ;
	member->okayToCacheLast = 0 ;

	// outgoing frame queue
	member->outFrames = NULL ;
	member->outFramesTail = NULL ;
	member->outFramesCount = 0 ;
#ifdef	VIDEO
	member->outVideoFrames = NULL ;
	member->outVideoFramesTail = NULL ;
	member->outVideoFramesCount = 0 ;
#endif
#ifdef	DTMF
	member->outDTMFFrames = NULL ;
	member->outDTMFFramesTail = NULL ;
	member->outDTMFFramesCount = 0 ;
#endif
#ifdef	TEXT
	member->outTextFrames = NULL ;
	member->outTextFramesTail = NULL ;
	member->outTextFramesCount = 0 ;
#endif
	// ( not currently used )
	// member->samplesperframe = AST_CONF_BLOCK_SAMPLES ;

	// used for determining need to mix frames
	// and for management interface notification
	// and for VAD based video switching
	member->speaking_state_notify = 0 ;
	member->speaking_state = 0 ;
	member->local_speaking_state = 0;
	member->last_state_change = (struct timeval){0, 0};
	member->speaker_count = 0;
#ifdef	VIDEO
	member->driven_member = NULL;

	member->video_broadcast_active = 0;
	member->last_video_frame_time = (struct timeval){0, 0};

	member->video_started = 0;
#endif
	// linked-list pointers
	member->next = NULL ;
#ifndef	VIDEO
	member->prev = NULL ;
#endif
	// account data
	member->frames_in = 0 ;
	member->frames_in_dropped = 0 ;
	member->frames_out = 0 ;
	member->frames_out_dropped = 0 ;
#ifdef	VIDEO
	member->video_frames_in = 0 ;
	member->video_frames_in_dropped = 0 ;
	member->video_frames_out = 0 ;
	member->video_frames_out_dropped = 0 ;
#endif
#ifdef	DTMF
	member->dtmf_frames_in = 0 ;
	member->dtmf_frames_in_dropped = 0 ;
	member->dtmf_frames_out = 0 ;
	member->dtmf_frames_out_dropped = 0 ;
#endif
#ifdef	TEXT
	member->text_frames_in = 0 ;
	member->text_frames_in_dropped = 0 ;
	member->text_frames_out = 0 ;
	member->text_frames_out_dropped = 0 ;
#endif
	// for counting sequentially dropped frames
	member->sequential_drops = 0 ;
	member->since_dropped = 0 ;

	// flags
	member->kick_flag = 0;
	member->max_users_flag = 0;

	// record start time
	// init dropped frame timestamps
	// init state change timestamp
	member->time_entered =
		member->last_in_dropped =
		member->last_out_dropped =
		member->last_state_change = ast_tvnow();

	//
	// parse passed flags
	//

	// silence detection flags w/ defaults
	member->vad_flag = 0 ;
	member->denoise_flag = 0 ;
	member->agc_flag = 0 ;

	// is this member using the telephone?
	member->via_telephone = 0 ;
	
	// temp pointer to flags string
	char* flags = member->flags ;

	int i;

	for ( i = 0 ; i < strlen( flags ) ; ++i )
	{
#ifdef	VIDEO
		if (flags[i] >= (int)'0' && flags[i] <= (int)'9')
		{
			if (member->req_id < 0)
			{
				member->req_id = flags[i] - (int)'0';
			}
			else
			{
				int newid = flags[i] - (int)'0';
				// need to boot anyone with this id already
				// will happen in add_member
				member->id = newid;
			}
		}
		else
#endif
		{
			// allowed flags are C, c, L, l, V, D, A, C, X, R, T, t, M, S, z, o, F
			// mute/no_recv options
			switch ( flags[i] )
			{
#ifdef	VIDEO
			case 'C':
				member->mute_video = 1;
				break ;
			case 'c':
				member->norecv_video = 1;
				break ;
#endif
			case 'L':
				member->mute_audio = 1;
				break ;
			case 'l':
				member->norecv_audio = 1;
				break;

				// speex preprocessing options
			case 'V':
				member->vad_flag = 1 ;
				break ;
			case 'D':
				member->denoise_flag = 1 ;
				break ;
			case 'A':
				member->agc_flag = 1 ;
				break ;

				// dtmf/moderator/video switching options
#ifdef	VIDEO
			case 'X':
				member->dtmf_switch = 1;
				break;
#endif
			case 'R':
				member->dtmf_relay = 1;
				break;
#ifdef	VIDEO
			case 'S':
				member->vad_switch = 1;
				break;
			case 'F':
				member->force_vad_switch = 1;
				break;
#endif
			case 'M':
				member->ismoderator = 1;
				break;
#ifdef	VIDEO
			case 'N':
				member->no_camera = 1;
				break;
#endif
#ifdef	TEXT
			case 't':
				member->does_text = 1;
				break;
#endif
#ifdef	VIDEO
			case 'z':
				member->vad_linger = 1;
				break;
			case 'o':
				member->does_chat_mode = 1;
				break;
#endif
			case 'x':
				member->kick_conferees = 1;
				break;

				//Telephone connection
			case 'a':
				member->vad_flag = 1 ;
			case 'T':
				member->via_telephone = 1;
				break;

			default:
				break ;
			}
		}
	}

	// set the dsp to null so silence detection is disabled by default
	member->dsp = NULL ;

#if ( SILDET == 2 )
	//
	// configure silence detection and preprocessing
	// if the user is coming in via the telephone,
	// and is not listen-only
	//
	if ( member->via_telephone == 1)
	{
		// create a speex preprocessor
		member->dsp = speex_preprocess_state_init( AST_CONF_BLOCK_SAMPLES, AST_CONF_SAMPLE_RATE ) ;

		if ( member->dsp == NULL )
		{
			ast_log( LOG_WARNING, "unable to initialize member dsp, channel => %s\n", chan->name ) ;
		}
		else
		{
			ast_log( AST_CONF_DEBUG, "member dsp initialized, channel => %s, v => %d, d => %d, a => %d\n",
				chan->name, member->vad_flag, member->denoise_flag, member->agc_flag ) ;

			// set speex preprocessor options
			speex_preprocess_ctl( member->dsp, SPEEX_PREPROCESS_SET_VAD, &(member->vad_flag) ) ;
			speex_preprocess_ctl( member->dsp, SPEEX_PREPROCESS_SET_DENOISE, &(member->denoise_flag) ) ;
			speex_preprocess_ctl( member->dsp, SPEEX_PREPROCESS_SET_AGC, &(member->agc_flag) ) ;

			speex_preprocess_ctl( member->dsp, SPEEX_PREPROCESS_SET_PROB_START, &member->vad_prob_start ) ;
			speex_preprocess_ctl( member->dsp, SPEEX_PREPROCESS_SET_PROB_CONTINUE, &member->vad_prob_continue ) ;

			ast_log( AST_CONF_DEBUG, "speech_prob_start => %f, speech_prob_continue => %f\n",
				member->dsp->speech_prob_start, member->dsp->speech_prob_continue ) ;
		}
	}
#endif
	//
	// read, write, and translation options
	//

	// set member's audio formats, taking dsp preprocessing into account
	// ( chan->nativeformats, AST_FORMAT_SLINEAR, AST_FORMAT_ULAW, AST_FORMAT_GSM )
	member->read_format = ( member->dsp == NULL ) ? chan->nativeformats : AST_FORMAT_SLINEAR ;

	member->write_format = chan->nativeformats;

	// 1.2 or 1.3+
#ifdef AST_FORMAT_AUDIO_MASK

	member->read_format &= AST_FORMAT_AUDIO_MASK;
	member->write_format &= AST_FORMAT_AUDIO_MASK;
#endif

	// translation paths ( ast_translator_build_path() returns null if formats match )
	member->to_slinear = ast_translator_build_path( AST_FORMAT_SLINEAR, member->read_format ) ;
	member->from_slinear = ast_translator_build_path( member->write_format, AST_FORMAT_SLINEAR ) ;

	ast_log( AST_CONF_DEBUG, "AST_FORMAT_SLINEAR => %d\n", AST_FORMAT_SLINEAR ) ;

	// index for converted_frames array
	switch ( member->write_format )
	{
		case AST_FORMAT_SLINEAR:
			member->write_format_index = AC_SLINEAR_INDEX ;
			break ;

		case AST_FORMAT_ULAW:
			member->write_format_index = AC_ULAW_INDEX ;
			break ;

	        case AST_FORMAT_ALAW:
			member->write_format_index = AC_ALAW_INDEX ;
			break ;

		case AST_FORMAT_GSM:
			member->write_format_index = AC_GSM_INDEX ;
			break ;

		case AST_FORMAT_SPEEX:
			member->write_format_index = AC_SPEEX_INDEX;
			break;

#ifdef AC_USE_G729A
		case AST_FORMAT_G729A:
			member->write_format_index = AC_G729A_INDEX;
			break;
#endif

		default:
			member->write_format_index = 0 ;
	}

	// index for converted_frames array
	switch ( member->read_format )
	{
		case AST_FORMAT_SLINEAR:
			member->read_format_index = AC_SLINEAR_INDEX ;
			break ;

		case AST_FORMAT_ULAW:
			member->read_format_index = AC_ULAW_INDEX ;
			break ;

		case AST_FORMAT_ALAW:
			member->read_format_index = AC_ALAW_INDEX ;
			break ;

		case AST_FORMAT_GSM:
			member->read_format_index = AC_GSM_INDEX ;
			break ;

		case AST_FORMAT_SPEEX:
			member->read_format_index = AC_SPEEX_INDEX;
			break;

#ifdef AC_USE_G729A
		case AST_FORMAT_G729A:
			member->read_format_index = AC_G729A_INDEX;
			break;
#endif

		default:
			member->read_format_index = 0 ;
	}

	// smoother defaults.
	member->smooth_multiple =1;
	member->smooth_size_in = -1;
	member->smooth_size_out = -1;
	member->inSmoother= NULL;
	member->outPacker= NULL;

	switch (member->read_format){
		/* these assumptions may be incorrect */
		case AST_FORMAT_ULAW:
		case AST_FORMAT_ALAW:
			member->smooth_size_in  = 160; //bytes
			member->smooth_size_out = 160; //samples
			break;
		case AST_FORMAT_GSM:
			/*
			member->smooth_size_in  = 33; //bytes
			member->smooth_size_out = 160;//samples
			*/
			break;
		case AST_FORMAT_SPEEX:
		case AST_FORMAT_G729A:
			/* this assumptions are wrong
			member->smooth_multiple = 2 ;  // for testing, force to dual frame
			member->smooth_size_in  = 39;  // bytes
			member->smooth_size_out = 160; // samples
			*/
			break;
		case AST_FORMAT_SLINEAR:
			member->smooth_size_in  = 320; //bytes
			member->smooth_size_out = 160; //samples
			break;
		default:
			member->inSmoother = NULL; //don't use smoother for this type.
			//ast_log( AST_CONF_DEBUG, "smoother is NULL for member->read_format => %d\n", member->read_format);
	}

	if (member->smooth_size_in > 0){
		member->inSmoother = ast_smoother_new(member->smooth_size_in);
		ast_log( AST_CONF_DEBUG, "created smoother(%d) for %d\n", member->smooth_size_in , member->read_format);
	}

	//
	// finish up
	//

	ast_log( AST_CONF_DEBUG, "created member, type => %s, priority => %d, readformat => %d\n",
		member->type, member->priority, chan->readformat ) ;

	return member ;
}

struct ast_conf_member* delete_member( struct ast_conf_member* member )
{
	// !!! NO RETURN TEST !!!
	// do { sleep(1) ; } while (1) ;

	// !!! CRASH TEST !!!
	// *((int *)0) = 0;

	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to the delete null member\n" ) ;
		return NULL ;
	}

	ast_mutex_lock ( &member->lock ) ;

	member->delete_flag = 1 ;
	if ( member->use_count )
		ast_cond_wait ( &member->delete_var, &member->lock ) ;

	ast_mutex_unlock ( &member->lock ) ;

#ifdef	VIDEO
	// If member is driving another member, make sure its speaker count is correct
	if ( member->driven_member != NULL && member->speaking_state == 1 )
		decrement_speaker_count(member->driven_member, 1);
#endif
	//
	// clean up member flags
	//

	if ( member->flags != NULL )
	{
		// !!! DEBUGING !!!
		ast_log( AST_CONF_DEBUG, "freeing member flags, name => %s\n",
			member->channel_name ) ;
		free( member->flags ) ;
	}

	//
	// delete the members frames
	//

	conf_frame* cf ;

	// !!! DEBUGING !!!
	ast_log( AST_CONF_DEBUG, "deleting member input frames, name => %s\n",
		member->channel_name ) ;

	// incoming frames
	cf = member->inFrames ;

	while ( cf != NULL )
	{
		cf = delete_conf_frame( cf ) ;
	}

	if (member->inSmoother != NULL)
		ast_smoother_free(member->inSmoother);
#ifdef	VIDEO
	cf = member->inVideoFrames ;

	while ( cf != NULL )
	{
		cf = delete_conf_frame( cf ) ;
	}
#endif
	// !!! DEBUGING !!!
	ast_log( AST_CONF_DEBUG, "deleting member output frames, name => %s\n",
		member->channel_name ) ;

	// outgoing frames
	cf = member->outFrames ;

	while ( cf != NULL )
	{
		cf = delete_conf_frame( cf ) ;
	}
#ifdef	VIDEO
	cf = member->outVideoFrames ;

	while ( cf != NULL )
	{
		cf = delete_conf_frame( cf ) ;
	}
#endif
#if ( SILDET == 2 )
	if ( member->dsp != NULL )
	{
		// !!! DEBUGING !!!
		ast_log( AST_CONF_DEBUG, "destroying member preprocessor, name => %s\n",
			member->channel_name ) ;
		speex_preprocess_state_destroy( member->dsp ) ;
	}
#endif

	// !!! DEBUGING !!!
	ast_log( AST_CONF_DEBUG, "freeing member translator paths, name => %s\n",
		member->channel_name ) ;

	// free the mixing translators
	ast_translator_free_path( member->to_slinear ) ;
	ast_translator_free_path( member->from_slinear ) ;

	// get a pointer to the next
	// member so we can return it
	struct ast_conf_member* nm = member->next ;

	// !!! DEBUGING !!!
	ast_log( AST_CONF_DEBUG, "freeing member channel name, name => %s\n",
		member->channel_name ) ;

	// free the member's copy for the channel name
	free( member->channel_name ) ;

	// free the member's copy of the uniqueid
	free( member->uniqueid ) ;

	// free the member's copy of the conference name
	free(member->conf_name);

	// free the member's copy of the conference type
	free(member->type);

	// free the member's memory
	free(member->callerid);
	free(member->callername);

	// clear all sounds
	struct ast_conf_soundq *sound = member->soundq;
	struct ast_conf_soundq *next;

	while ( sound )
	{
		next = sound->next;
		if ( sound->stream )
			ast_closestream( sound->stream );
		free( sound );
		sound = next;
	}

	// !!! DEBUGING !!!
	ast_log( AST_CONF_DEBUG, "freeing member\n" ) ;

	free( member ) ;
	member = NULL ;

	return nm ;
}

//
// incoming frame functions
//
#ifdef	VIDEO
conf_frame* get_incoming_video_frame( struct ast_conf_member *member )
{
  	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to get frame from null member\n" ) ;
		return NULL ;
	}

	ast_mutex_lock(&member->lock);

	if ( member->inVideoFramesCount == 0 )
	{
		ast_mutex_unlock(&member->lock);
		return NULL ;
	}

	//
	// return the next frame in the queue
	//

	conf_frame* cfr = NULL ;

	// get first frame in line
	cfr = member->inVideoFramesTail ;

	// if it's the only frame, reset the queue,
	// else, move the second frame to the front
	if ( member->inVideoFramesTail == member->inVideoFrames )
	{
		member->inVideoFramesTail = NULL ;
		member->inVideoFrames = NULL ;
	}
	else
	{
		// move the pointer to the next frame
		member->inVideoFramesTail = member->inVideoFramesTail->prev ;

		// reset it's 'next' pointer
		if ( member->inVideoFramesTail != NULL )
			member->inVideoFramesTail->next = NULL ;
	}

	// separate the conf frame from the list
	cfr->next = NULL ;
	cfr->prev = NULL ;

	// decrement frame count
	member->inVideoFramesCount-- ;

	ast_mutex_unlock(&member->lock);
	return cfr ;

}
#endif
#ifdef	DTMF
conf_frame* get_incoming_dtmf_frame( struct ast_conf_member *member )
{
  	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to get frame from null member\n" ) ;
		return NULL ;
	}

	ast_mutex_lock(&member->lock);

	if ( member->inDTMFFramesCount == 0 )
	{
		ast_mutex_unlock(&member->lock);
		return NULL ;
	}

	//
	// return the next frame in the queue
	//

	conf_frame* cfr = NULL ;

	// get first frame in line
	cfr = member->inDTMFFramesTail ;

	// if it's the only frame, reset the queue,
	// else, move the second frame to the front
	if ( member->inDTMFFramesTail == member->inDTMFFrames )
	{
		member->inDTMFFramesTail = NULL ;
		member->inDTMFFrames = NULL ;
	}
	else
	{
		// move the pointer to the next frame
		member->inDTMFFramesTail = member->inDTMFFramesTail->prev ;

		// reset it's 'next' pointer
		if ( member->inDTMFFramesTail != NULL )
			member->inDTMFFramesTail->next = NULL ;
	}

	// separate the conf frame from the list
	cfr->next = NULL ;
	cfr->prev = NULL ;

	// decriment frame count
	member->inDTMFFramesCount-- ;

	ast_mutex_unlock(&member->lock);
	return cfr ;

}
#endif

conf_frame* get_incoming_frame( struct ast_conf_member *member )
{
	conf_frame *cf_result;
	//
	// sanity checks
	//

	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to get frame from null member\n" ) ;
		return NULL ;
	}

	ast_mutex_lock(&member->lock);

 	//
 	// repeat last frame a couple times to smooth transition
 	//

#ifdef AST_CONF_CACHE_LAST_FRAME
	if ( member->inFramesCount == 0 )
	{
		// nothing to do if there's no cached frame
		if ( member->inFramesLast == NULL ) {
			ast_mutex_unlock(&member->lock);
			return NULL ;
		}

		// turn off 'okay to cache' flag
		member->okayToCacheLast = 0 ;

		if ( member->inFramesRepeatLast >= AST_CONF_CACHE_LAST_FRAME )
		{
			// already used this frame AST_CONF_CACHE_LAST_FRAME times

			// reset repeat count
			member->inFramesRepeatLast = 0 ;

			// clear the cached frame
			delete_conf_frame( member->inFramesLast ) ;
			member->inFramesLast = NULL ;

			// return null
			ast_mutex_unlock(&member->lock);
			return NULL ;
		}
		else
		{
			ast_log( AST_CONF_DEBUG, "repeating cached frame, channel => %s, inFramesRepeatLast => %d\n",
				member->channel_name, member->inFramesRepeatLast ) ;

			// increment counter
			member->inFramesRepeatLast++ ;

			// return a copy of the cached frame
			cf_result = copy_conf_frame( member->inFramesLast ) ;
			ast_mutex_unlock(&member->lock);
			return cf_result;
		}
	}
	else if ( member->okayToCacheLast == 0 && member->inFramesCount >= 3 )
	{
		ast_log( AST_CONF_DEBUG, "enabling cached frame, channel => %s, incoming => %d, outgoing => %d\n",
			member->channel_name, member->inFramesCount, member->outFramesCount ) ;

		// turn on 'okay to cache' flag
		member->okayToCacheLast = 1 ;
	}
#else
	if ( member->inFramesCount == 0 ) {
		ast_mutex_unlock(&member->lock);
		return NULL ;
	}
#endif // AST_CONF_CACHE_LAST_FRAME

	//
	// return the next frame in the queue
	//

	conf_frame* cfr = NULL ;

	// get first frame in line
	cfr = member->inFramesTail ;

	// if it's the only frame, reset the queue,
	// else, move the second frame to the front
	if ( member->inFramesTail == member->inFrames )
	{
		member->inFramesTail = NULL ;
		member->inFrames = NULL ;
	}
	else
	{
		// move the pointer to the next frame
		member->inFramesTail = member->inFramesTail->prev ;

		// reset it's 'next' pointer
		if ( member->inFramesTail != NULL )
			member->inFramesTail->next = NULL ;
	}

	// separate the conf frame from the list
	cfr->next = NULL ;
	cfr->prev = NULL ;

	// decriment frame count
	member->inFramesCount-- ;

#ifdef AST_CONF_CACHE_LAST_FRAME
	// copy frame if queue is now empty
	if (
		member->inFramesCount == 0
		&& member->okayToCacheLast == 1
	)
	{
		// reset repeat count
		member->inFramesRepeatLast = 0 ;

		// clear cached frame
		if ( member->inFramesLast != NULL )
		{
			delete_conf_frame( member->inFramesLast ) ;
			member->inFramesLast = NULL ;
		}

		// cache new frame
		member->inFramesLast = copy_conf_frame( cfr ) ;
	}
#endif // AST_CONF_CACHE_LAST_FRAME

	ast_mutex_unlock(&member->lock);
	return cfr ;
}
#ifdef	VIDEO
int queue_incoming_video_frame( struct ast_conf_member* member, const struct ast_frame* fr )
{
	// check on frame
	if ( fr == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue null frame\n" ) ;
		return -1 ;
	}

	// check on member
	if ( member == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue frame for null member\n" ) ;
		return -1 ;
	}

	// lock the member
	ast_mutex_lock(&member->lock);

	if (!member->first_frame_received)
	{
		// nat=yes will be correct now
		member->first_frame_received = 1;
		member->conference = 1;
	}

	// We have to drop if the queue is full!
	if ( member->inVideoFramesCount >= AST_CONF_MAX_VIDEO_QUEUE )
	{
		ast_log(
			AST_CONF_DEBUG,
			"unable to queue incoming VIDEO frame, channel => %s, incoming => %d, outgoing => %d\n",
			member->channel_name, member->inVideoFramesCount, member->outVideoFramesCount
		) ;
		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

	//
	// create new conf frame from passed data frame
	//

	// ( member->inFrames may be null at this point )
	conf_frame* cfr = create_conf_frame( member, member->inVideoFrames, fr ) ;

	if ( cfr == NULL )
	{
		ast_log( LOG_ERROR, "unable to malloc conf_frame\n" ) ;
		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

	// copy frame data pointer to conf frame
	// cfr->fr = fr ;

	//
	// add new frame to speaking members incoming frame queue
	// ( i.e. save this frame data, so we can distribute it in conference_exec later )
	//

	if ( member->inVideoFrames == NULL )
	{
		// this is the first frame in the buffer
		member->inVideoFramesTail = cfr ;
		member->inVideoFrames = cfr ;
	}
	else
	{
		// put the new frame at the head of the list
		member->inVideoFrames = cfr ;
	}

	// increment member frame count
	member->inVideoFramesCount++ ;

	ast_mutex_unlock(&member->lock);

        // Everything has gone okay!
	return 0;
}
#endif
#ifdef	DTMF
int queue_incoming_dtmf_frame( struct ast_conf_member* member, const struct ast_frame* fr )
{
  //ast_log( AST_CONF_DEBUG, "queue incoming video frame\n");

	// check on frame
	if ( fr == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue null frame\n" ) ;
		return -1 ;
	}

	// check on member
	if ( member == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue frame for null member\n" ) ;
		return -1 ;
	}

	ast_mutex_lock(&member->lock);

	// We have to drop if the queue is full!
	if ( member->inDTMFFramesCount >= AST_CONF_MAX_DTMF_QUEUE )
	{
		ast_log(
			AST_CONF_DEBUG,
			"unable to queue incoming DTMF frame, channel => %s, incoming => %d, outgoing => %d\n",
			member->channel_name, member->inDTMFFramesCount, member->outDTMFFramesCount
		) ;
		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

	//
	// create new conf frame from passed data frame
	//

	// ( member->inFrames may be null at this point )
	conf_frame* cfr = create_conf_frame( member, member->inDTMFFrames, fr ) ;

	if ( cfr == NULL )
	{
		ast_log( LOG_ERROR, "unable to malloc conf_frame\n" ) ;
		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

	// copy frame data pointer to conf frame
	// cfr->fr = fr ;

	//
	// add new frame to speaking members incoming frame queue
	// ( i.e. save this frame data, so we can distribute it in conference_exec later )
	//

	if ( member->inDTMFFrames == NULL )
	{
		// this is the first frame in the buffer
		member->inDTMFFramesTail = cfr ;
		member->inDTMFFrames = cfr ;
	}
	else
	{
		// put the new frame at the head of the list
		member->inDTMFFrames = cfr ;
	}

	// increment member frame count
	member->inDTMFFramesCount++ ;

	ast_mutex_unlock(&member->lock);

	// Everything has gone okay!
	return 0;
}
#endif
int queue_incoming_frame( struct ast_conf_member* member, struct ast_frame* fr )
{
	//
	// sanity checks
	//

	// check on frame
	if ( fr == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue null frame\n" ) ;
		return -1 ;
	}

	// check on member
	if ( member == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue frame for null member\n" ) ;
		return -1 ;
	}

	ast_mutex_lock(&member->lock);

	if ( member->inFramesCount > member->inFramesNeeded )
	{
		if ( member->inFramesCount > AST_CONF_QUEUE_DROP_THRESHOLD )
		{
			struct timeval curr = ast_tvnow();

			// time since last dropped frame
			long diff = ast_tvdiff_ms(curr, member->last_in_dropped);

			// number of milliseconds which must pass between frame drops
			// ( 15 frames => -100ms, 10 frames => 400ms, 5 frames => 900ms, 0 frames => 1400ms, etc. )
			long time_limit = 1000 - ( ( member->inFramesCount - AST_CONF_QUEUE_DROP_THRESHOLD ) * 100 ) ;

			if ( diff >= time_limit )
			{
				// count sequential drops
				member->sequential_drops++ ;

				ast_log(
					AST_CONF_DEBUG,
					"dropping frame from input buffer, channel => %s, incoming => %d, outgoing => %d\n",
					member->channel_name, member->inFramesCount, member->outFramesCount
				) ;

				// accounting: count dropped incoming frames
				member->frames_in_dropped++ ;

				// reset frames since dropped
				member->since_dropped = 0 ;

				// delete the frame
				delete_conf_frame( get_incoming_frame( member ) ) ;

				member->last_in_dropped = ast_tvnow();
			}
			else
			{
/*
				ast_log(
					AST_CONF_DEBUG,
					"input buffer larger than drop threshold, channel => %s, incoming => %d, outgoing => %d\n",
					member->channel_name, member->inFramesCount, member->outFramesCount
				) ;
*/
			}
		}
	}

	//
	// if we have to drop frames, we'll drop new frames
	// because it's easier ( and doesn't matter much anyway ).
	//

	if ( member->inFramesCount >= AST_CONF_MAX_QUEUE )
	{
		// count sequential drops
		member->sequential_drops++ ;

		ast_log(
			AST_CONF_DEBUG,
			"unable to queue incoming frame, channel => %s, incoming => %d, outgoing => %d\n",
			member->channel_name, member->inFramesCount, member->outFramesCount
		) ;

		// accounting: count dropped incoming frames
		member->frames_in_dropped++ ;

		// reset frames since dropped
		member->since_dropped = 0 ;

		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

	// reset sequential drops
	member->sequential_drops = 0 ;

	// increment frames since dropped
	member->since_dropped++ ;

	//
	// create new conf frame from passed data frame
	//

	// ( member->inFrames may be null at this point )
	if (member->inSmoother == NULL ){
		conf_frame* cfr = create_conf_frame( member, member->inFrames, fr ) ;
		if ( cfr == NULL )
		{
			ast_log( LOG_ERROR, "unable to malloc conf_frame\n" ) ;
			ast_mutex_unlock(&member->lock);
			return -1 ;
		}

		//
		// add new frame to speaking members incoming frame queue
		// ( i.e. save this frame data, so we can distribute it in conference_exec later )
		//

		if ( member->inFrames == NULL ) {
			member->inFramesTail = cfr ;
		}
		member->inFrames = cfr ;
		member->inFramesCount++ ;
	} else {
		//feed frame(fr) into the smoother

		// smoother tmp frame
		struct ast_frame *sfr;
		int multiple = 1;
		int i=0;

#if 0
		if ( (member->smooth_size_in > 0 ) && (member->smooth_size_in * member->smooth_multiple != fr->datalen) )
		{
			ast_log( AST_CONF_DEBUG, "resetting smooth_size_in. old size=> %d, multiple =>%d, datalen=> %d\n", member->smooth_size_in, member->smooth_multiple, fr->datalen );
			if ( fr->datalen % member->smooth_multiple != 0) {
				// if datalen not divisible by smooth_multiple, assume we're just getting normal encoding.
			//	ast_log(AST_CONF_DEBUG,"smooth_multiple does not divide datalen. changing smooth size from %d to %d, multiple => 1\n", member->smooth_size_in, fr->datalen);
				member->smooth_size_in = fr->datalen;
				member->smooth_multiple = 1;
			} else {
				// assume a fixed multiple, so divide into datalen.
				int newsmooth = fr->datalen / member->smooth_multiple ;
			//	ast_log(AST_CONF_DEBUG,"datalen is divisible by smooth_multiple, changing smooth size from %d to %d\n", member->smooth_size_in, newsmooth);
				member->smooth_size_in = newsmooth;
			}

			//free input smoother.
			if (member->inSmoother != NULL)
				ast_smoother_free(member->inSmoother);

			//make new input smoother.
			member->inSmoother = ast_smoother_new(member->smooth_size_in);
		}
#endif

		ast_smoother_feed( member->inSmoother, fr );
ast_log (AST_CONF_DEBUG, "SMOOTH:Feeding frame into inSmoother, timestamp => %ld.%ld\n", fr->delivery.tv_sec, fr->delivery.tv_usec);

		if ( multiple > 1 )
			fr->samples /= multiple;

		// read smoothed version of frames, add to queue
		while( ( sfr = ast_smoother_read( member->inSmoother ) ) ){

			++i;
ast_log( AST_CONF_DEBUG , "\treading new frame [%d] from smoother, inFramesCount[%d], \n\tsfr->frametype -> %d , sfr->subclass -> %d , sfr->datalen => %d sfr->samples => %d\n", i , member->inFramesCount , sfr->frametype, sfr->subclass, sfr->datalen, sfr->samples);
ast_log (AST_CONF_DEBUG, "SMOOTH:Reading frame from inSmoother, i=>%d, timestamp => %ld.%ld\n",i, sfr->delivery.tv_sec, sfr->delivery.tv_usec);
			conf_frame* cfr = create_conf_frame( member, member->inFrames, sfr ) ;
			if ( cfr == NULL )
			{
				ast_log( LOG_ERROR, "unable to malloc conf_frame\n" ) ;
				ast_mutex_unlock(&member->lock);
				return -1 ;
			}

			//
			// add new frame to speaking members incoming frame queue
			// ( i.e. save this frame data, so we can distribute it in conference_exec later )
			//

			if ( member->inFrames == NULL ) {
				member->inFramesTail = cfr ;
			}
			member->inFrames = cfr ;
			member->inFramesCount++ ;
		}
	}
	ast_mutex_unlock(&member->lock);
	return 0 ;
}

//
// outgoing frame functions
//

conf_frame* get_outgoing_frame( struct ast_conf_member *member )
{
	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to get frame from null member\n" ) ;
		return NULL ;
	}

	conf_frame* cfr ;

	// ast_log( AST_CONF_DEBUG, "getting member frames, count => %d\n", member->outFramesCount ) ;

	ast_mutex_lock(&member->lock);

	if ( member->outFramesCount > AST_CONF_MIN_QUEUE )
	{
		cfr = member->outFramesTail ;

		// if it's the only frame, reset the queu,
		// else, move the second frame to the front
		if ( member->outFramesTail == member->outFrames )
		{
			member->outFrames = NULL ;
			member->outFramesTail = NULL ;
		}
		else
		{
			// move the pointer to the next frame
			member->outFramesTail = member->outFramesTail->prev ;

			// reset it's 'next' pointer
			if ( member->outFramesTail != NULL )
				member->outFramesTail->next = NULL ;
		}

		// separate the conf frame from the list
		cfr->next = NULL ;
		cfr->prev = NULL ;

		// decriment frame count
		member->outFramesCount-- ;
		ast_mutex_unlock(&member->lock);
		return cfr ;
	}
	ast_mutex_unlock(&member->lock);
	return NULL ;
}

int __queue_outgoing_frame( struct ast_conf_member* member, const struct ast_frame* fr, struct timeval delivery )
{
	// accounting: count the number of outgoing frames for this member
	member->frames_out++ ;

	//
	// we have to drop frames, so we'll drop new frames
	// because it's easier ( and doesn't matter much anyway ).
	//
	if ( member->outFramesCount >= AST_CONF_MAX_QUEUE )
	{
		ast_log(
			AST_CONF_DEBUG,
			"unable to queue outgoing frame, channel => %s, incoming => %d, outgoing => %d\n",
			member->channel_name, member->inFramesCount, member->outFramesCount
		) ;

		// accounting: count dropped outgoing frames
		member->frames_out_dropped++ ;
		return -1 ;
	}

	//
	// create new conf frame from passed data frame
	//

	conf_frame* cfr = create_conf_frame( member, member->outFrames, fr ) ;

	if ( cfr == NULL )
	{
		ast_log( LOG_ERROR, "unable to create new conf frame\n" ) ;

		// accounting: count dropped outgoing frames
		member->frames_out_dropped++ ;
		return -1 ;
	}

	// set delivery timestamp
	cfr->fr->delivery = delivery ;

	//
	// add new frame to speaking members incoming frame queue
	// ( i.e. save this frame data, so we can distribute it in conference_exec later )
	//

	if ( member->outFrames == NULL ) {
		member->outFramesTail = cfr ;
	}
	member->outFrames = cfr ;
	member->outFramesCount++ ;

	// return success
	return 0 ;
}

int queue_outgoing_frame( struct ast_conf_member* member, const struct ast_frame* fr, struct timeval delivery )
{
	// check on frame
	if ( fr == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue null frame\n" ) ;
		return -1 ;
	}

	// check on member
	if ( member == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue frame for null member\n" ) ;
		return -1 ;
	}

	if ( ( member->outPacker == NULL ) && ( member->smooth_multiple > 1 ) && ( member->smooth_size_out > 0 ) ){
		//ast_log (AST_CONF_DEBUG, "creating outPacker with size => %d \n\t( multiple => %d ) * ( size => %d )\n", member->smooth_multiple * member-> smooth_size_out, member->smooth_multiple , member->smooth_size_out);
		member->outPacker = ast_packer_new( member->smooth_multiple * member->smooth_size_out);
	}

	if (member->outPacker == NULL ){
		return __queue_outgoing_frame( member, fr, delivery ) ;
	}
	else
	{
		struct ast_frame *sfr;
		int exitval = 0;
//ast_log (AST_CONF_DEBUG, "sending fr into outPacker, datalen=>%d, samples=>%d\n",fr->datalen, fr->samples);
		ast_packer_feed( member->outPacker , fr );
		while( (sfr = ast_packer_read( member->outPacker ) ) )
		{
//ast_log (AST_CONF_DEBUG, "read sfr from outPacker, datalen=>%d, samples=>%d\n",sfr->datalen, sfr->samples);
			if ( __queue_outgoing_frame( member, sfr, delivery ) == -1 ) {
				exitval = -1;
			}
		}

		return exitval;
	}
}

//
// outgoing frame functions
//
#ifdef	VIDEO
conf_frame* get_outgoing_video_frame( struct ast_conf_member *member )
{
	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to get frame from null member\n" ) ;
		return NULL ;
	}

	conf_frame* cfr ;

	ast_mutex_lock(&member->lock);

	// ast_log( AST_CONF_DEBUG, "getting member frames, count => %d\n", member->outFramesCount ) ;

	if ( member->outVideoFramesCount > AST_CONF_MIN_QUEUE )
	{
		cfr = member->outVideoFramesTail ;

		// if it's the only frame, reset the queu,
		// else, move the second frame to the front
		if ( member->outVideoFramesTail == member->outVideoFrames )
		{
			member->outVideoFrames = NULL ;
			member->outVideoFramesTail = NULL ;
		}
		else
		{
			// move the pointer to the next frame
			member->outVideoFramesTail = member->outVideoFramesTail->prev ;

			// reset it's 'next' pointer
			if ( member->outVideoFramesTail != NULL )
				member->outVideoFramesTail->next = NULL ;
		}

		// separate the conf frame from the list
		cfr->next = NULL ;
		cfr->prev = NULL ;

		// decriment frame count
		member->outVideoFramesCount-- ;
		ast_mutex_unlock(&member->lock);
		return cfr ;
	}

	ast_mutex_unlock(&member->lock);
	return NULL ;
}



int queue_outgoing_video_frame( struct ast_conf_member* member, const struct ast_frame* fr, struct timeval delivery )
{
	// check on frame
	if ( fr == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue null frame\n" ) ;
		return -1 ;
	}

	// check on member
	if ( member == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue frame for null member\n" ) ;
		return -1 ;
	}

	ast_mutex_lock(&member->lock);

	// accounting: count the number of outgoing frames for this member
	member->video_frames_out++ ;

	//
	// we have to drop frames, so we'll drop new frames
	// because it's easier ( and doesn't matter much anyway ).
	//
	if ( member->outVideoFramesCount >= AST_CONF_MAX_VIDEO_QUEUE)
	{
		ast_log(
			AST_CONF_DEBUG,
			"unable to queue outgoing VIDEO frame, channel => %s, incoming => %d, outgoing => %d\n",
			member->channel_name, member->inVideoFramesCount, member->outVideoFramesCount
		) ;

		// accounting: count dropped outgoing frames
		member->video_frames_out_dropped++ ;
		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

	//
	// create new conf frame from passed data frame
	//

	conf_frame* cfr = create_conf_frame( member, member->outVideoFrames, fr ) ;

	if ( cfr == NULL )
	{
		ast_log( LOG_ERROR, "unable to create new conf frame\n" ) ;

		// accounting: count dropped outgoing frames
		member->video_frames_out_dropped++ ;
                ast_mutex_unlock(&member->lock);
		return -1 ;
	}

	// set delivery timestamp
#ifdef VIDEO_SETTIMESTAMP
	cfr->fr->delivery = delivery ;
#else
	cfr->fr->delivery.tv_sec = 0;
	cfr->fr->delivery.tv_usec = 0;
#endif
	//ast_log (LOG_WARNING,"%d\n",cfr->fr->seqno);

#ifdef RTP_SEQNO_ZERO
	cfr->fr->seqno = 0;
#endif

	if ( member->outVideoFrames == NULL )
	{
		// this is the first frame in the buffer
		member->outVideoFramesTail = cfr ;
		member->outVideoFrames = cfr ;
	}
	else
	{
		// put the new frame at the head of the list
		member->outVideoFrames = cfr ;
	}

	// increment member frame count
	member->outVideoFramesCount++ ;

	ast_mutex_unlock(&member->lock);

	// return success
	return 0 ;
}
#endif
#ifdef	DTMF
conf_frame* get_outgoing_dtmf_frame( struct ast_conf_member *member )
{
	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to get frame from null member\n" ) ;
		return NULL ;
	}

	conf_frame* cfr ;

	// ast_log( AST_CONF_DEBUG, "getting member frames, count => %d\n", member->outFramesCount ) ;

	ast_mutex_lock(&member->lock);

	if ( member->outDTMFFramesCount > AST_CONF_MIN_QUEUE )
	{
		cfr = member->outDTMFFramesTail ;

		// if it's the only frame, reset the queu,
		// else, move the second frame to the front
		if ( member->outDTMFFramesTail == member->outDTMFFrames )
		{
			member->outDTMFFrames = NULL ;
			member->outDTMFFramesTail = NULL ;
		}
		else
		{
			// move the pointer to the next frame
			member->outDTMFFramesTail = member->outDTMFFramesTail->prev ;

			// reset it's 'next' pointer
			if ( member->outDTMFFramesTail != NULL )
				member->outDTMFFramesTail->next = NULL ;
		}

		// separate the conf frame from the list
		cfr->next = NULL ;
		cfr->prev = NULL ;

		// decriment frame count
		member->outDTMFFramesCount-- ;
		ast_mutex_unlock(&member->lock);
		return cfr ;
	}
	ast_mutex_unlock(&member->lock);
	return NULL ;
}
#endif
#ifdef	TEXT
conf_frame* get_outgoing_text_frame( struct ast_conf_member *member )
{
	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to get frame from null member\n" ) ;
		return NULL ;
	}

	conf_frame* cfr ;

	// ast_log( AST_CONF_DEBUG, "getting member frames, count => %d\n", member->outFramesCount ) ;

	ast_mutex_lock(&member->lock);

	if ( member->outTextFramesCount > AST_CONF_MIN_QUEUE )
	{
		cfr = member->outTextFramesTail ;

		// if it's the only frame, reset the queu,
		// else, move the second frame to the front
		if ( member->outTextFramesTail == member->outTextFrames )
		{
			member->outTextFrames = NULL ;
			member->outTextFramesTail = NULL ;
		}
		else
		{
			// move the pointer to the next frame
			member->outTextFramesTail = member->outTextFramesTail->prev ;

			// reset it's 'next' pointer
			if ( member->outTextFramesTail != NULL )
				member->outTextFramesTail->next = NULL ;
		}

		// separate the conf frame from the list
		cfr->next = NULL ;
		cfr->prev = NULL ;

		// decriment frame count
		member->outTextFramesCount-- ;
		ast_mutex_unlock(&member->lock);
		return cfr ;
	}
	ast_mutex_unlock(&member->lock);
	return NULL ;
}
#endif
#ifdef	DTMF
int queue_outgoing_dtmf_frame( struct ast_conf_member* member, const struct ast_frame* fr )
{
	// check on frame
	if ( fr == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue null frame\n" ) ;
		return -1 ;
	}

	// check on member
	if ( member == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue frame for null member\n" ) ;
		return -1 ;
	}

	ast_mutex_lock(&member->lock);

	// accounting: count the number of outgoing frames for this member
	member->dtmf_frames_out++ ;

	//
	// we have to drop frames, so we'll drop new frames
	// because it's easier ( and doesn't matter much anyway ).
	//
	if ( member->outDTMFFramesCount >= AST_CONF_MAX_DTMF_QUEUE)
	{
		ast_log(
			AST_CONF_DEBUG,
			"unable to queue outgoing DTMF frame, channel => %s, incoming => %d, outgoing => %d\n",
			member->channel_name, member->inDTMFFramesCount, member->outDTMFFramesCount
		) ;

		// accounting: count dropped outgoing frames
		member->dtmf_frames_out_dropped++ ;
		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

	//
	// create new conf frame from passed data frame
	//

	conf_frame* cfr = create_conf_frame( member, member->outDTMFFrames, fr ) ;

	if ( cfr == NULL )
	{
		ast_log( LOG_ERROR, "unable to create new conf frame\n" ) ;

		// accounting: count dropped outgoing frames
		member->dtmf_frames_out_dropped++ ;
		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

#ifdef RTP_SEQNO_ZERO
	cfr->fr->seqno = 0;
#endif

	if ( member->outDTMFFrames == NULL )
	{
		// this is the first frame in the buffer
		member->outDTMFFramesTail = cfr ;
		member->outDTMFFrames = cfr ;
	}
	else
	{
		// put the new frame at the head of the list
		member->outDTMFFrames = cfr ;
	}

	// increment member frame count
	member->outDTMFFramesCount++ ;

	ast_mutex_unlock(&member->lock);
	// return success
	return 0 ;
}
#endif
#ifdef	TEXT
int queue_outgoing_text_frame( struct ast_conf_member* member, const struct ast_frame* fr)
{
	// check on frame
	if ( fr == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue null frame\n" ) ;
		return -1 ;
	}

	// check on member
	if ( member == NULL )
	{
		ast_log( LOG_ERROR, "unable to queue frame for null member\n" ) ;
		return -1 ;
	}

	ast_mutex_lock(&member->lock);

	// accounting: count the number of outgoing frames for this member
	member->text_frames_out++ ;

	//
	// we have to drop frames, so we'll drop new frames
	// because it's easier ( and doesn't matter much anyway ).
	//
	if ( member->outTextFramesCount >= AST_CONF_MAX_TEXT_QUEUE)
	{
		ast_log(
			AST_CONF_DEBUG,
			"unable to queue outgoing text frame, channel => %s, incoming => %d, outgoing => %d\n",
			member->channel_name, member->inTextFramesCount, member->outTextFramesCount
		) ;

		// accounting: count dropped outgoing frames
		member->text_frames_out_dropped++ ;
		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

	//
	// create new conf frame from passed data frame
	//

	conf_frame* cfr = create_conf_frame( member, member->outTextFrames, fr ) ;

	if ( cfr == NULL )
	{
		ast_log( LOG_ERROR, "unable to create new conf frame\n" ) ;

		// accounting: count dropped outgoing frames
		member->text_frames_out_dropped++ ;
		ast_mutex_unlock(&member->lock);
		return -1 ;
	}

#ifdef RTP_SEQNO_ZERO
	cfr->fr->seqno = 0;
#endif

	if ( member->outTextFrames == NULL )
	{
		// this is the first frame in the buffer
		member->outTextFramesTail = cfr ;
		member->outTextFrames = cfr ;
	}
	else
	{
		// put the new frame at the head of the list
		member->outTextFrames = cfr ;
	}

	// increment member frame count
	member->outTextFramesCount++ ;

	ast_mutex_unlock(&member->lock);
	// return success
	return 0 ;
}
#endif

//
// manager functions
//

void send_state_change_notifications( struct ast_conf_member* member )
{
	// ast_log( AST_CONF_DEBUG, "sending state change notification\n" ) ;

	// loop through list of members, sending state changes
	while ( member != NULL )
	{
		// has the state changed since last time through this loop?
		if ( member->speaking_state_notify )
		{
			manager_event(
				EVENT_FLAG_CALL,
				"ConferenceState",
				"Channel: %s\r\n"
				"Flags: %s\r\n"
				"State: %s\r\n",
				member->channel_name,
				member->flags,
				( ( member->speaking_state == 1 ) ? "speaking" : "silent" )
			) ;

			ast_log( AST_CONF_DEBUG, "member state changed, channel => %s, state => %d, incoming => %d, outgoing => %d\n",
				member->channel_name, member->speaking_state, member->inFramesCount, member->outFramesCount ) ;

			member->speaking_state_notify = 0;
		}

		// move the pointer to the next member
		member = member->next ;
	}

	return ;
}

//
// ast_packer, adapted from ast_smoother
// pack multiple frames together into one packet on the wire.
//

#define PACKER_SIZE  8000
#define PACKER_QUEUE 10 // store at most 10 complete packets in the queue

struct ast_packer {
	int framesize; // number of frames per packet on the wire.
	int size;
	int packet_index;
	int format;
	int readdata;
	int optimizablestream;
	int flags;
	float samplesperbyte;
	struct ast_frame f;
	struct timeval delivery;
	char data[PACKER_SIZE];
	char framedata[PACKER_SIZE + AST_FRIENDLY_OFFSET];
	int samples;
	int sample_queue[PACKER_QUEUE];
	int len_queue[PACKER_QUEUE];
	struct ast_frame *opt;
	int len;
};

void ast_packer_reset(struct ast_packer *s, int framesize)
{
	memset(s, 0, sizeof(struct ast_packer));
	s->framesize = framesize;
	s->packet_index=0;
	s->len=0;
}

struct ast_packer *ast_packer_new(int framesize)
{
	struct ast_packer *s;
	if (framesize < 1)
		return NULL;
	s = malloc(sizeof(struct ast_packer));
	if (s)
		ast_packer_reset(s, framesize);
	return s;
}

int ast_packer_get_flags(struct ast_packer *s)
{
	return s->flags;
}

void ast_packer_set_flags(struct ast_packer *s, int flags)
{
	s->flags = flags;
}

int ast_packer_feed(struct ast_packer *s, const struct ast_frame *f)
{
	if (f->frametype != AST_FRAME_VOICE) {
		ast_log(LOG_WARNING, "Huh?  Can't pack a non-voice frame!\n");
		return -1;
	}
	if (!s->format) {
		s->format = f->subclass;
		s->samples=0;
	} else if (s->format != f->subclass) {
		ast_log(LOG_WARNING, "Packer was working on %d format frames, now trying to feed %d?\n", s->format, f->subclass);
		return -1;
	}
	if (s->len + f->datalen > PACKER_SIZE) {
		ast_log(LOG_WARNING, "Out of packer space\n");
		return -1;
	}
	if (s->packet_index >= PACKER_QUEUE ){
		ast_log(LOG_WARNING, "Out of packer queue space\n");
		return -1;
	}

	memcpy(s->data + s->len, CASTDATA2PTR(f->data, void), f->datalen);
	/* If either side is empty, reset the delivery time */
	if (!s->len || (!f->delivery.tv_sec && !f->delivery.tv_usec) ||
			(!s->delivery.tv_sec && !s->delivery.tv_usec))
		s->delivery = f->delivery;
	s->len += f->datalen;
//packer stuff
	s->len_queue[s->packet_index]    += f->datalen;
	s->sample_queue[s->packet_index] += f->samples;
	s->samples += f->samples;

	if (s->samples > s->framesize )
		++s->packet_index;

	return 0;
}

struct ast_frame *ast_packer_read(struct ast_packer *s)
{
	struct ast_frame *opt;
	int len;
	/* IF we have an optimization frame, send it */
	if (s->opt) {
		opt = s->opt;
		s->opt = NULL;
		return opt;
	}

	/* Make sure we have enough data */
	if (s->samples < s->framesize ){
			return NULL;
	}
	len = s->len_queue[0];
	if (len > s->len)
		len = s->len;
	/* Make frame */
	s->f.frametype = AST_FRAME_VOICE;
	s->f.subclass = s->format;
	SETDATA2PTR(s->f.data, s->framedata + AST_FRIENDLY_OFFSET);
	s->f.offset = AST_FRIENDLY_OFFSET;
	s->f.datalen = len;
	s->f.samples = s->sample_queue[0];
	s->f.delivery = s->delivery;
	/* Fill Data */
	memcpy(CASTDATA2PTR(s->f.data, void), s->data, len);
	s->len -= len;
	/* Move remaining data to the front if applicable */
	if (s->len) {
		/* In principle this should all be fine because if we are sending
		   G.729 VAD, the next timestamp will take over anyawy */
		memmove(s->data, s->data + len, s->len);
		if (s->delivery.tv_sec || s->delivery.tv_usec) {
			/* If we have delivery time, increment it, otherwise, leave it at 0 */
			s->delivery.tv_sec +=  s->sample_queue[0] / 8000.0;
			s->delivery.tv_usec += (((int)(s->sample_queue[0])) % 8000) * 125;
			if (s->delivery.tv_usec > 1000000) {
				s->delivery.tv_usec -= 1000000;
				s->delivery.tv_sec += 1;
			}
		}
	}
	int j;
	s->samples -= s->sample_queue[0];
	if( s->packet_index > 0 ){
		for (j=0; j<s->packet_index -1 ; j++){
			s->len_queue[j]=s->len_queue[j+1];
			s->sample_queue[j]=s->sample_queue[j+1];
		}
		s->len_queue[s->packet_index]=0;
		s->sample_queue[s->packet_index]=0;
		s->packet_index--;
	} else {
		s->len_queue[0]=0;
		s->sample_queue[0]=0;
	}


	/* Return frame */
	return &s->f;
}

void ast_packer_free(struct ast_packer *s)
{
	free(s);
}

int queue_frame_for_listener(
	struct ast_conference* conf,
	struct ast_conf_member* member,
	conf_frame* frame
)
{
	//
	// check inputs
	//

	if ( conf == NULL )
	{
		ast_log( LOG_WARNING, "unable to queue listener frame with null conference\n" ) ;
		return -1 ;
	}

	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to queue listener frame with null member\n" ) ;
		return -1 ;
	}

	//
	// loop over spoken frames looking for member's appropriate match
	//

	short found_flag = 0 ;
	struct ast_frame* qf ;

	for ( ; frame != NULL ; frame = frame->next )
	{
		// we're looking for a null or matching member
		if ( frame->member != NULL && frame->member != member )
			continue ;

		if ( frame->fr == NULL )
		{
			ast_log( LOG_WARNING, "unknown error queueing frame for listener, frame->fr == NULL\n" ) ;
			continue ;
		}

		// first, try for a pre-converted frame
		qf = (member->listen_volume == 0 ? frame->converted[ member->write_format_index ] : 0);

		// convert ( and store ) the frame
		if ( qf == NULL )
		{
			// make a copy of the slinear version of the frame
			qf = ast_frdup( frame->fr ) ;

			if (member->listen_volume != 0)
			{
				ast_frame_adjust_volume(qf, member->listen_volume);
			}

			if ( qf == NULL )
			{
				ast_log( LOG_WARNING, "unable to duplicate frame\n" ) ;
				continue ;
			}

			// convert using the conference's translation path
			qf = convert_frame_from_slinear( conf->from_slinear_paths[ member->write_format_index ], qf ) ;

			// store the converted frame
			// ( the frame will be free'd next time through the loop )
			if (member->listen_volume == 0)
			{
				frame->converted[ member->write_format_index ] = qf ;
			}
		}

		if ( qf != NULL )
		{
			// duplicate the frame before queue'ing it
			// ( since this member doesn't own this _shared_ frame )
			// qf = ast_frdup( qf ) ;



			if ( queue_outgoing_frame( member, qf, conf->delivery_time ) != 0 )
			{
				// free the new frame if it couldn't be queue'd
				// XXX NEILS - WOULD BE FREED IN CLEANUPast_frfree( qf ) ;
				//qf = NULL ;
			}

			if (member->listen_volume != 0)
			{
				// free frame ( the translator's copy )
				ast_frfree( qf ) ;
			}
		}
		else
		{
			ast_log( LOG_WARNING, "unable to translate outgoing listener frame, channel => %s\n", member->channel_name ) ;
		}

		// set found flag
		found_flag = 1 ;

		// break from for loop
		break ;
	}

	// queue a silent frame
	if ( found_flag == 0 )
		queue_silent_frame( conf, member ) ;

	return 0 ;
}


int queue_frame_for_speaker(
	struct ast_conference* conf,
	struct ast_conf_member* member,
	conf_frame* frame
)
{
	//
	// check inputs
	//

	if ( conf == NULL )
	{
		ast_log( LOG_WARNING, "unable to queue speaker frame with null conference\n" ) ;
		return -1 ;
	}

	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to queue speaker frame with null member\n" ) ;
		return -1 ;
	}

	//
	// loop over spoken frames looking for member's appropriate match
	//

	short found_flag = 0 ;
	struct ast_frame* qf ;

	for ( ; frame != NULL ; frame = frame->next )
	{
		if ( frame->member != member )
		{
			continue ;
		}

		if ( frame->fr == NULL )
		{
			ast_log( LOG_WARNING, "unable to queue speaker frame with null data\n" ) ;
			continue ;
		}

		//
		// convert and queue frame
		//

		// short-cut pointer to the ast_frame
		qf = frame->fr ;

		if ( (qf->subclass == member->write_format) && (member->listen_volume == 0) )
		{
			// frame is already in correct format, so just queue it

			queue_outgoing_frame( member, qf, conf->delivery_time ) ;
		}
		else
		{
			// make a copy of the slinear version of the frame
			qf = ast_frdup( qf ) ;

			if (member->listen_volume != 0)
			{
				ast_frame_adjust_volume(frame->fr, member->listen_volume);
			}

			//
			// convert frame to member's write format
			// ( calling ast_frdup() to make sure the translator's copy sticks around )
			//
			qf = convert_frame_from_slinear( member->from_slinear, qf ) ;

			if ( qf != NULL )
			{
				// queue frame
				queue_outgoing_frame( member, qf, conf->delivery_time ) ;

				// free frame ( the translator's copy )
				ast_frfree( qf ) ;
			}
			else
			{
				ast_log( LOG_WARNING, "unable to translate outgoing speaker frame, channel => %s\n", member->channel_name ) ;
			}
		}

		// set found flag
		found_flag = 1 ;

		// we found the frame, skip to the next member
		break ;
	}

	// queue a silent frame
	if ( found_flag == 0 )
		queue_silent_frame( conf, member ) ;

	return 0 ;
}


int queue_silent_frame(
	struct ast_conference* conf,
	struct ast_conf_member* member
)
{
  int c;
#ifdef APP_KONFERENCE_DEBUG
	//
	// check inputs
	//

	if ( conf == NULL )
	{
		ast_log( AST_CONF_DEBUG, "unable to queue silent frame for null conference\n" ) ;
		return -1 ;
	}

	if ( member == NULL )
	{
		ast_log( AST_CONF_DEBUG, "unable to queue silent frame for null member\n" ) ;
		return -1 ;
	}
#endif // APP_KONFERENCE_DEBUG

	//
	// initialize static variables
	//

	static conf_frame* silent_frame = NULL ;
	static struct ast_frame* qf = NULL ;

	if ( silent_frame == NULL )
	{
		if ( ( silent_frame = get_silent_frame() ) == NULL )
		{
			ast_log( LOG_WARNING, "unable to initialize static silent frame\n" ) ;
			return -1 ;
		}
	}


	// get the appropriate silent frame
	qf = silent_frame->converted[ member->write_format_index ] ;

	if ( qf == NULL )
	{
		//
		// we need to do this to avoid echo on the speaker's line.
		// translators seem to be single-purpose, i.e. they
		// can't be used simultaneously for multiple audio streams
		//

		struct ast_trans_pvt* trans = ast_translator_build_path( member->write_format, AST_FORMAT_SLINEAR ) ;

		if ( trans != NULL )
		{
			// attempt ( five times ) to get a silent frame
			// to make sure we provice the translator with enough data
			for ( c = 0 ; c < 5 ; ++c )
			{
				// translate the frame
				qf = ast_translate( trans, silent_frame->fr, 0 ) ;

				// break if we get a frame
				if ( qf != NULL ) break ;
			}

			if ( qf != NULL )
			{
				// isolate the frame so we can keep it around after trans is free'd
				qf = ast_frisolate( qf ) ;

				// cache the new, isolated frame
				silent_frame->converted[ member->write_format_index ] = qf ;
			}

			ast_translator_free_path( trans ) ;
		}
	}

	//
	// queue the frame, if it's not null,
	// otherwise there was an error
	//
	if ( qf != NULL )
	{
		queue_outgoing_frame( member, qf, conf->delivery_time ) ;
	}
	else
	{
		ast_log( LOG_ERROR, "unable to translate outgoing silent frame, channel => %s\n", member->channel_name ) ;
	}

	return 0 ;
}



void member_process_outgoing_frames(struct ast_conference* conf,
				  struct ast_conf_member *member,
				  struct conf_frame *send_frames)
{
	ast_mutex_lock(&member->lock);

	// skip members that are not ready
	if ( member->ready_for_outgoing == 0 )
	{
		ast_mutex_unlock(&member->lock);
		return ;
	}

	// skip no receive audio clients
	if ( member->norecv_audio )
	{
		ast_mutex_unlock(&member->lock);
		return;
	}

	if ( member->local_speaking_state == 0 )
	{
		// queue listener frame
		queue_frame_for_listener( conf, member, send_frames ) ;
	}
	else
	{
		// queue speaker frame
		queue_frame_for_speaker( conf, member, send_frames ) ;
	}
	ast_mutex_unlock(&member->lock);
}

// Functions that will increase and decrease speaker_count in a secure way, locking the member mutex if required
// Will also set speaking_state flag.
// Returns the previous speaking state
int increment_speaker_count(struct ast_conf_member *member, int lock)
{
	int old_state;

	if ( lock )
		ast_mutex_lock(&member->lock);

	old_state = member->speaking_state;
	member->speaker_count++;
	member->speaking_state = 1;

	ast_log(AST_CONF_DEBUG, "Increment speaker count: id=%d, count=%d\n", member->id, member->speaker_count);

	// If this is a state change, update the timestamp
	if ( old_state == 0 )
	{
		member->speaking_state_notify = 1;
		member->last_state_change = ast_tvnow();
	}

	if ( lock )
		ast_mutex_unlock(&member->lock);

	return old_state;
}

int decrement_speaker_count(struct ast_conf_member *member, int lock)
{
	int old_state;

	if ( lock )
		ast_mutex_lock(&member->lock);

	old_state = member->speaking_state;
	if ( member->speaker_count > 0 )
		member->speaker_count--;
	if ( member->speaker_count == 0 )
		member->speaking_state = 0;

	ast_log(AST_CONF_DEBUG, "Decrement speaker count: id=%d, count=%d\n", member->id, member->speaker_count);

	// If this is a state change, update the timestamp
	if ( old_state == 1 && member->speaking_state == 0 )
	{
		member->speaking_state_notify = 1;
		member->last_state_change = ast_tvnow();
	}

	if ( lock )
		ast_mutex_unlock(&member->lock);

	return old_state;
}

void member_process_spoken_frames(struct ast_conference* conf,
				 struct ast_conf_member *member,
				 struct conf_frame **spoken_frames,
				 long time_diff,
				 int *listener_count,
				 int *speaker_count
	)
{
	struct conf_frame *cfr;

	// acquire member mutex
	TIMELOG(ast_mutex_lock( &member->lock ),1,"conf thread member lock") ;

	// tell member the number of frames we're going to need ( used to help dropping algorithm )
	member->inFramesNeeded = ( time_diff / AST_CONF_FRAME_INTERVAL ) - 1 ;

	// !!! TESTING !!!
	if (
		conf->debug_flag == 1
		&& member->inFramesNeeded > 0
		)
	{
		ast_log( AST_CONF_DEBUG, "channel => %s, inFramesNeeded => %d, inFramesCount => %d\n",
			 member->channel_name, member->inFramesNeeded, member->inFramesCount ) ;
	}

	// non-listener member should have frames,
	// unless silence detection dropped them
	cfr = get_incoming_frame( member ) ;

	// handle retrieved frames
	if ( cfr == NULL || cfr->fr == NULL )
	{
		// Decrement speaker count for us and for driven members
		// This happens only for the first missed frame, since we want to
		// decrement only on state transitions
		if ( member->local_speaking_state == 1 )
		{
			decrement_speaker_count(member, 0);
			member->local_speaking_state = 0;
			// If we're driving another member, decrement its speaker count as well
#ifdef	VIDEO
			if ( member->driven_member != NULL )
				decrement_speaker_count(member->driven_member, 1);
#endif
		}

		// count the listeners
		(*listener_count)++ ;
	}
	else
	{
		// append the frame to the list of spoken frames
		if ( *spoken_frames != NULL )
		{
			// add new frame to end of list
			cfr->next = *spoken_frames ;
			(*spoken_frames)->prev = cfr ;
		}

		// point the list at the new frame
		*spoken_frames = cfr ;

		// Increment speaker count for us and for driven members
		// This happens only on the first received frame, since we want to
		// increment only on state transitions
		if ( member->local_speaking_state == 0 )
		{
			increment_speaker_count(member, 0);
			member->local_speaking_state = 1;
#ifdef	VIDEO
			// If we're driving another member, increment its speaker count as well
			if ( member->driven_member != NULL )
				increment_speaker_count(member->driven_member, 1);
#endif
		}

		// count the speakers
		(*speaker_count)++ ;
	}

	// release member mutex
	ast_mutex_unlock( &member->lock ) ;

	return;
}
#ifdef	VIDEO
int is_video_eligible(struct ast_conf_member *member)
{
	if ( member == NULL )
		return 0;
	
	return !member->no_camera && !member->mute_video && !member->via_telephone;
}

// Member start and stop video methods
void start_video(struct ast_conf_member *member)
{
	if ( member == NULL || member->video_started || !is_video_eligible(member))
		return;
#ifdef	TEXT
	send_text_message_to_member(member, AST_CONF_CONTROL_START_VIDEO);
#endif
	member->video_started = 1;
}

void stop_video(struct ast_conf_member *member)
{
	if ( member == NULL || !member->video_started )
		return;
#ifdef  TEXT
	send_text_message_to_member(member, AST_CONF_CONTROL_STOP_VIDEO);
#endif
	member->video_started = 0;

}
#endif
