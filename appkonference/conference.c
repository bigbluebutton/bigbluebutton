
// $Id: conference.c 886 2007-08-06 14:33:34Z bcholew $

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
#include "conference.h"
#include "asterisk/utils.h"

#include "asterisk/app.h"
#include "asterisk/say.h"

#include "asterisk/musiconhold.h"

//
// static variables
//

// single-linked list of current conferences
struct ast_conference *conflist = NULL ;

// mutex for synchronizing access to conflist
//static ast_mutex_t conflist_lock = AST_MUTEX_INITIALIZER ;
AST_MUTEX_DEFINE_STATIC(conflist_lock);

static int conference_count = 0 ;

// Forward funtcion declarations
#ifdef	VIDEO
static void do_VAD_switching(struct ast_conference *conf);
static void do_video_switching(struct ast_conference *conf, int new_id, int lock);
#endif
static struct ast_conference* find_conf(const char* name);
static struct ast_conference* create_conf(char* name, struct ast_conf_member* member);
static void remove_conf(struct ast_conference* conf);
static void add_member(struct ast_conf_member* member, struct ast_conference* conf);
#ifdef	VIDEO
static int get_new_id(struct ast_conference *conf);
static int update_member_broadcasting(struct ast_conference *conf, struct ast_conf_member *member, struct conf_frame *cfr, struct timeval time);
#endif

//
// main conference function
//

static void conference_exec( struct ast_conference *conf )
{

	struct ast_conf_member *member;
#if	VIDEO || DTMF
	struct conf_frame *cfr;
#endif
#ifdef	VIDEO
	struct ast_conf_member *video_source_member;
#endif
#ifdef	DTMF
	struct ast_conf_member *dtmf_source_member;
#endif
	struct conf_frame *spoken_frames, *send_frames;

	// count number of speakers, number of listeners
	int speaker_count ;
	int listener_count ;

	ast_log( AST_CONF_DEBUG, "Entered conference_exec, name => %s\n", conf->name ) ;

	// timer timestamps
	struct timeval base, curr, notify ;
	base = notify = ast_tvnow();

	// holds differences of curr and base
	long time_diff = 0 ;
	long time_sleep = 0 ;

	int since_last_slept = 0 ;

	//
	// variables for checking thread frequency
	//

	// count to AST_CONF_FRAMES_PER_SECOND
	int tf_count = 0 ;
	long tf_diff = 0 ;
	float tf_frequency = 0.0 ;

	struct timeval tf_base, tf_curr ;
	tf_base = ast_tvnow();

	int res;

	int oldcount = 0;

	//
	// main conference thread loop
	//

	while ( 42 == 42 )
	{
		// update the current timestamp
		curr = ast_tvnow();

		// calculate difference in timestamps
		time_diff = ast_tvdiff_ms(curr, base);

		// calculate time we should sleep
		time_sleep = AST_CONF_FRAME_INTERVAL - time_diff ;

		if ( time_sleep > 0 )
		{
			// sleep for sleep_time ( as milliseconds )
			usleep( time_sleep * 1000 ) ;

			// reset since last slept counter
			since_last_slept = 0 ;

			continue ;
		}
		else
		{
			// long sleep warning
			if (
				since_last_slept == 0
				&& time_diff > AST_CONF_CONFERENCE_SLEEP * 2
			)
			{
				ast_log(
					AST_CONF_DEBUG,
					"long scheduling delay, time_diff => %ld, AST_CONF_FRAME_INTERVAL => %d\n",
					time_diff, AST_CONF_FRAME_INTERVAL
				) ;
			}

			// increment times since last slept
			++since_last_slept ;

			// sleep every other time
			if ( since_last_slept % 2 )
				usleep( 0 ) ;
		}

		// adjust the timer base ( it will be used later to timestamp outgoing frames )
		add_milliseconds( &base, AST_CONF_FRAME_INTERVAL ) ;

		//
		// check thread frequency
		//


		if ( ++tf_count >= AST_CONF_FRAMES_PER_SECOND )
		{
			// update current timestamp
			tf_curr = ast_tvnow();

			// compute timestamp difference
			tf_diff = ast_tvdiff_ms(tf_curr, tf_base);

			// compute sampling frequency
			tf_frequency = ( float )( tf_diff ) / ( float )( tf_count ) ;

			if (
				( tf_frequency <= ( float )( AST_CONF_FRAME_INTERVAL - 1 ) )
				|| ( tf_frequency >= ( float )( AST_CONF_FRAME_INTERVAL + 1 ) )
			)
			{
				ast_log(
					LOG_WARNING,
					"processed frame frequency variation, name => %s, member count => %d/%d, tf_count => %d, tf_diff => %ld, tf_frequency => %2.4f\n",
					conf->name, conf->membercount, oldcount, tf_count, tf_diff, tf_frequency
				) ;
			}

			// reset values
			tf_base = tf_curr ;
			tf_count = 0 ;
			oldcount = conf->membercount ;
		}

		//-----------------//
		// INCOMING FRAMES //
		//-----------------//

		// ast_log( AST_CONF_DEBUG, "PROCESSING FRAMES, conference => %s, step => %d, ms => %ld\n",
		//	conf->name, step, ( base.tv_usec / 20000 ) ) ;

		//
		// check if the conference is empty and if so
		// remove it and break the loop
		//

		// acquire the conference lock
		ast_rwlock_rdlock(&conf->lock);

		if ( conf->membercount == 0 )
		{
			if ( ((res = ast_mutex_trylock(&conflist_lock)) != 0) || (conf->membercount != 0) )
			{
				if ( !res )
					ast_mutex_unlock(&conflist_lock);

				ast_rwlock_unlock(&conf->lock);
				ast_log ( LOG_NOTICE, "conference conflist trylock failed, res => %d,  name => %s, member count => %d\n", res, conf->name, conf->membercount ) ;
				continue;
			}
			if (conf->debug_flag)
			{
				ast_log( LOG_NOTICE, "removing conference, count => %d, name => %s\n", conf->membercount, conf->name ) ;
			}
			remove_conf( conf ) ; // stop the conference

			// We don't need to release the conf mutex, since it was destroyed anyway

			// release the conference list lock
			ast_mutex_unlock(&conflist_lock);

			break ; // break from main processing loop
		}

		//
		// Start processing frames
		//

		// update the current delivery time
		conf->delivery_time = base ;

		//
		// loop through the list of members
		// ( conf->memberlist is a single-linked list )
		//

		// ast_log( AST_CONF_DEBUG, "begin processing incoming audio, name => %s\n", conf->name ) ;

		// reset speaker and listener count
		speaker_count = 0 ;
		listener_count = 0 ;

		// get list of conference members
		member = conf->memberlist ;

		// reset pointer lists
		spoken_frames = NULL ;
#ifdef	VIDEO
		// reset video source
		video_source_member = NULL;
#endif
#ifdef	DTMF
                // reset dtmf source
		dtmf_source_member = NULL;
#endif
		// loop over member list to retrieve queued frames
		while ( member != NULL )
		{
			member_process_spoken_frames(conf,member,&spoken_frames,time_diff,
						     &listener_count, &speaker_count);

			member = member->next;
		}

		// ast_log( AST_CONF_DEBUG, "finished processing incoming audio, name => %s\n", conf->name ) ;


		//---------------//
		// MIXING FRAMES //
		//---------------//

		// mix frames and get batch of outgoing frames
		send_frames = mix_frames( spoken_frames, speaker_count, listener_count, conf->volume ) ;

		// accounting: if there are frames, count them as one incoming frame
		if ( send_frames != NULL )
		{
			// set delivery timestamp
			//set_conf_frame_delivery( send_frames, base ) ;
//			ast_log ( LOG_WARNING, "base = %d,%d: conf->delivery_time = %d,%d\n",base.tv_sec,base.tv_usec, conf->delivery_time.tv_sec, conf->delivery_time.tv_usec);

			// ast_log( AST_CONF_DEBUG, "base => %ld.%ld %d\n", base.tv_sec, base.tv_usec, ( int )( base.tv_usec / 1000 ) ) ;

			conf->stats.frames_in++ ;
		}

		//-----------------//
		// OUTGOING FRAMES //
		//-----------------//

		//
		// loop over member list to queue outgoing frames
		//
		for ( member = conf->memberlist ; member != NULL ; member = member->next )
		{
			member_process_outgoing_frames(conf, member, send_frames);
		}
#ifdef	VIDEO
		//-------//
		// VIDEO //
		//-------//

		curr = ast_tvnow();
		
		// Chat mode handling
		// If there's only one member, then video gets reflected back to it
		// If there are two members, then each sees the other's video
		if ( conf->does_chat_mode &&
		     conf->membercount > 0 &&
		     conf->membercount <= 2
		   )
		{
			struct ast_conf_member *m1, *m2;

			m1 = conf->memberlist;
			m2 = conf->memberlist->next;
			
			if ( !conf->chat_mode_on )
				conf->chat_mode_on = 1;
				
			start_video(m1);
			if ( m2 != NULL )
				start_video(m2);
			
			if ( conf->membercount == 1 )
			{
				cfr = get_incoming_video_frame(m1);
				update_member_broadcasting(conf, m1, cfr, curr);
				while ( cfr )
				{
					queue_outgoing_video_frame(m1, cfr->fr, conf->delivery_time);
					delete_conf_frame(cfr);
					cfr = get_incoming_video_frame(m1);
				}
			} else if ( conf->membercount == 2 )
			{
				cfr = get_incoming_video_frame(m1);
				update_member_broadcasting(conf, m1, cfr, curr);
				while ( cfr )
				{
					queue_outgoing_video_frame(m2, cfr->fr, conf->delivery_time);
					delete_conf_frame(cfr);
					cfr = get_incoming_video_frame(m1);
				}

				cfr = get_incoming_video_frame(m2);
				update_member_broadcasting(conf, m2, cfr, curr);
				while ( cfr )
				{
					queue_outgoing_video_frame(m1, cfr->fr, conf->delivery_time);
					delete_conf_frame(cfr);
					cfr = get_incoming_video_frame(m2);
				}
			}
		} else
		{
			// Generic conference handling (chat mode disabled or more than 2 members)
			// If we were previously in chat mode, turn it off and stop video from members
			if ( conf->chat_mode_on )
			{
				// Send STOPVIDEO commands to everybody except the current source, if any
				conf->chat_mode_on = 0;
				for (member = conf->memberlist; member != NULL; member = member->next)
				{
					if ( member->id != conf->current_video_source_id )
						stop_video(member);
				}
			}
			
			// loop over the incoming frames and send to all outgoing
			// TODO: this is an O(n^2) algorithm. Can we speed it up without sacrificing per-member switching?
			for (video_source_member = conf->memberlist;
			     video_source_member != NULL;
			     video_source_member = video_source_member->next
			    )
			{
				cfr = get_incoming_video_frame(video_source_member);
				update_member_broadcasting(conf, video_source_member, cfr, curr);
				while ( cfr )
				{
					for (member = conf->memberlist; member != NULL; member = member->next)
					{
						// skip members that are not ready or are not supposed to receive video
						if ( !member->ready_for_outgoing || member->norecv_video )
							continue ;

						if ( conf->video_locked )
						{
							// Always send video from the locked source
							if ( conf->current_video_source_id == video_source_member->id )
								queue_outgoing_video_frame(member, cfr->fr, conf->delivery_time);
						} else
						{
							// If the member has vad switching disabled and dtmf switching enabled, use that
							if ( member->dtmf_switch &&
							     !member->vad_switch &&
							     member->req_id == video_source_member->id
							   )
							{
								queue_outgoing_video_frame(member, cfr->fr, conf->delivery_time);
							} else
							{
								// If no dtmf switching, then do VAD switching
								// The VAD switching decision code should make sure that our video source
								// is legit
								if ( (conf->current_video_source_id == video_source_member->id) ||
								     (conf->current_video_source_id < 0 &&
								      conf->default_video_source_id == video_source_member->id
								     )
								   )
								{
									queue_outgoing_video_frame(member, cfr->fr, conf->delivery_time);
								}
							}


						}
					}
					// Garbage collection
					delete_conf_frame(cfr);
					cfr = get_incoming_video_frame(video_source_member);
				}
			}
		}
#endif
#ifdef	DTMF
                //------//
		// DTMF //
		//------//

		// loop over the incoming frames and send to all outgoing
		for (dtmf_source_member = conf->memberlist; dtmf_source_member != NULL; dtmf_source_member = dtmf_source_member->next)
		{
			while ((cfr = get_incoming_dtmf_frame( dtmf_source_member )))
			{
				for (member = conf->memberlist; member != NULL; member = member->next)
				{
					// skip members that are not ready
					if ( member->ready_for_outgoing == 0 )
					{
						continue ;
					}

					if (member != dtmf_source_member)
					{
 						// Send the latest frame
						queue_outgoing_dtmf_frame(member, cfr->fr);
					}
				}
				// Garbage collection
				delete_conf_frame(cfr);
			}
		}
#endif
		//---------//
		// CLEANUP //
		//---------//

		// clean up send frames
		while ( send_frames != NULL )
		{
			// accouting: count all frames and mixed frames
			if ( send_frames->member == NULL )
				conf->stats.frames_out++ ;
			else
				conf->stats.frames_mixed++ ;

			// delete the frame
			send_frames = delete_conf_frame( send_frames ) ;
		}

		//
		// notify the manager of state changes every 100 milliseconds
		// we piggyback on this for VAD switching logic
		//

		if ( ( ast_tvdiff_ms(curr, notify) / AST_CONF_NOTIFICATION_SLEEP ) >= 1 )
		{
#ifdef	VIDEO
			// Do VAD switching logic
			// We need to do this here since send_state_change_notifications
			// resets the flags
			if ( !conf->video_locked )
				do_VAD_switching(conf);
#endif
			// send the notifications
			send_state_change_notifications( conf->memberlist ) ;

			// increment the notification timer base
			add_milliseconds( &notify, AST_CONF_NOTIFICATION_SLEEP ) ;
		}

		// release conference lock
		ast_rwlock_unlock( &conf->lock ) ;

		// !!! TESTING !!!
		// usleep( 1 ) ;
	}
	// end while ( 42 == 42 )

	//
	// exit the conference thread
	//

	ast_log( AST_CONF_DEBUG, "exit conference_exec\n" ) ;

	// exit the thread
	pthread_exit( NULL ) ;

	return ;
}

//
// manange conference functions
//

// called by app_conference.c:load_module()
void init_conference( void )
{
	ast_mutex_init( &conflist_lock ) ;
	channel_table = malloc (CHANNEL_TABLE_SIZE * sizeof (struct channel_bucket) ) ;
	int i;
	for ( i = 0; i < CHANNEL_TABLE_SIZE; i++)
		AST_LIST_HEAD_INIT (&channel_table[i]) ;
	ast_log( LOG_NOTICE, "initializing channel table, size = %d\n", CHANNEL_TABLE_SIZE ) ;
}

struct ast_conference* join_conference( struct ast_conf_member* member )
{
	struct ast_conference* conf = NULL ;

	// acquire the conference list lock
	ast_mutex_lock(&conflist_lock);



	// look for an existing conference
	ast_log( AST_CONF_DEBUG, "attempting to find requested conference\n" ) ;
	conf = find_conf( member->conf_name ) ;

	// unable to find an existing conference, try to create one
	if ( conf == NULL )
	{
		// create a new conference
		ast_log( AST_CONF_DEBUG, "attempting to create requested conference\n" ) ;

		// create the new conference with one member
		conf = create_conf( member->conf_name, member ) ;

		// return an error if create_conf() failed
		if ( conf == NULL )
			ast_log( LOG_ERROR, "unable to find or create requested conference\n" ) ;
	}
	else
	{
		//
		// existing conference found, add new member to the conference
		//
		// once we call add_member(), this thread
		// is responsible for calling delete_member()
		//
		if (!member->max_users || (member->max_users > conf->membercount)) {
			add_member( member, conf ) ;
		} else {
			ast_log( LOG_NOTICE, "conference %s max users exceeded: member count = %d\n", conf->name, conf->membercount ) ;
			pbx_builtin_setvar_helper(member->chan, "KONFERENCE", "MAXUSERS");
			member->max_users_flag = 1;
			conf = NULL;
		}
	}

	// release the conference list lock
	ast_mutex_unlock(&conflist_lock);

	return conf ;
}

// This function should be called with conflist_lock mutex being held
static struct ast_conference* find_conf( const char* name )
{
	// no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", name ) ;
		return NULL ;
	}

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (char*)&(conf->name), name, 80 ) == 0 )
		{
			// found conf name match
			ast_log( AST_CONF_DEBUG, "found conference in conflist, name => %s\n", name ) ;
			return conf;
		}
		conf = conf->next ;
	}

	ast_log( AST_CONF_DEBUG, "unable to find conference in conflist, name => %s\n", name ) ;
	return NULL;
}

// This function should be called with conflist_lock held
static struct ast_conference* create_conf( char* name, struct ast_conf_member* member )
{
	ast_log( AST_CONF_DEBUG, "entered create_conf, name => %s\n", name ) ;

	//
	// allocate memory for conference
	//

	struct ast_conference *conf = malloc( sizeof( struct ast_conference ) ) ;

	if ( conf == NULL )
	{
		ast_log( LOG_ERROR, "unable to malloc ast_conference\n" ) ;
		return NULL ;
	}

	//
	// initialize conference
	//

	conf->next = NULL ;
	conf->memberlist = NULL ;
#ifndef	VIDEO
	conf->memberlast = NULL ;
#endif
	conf->membercount = 0 ;
	conf->conference_thread = -1 ;

	conf->debug_flag = 0 ;

	conf->kick_flag = 0 ;

	conf->id_count = 0;
#ifdef	VIDEO
	conf->default_video_source_id = -1;
	conf->current_video_source_id = -1;
	//conf->current_video_source_timestamp = ast_tvnow();
	conf->video_locked = 0;

	conf->chat_mode_on = 0;
	conf->does_chat_mode = 0;
#endif
	// zero stats
	memset(	&conf->stats, 0x0, sizeof( ast_conference_stats ) ) ;

	// record start time
	conf->stats.time_entered = ast_tvnow();

	// copy name to conference
	strncpy( (char*)&(conf->name), name, sizeof(conf->name) - 1 ) ;
	strncpy( (char*)&(conf->stats.name), name, sizeof(conf->name) - 1 ) ;

	// zero volume
	conf->volume = 0;

	// initialize the conference lock
	ast_rwlock_init( &conf->lock ) ;

	// build translation paths
	conf->from_slinear_paths[ AC_SLINEAR_INDEX ] = NULL ;
	conf->from_slinear_paths[ AC_ULAW_INDEX ] = ast_translator_build_path( AST_FORMAT_ULAW, AST_FORMAT_SLINEAR ) ;
	conf->from_slinear_paths[ AC_ALAW_INDEX ] = ast_translator_build_path( AST_FORMAT_ALAW, AST_FORMAT_SLINEAR ) ;
	conf->from_slinear_paths[ AC_GSM_INDEX ] = ast_translator_build_path( AST_FORMAT_GSM, AST_FORMAT_SLINEAR ) ;
	conf->from_slinear_paths[ AC_SPEEX_INDEX ] = ast_translator_build_path( AST_FORMAT_SPEEX, AST_FORMAT_SLINEAR ) ;
#ifdef AC_USE_G729A
	conf->from_slinear_paths[ AC_G729A_INDEX ] = ast_translator_build_path( AST_FORMAT_G729A, AST_FORMAT_SLINEAR ) ;
#endif

	ast_log( AST_CONF_DEBUG, "added new conference to conflist, name => %s\n", name ) ;

	//
	// spawn thread for new conference, using conference_exec( conf )
	//

	if ( ast_pthread_create( &conf->conference_thread, NULL, (void*)conference_exec, conf ) == 0 )
	{
		// detach the thread so it doesn't leak
		pthread_detach( conf->conference_thread ) ;

		// add the initial member
		add_member( member, conf ) ;

		// prepend new conference to conflist
		conf->next = conflist ;
		conflist = conf ;

		ast_log( AST_CONF_DEBUG, "started conference thread for conference, name => %s\n", conf->name ) ;
	}
	else
	{
		ast_log( LOG_ERROR, "unable to start conference thread for conference %s\n", conf->name ) ;

		conf->conference_thread = -1 ;

		// clean up conference
		free( conf ) ;
		conf = NULL ;
	}

	// count new conference
	if ( conf != NULL )
		++conference_count ;

	return conf ;
}

//This function should be called with conflist_lock and conf->lock held
static void remove_conf( struct ast_conference *conf )
{
  int c;

	// ast_log( AST_CONF_DEBUG, "attempting to remove conference, name => %s\n", conf->name ) ;

	struct ast_conference *conf_current = conflist ;
	struct ast_conference *conf_temp = NULL ;

	// loop through list of conferences
	while ( conf_current != NULL )
	{
		// if conf_current point to the passed conf,
		if ( conf_current == conf )
		{
			if ( conf_temp == NULL )
			{
				// this is the first conf in the list, so we just point
				// conflist past the current conf to the next
				conflist = conf_current->next ;
			}
			else
			{
				// this is not the first conf in the list, so we need to
				// point the preceeding conf to the next conf in the list
				conf_temp->next = conf_current->next ;
			}

			//
			// do some frame clean up
			//

			for ( c = 0 ; c < AC_SUPPORTED_FORMATS ; ++c )
			{
				// free the translation paths
				if ( conf_current->from_slinear_paths[ c ] != NULL )
				{
					ast_translator_free_path( conf_current->from_slinear_paths[ c ] ) ;
					conf_current->from_slinear_paths[ c ] = NULL ;
				}
			}

			// calculate time in conference
			// total time converted to seconds
			long tt = ast_tvdiff_ms(ast_tvnow(),
					conf_current->stats.time_entered) / 1000;

			// report accounting information
			if (conf->debug_flag)
			{
				ast_log( LOG_NOTICE, "conference accounting, fi => %ld, fo => %ld, fm => %ld, tt => %ld\n",
					 conf_current->stats.frames_in, conf_current->stats.frames_out, conf_current->stats.frames_mixed, tt ) ;

				ast_log( AST_CONF_DEBUG, "removed conference, name => %s\n", conf_current->name ) ;
			}

			ast_rwlock_unlock( &conf_current->lock ) ;

			free( conf_current ) ;
			conf_current = NULL ;

			break ;
		}

		// save a refence to the soon to be previous conf
		conf_temp = conf_current ;

		// move conf_current to the next in the list
		conf_current = conf_current->next ;
	}

	// count new conference
	--conference_count ;

	return ;
}

#ifdef	VIDEO
static int get_new_id( struct ast_conference *conf )
{
	// must have the conf lock when calling this
	int newid;
	struct ast_conf_member *othermember;
	// get a video ID for this member
	newid = 0;
	othermember = conf->memberlist;
	while (othermember)
	{
	    if (othermember->id == newid)
	    {
		    newid++;
		    othermember = conf->memberlist;
	    }
	    else
	    {
		    othermember = othermember->next;
	    }
	}
	return newid;
}
#endif

int end_conference(const char *name, int hangup )
{
	struct ast_conference *conf;

	// acquire the conference list lock
	ast_mutex_lock(&conflist_lock);

	conf = find_conf(name);
	if ( conf == NULL )
	{
		ast_log( LOG_WARNING, "could not find conference\n" ) ;

		// release the conference list lock
		ast_mutex_unlock(&conflist_lock);

		return -1 ;
	}

	// acquire the conference lock
	ast_rwlock_rdlock( &conf->lock ) ;

	// get list of conference members
	struct ast_conf_member* member = conf->memberlist ;

	// loop over member list and request hangup
	while ( member != NULL )
	{
		// acquire member mutex and request hangup
		// or just kick
		ast_mutex_lock( &member->lock ) ;
		if (hangup)
			ast_softhangup( member->chan, 1 ) ;
		else
			member->kick_flag = 1;
		ast_mutex_unlock( &member->lock ) ;

		// go on to the next member
		// ( we have the conf lock, so we know this is okay )
		member = member->next ;
	}

	// release the conference lock
	ast_rwlock_unlock( &conf->lock ) ;

	// release the conference list lock
	ast_mutex_unlock(&conflist_lock);

	return 0 ;
}

//
// member-related functions
//

// This function should be called with conflist_lock held
static void add_member( struct ast_conf_member *member, struct ast_conference *conf )
{
	if ( conf == NULL )
	{
		ast_log( LOG_ERROR, "unable to add member to NULL conference\n" ) ;
		return ;
	}

	// acquire the conference lock
	ast_rwlock_wrlock( &conf->lock ) ;

	// update conference stats
	conf->membercount++;

	if (member->ismoderator)
		conf->stats.moderators++;

#ifdef	VIDEO
        int newid;
        struct ast_conf_member *othermember;

	if (member->id < 0)
	{
		// get an ID for this member
		newid = get_new_id( conf );
		member->id = newid;
	}
	else {
		// boot anyone who has this id already
		othermember = conf->memberlist;
		while (othermember)
		{
			if (othermember->id == member->id)
				othermember->id = -1;
			othermember = othermember->next;
		}
	}

	// The conference sets chat mode according to the latest member chat flag
	conf->does_chat_mode = member->does_chat_mode;

	// check if we're supposed to do chat_mode, and if so, start video on the client
	if ( conf->does_chat_mode && conf->membercount <= 2 )
	{
		start_video(member);
		conf->chat_mode_on = 1;
	}

	if ( member->mute_video )
		stop_video(member);

	// set a long term id
	int new_initial_id = 0;
	othermember = conf->memberlist;
	while (othermember)
	{
		if (othermember->initial_id >= new_initial_id)
			new_initial_id++;

		othermember = othermember->next;
	}
	member->initial_id = new_initial_id;


	ast_log( AST_CONF_DEBUG, "new video id %d\n", newid) ;

	int last_id;
	if (conf->memberlist) last_id = conf->memberlist->id;
	else last_id = 0;

	if (member->req_id < 0) // otherwise pre-selected in create_member
	{
		// want to watch the last person to 0 or 1 (for now)
		if (member->id > 0) member->req_id = 0;
		else member->req_id = 1;
	}

	member->next = conf->memberlist ; // next is now list
	conf->memberlist = member ; // member is now at head of list

#else
	member->id = ( !conf->memberlast ? 1 : conf->memberlast->id + 1 ) ;

	if ( !conf->memberlist )
		conf->memberlist = conf->memberlast = member ;
	else {
		member->prev = conf->memberlast ; // dbl links
		conf->memberlast->next = member ;
		conf->memberlast = member ;
	}
#endif

	// release the conference lock
	ast_rwlock_unlock( &conf->lock ) ;

	ast_log( AST_CONF_DEBUG, "member added to conference, name => %s\n", conf->name ) ;

	return ;
}

void remove_member( struct ast_conf_member* member, struct ast_conference* conf )
{
	int membercount ;
	short moderators ;
	long tt ;

	// check for member
	if ( member == NULL )
	{
		ast_log( LOG_WARNING, "unable to remove NULL member\n" ) ;
		return ;
	}

	// check for conference
	if ( conf == NULL )
	{
		ast_log( LOG_WARNING, "unable to remove member from NULL conference\n" ) ;
		return  ;
	}

	//
	// loop through the member list looking
	// for the requested member
	//

	ast_rwlock_wrlock( &conf->lock );

	if ( member->ismoderator && member->kick_conferees )
		conf->kick_flag = 1 ;

#ifdef	VIDEO
	struct ast_conf_member *member_list = conf->memberlist ;
	struct ast_conf_member *member_temp = NULL ;
#else
	struct ast_conf_member *member_temp = member->prev ;
#endif

#ifdef	VIDEO
	while ( member_list != NULL )
	{
		// set conference to send no_video to anyone who was watching us
		ast_mutex_lock( &member_list->lock ) ;
		if (member_list->req_id == member->id)
		{
			member_list->conference = 1;
		}
		ast_mutex_unlock( &member_list->lock ) ;
		member_list = member_list->next ;
	}

	member_list = conf->memberlist ;

	while ( member_list != NULL )
	{
		// If member is driven by the currently visited member, break the association
		if ( member_list->driven_member == member )
		{
			// Acquire member mutex
			ast_mutex_lock(&member_list->lock);

			member_list->driven_member = NULL;

			// Release member mutex
			ast_mutex_unlock(&member_list->lock);
		}
		if ( member_list == member )
		{
#endif
			//
			// log some accounting information
			//

			// calculate time in conference (in seconds)
			tt = ast_tvdiff_ms(ast_tvnow(),
					member->time_entered) / 1000;

			if (conf->debug_flag)
			{
				ast_log(
					LOG_NOTICE,
					"member accounting, channel => %s, te => %ld, fi => %ld, fid => %ld, fo => %ld, fod => %ld, tt => %ld\n",
					member->channel_name,
					member->time_entered.tv_sec, member->frames_in, member->frames_in_dropped,
					member->frames_out, member->frames_out_dropped, tt
					) ;
			}

			//
			// if this is the first member in the linked-list,
			// skip over the first member in the list, else
			//
			// point the previous 'next' to the current 'next',
			// thus skipping the current member in the list
			//
			if ( member_temp == NULL )
				conf->memberlist = member->next ;
			else
				member_temp->next = member->next ;
#ifndef	VIDEO
			if(member->next) member->next->prev =  member_temp ; // dbl links

			if ( conf->memberlast == member )
				conf->memberlast = ( member_temp == NULL ? NULL : member_temp );
#endif
			// update conference stats
			membercount = --conf->membercount;

			// update moderator count
			moderators = (!member->ismoderator ? conf->stats.moderators : --conf->stats.moderators );
#ifdef	VIDEO
			// Check if member is the default or current video source
			if ( conf->current_video_source_id == member->id )
			{
				if ( conf->video_locked )
				{
					conf->video_locked = 0;
					manager_event(EVENT_FLAG_CALL, "ConferenceUnlock", "ConferenceName: %s\r\n", conf->name);
				}
				do_video_switching(conf, conf->default_video_source_id, 0);
			} else if ( conf->default_video_source_id == member->id )
			{
				conf->default_video_source_id = -1;
			}

			// If the member is broadcasting, we notify that it is no longer the case
			if ( member->video_broadcast_active )
			{
				manager_event(EVENT_FLAG_CALL,
					"ConferenceVideoBroadcastOff",
					"ConferenceName: %s\r\nChannel: %s\r\n",
					conf->name,
					member->channel_name
					);
			}

			// point to the next member in the list
			member_list = member_list->next ;

			//break ;
		}
		else
		{
			// save a pointer to the current member,
			// and then point to the next member in the list
			member_temp = member_list ;
			member_list = member_list->next ;
		}
	}
#endif
	ast_rwlock_unlock( &conf->lock );

	ast_log( AST_CONF_DEBUG, "removed member from conference, name => %s, remaining => %d\n",
			member->conf_name, membercount ) ;

	// remove member from channel table
	AST_LIST_LOCK (member->bucket ) ;
	AST_LIST_REMOVE (member->bucket, member, hash_entry) ;
	AST_LIST_UNLOCK (member->bucket ) ;

	//ast_log( AST_CONF_DEBUG, "Removed %s from the channel table, bucket => %ld\n", member->chan->name, member->bucket - channel_table) ;

	// output to manager...
	manager_event(
		EVENT_FLAG_CALL,
		"ConferenceLeave",
		"ConferenceName: %s\r\n"
		"Type:  %s\r\n"
		"UniqueID: %s\r\n"
		"Member: %d\r\n"
		"Flags: %s\r\n"
		"Channel: %s\r\n"
		"CallerID: %s\r\n"
		"CallerIDName: %s\r\n"
		"Duration: %ld\r\n"
		"Moderators: %d\r\n"
		"Count: %d\r\n",
		member->conf_name,
		member->type,
		member->uniqueid,
		member->id,
		member->flags,
		member->channel_name,
		member->callerid,
		member->callername,
		tt,
		moderators,
		membercount
	) ;

	// delete the member
	delete_member( member ) ;

}

//
// returns: -1 => error, 0 => debugging off, 1 => debugging on
// state: on => 1, off => 0, toggle => -1
//
int set_conference_debugging( const char* name, int state )
{
	if ( name == NULL )
		return -1 ;

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;
	int new_state = -1 ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), name, 80 ) == 0 )
		{
			// lock conference
			// ast_mutex_lock( &(conf->lock) ) ;

			// toggle or set the state
			if ( state == -1 )
				conf->debug_flag = ( conf->debug_flag == 0 ) ? 1 : 0 ;
			else
				conf->debug_flag = ( state == 0 ) ? 0 : 1 ;

			new_state = conf->debug_flag ;

			// unlock conference
			// ast_mutex_unlock( &(conf->lock) ) ;

			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return new_state ;
}


int get_conference_count( void )
{
	return conference_count ;
}

int show_conference_stats ( int fd )
{
        // no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized.\n") ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	ast_cli( fd, "%-20.20s %-20.20s %-20.20s\n", "Name", "Members", "Volume" ) ;

	// loop through conf list
	while ( conf != NULL )
	{
		ast_cli( fd, "%-20.20s %-20d %-20d\n", conf->name, conf->membercount, conf->volume ) ;
		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return 1 ;
}

int show_conference_list ( int fd, const char *name )
{
	struct ast_conf_member *member;
	char volume_str[10];

        // no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", name ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), name, 80 ) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock(&conf->lock);

			// ast_cli(fd, "Chat mode is %s\n", conf->chat_mode_on ? "ON" : "OFF");
#ifdef	VIDEO
			ast_cli( fd, "%-20.20s %-20.20s %-20.20s %-20.20s %-20.20s %-20.20s %-20.20s\n", "User #", "Flags", "Audio", "Volume", "Driver #", "Bucket", "Channel");
#else
			ast_cli( fd, "%-20.20s %-20.20s %-20.20s %-20.20s %-20.20s %-20.20s\n", "User #", "Flags", "Audio", "Volume", "Bucket", "Channel");
#endif
			// do the biz
			member = conf->memberlist ;
			while ( member != NULL )
			{
				snprintf(volume_str, 10, "%d:%d", member->talk_volume, member->listen_volume);
#ifdef	VIDEO
				if ( member->driven_member == NULL )
				{
					ast_cli( fd, "%-20d %-20.20s %-20.20s %-20.20s %-20.20s %-20ld %-80s\n",
					member->id, member->flags, (member->mute_audio == 0 ? "Unmuted" : "Muted"), volume_str, "*", member->bucket - channel_table, member->channel_name);
				} else {
					ast_cli( fd, "%-20d %-20.20s %-20.20s %-20.20s %-20d  %-20ld %-20.20s\n", member->id, member->flags,
					(member->mute_audio == 0 ? "Unmuted" : "Muted"), volume_str, member->driven_member->id, member->bucket - channel_table, member->channel_name);
				}
#else
				ast_cli( fd, "%-20d %-20.20s %-20.20s %-20.20s %-20ld %-80s\n",
				member->id, member->flags, (member->mute_audio == 0 ? "Unmuted" : "Muted"), volume_str, member->bucket - channel_table, member->channel_name);
#endif
				member = member->next;
			}

			// release conference lock
			ast_rwlock_unlock(&conf->lock);

			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return 1 ;
}

/* Dump list of conference info */
int manager_conference_list( struct mansession *s, const struct message *m )
{
	const char *id = astman_get_header(m,"ActionID");
	const char *conffilter = astman_get_header(m,"Conference");
	char idText[256] = "";
	struct ast_conf_member *member;

	astman_send_ack(s, m, "Conference list will follow");

  // no conferences exist
	if ( conflist == NULL )
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", conffilter );;

	if (!ast_strlen_zero(id)) {
		snprintf(idText,256,"ActionID: %s\r\n",id);
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), conffilter, 80 ) == 0 )
		{
			// do the biz
			member = conf->memberlist ;
			while (member != NULL)
			  {
					astman_append(s, "Event: ConferenceEntry\r\n"
						"ConferenceName: %s\r\n"
						"Member: %d\r\n"
						"Channel: %s\r\n"
						"CallerID: %s\r\n"
						"CallerIDName: %s\r\n"
						"Muted: %s\r\n"
#ifdef	VIDEO
						"VideoMuted: %s\r\n"
						"Default: %s\r\n"
						"Current: %s\r\n"
#endif
						"%s"
						"\r\n",
						conf->name,
						member->id,
						member->channel_name,
						member->chan->cid.cid_num ? member->chan->cid.cid_num : "unknown",
						member->chan->cid.cid_name ? member->chan->cid.cid_name : "unknown",
						member->mute_audio ? "YES" : "NO",
#ifdef	VIDEO
						member->mute_video ? "YES" : "NO",
						member->id == conf->default_video_source_id ? "YES" : "NO",
						member->id == conf->current_video_source_id ? "YES" : "NO",
#endif
						idText);
			    member = member->next;
			  }
			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	astman_append(s,
		"Event: ConferenceListComplete\r\n"
		"%s"
		"\r\n",idText);

	return RESULT_SUCCESS;
}

//
// E.BUU - Manager conference end. Additional option to just kick everybody out
// without hangin up channels
//
int manager_conference_end(struct mansession *s, const struct message *m)
{
	const char *confname = astman_get_header(m,"Conference");
	int hangup = 1;

	const char * h =  astman_get_header(m, "Hangup");
	if (h)
	{
		hangup = atoi(h);
	}

	ast_log( LOG_NOTICE, "Terminating conference %s on manager's request. Hangup: %s.\n", confname, hangup?"YES":"NO" );
        if ( end_conference( confname, hangup ) != 0 )
        {
		ast_log( LOG_ERROR, "manager end conf: unable to terminate conference %s.\n", confname );
		astman_send_error(s, m, "Failed to terminate\r\n");
		return RESULT_FAILURE;
	}

	astman_send_ack(s, m, "Conference terminated");
	return RESULT_SUCCESS;
}

int kick_member (  const char* confname, int user_id)
{
	struct ast_conf_member *member;
	int res = 0;

	// no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", confname ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), confname, 80 ) == 0 )
		{
		        // do the biz
			ast_rwlock_rdlock( &conf->lock ) ;
		        member = conf->memberlist ;
			while (member != NULL)
			  {
			    if (member->id == user_id)
			      {
				      ast_mutex_lock( &member->lock ) ;
				      member->kick_flag = 1;
				      //ast_soft_hangup(member->chan);
				      ast_mutex_unlock( &member->lock ) ;

				      res = 1;
			      }
			    member = member->next;
			  }
			ast_rwlock_unlock( &conf->lock ) ;
			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res ;
}

int kick_all ( void )
{
  struct ast_conf_member *member;
  int res = 0;

        // no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized\n" ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		// do the biz
		ast_rwlock_rdlock( &conf->lock ) ;
		member = conf->memberlist ;
		while (member != NULL)
		{
			ast_mutex_lock( &member->lock ) ;
			member->kick_flag = 1;
			ast_mutex_unlock( &member->lock ) ;
			member = member->next;
		}
		ast_rwlock_unlock( &conf->lock ) ;
		break ;

	conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res ;
}

int mute_member (  const char* confname, int user_id)
{
  struct ast_conf_member *member;
  int res = 0;

        // no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", confname ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), confname, 80 ) == 0 )
		{
		        // do the biz
			ast_rwlock_rdlock( &conf->lock ) ;
		        member = conf->memberlist ;
			while (member != NULL)
			  {
			    if (member->id == user_id)
			      {
				      ast_mutex_lock( &member->lock ) ;
				      member->muted = member->mute_audio = 1;
				      ast_mutex_unlock( &member->lock ) ;
					manager_event(
						EVENT_FLAG_CALL,
						"ConferenceMemberMute",
						"Channel: %s\r\n",
						member->channel_name
					) ;
				      res = 1;
			      }
			    member = member->next;
			  }
			ast_rwlock_unlock( &conf->lock ) ;
			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res ;
}

int mute_conference (  const char* confname)
{
  struct ast_conf_member *member;
  int res = 0;

        // no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", confname ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), confname, 80 ) == 0 )
		{
		        // do the biz
			ast_rwlock_rdlock( &conf->lock ) ;
		        member = conf->memberlist ;
			while (member != NULL)
			  {
			    if ( !member->ismoderator )
			      {
				      ast_mutex_lock( &member->lock ) ;
				      member->muted = member->mute_audio = 1;
				      ast_mutex_unlock( &member->lock ) ;
				      res = 1;
			      }
			    member = member->next;
			  }
			ast_rwlock_unlock( &conf->lock ) ;
			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	manager_event(
		EVENT_FLAG_CALL,
		"ConferenceMute",
		"ConferenceName: %s\r\n",
		confname
	) ;

	return res ;
}

int unmute_member (  const char* confname, int user_id)
{
  struct ast_conf_member *member;
  int res = 0;

        // no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", confname ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), confname, 80 ) == 0 )
		{
		        // do the biz
			ast_rwlock_rdlock( &conf->lock ) ;
		        member = conf->memberlist ;
			while (member != NULL)
			  {
			    if (member->id == user_id)
			      {
				      ast_mutex_lock( &member->lock ) ;
				      member->muted = member->mute_audio = 0;
				      ast_mutex_unlock( &member->lock ) ;
					manager_event(
						EVENT_FLAG_CALL,
						"ConferenceMemberUnmute",
						"Channel: %s\r\n",
						member->channel_name
					) ;
				      res = 1;
			      }
			    member = member->next;
			  }
			ast_rwlock_unlock( &conf->lock ) ;
			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res ;
}

int unmute_conference (  const char* confname)
{
  struct ast_conf_member *member;
  int res = 0;

        // no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", confname ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), confname, 80 ) == 0 )
		{
		        // do the biz
			ast_rwlock_rdlock( &conf->lock ) ;
		        member = conf->memberlist ;
			while (member != NULL)
			  {
			    if ( !member->ismoderator )
			      {
				      ast_mutex_lock( &member->lock ) ;
				      member->muted = member->mute_audio = 0;
				      ast_mutex_unlock( &member->lock ) ;
				      res = 1;
			      }
			    member = member->next;
			  }
			ast_rwlock_unlock( &conf->lock ) ;
			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	manager_event(
		EVENT_FLAG_CALL,
		"ConferenceUnmute",
		"ConferenceName: %s\r\n",
		confname
	) ;

	return res ;
}
#ifdef	VIDEO
int viewstream_switch ( const char* confname, int user_id, int stream_id )
{
  struct ast_conf_member *member;
  int res = 0;

        // no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", confname ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), confname, 80 ) == 0 )
		{
		        // do the biz
			ast_rwlock_rdlock( &conf->lock ) ;
		        member = conf->memberlist ;
			while (member != NULL)
			{
				if (member->id == user_id)
				{
					// switch the video
					ast_mutex_lock( &member->lock ) ;

					member->req_id = stream_id;
					member->conference = 1;

					ast_mutex_unlock( &member->lock ) ;
					res = 1;
				}
				member = member->next;
			}
			ast_rwlock_unlock( &conf->lock ) ;
			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res ;
}

int viewchannel_switch ( const char* confname, const char* userchan, const char* streamchan )
{
  struct ast_conf_member *member;
  int res = 0;
  int stream_id = -1;

        // no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", confname ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), confname, 80 ) == 0 )
		{
		        // do the biz
			ast_rwlock_rdlock( &conf->lock ) ;
		        member = conf->memberlist ;
			while (member != NULL)
			{
				if (strncasecmp( member->channel_name, streamchan, 80 ) == 0)
				{
					stream_id = member->id;
				}
				member = member->next;
			}
			ast_rwlock_unlock( &conf->lock ) ;
			if (stream_id >= 0)
			{
				// do the biz
				ast_rwlock_rdlock( &conf->lock ) ;
				member = conf->memberlist ;
				while (member != NULL)
				{
					if (strncasecmp( member->channel_name, userchan, 80 ) == 0)
					{
						// switch the video
						ast_mutex_lock( &member->lock ) ;

						member->req_id = stream_id;
						member->conference = 1;

						ast_mutex_unlock( &member->lock ) ;
						res = 1;
					}
					member = member->next;
				}
				ast_rwlock_unlock( &conf->lock ) ;
			}
			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res ;
}
#endif
int get_conference_stats( ast_conference_stats* stats, int requested )
{
	// no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialize\n" ) ;
		return 0 ;
	}

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	// compare the number of requested to the number of available conferences
	requested = ( get_conference_count() < requested ) ? get_conference_count() : requested ;

	//
	// loop through conf list
	//

	struct ast_conference* conf = conflist ;
	int count = 0 ;

	while ( count <= requested && conf != NULL )
	{
		// copy stats struct to array
		stats[ count ] = conf->stats ;

		conf = conf->next ;
		++count ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return count ;
}

int get_conference_stats_by_name( ast_conference_stats* stats, const char* name )
{
	// no conferences exist
	if ( conflist == NULL )
	{
		ast_log( AST_CONF_DEBUG, "conflist has not yet been initialized, name => %s\n", name ) ;
		return 0 ;
	}

	// make sure stats is null
	stats = NULL ;

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	struct ast_conference *conf = conflist ;

	// loop through conf list
	while ( conf != NULL )
	{
		if ( strncasecmp( (const char*)&(conf->name), name, 80 ) == 0 )
		{
			// copy stats for found conference
			*stats = conf->stats ;
			break ;
		}

		conf = conf->next ;
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return ( stats == NULL ) ? 0 : 1 ;
}

struct ast_conf_member *find_member( const char *chan )
{
	struct ast_conf_member *member ;
	struct channel_bucket *bucket = &( channel_table[hash(chan) % CHANNEL_TABLE_SIZE] ) ;

	AST_LIST_LOCK ( bucket ) ;

	AST_LIST_TRAVERSE ( bucket, member, hash_entry )
		if (!strcmp (member->channel_name, chan) ) {
			ast_mutex_lock (&member->lock) ;
			member->use_count++ ;
			break ;
		}

	AST_LIST_UNLOCK ( bucket ) ;

	return member ;
}

#ifdef	VIDEO
// All the VAD-based video switching magic happens here
// This function should be called inside conference_exec
// The conference mutex should be locked, we don't have to do it here
static void do_VAD_switching(struct ast_conference *conf)
{
	struct ast_conf_member *member;
	struct timeval current_time = ast_tvnow();
	long longest_speaking = 0;
	struct ast_conf_member *longest_speaking_member = NULL;
	int current_silent = 0;
	int current_linger = 0;
	int current_no_video = 0;
	int current_force_switch = 0;
	int default_no_video = 0;
	int default_force_switch = 0;

	// Scan the member list looking for the longest speaking member
	// We also check if the currently speaking member has been silent for a while
	// Also, we check for camera disabled or video muted members
	// We say that a member is speaking after his speaking state has been on for
	// at least AST_CONF_VIDEO_START_TIMEOUT ms
	// We say that a member is silent after his speaking state has been off for
	// at least AST_CONF_VIDEO_STOP_TIMEOUT ms
	for ( member = conf->memberlist ;
	      member != NULL ;
	      member = member->next )
	{
		// If a member connects via telephone, they don't have video
		if ( member->via_telephone )
			continue;

		// We check for no VAD switching, video-muted or camera disabled
		// If yes, this member will not be considered as a candidate for switching
		// If this is the currently speaking member, then mark it so we force a switch
		if ( !member->vad_switch )
			continue;

		// Extract the linger and force switch flags of the current video source
		if ( member->id == conf->current_video_source_id )
		{
			current_linger = member->vad_linger;
			current_force_switch = member->force_vad_switch;
		}
		
		if ( member->id == conf->default_video_source_id )
			default_force_switch = member->force_vad_switch;

		if ( member->no_camera || member->mute_video )
		{
			if ( member->id == conf->default_video_source_id )
				default_no_video = 1;
			
			if ( member->id == conf->current_video_source_id )
				current_no_video = 1;
			else if ( !member->force_vad_switch )
				continue;
		}

		// Check if current speaker has been silent for a while
		if ( member->id == conf->current_video_source_id &&
		     !member->speaking_state &&
		     ast_tvdiff_ms(current_time, member->last_state_change) > member->video_stop_timeout )
		{
			current_silent = 1;
		}

		// Find a candidate to switch to by looking for the longest speaking member
		// We exclude the current video source from the search
		if ( member->id != conf->current_video_source_id && member->speaking_state == 1 )
		{
			long speak_time = ast_tvdiff_ms(current_time, member->last_state_change);
			if ( speak_time > member->video_start_timeout && speak_time > longest_speaking )
			{
				longest_speaking = speak_time;
				longest_speaking_member = member;
			}
		}
	}

	// We got our results, now let's make a decision
	// If the currently speaking member has been marked as silent, then we take the longest
	// speaking member.  If no member is speaking, but the current member has the vad_linger
	// flag set, we stay put, otherwise we go to default.  If there's no default, we blank.
	// As a policy we don't want to switch away from a member that is speaking
	// however, we might need to refine this to avoid a situation when a member has a
	// low noise threshold or its VAD is simply stuck
	if ( 
	     (conf->current_video_source_id < 0) ||
	     (current_silent && !current_linger) ||
	     (current_silent && longest_speaking_member != NULL ) ||
	     (current_no_video && !current_force_switch)
	   )
	{
		int new_id;

		if ( longest_speaking_member )
			// Somebody is talking, switch to that member
			new_id = longest_speaking_member->id;
		else if ( conf->default_video_source_id >= 0  &&
		          (!default_no_video || default_force_switch)
		        )
			// No talking, but we have a default that can send video
			new_id = conf->default_video_source_id;
		else
			// No default, switch to empty (-1)
			new_id = -1;

		do_video_switching(conf, new_id, 0);
	}
}

int lock_conference(const char *conference, int member_id)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                   res;

	if ( conference == NULL || member_id < 0 )
		return -1 ;

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	// Look for conference
	res = 0;
	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// Search member list for our member
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( member->id == member_id && !member->mute_video )
				{
					do_video_switching(conf, member_id, 0);
					conf->video_locked = 1;
					res = 1;

					manager_event(EVENT_FLAG_CALL, "ConferenceLock", "ConferenceName: %s\r\nChannel: %s\r\n", conf->name, member->channel_name);
					break;
				}
			}

			// Release conference lock
			ast_rwlock_unlock( &conf->lock );
			break;
		}
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

int lock_conference_channel(const char *conference, const char *channel)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                   res;

	if ( conference == NULL || channel == NULL )
		return -1 ;

	// acquire mutex
	ast_mutex_lock( &conflist_lock ) ;

	// Look for conference
	res = 0;
	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// Search member list for our member
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( strcmp(channel, member->channel_name) == 0 && !member->mute_video )
				{
					do_video_switching(conf, member->id, 0);
					conf->video_locked = 1;
					res = 1;

					manager_event(EVENT_FLAG_CALL, "ConferenceLock", "ConferenceName: %s\r\nChannel: %s\r\n", conf->name, member->channel_name);
					break;
				}
			}

			// Release conference lock
			ast_rwlock_unlock( &conf->lock );
			break;
		}
	}

	// release mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

int unlock_conference(const char *conference)
{
	struct ast_conference  *conf;
	int                   res;

	if ( conference == NULL )
		return -1;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	// Look for conference
	res = 0;
	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			conf->video_locked = 0;
			manager_event(EVENT_FLAG_CALL, "ConferenceUnlock", "ConferenceName: %s\r\n", conf->name);
			do_video_switching(conf, conf->default_video_source_id, 0);
			res = 1;

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

int set_default_id(const char *conference, int member_id)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                   res;

	if ( conference == NULL )
		return -1 ;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	// Look for conference
	res = 0;
	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			if ( member_id < 0 )
			{
				conf->default_video_source_id = -1;
				manager_event(EVENT_FLAG_CALL, "ConferenceDefault", "ConferenceName: %s\r\nChannel: empty\r\n", conf->name);
				res = 1;
				break;
			} else
			{
				// Search member list for our member
				// acquire conference lock
				ast_rwlock_rdlock( &conf->lock );

				for ( member = conf->memberlist ; member != NULL ; member = member->next )
				{
					// We do not allow video muted members or members that do not support
					// VAD switching to become defaults
					if ( member->id == member_id &&
					     !member->mute_video &&
					     member->vad_switch
					   )
					{
						conf->default_video_source_id = member_id;
						res = 1;

						manager_event(EVENT_FLAG_CALL, "ConferenceDefault", "ConferenceName: %s\r\nChannel: %s\r\n", conf->name, member->channel_name);
						break;
					}
				}

				// Release conference lock
				ast_rwlock_unlock( &conf->lock );
				break;
			}
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;

}

int set_default_channel(const char *conference, const char *channel)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                   res;

	if ( conference == NULL || channel == NULL )
		return -1 ;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	// Look for conference
	res = 0;
	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// Search member list for our member
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				// We do not allow video muted members or members that do not support
				// VAD switching to become defaults
				if ( strcmp(channel, member->channel_name) == 0 &&
				     !member->mute_video &&
				     member->vad_switch
				   )
				{
					conf->default_video_source_id = member->id;
					res = 1;

					manager_event(EVENT_FLAG_CALL, "ConferenceDefault", "ConferenceName: %s\r\nChannel: %s\r\n", conf->name, member->channel_name);
					break;
				}
			}

			// Release conference lock
			ast_rwlock_unlock( &conf->lock );
			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

int video_mute_member(const char *conference, int member_id)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                    res;

	if ( conference == NULL || member_id < 0 )
		return -1;

	res = 0;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( member->id == member_id )
				{
					// acquire member mutex
					ast_mutex_lock( &member->lock );

					member->mute_video = 1;

					// release member mutex
					ast_mutex_unlock( &member->lock );

					manager_event(EVENT_FLAG_CALL, "ConferenceVideoMute", "ConferenceName: %s\r\nChannel: %s\r\n", conf->name, member->channel_name);

					if ( member->id == conf->current_video_source_id )
					{
						do_video_switching(conf, conf->default_video_source_id, 0);
					}

					res = 1;
					break;
				}
			}

			// release conference lock
			ast_rwlock_unlock( &conf->lock );

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

int video_unmute_member(const char *conference, int member_id)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                    res;

	if ( conference == NULL || member_id < 0 )
		return -1;

	res = 0;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( member->id == member_id )
				{
					// acquire member mutex
					ast_mutex_lock( &member->lock );

					member->mute_video = 0;

					// release member mutex
					ast_mutex_unlock( &member->lock );

					manager_event(EVENT_FLAG_CALL, "ConferenceVideoUnmute", "ConferenceName: %s\r\nChannel: %s\r\n", conf->name, member->channel_name);

					res = 1;
					break;
				}
			}

			// release conference lock
			ast_rwlock_unlock( &conf->lock );

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

int video_mute_channel(const char *conference, const char *channel)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                    res;

	if ( conference == NULL || channel == NULL )
		return -1;

	res = 0;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( strcmp(channel, member->channel_name) == 0 )
				{
					// acquire member mutex
					ast_mutex_lock( &member->lock );

					member->mute_video = 1;

					// release member mutex
					ast_mutex_unlock( &member->lock );

					manager_event(EVENT_FLAG_CALL, "ConferenceVideoMute", "ConferenceName: %s\r\nChannel: %s\r\n", conf->name, member->channel_name);

					if ( member->id == conf->current_video_source_id )
					{
						do_video_switching(conf, conf->default_video_source_id, 0);
					}

					res = 1;
					break;
				}
			}

			// release conference lock
			ast_rwlock_unlock( &conf->lock );

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

int video_unmute_channel(const char *conference, const char *channel)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                    res;

	if ( conference == NULL || channel == NULL )
		return -1;

	res = 0;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( strcmp(channel, member->channel_name) == 0 )
				{
					// acquire member mutex
					ast_mutex_lock( &member->lock );

					member->mute_video = 0;

					// release member mutex
					ast_mutex_unlock( &member->lock );

					manager_event(EVENT_FLAG_CALL, "ConferenceVideoUnmute", "ConferenceName: %s\r\nChannel: %s\r\n", conf->name, member->channel_name);

					res = 1;
					break;
				}
			}

			// release conference lock
			ast_rwlock_unlock( &conf->lock );

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}
#endif
#ifdef	TEXT
//
// Text message functions
//
int send_text(const char *conference, int member_id, const char *text)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                    res;

	if ( conference == NULL || member_id < 0 || text == NULL )
		return -1;

	res = 0;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( member->id == member_id )
				{
					res = send_text_message_to_member(member, text) == 0;
					break;
				}
			}

			// release conference lock
			ast_rwlock_unlock( &conf->lock );

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;
	return res;
}

int send_text_channel(const char *conference, const char *channel, const char *text)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                    res;

	if ( conference == NULL || channel == NULL || text == NULL )
		return -1;

	res = 0;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( strcmp(member->channel_name, channel) == 0 )
				{
					res = send_text_message_to_member(member, text) == 0;
					break;
				}
			}

			// release conference lock
			ast_rwlock_unlock( &conf->lock );

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

int send_text_broadcast(const char *conference, const char *text)
{
	struct ast_conference  *conf;
	struct ast_conf_member *member;
	int                    res;

	if ( conference == NULL || text == NULL )
		return -1;

	res = 0;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( send_text_message_to_member(member, text) == 0 )
					res = res || 1;
			}

			// release conference lock
			ast_rwlock_unlock( &conf->lock );

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

// Creates a text frame and sends it to a given member
// Returns 0 on success, -1 on failure
int send_text_message_to_member(struct ast_conf_member *member, const char *text)
{
	struct ast_frame *f;

	if ( member == NULL || text == NULL ) return -1;

	if ( member->does_text )
	{
		f = create_text_frame(text, 1);
		if ( f == NULL || queue_outgoing_text_frame(member, f) != 0) return -1;
		ast_frfree(f);
	}

	return 0;
}
#endif
#ifdef	VIDEO
// Associates two members
// Drives VAD-based video switching of dst_member from audio from src_member
// This can be used when a member participates in a video conference but
// talks using a telephone (simulcast) connection
int drive(const char *conference, int src_member_id, int dst_member_id)
{
	int res;
	struct ast_conference *conf;
	struct ast_conf_member *member;
	struct ast_conf_member *src;
	struct ast_conf_member *dst;

	if ( conference == NULL || src_member_id < 0 )
		return -1;

	res = 0;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			src = NULL;
			dst = NULL;
			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( member->id == src_member_id )
					src = member;
				if ( member->id == dst_member_id )
					dst = member;
			}
			if ( src != NULL )
			{
				// acquire member mutex
				ast_mutex_lock(&src->lock);

				if ( dst != NULL )
				{
					src->driven_member = dst;
					// Make sure the driven member's speaker count is correct
					if ( src->speaking_state == 1 )
						increment_speaker_count(src->driven_member, 1);
					res = 1;
				} else
				{
					if ( dst_member_id < 0 )
					{
						// Make sure the driven member's speaker count is correct
						if ( src->speaking_state == 1 )
							decrement_speaker_count(src->driven_member, 1);
						src->driven_member = NULL;
						res = 1;
					}
				}

				// release member mutex
				ast_mutex_unlock(&src->lock);
			}

			// release conference lock
			ast_rwlock_unlock( &conf->lock );

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

// Associates two channels
// Drives VAD-based video switching of dst_channel from audio from src_channel
// This can be used when a member participates in a video conference but
// talks using a telephone (simulcast) connection
int drive_channel(const char *conference, const char *src_channel, const char *dst_channel)
{
	int res;
	struct ast_conference *conf;
	struct ast_conf_member *member;
	struct ast_conf_member *src;
	struct ast_conf_member *dst;

	if ( conference == NULL || src_channel == NULL )
		return -1;

	res = 0;

	// acquire conference list mutex
	ast_mutex_lock( &conflist_lock ) ;

	for ( conf = conflist ; conf != NULL ; conf = conf->next )
	{
		if ( strcmp(conference, conf->name) == 0 )
		{
			// acquire conference lock
			ast_rwlock_rdlock( &conf->lock );

			src = NULL;
			dst = NULL;
			for ( member = conf->memberlist ; member != NULL ; member = member->next )
			{
				if ( strcmp(src_channel, member->channel_name) == 0 )
					src = member;
				if ( dst_channel != NULL && strcmp(dst_channel, member->channel_name) == 0 )
					dst = member;
			}
			if ( src != NULL )
			{
				// acquire member mutex
				ast_mutex_lock(&src->lock);

				if ( dst != NULL )
				{
					src->driven_member = dst;
					// Make sure the driven member's speaker count is correct
					if ( src->speaking_state == 1 )
						increment_speaker_count(src->driven_member, 1);
					res = 1;
				} else
				{
					if ( dst_channel == NULL )
					{
						// Make sure the driven member's speaker count is correct
						if ( src->speaking_state == 1 )
							decrement_speaker_count(src->driven_member, 1);
						src->driven_member = NULL;
						res = 1;
					}
				}

				// release member mutex
				ast_mutex_unlock(&src->lock);
			}

			// release conference lock
			ast_rwlock_unlock( &conf->lock );

			break;
		}
	}

	// release conference list mutex
	ast_mutex_unlock( &conflist_lock ) ;

	return res;
}

// Switches video source
// Sends a manager event as well as
// a text message notifying members of a video switch
// The notification is sent to the current member and to the new member
// The function locks the conference mutex as required
static void do_video_switching(struct ast_conference *conf, int new_id, int lock)
{
	if ( conf == NULL ) return;

	if ( lock )
		ast_rwlock_rdlock( &conf->lock );

	// No need to do anything if the current member is the same as the new member
	if ( new_id != conf->current_video_source_id )
	{
		// During chat mode, we don't actually switch members
		// however, we keep track of who's supposed to be current speaker
		// so we can switch to it once we get out of chat mode.
		// We also send VideoSwitch events so anybody monitoring the AMI
		// can keep track of this
		struct ast_conf_member *member;
		struct ast_conf_member *new_member = NULL;

		for ( member = conf->memberlist ; member != NULL ; member = member->next )
		{
			if ( member->id == conf->current_video_source_id )
			{
				if ( !conf->chat_mode_on )
					stop_video(member);
			}
			if ( member->id == new_id )
			{
				if ( !conf->chat_mode_on )
					start_video(member);
				new_member = member;
			}
		}

		manager_event(EVENT_FLAG_CALL,
			"ConferenceVideoSwitch",
			"ConferenceName: %s\r\nChannel: %s\r\n",
			conf->name,
			new_member == NULL ? "empty" : new_member->channel_name
			);

		conf->current_video_source_id = new_id;
	}

	if ( lock )
		ast_rwlock_unlock( &conf->lock );
}
#endif
int play_sound_channel(int fd, const char *channel, char **file, int mute, int n)
{
	struct ast_conf_member *member;
	struct ast_conf_soundq *newsound;
	struct ast_conf_soundq **q;

	ast_cli(fd, "Playing sound %s to member %s %s\n",
		      *file, channel, mute ? "with mute" : "");

	member = find_member(channel);
	if( !member )
	{
		ast_cli(fd, "Member %s not found\n", channel);
		return 0;
	} else if (!member->moh_flag)
	{

		while ( n-- > 0 ) {
			if( !(newsound = calloc(1, sizeof(struct ast_conf_soundq))))
				break ;

			ast_copy_string(newsound->name, *file, sizeof(newsound->name));

			// append sound to the end of the list.
			for ( q=&member->soundq; *q; q = &((*q)->next) ) ;
			*q = newsound;

			file++;
		}

		member->muted = mute;

	}
	if ( !--member->use_count && member->delete_flag )
		ast_cond_signal ( &member->delete_var ) ;
	ast_mutex_unlock(&member->lock);

	return 1 ;
}

int stop_sound_channel(int fd, const char *channel)
{
	struct ast_conf_member *member;
	struct ast_conf_soundq *sound;
	struct ast_conf_soundq *next;

	ast_cli( fd, "Stopping sounds to member %s\n", channel);

	member = find_member(channel);
	if ( !member )
	{
		ast_cli(fd, "Member %s not found\n", channel);
		return 0;
	}

	// clear all sounds
	sound = member->soundq;

	while ( sound )
	{
		next = sound->next;
		sound->stopped = 1;
		sound = next;
	}
	if ( !--member->use_count && member->delete_flag )
		ast_cond_signal ( &member->delete_var ) ;
	ast_mutex_unlock(&member->lock);

	return 1;
}

int start_moh_channel(int fd, const char *channel)
{
	struct ast_conf_member *member;

	ast_cli( fd, "Starting moh to member %s\n", channel);

	member = find_member(channel);
	if ( !member )
	{
		ast_cli(fd, "Member %s not found\n", channel);
		return 0;
	} else if (!member->norecv_audio && !member->moh_flag)
	{
		member->moh_flag = 1;
	}

	if ( !--member->use_count && member->delete_flag )
		ast_cond_signal ( &member->delete_var ) ;
	ast_mutex_unlock(&member->lock);

	return 1;
}

int stop_moh_channel(int fd, const char *channel)
{
	struct ast_conf_member *member;

	ast_cli( fd, "Stopping moh to member %s\n", channel);

	member = find_member(channel);
	if ( !member )
	{
		ast_cli(fd, "Member %s not found\n", channel);
		return 0;
	} else if (!member->norecv_audio && member->moh_flag)
	{
		ast_moh_stop(member->chan);

		member->moh_flag = member->muted = 0;
		member->ready_for_outgoing = 1;
	}

	if ( !--member->use_count && member->delete_flag )
		ast_cond_signal ( &member->delete_var ) ;
	ast_mutex_unlock(&member->lock);

	return 1;
}

int talk_volume_channel(int fd, const char *channel, int up)
{
	struct ast_conf_member *member;

	ast_cli( fd, "Adjusting talk volume level %s for member %s\n", up ? "up" : "down", channel);

	member = find_member(channel);
	if ( !member )
	{
		ast_cli(fd, "Member %s not found\n", channel);
		return 0;
	}

	up ? member->talk_volume++ : member->talk_volume--;

	if ( !--member->use_count && member->delete_flag )
		ast_cond_signal ( &member->delete_var ) ;
	ast_mutex_unlock(&member->lock);

	return 1;
}

int listen_volume_channel(int fd, const char *channel, int up)
{
	struct ast_conf_member *member;

	ast_cli( fd, "Adjusting listen volume level %s for member %s\n", up ? "up" : "down", channel);

	member = find_member(channel);
	if ( !member )
	{
		ast_cli(fd, "Member %s not found\n", channel);
		return 0;
	}

	up ? member->listen_volume++ : member->listen_volume--;

	if ( !--member->use_count && member->delete_flag )
		ast_cond_signal ( &member->delete_var ) ;
	ast_mutex_unlock(&member->lock);

	return 1;
}

int volume(int fd, const char *conference, int up)
{
	struct ast_conference *conf;

	// acquire the conference list lock
	ast_mutex_lock(&conflist_lock);

	conf = find_conf(conference);
	if ( conf == NULL )
	{
		// release the conference list lock
		ast_mutex_unlock(&conflist_lock);

		ast_cli( fd, "Conference %s not found\n", conference ) ;
		return 0;
	}

	// acquire the conference lock
	ast_rwlock_wrlock( &conf->lock ) ;

	// adjust volume
	up ? conf->volume++ : conf->volume--;

	// release the conference lock
	ast_rwlock_unlock( &conf->lock ) ;

	// release the conference list lock
	ast_mutex_unlock(&conflist_lock);

	return 1;
}
#ifdef	VIDEO
static int update_member_broadcasting(struct ast_conference *conf, struct ast_conf_member *member, struct conf_frame *cfr, struct timeval now)
{
	if ( conf == NULL || member == NULL )
		return 0;

	if ( cfr == NULL &&
	     member->video_broadcast_active &&
	     (ast_tvdiff_ms(now, member->last_video_frame_time)) > AST_CONF_VIDEO_STOP_BROADCAST_TIMEOUT
	   )
	{
		member->video_broadcast_active = 0;
		manager_event(EVENT_FLAG_CALL,
				"ConferenceVideoBroadcastOff",
				"ConferenceName: %s\r\nChannel: %s\r\n",
				conf->name,
				member->channel_name
				);
	} else if ( cfr != NULL )
	{
		member->last_video_frame_time = now;
		if ( !member->video_broadcast_active )
		{
			member->video_broadcast_active = 1;
			manager_event(EVENT_FLAG_CALL,
				"ConferenceVideoBroadcastOn",
				"ConferenceName: %s\r\nChannel: %s\r\n",
				conf->name,
				member->channel_name
				);
		}
	}

	return member->video_broadcast_active;
}
#endif

int hash(const char *channel_name)
{
	int i = 0, h = 0, g;
	while (channel_name[i])
	{
		h = (h << 4) + channel_name[i++];
		if ( (g = h & 0xF0000000) )
			h ^= g >> 24;
		h &= ~g;
	}
	//ast_log(AST_CONF_DEBUG, "Hashed channel_name: %s to 0x%08x\n", channel_name, h);
	return h;
}

int count_exec( struct ast_channel* chan, void* data )
{
	int res = 0;
	struct ast_conference *conf;
	int count;
	char *localdata;
	char val[80] = "0"; 
	AST_DECLARE_APP_ARGS(args,
		AST_APP_ARG(confno);
		AST_APP_ARG(varname);
	);
	if (ast_strlen_zero(data)) {
		ast_log(LOG_WARNING, "ConferenceCount requires an argument (conference number)\n");
		return -1;
	}

	if (!(localdata = ast_strdupa(data))) {
		return -1;
	}

	AST_STANDARD_APP_ARGS(args, localdata);
	
	ast_mutex_lock(&conflist_lock) ;

	conf = find_conf(args.confno);

	if (conf) {
		count = conf->membercount;
	} else
		count = 0;

	ast_mutex_unlock(&conflist_lock) ;

	if (!ast_strlen_zero(args.varname)){
		snprintf(val, sizeof(val), "%d",count);
		pbx_builtin_setvar_helper(chan, args.varname, val);
	} else {
		if (chan->_state != AST_STATE_UP)
			ast_answer(chan);
		res = ast_say_number(chan, count, "", chan->language, (char *) NULL);
	}
	return res;
}
