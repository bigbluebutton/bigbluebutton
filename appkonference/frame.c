
// $Id: frame.c 751 2006-12-11 22:08:45Z sbalea $

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

#include "asterisk/autoconfig.h"
#include "frame.h"

conf_frame* mix_frames( conf_frame* frames_in, int speaker_count, int listener_count, int volume )
{
	if ( frames_in == NULL )
		return NULL ;

	conf_frame* frames_out = NULL ;

	if ( speaker_count > 1 )
	{
		if ( speaker_count == 2 && listener_count == 0 )
		{
			// optimize here also?
			frames_out = mix_multiple_speakers( frames_in, speaker_count, listener_count, volume ) ;
		}
		else
		{
			// mix spoken frames for sending
			// ( note: this call also releases us from free'ing spoken_frames )
			frames_out = mix_multiple_speakers( frames_in, speaker_count, listener_count, volume ) ;
		}
	}
	else if ( speaker_count == 1 )
	{
		// pass-through frames
		frames_out = mix_single_speaker( frames_in, volume ) ;
		//printf("mix single speaker\n");
	}
	else
	{
		// no frames to send, leave frames_out null
	}

	return frames_out ;
}

conf_frame* mix_single_speaker( conf_frame* frames_in, int volume )
{
#ifdef APP_KONFERENCE_DEBUG
	// ast_log( AST_CONF_DEBUG, "returning single spoken frame\n" ) ;

	//
	// check input
	//

	if ( frames_in == NULL )
	{
		ast_log( AST_CONF_DEBUG, "unable to mix single spoken frame with null frame\n" ) ;
		return NULL ;
	}

	if ( frames_in->fr == NULL )
	{
		ast_log( AST_CONF_DEBUG, "unable to mix single spoken frame with null data\n" ) ;
		return NULL ;
	}

	if ( frames_in->member == NULL )
	{
		ast_log( AST_CONF_DEBUG, "unable to mix single spoken frame with null member\n" ) ;
		return NULL ;
	}
#endif // APP_KONFERENCE_DEBUG

	//
	// 'mix' the frame
	//

	// copy orignal frame to converted array so listeners don't need to re-encode it
	frames_in->converted[ frames_in->member->read_format_index ] = ast_frdup( frames_in->fr ) ;

	// convert frame to slinear, if we have a path
	frames_in->fr = convert_frame_to_slinear(
		frames_in->member->to_slinear,
		frames_in->fr
	) ;

	if ( (frames_in->member->talk_volume != 0) || (volume != 0) )
	{
		ast_frame_adjust_volume(frames_in->fr, frames_in->member->talk_volume + volume);
	}

	if ( frames_in->member->spyee_channel_name == NULL )
	{
		// set frame's spy partner
		frames_in->spy_partner = frames_in->member->spy_partner ;

		// set the frame's member to null ( i.e. all listeners )
		frames_in->member = NULL ;
	}
	else
		frames_in->member = frames_in->member->spy_partner ;

	return frames_in ;
}

// {
	//
	// a little optimization for testing only:
	// when two speakers ( of the same type ) and no listeners
	// are in a conference, we just swamp the frame's member pointers
	//
/*
	if (
		listeners == 0
		&& speakers == 2
		&& cf_spokenFrames->member->read_format == cf_spokenFrames->next->member->write_format
		&& cf_spokenFrames->member->write_format == cf_spokenFrames->next->member->read_format
	)
	{
		struct ast_conf_member* m = NULL ;
		m = cf_spokenFrames->member ;
		cf_spokenFrames->member = cf_spokenFrames->next->member ;
		cf_spokenFrames->next->member = m ;
		return cf_spokenFrames ;
	}
*/
// }

void set_conf_frame_delivery( conf_frame* frame, struct timeval time )
{
	for ( ; frame != NULL ; frame = frame->next )
	{
		if ( frame->fr != NULL )
		{
			// copy passed timeval to frame's delivery timeval
			frame->fr->delivery = time ;
		}
	}

	return ;
}

conf_frame* mix_multiple_speakers(
	conf_frame* frames_in,
	int speakers,
	int listeners,
	int volume
)
{
#ifdef APP_KONFERENCE_DEBUG
	//
	// check input
	//

	// no frames to mix
	if ( ( frames_in == NULL ) || ( frames_in->fr == NULL ) )
	{
		ast_log( AST_CONF_DEBUG, "passed spoken frame list was NULL\n" ) ;
		return NULL ;
	}

	// if less than two speakers, then no frames to mix
	if ( speakers < 2 )
	{
		ast_log( AST_CONF_DEBUG, "mix_multiple_speakers() called with less than two speakers\n" ) ;
		return NULL ;
	}
#endif // APP_KONFERENCE_DEBUG

	//
	// at this point we know that there is more than one frame,
	// and that the frames need to be converted to pcm to be mixed
	//
	// now, if there are only two frames and two members,
	// we can swap them. ( but we'll get to that later. )
	//

	//
	// loop through the spoken frames, making a list of spoken members,
	// and converting gsm frames to slinear frames so we can mix them.
	//

	// pointer to the spoken frames list
	conf_frame* cf_spoken = frames_in ;

	// pointer to the new list of mixed frames
	conf_frame* cf_sendFrames = NULL ;

	while ( cf_spoken != NULL )
	{
		//
		// while we're looping through the spoken frames, we'll
		// convert the frame to a format suitable for mixing
		//
		// if the frame fails to convert, drop it and treat
		// the speaking member like a listener by not adding
		// them to the cf_sendFrames list
		//

		if ( cf_spoken->member == NULL )
		{
			ast_log( LOG_WARNING, "unable to determine frame member\n" ) ;
		}
		else
		{
			// ast_log( AST_CONF_DEBUG, "converting frame to slinear, channel => %s\n", cf_spoken->member->channel_name ) ;
			cf_spoken->fr = convert_frame_to_slinear(
				cf_spoken->member->to_slinear,
				cf_spoken->fr
			) ;

			if (( cf_spoken->member->talk_volume != 0 ) || (volume != 0))
			{
				ast_frame_adjust_volume(cf_spoken->fr, cf_spoken->member->talk_volume + volume);
			}

			if ( cf_spoken->fr == NULL )
			{
				ast_log( LOG_WARNING, "unable to convert frame to slinear\n" ) ;
			}
			else if ( cf_spoken->member->spyee_channel_name == NULL )
			{
				// create new conf frame with last frame as 'next'
				cf_sendFrames = create_conf_frame( cf_spoken->member, cf_sendFrames, NULL ) ;
			}
			else if ( cf_spoken->member->spy_partner->local_speaking_state == 0 )
			{
				cf_sendFrames = create_conf_frame( cf_spoken->member->spy_partner, cf_sendFrames, NULL ) ;
			}
		}

		// point to the next spoken frame
		cf_spoken = cf_spoken->next ;
	}

	// if necessary, add a frame with a null member pointer.
	// this frame will hold the audio mixed for all listeners
	if ( listeners > 0 )
	{
		cf_sendFrames = create_conf_frame( NULL, cf_sendFrames, NULL ) ;
	}

	//
	// mix the audio
	//

	// convenience pointer that skips over the friendly offset
	char* cp_listenerData ;

	// pointer to the send frames list
	conf_frame* cf_send = NULL ;

	for ( cf_send = cf_sendFrames ; cf_send != NULL ; cf_send = cf_send->next )
	{
		// allocate a mix buffer which fill large enough memory to
		// hold a frame, and reset it's memory so we don't get noise
		char* cp_listenerBuffer = malloc( AST_CONF_BUFFER_SIZE ) ;
		memset( cp_listenerBuffer, 0x0, AST_CONF_BUFFER_SIZE ) ;

		// point past the friendly offset right to the data
		cp_listenerData = cp_listenerBuffer + AST_FRIENDLY_OFFSET ;

		// reset the spoken list pointer
		cf_spoken = frames_in ;

		// really mix the audio
		for ( ; cf_spoken != NULL ; cf_spoken = cf_spoken->next )
		{
			//
			// if the members are equal, and they
			// are not null, do not mix them.
			//
			if (
				( cf_spoken->member == cf_send->member )
				|| ( cf_spoken->member->spyee_channel_name != NULL
					&& cf_spoken->member->spy_partner != cf_send->member)
			)
			{
				// don't mix this frame
			}
			else if ( cf_spoken->fr == NULL )
			{
				ast_log( LOG_WARNING, "unable to mix conf_frame with null ast_frame\n" ) ;
			}
			else
			{
				// mix the new frame in with the existing buffer
				mix_slinear_frames( cp_listenerData, CASTDATA2PTR(cf_spoken->fr->data, char), AST_CONF_BLOCK_SAMPLES);//XXX NAS cf_spoken->fr->samples ) ;
			}
		}

		// copy a pointer to the frame data to the conf_frame
		cf_send->mixed_buffer = cp_listenerData ;
	}

	//
	// copy the mixed buffer to a new frame
	//

	// reset the send list pointer
	cf_send = cf_sendFrames ;

	while ( cf_send != NULL )
	{
		cf_send->fr = create_slinear_frame( cf_send->mixed_buffer ) ;
		cf_send = cf_send->next ;
	}

	//
	// clean up the spoken frames we were passed
	// ( caller will only be responsible for free'ing returns frames )
	//

	// reset the spoken list pointer
	cf_spoken = frames_in ;

	while ( cf_spoken != NULL )
	{
		struct ast_conf_member *spy_partner = cf_spoken->member->spy_partner ;

		if ( spy_partner == NULL || cf_spoken->member->spyee_channel_name != NULL )
		{
			// delete the frame
			cf_spoken = delete_conf_frame( cf_spoken ) ;
		}
		else
		{
			// move the unmixed frame to sendFrames
			//  and indicate who it's for
			conf_frame *spy_frame = cf_spoken ;

			cf_spoken = cf_spoken->next;
			if ( cf_spoken != NULL )
				cf_spoken->prev = NULL;

			spy_frame->next = cf_sendFrames;
			cf_sendFrames->prev = spy_frame;
			spy_frame->prev = NULL;

			spy_frame->member = spy_partner;

			cf_sendFrames = spy_frame;
		}
	}

	// return the list of frames for sending
	return cf_sendFrames ;
}


struct ast_frame* convert_frame_to_slinear( struct ast_trans_pvt* trans, struct ast_frame* fr )
{
	// check for null frame
	if ( fr == NULL )
	{
		ast_log( LOG_ERROR, "unable to translate null frame to slinear\n" ) ;
		return NULL ;
	}

	// we don't need to duplicate this frame since
	// the normal translation would free it anyway, so
	// we'll just pretend we free'd and malloc'd a new one.
	if ( fr->subclass == AST_FORMAT_SLINEAR )
		return fr ;

	// check for null translator ( after we've checked that we need to translate )
	if ( trans == NULL )
	{
		ast_log( LOG_ERROR, "unable to translate frame with null translation path\n" ) ;
		return fr ;
	}

	// return the converted frame
	return convert_frame( trans, fr ) ;
}

struct ast_frame* convert_frame_from_slinear( struct ast_trans_pvt* trans, struct ast_frame* fr )
{
	// check for null translator ( after we've checked that we need to translate )
	if ( trans == NULL )
	{
		//ast_log( LOG_ERROR, "unable to translate frame with null translation path\n" ) ;
		return fr ;
	}

	// check for null frame
	if ( fr == NULL )
	{
		ast_log( LOG_ERROR, "unable to translate null slinear frame\n" ) ;
		return NULL ;
	}

	// if the frame is not slinear, return an error
	if ( fr->subclass != AST_FORMAT_SLINEAR )
	{
		ast_log( LOG_ERROR, "unable to translate non-slinear frame\n" ) ;
		return NULL ;
	}

	// return the converted frame
	return convert_frame( trans, fr ) ;
}

struct ast_frame* convert_frame( struct ast_trans_pvt* trans, struct ast_frame* fr )
{
	if ( trans == NULL )
	{
		ast_log( LOG_WARNING, "unable to convert frame with null translator\n" ) ;
		return NULL ;
	}

	if ( fr == NULL )
	{
		ast_log( LOG_WARNING, "unable to convert null frame\n" ) ;
		return NULL ;
	}

	// convert the frame
	struct ast_frame* translated_frame = ast_translate( trans, fr, 1 ) ;

	// check for errors
	if ( translated_frame == NULL )
	{
		ast_log( LOG_ERROR, "unable to translate frame\n" ) ;
		return NULL ;
	}

	// return the translated frame
	return translated_frame ;
}

conf_frame* delete_conf_frame( conf_frame* cf )
{
  int c;
	// check for null frames
	if ( cf == NULL )
	{
		ast_log( AST_CONF_DEBUG, "unable to delete null conf frame\n" ) ;
		return NULL ;
	}

	// check for frame marked as static
	if ( cf->static_frame == 1 )
		return NULL ;

	if ( cf->fr != NULL )
	{
		ast_frfree( cf->fr ) ;
		cf->fr = NULL ;
	}

	// make sure converted frames are set to null
	for ( c = 0 ; c < AC_SUPPORTED_FORMATS ; ++c )
	{
		if ( cf->converted[ c ] != NULL )
		{
			ast_frfree( cf->converted[ c ] ) ;
			cf->converted[ c ] = NULL ;
		}
	}

	// get a pointer to the next frame
	// in the list so we can return it
	conf_frame* nf = cf->next ;

	free( cf ) ;
	cf = NULL ;

	return nf ;
}

conf_frame* create_conf_frame( struct ast_conf_member* member, conf_frame* next, const struct ast_frame* fr )
{
	// pointer to list of mixed frames
	conf_frame* cf = malloc( sizeof( struct conf_frame ) ) ;

	if ( cf == NULL )
	{
		ast_log( LOG_ERROR, "unable to allocate memory for conf frame\n" ) ;
		return NULL ;
	}

	//
	// init with some defaults
	//

	// make sure converted frames are set to null
//	for ( int c = 0 ; c < AC_SUPPORTED_FORMATS ; ++c )
//	{
//		cf->converted[ c ] = NULL ;
//	}

	memset( (struct ast_frame*)( cf->converted ), 0x0, ( sizeof( struct ast_frame* ) * AC_SUPPORTED_FORMATS ) ) ;

	cf->member = member ;
	// cf->priority = 0 ;

	cf->spy_partner = NULL ;

	cf->prev = NULL ;
	cf->next = next ;

	cf->static_frame = 0 ;

	// establish relationship to 'next'
	if ( next != NULL ) next->prev = cf ;

	// this holds the ast_frame pointer
	cf->fr = ( fr == NULL ) ? NULL : ast_frdup( ( struct ast_frame* )( fr ) ) ;

	// this holds the temporu mix buffer
	cf->mixed_buffer = NULL ;

	return cf ;
}

conf_frame* copy_conf_frame( conf_frame* src )
{
	//
	// check inputs
	//

	if ( src == NULL )
	{
		ast_log( AST_CONF_DEBUG, "unable to copy null conf frame\n" ) ;
		return NULL ;
	}

	//
	// copy the frame
	//

	struct conf_frame *cfr = NULL ;

	// create a new conf frame
	cfr = create_conf_frame( src->member, NULL, src->fr ) ;

	if ( cfr == NULL )
	{
		ast_log( AST_CONF_DEBUG, "unable to create new conf frame for copy\n" ) ;
		return NULL ;
	}

	return cfr ;
}

#ifdef	TEXT
//
// Create a TEXT frame based on a given string
//
struct ast_frame* create_text_frame(const char *text, int copy)
{
	struct ast_frame *f;
	char             *t;

	f = calloc(1, sizeof(struct ast_frame));
	if ( f == NULL )
	{
		ast_log( LOG_ERROR, "unable to allocate memory for text frame\n" ) ;
		return NULL ;
	}
	if ( copy )
	{
		t = calloc(strlen(text) + 1, 1);
		if ( t == NULL )
		{
			ast_log( LOG_ERROR, "unable to allocate memory for text data\n" ) ;
			free(f);
			return NULL ;
		}
		strncpy(t, text, strlen(text));
	} else
	{
		t = (char *)text;
	}

	f->frametype = AST_FRAME_TEXT;
	f->offset = 0;
	f->mallocd = AST_MALLOCD_HDR;
	if ( copy ) f->mallocd |= AST_MALLOCD_DATA;
	f->datalen = strlen(t) + 1;
	SETDATA2PTR(f->data, t);
	f->src = NULL;

	return f;
}
#endif

//
// slinear frame functions
//

struct ast_frame* create_slinear_frame( char* data )
{
	struct ast_frame* f ;

	f = calloc( 1, sizeof( struct ast_frame ) ) ;
	if ( f == NULL )
	{
		ast_log( LOG_ERROR, "unable to allocate memory for slinear frame\n" ) ;
		return NULL ;
	}

	f->frametype = AST_FRAME_VOICE ;
	f->subclass = AST_FORMAT_SLINEAR ;
	f->samples = AST_CONF_BLOCK_SAMPLES ;
	f->offset = AST_FRIENDLY_OFFSET ;
	f->mallocd = AST_MALLOCD_HDR | AST_MALLOCD_DATA ;

	f->datalen = AST_CONF_FRAME_DATA_SIZE ;
	SETDATA2PTR(f->data, data);

	f->src = NULL ;

	return f ;
}

void mix_slinear_frames( char *dst, const char *src, int samples )
{
	if ( dst == NULL ) return ;
	if ( src == NULL ) return ;

	int i, val ;

	for ( i = 0 ; i < samples ; ++i )
	{
		val = ( (short*)dst )[i] + ( (short*)src )[i] ;

		if ( val > 0x7fff )
		{
			( (short*)dst )[i] = 0x7fff - 1 ;
			continue ;
		}
		else if ( val < -0x7fff )
		{
			( (short*)dst )[i] = -0x7fff + 1 ;
			continue ;
		}
		else
		{
			( (short*)dst )[i] = val ;
	   		continue ;
		}
	}

	return ;
}

//
// silent frame functions
//

conf_frame* get_silent_frame( void )
{
	static conf_frame* static_silent_frame = NULL ;

	// we'll let this leak until the application terminates
	if ( static_silent_frame == NULL )
	{
		// ast_log( AST_CONF_DEBUG, "creating cached silent frame\n" ) ;
		struct ast_frame* fr = get_silent_slinear_frame() ;

		static_silent_frame = create_conf_frame( NULL, NULL, fr ) ;

		if ( static_silent_frame == NULL )
		{
			ast_log( LOG_WARNING, "unable to create cached silent frame\n" ) ;
			return NULL ;
		}

		// init the 'converted' slinear silent frame
		static_silent_frame->converted[ AC_SLINEAR_INDEX ] = get_silent_slinear_frame() ;

		// mark frame as static so it's not deleted
		static_silent_frame->static_frame = 1 ;
	}

	return static_silent_frame ;
}

struct ast_frame* get_silent_slinear_frame( void )
{
	static struct ast_frame* f = NULL ;

	// we'll let this leak until the application terminates
	if ( f == NULL )
	{
		char* data = malloc( AST_CONF_BUFFER_SIZE ) ;
		memset( data, 0x0, AST_CONF_BUFFER_SIZE ) ;
		f = create_slinear_frame( data ) ;
	}

	return f;
}













