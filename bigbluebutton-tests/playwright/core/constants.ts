export const CI: boolean = process.env.CI === 'true';
const TIMEOUT_MULTIPLIER: number = Number(process.env.TIMEOUT_MULTIPLIER);
const MULTIPLIER: number = CI ? TIMEOUT_MULTIPLIER || 2 : TIMEOUT_MULTIPLIER || 1;

// GLOBAL TESTS VARS
export const ELEMENT_WAIT_TIME: number = 5000 * MULTIPLIER;
export const ELEMENT_WAIT_LONGER_TIME: number = 10000 * MULTIPLIER;
export const ELEMENT_WAIT_EXTRA_LONG_TIME: number = 15000 * MULTIPLIER;
export const LOOP_INTERVAL: number = 1200;

// STRESS TESTS VARS
export const JOIN_AS_MODERATOR_TEST_ROUNDS: number = 15;
export const MAX_JOIN_AS_MODERATOR_FAIL_RATE: number = 0.05;
export const BREAKOUT_ROOM_INVITATION_TEST_ROUNDS: number = 20;
export const JOIN_TWO_USERS_ROUNDS: number = 20;
export const JOIN_TWO_USERS_KEEPING_CONNECTED_ROUNDS: number = 20;
export const JOIN_TWO_USERS_EXCEEDING_MAX_PARTICIPANTS: number = 20;
export const MAX_PARTICIPANTS_TO_JOIN: number = 4;

// MEDIA CONNECTION TIMEOUTS
export const VIDEO_LOADING_WAIT_TIME: number = 15000;
export const UPLOAD_PDF_WAIT_TIME: number = 30000 * MULTIPLIER;
export const CUSTOM_MEETING_ID: string = 'custom-meeting';
