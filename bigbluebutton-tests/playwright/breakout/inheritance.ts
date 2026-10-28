import { expect, Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { getMeetingInfo } from '../core/endpoints';
import { readRows } from '../core/graphql';
import { Page } from '../core/page';
import { parameters } from '../core/parameters';
import { skipSlide, uploadSinglePresentation } from '../presentation/util';
import { Join } from './join';

// The parent of the getMeetingInfo test. Every meeting of the suite is created with
// attendeePW=ap and moderatorPW=mp already (core/helpers.ts createMeetingUrl).
const PARENT_DIAL_NUMBER = '+1-613-555-0199';
const PARENT_METADATA = { foo: 'bar' };

export function roomsApiCreateParameter(voiceBridge: number): string {
  const dialNumber = encodeURIComponent(PARENT_DIAL_NUMBER);
  return `meta_foo=${PARENT_METADATA.foo}&dialNumber=${dialNumber}&voiceBridge=${voiceBridge}`;
}

// The name the creation panel gives room N (app.createBreakoutRoom.room)
const roomName = (sequence: number) => `Room ${sequence}`;
// The duration the creation panel offers, in minutes
const PANEL_DURATION = 15;
// The path of the bbb-webrtc-sfu signalling socket
const SFU_SOCKET_PATH = '/bbb-webrtc-sfu';

type MeetingInfo = Awaited<ReturnType<typeof getMeetingInfo>>['data']['response'];
// The getMeetingInfo fields core/endpoints.ts does not type; xml2js turns every element into an array
interface RoomMeetingInfo extends Omit<MeetingInfo, 'metadata'> {
  voiceBridge: string[];
  dialNumber: string[];
  attendeePW?: string[];
  moderatorPW?: string[];
  duration: string[];
  recording: string[];
  freeJoin?: string[];
  // <metadata><foo>bar</foo></metadata> parses to [{ foo: ['bar'] }], an empty <metadata/> to ['']
  metadata: Array<Record<string, string[]> | string>;
}

async function readMeetingInfo(meetingId: string): Promise<RoomMeetingInfo> {
  const { data } = await getMeetingInfo(meetingId);
  return data.response as unknown as RoomMeetingInfo;
}

function metadataOf(info: RoomMeetingInfo): Record<string, string> {
  const [entries] = info.metadata ?? [];
  if (!entries || typeof entries === 'string') return {};
  return Object.fromEntries(Object.entries(entries).map(([key, [value]]) => [key, value]));
}

// The meeting row a participant reads: what a room took from its parent
const MEETING_ROW =
  'subscription { meeting { disabledFeatures notifyRecordingIsOn ' +
  'usersPolicies { guestPolicy multiUserWhiteboardEnabled } voiceSettings { muteOnStart } } }';
interface MeetingRow {
  disabledFeatures: string[];
  notifyRecordingIsOn: boolean;
  usersPolicies: { guestPolicy: string; multiUserWhiteboardEnabled: boolean };
  voiceSettings: { muteOnStart: boolean };
}

async function readMeetingRow(page: Page): Promise<MeetingRow> {
  const [row] = await readRows<MeetingRow>(page, MEETING_ROW, 'meeting');
  expect(row, 'should read the meeting row of the participant').toBeTruthy();
  return row;
}

const CURRENT_PAGE = 'subscription { pres_page_curr { presentationId num totalPages content } }';
interface CurrentPage {
  presentationId: string;
  num: number;
  totalPages: number;
  content: string;
}

async function readCurrentPage(page: Page): Promise<CurrentPage | undefined> {
  const [currentPage] = await readRows<CurrentPage>(page, CURRENT_PAGE, 'pres_page_curr');
  return currentPage;
}

async function readPresentationPages(page: Page, presentationId: string) {
  const query =
    `subscription { pres_page(where: { presentationId: { _eq: "${presentationId}" } }, ` +
    'order_by: { num: asc }) { num content } }';
  return readRows<{ num: number; content: string }>(page, query, 'pres_page');
}

// Five pages, each with its own text
const DISTINCT_PAGES_PRESENTATION = 'smartSlidesPresentation.pdf';
const DISTINCT_PAGES_COUNT = 5;

const CURRENT_USER_PRESENTER = 'subscription { user_current { presenter } }';

async function isPresenter(page: Page): Promise<boolean> {
  const [user] = await readRows<{ presenter: boolean }>(page, CURRENT_USER_PRESENTER, 'user_current');
  return user?.presenter === true;
}

// Starts the recording as the moderator in the given meeting
async function startRecording(moderatorPage: Page) {
  // toasts of a freshly joined meeting cover the recording indicator
  await moderatorPage.closeAllToastNotifications();
  await moderatorPage.waitAndClick(e.recordingIndicator);
  await moderatorPage.waitAndClick(e.confirmRecordingButton);
  await expect(
    moderatorPage.page.locator(`${e.recordingIndicator} button`),
    'the moderator should start the recording',
  ).toHaveAttribute('aria-label', 'Pause recording', { timeout: ELEMENT_WAIT_LONGER_TIME });
}

export class Inheritance extends Join {
  // The attendee joins the first room from the breakout panel (the invitation was dismissed).
  // onOpen sees the room's tab before it loads.
  private async openRoomFromPanel(attendee: Page, onOpen?: (tab: PlaywrightPage) => void): Promise<Page> {
    await attendee.page.bringToFront();
    await attendee.waitAndClick(e.breakoutRoomSidebarButton);
    const tab = await attendee.handleNewTab(e.joinFirstRoom, attendee.page.context());
    onOpen?.(tab);
    const breakoutPage = new Page(this.browser, tab, this.modPage.testInfo);
    await breakoutPage.page.bringToFront();
    await breakoutPage.hasElement(e.presentationTitle, 'should load the breakout room', ELEMENT_WAIT_EXTRA_LONG_TIME);
    return breakoutPage;
  }

  // Puts the attendees in the first room and creates the rooms, leaving their invitations open
  private async createWithAttendeesInFirstRoom(attendees: Page[]) {
    await this.modPage.setHeightWidthViewPortSize({ width: 1920, height: 1080 });
    await this.modPage.waitAndClick(e.breakoutRoomSidebarButton);
    await this.modPage.waitForSelector(e.attendeeNotAssigned, ELEMENT_WAIT_EXTRA_LONG_TIME);
    // the unassigned users are listed by name, so the attendees come before the moderator
    for (const attendee of attendees) {
      await this.modPage.dragDropSelector(e.attendeeNotAssigned, e.breakoutBox1);
      await this.modPage.hasText(e.breakoutBox1, attendee.username, `should assign ${attendee.username} to room 1`);
    }
    await this.modPage.waitAndClick(e.createBreakoutRoomsButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.setHeightWidthViewPortSize(); // reset to default size
  }

  // The rooms must have been created from the panel; the parent with roomsApiCreateParameter(parentVoiceBridge)
  async roomsReadThroughTheApi(parentVoiceBridge: number) {
    const parent = await readMeetingInfo(this.modPage.meetingId);
    expect(parent.dialNumber, 'the parent should take the dial number it was created with').toEqual([
      PARENT_DIAL_NUMBER,
    ]);
    expect(metadataOf(parent), 'the parent should keep the metadata it was created with').toMatchObject(
      PARENT_METADATA,
    );

    let roomIds: string[] = [];
    await expect
      .poll(
        async () => {
          roomIds = (await readMeetingInfo(this.modPage.meetingId)).breakoutRooms?.[0]?.breakout ?? [];
          return roomIds.length;
        },
        { message: 'the parent should list its two rooms', timeout: ELEMENT_WAIT_LONGER_TIME },
      )
      .toBe(2);
    const rooms = (await Promise.all(roomIds.map(readMeetingInfo))).sort(
      (a, b) => Number(a.sequence?.[0]) - Number(b.sequence?.[0]),
    );

    // the panel shows the rooms by the names the API gives them
    await this.modPage.hasElement(e.roomName1, `should show "${roomName(1)}" in the moderator's breakout panel`);
    await this.modPage.hasElement(e.roomName2, `should show "${roomName(2)}" in the moderator's breakout panel`);

    rooms.forEach((room, index) => {
      const sequence = index + 1;
      const name = roomName(sequence);
      expect(room.returncode, `getMeetingInfo should succeed for ${name}`).toEqual(['SUCCESS']);
      expect(room.sequence, `${name} should have sequence ${sequence}`).toEqual([String(sequence)]);
      expect(room.meetingName, `${name} should be named as the panel names it`).toEqual([name]);
      expect(room.isBreakout, `${name} should be a breakout room`).toEqual(['true']);
      expect(room.parentMeetingID, `${name} should name the parent's internal id`).toEqual(parent.internalMeetingID);
      expect(room.voiceBridge, `${name} should use the parent's voice bridge followed by its sequence`).toEqual([
        `${parentVoiceBridge}${sequence}`,
      ]);
      expect(room.dialNumber, `${name} should take the parent's dial number`).toEqual([PARENT_DIAL_NUMBER]);
      expect(room.attendeePW, `${name} should take the parent's attendee password`).toEqual([parameters.attendeePW]);
      expect(room.moderatorPW, `${name} should take the parent's moderator password`).toEqual([parameters.moderatorPW]);
      expect(room.duration, `${name} should last as long as the panel said`).toEqual([String(PANEL_DURATION)]);
      expect(room.freeJoin, `${name} should not let the attendees choose their room`).toEqual(['false']);
      expect(room.recording, `${name} should not be recorded (the Record option was not ticked)`).toEqual(['false']);
      expect(metadataOf(room), `${name} should take the parent's metadata`).toMatchObject(PARENT_METADATA);
      expect(metadataOf(room), `${name} should take all of the parent's metadata`).toEqual(metadataOf(parent));
    });
  }

  // The parent's welcome (the suite's default, which contains %%CONFNAME%%) is substituted with the
  // room's name inside the room
  async welcomeMessageNamesTheRoom() {
    const parentName = (await readMeetingInfo(this.modPage.meetingId)).meetingName[0];

    // control: the parent substitutes its own name
    await this.userPage.waitAndClick(e.sessionDetailsButton);
    await this.userPage.hasText(
      e.sessionDetailsModal,
      `Welcome to ${parentName}!`,
      'should welcome the attendee to the parent by its name in the session details',
    );
    await this.userPage.waitAndClick(e.closeModal);
    await this.userPage.wasRemoved(e.sessionDetailsModal, 'should close the session details of the parent');

    const breakoutPage = await this.joinRoom();
    await breakoutPage.waitAndClick(e.sessionDetailsButton);
    await breakoutPage.hasText(
      e.sessionDetailsModal,
      `Welcome to ${roomName(1)}!`,
      'should welcome the attendee to the room by the room name in the session details',
    );
    const roomDetails = breakoutPage.page.locator(e.sessionDetailsModal);
    await expect(roomDetails, 'should replace %%CONFNAME%% in the room').not.toContainText('%%CONFNAME%%');
    await expect(roomDetails, "should not welcome the attendee to the room by the parent's name").not.toContainText(
      parentName,
    );
  }

  // The moderator is the presenter in the parent and, alone in it, in room 1: the presenter alone has
  // the poll button, so the whiteboard tools (the presenter's) are awaited first.
  private static async expectPollsAndSharedNotes(page: Page, available: boolean, where: string) {
    await page.hasElement(e.wbToolbar, `the moderator should be the presenter ${where}`, ELEMENT_WAIT_LONGER_TIME);
    await page.hasElement(e.messagesSidebarButton, `should display the sidebar ${where}`);
    if (available) {
      await page.hasElement(e.sharedNotesSidebarButton, `should offer the shared notes ${where}`);
      await page.hasElement(e.pollSidebarButton, `should offer the polls ${where}`);
    } else {
      await page.wasRemoved(e.sharedNotesSidebarButton, `should not offer the shared notes ${where}`);
      await page.wasRemoved(e.pollSidebarButton, `should not offer the polls ${where}`);
    }
  }

  // The parent was created with or without disabledFeatures=polls,sharedNotes; the rooms from the panel
  async pollsAndSharedNotesFollowTheParent(available: boolean) {
    await Inheritance.expectPollsAndSharedNotes(this.modPage, available, 'in the parent');

    const breakoutModPage = new Page(
      this.browser,
      await this.joinFirstBreakoutRoomAsModerator(),
      this.modPage.testInfo,
    );
    await Inheritance.expectPollsAndSharedNotes(breakoutModPage, available, 'in the room');
    const room = await readMeetingRow(breakoutModPage);
    if (available) {
      expect(room.disabledFeatures, 'the room should not disable polls').not.toContain('polls');
      expect(room.disabledFeatures, 'the room should not disable the shared notes').not.toContain('sharedNotes');
    } else {
      expect(room.disabledFeatures, "the room should take the parent's disabled polls").toContain('polls');
      expect(room.disabledFeatures, "the room should take the parent's disabled shared notes").toContain('sharedNotes');
    }
  }

  // The parent was created with muteOnStart=true; the rooms from the panel
  async muteOnStartIsOffInRooms() {
    // control: the parent joins the attendee muted
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone({ shouldUnmute: false });
    await this.userPage.hasElement(e.unmuteMicButton, 'muteOnStart=true should join the attendee muted in the parent');
    const parent = await readMeetingRow(this.userPage);
    expect(parent.voiceSettings.muteOnStart, 'the parent should have muteOnStart on').toBe(true);

    // the room takes the attendee's microphone along, with the room's own mute-on-start state
    const breakoutPage = await this.openRoomFromPanel(this.userPage);
    await breakoutPage.hasElement(
      e.muteMicButton,
      'should join the attendee unmuted in the room',
      ELEMENT_WAIT_EXTRA_LONG_TIME,
    );
    await breakoutPage.hasElement(e.isTalking, 'the room should hear the attendee');
    await this.userPage.hasElement(e.joinAudio, 'the attendee should have left the audio of the parent');
    const room = await readMeetingRow(breakoutPage);
    expect(room.voiceSettings.muteOnStart, 'the room should have muteOnStart off').toBe(false);
  }

  // Two attendees in room 1 (breakoutRoomsMultiUserWhiteboardDefaultOn=true by default)
  async multiUserWhiteboardOnInRooms() {
    // control: the parent gives no whiteboard tools to an attendee who is not the presenter
    await this.userPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.wasRemoved(e.wbToolbar, 'should not give the attendee the whiteboard tools in the parent');
    const parent = await readMeetingRow(this.userPage);
    expect(parent.usersPolicies.multiUserWhiteboardEnabled, 'the parent should be single-user').toBe(false);

    const attendees = [this.userPage, this.userPage2];
    await this.createWithAttendeesInFirstRoom(attendees);
    const breakoutPages = [
      await this.joinRoomFromInvitation(attendees[0]),
      await this.joinRoomFromInvitation(attendees[1]),
    ];

    // with no moderator in it, the room makes one of the attendees its presenter
    let presenters: boolean[] = [];
    await expect
      .poll(
        async () => {
          presenters = await Promise.all(breakoutPages.map(isPresenter));
          return presenters.filter(Boolean).length;
        },
        { message: 'the room should have one presenter', timeout: ELEMENT_WAIT_LONGER_TIME },
      )
      .toBe(1);
    const viewerIndex = presenters.indexOf(false);
    const viewer = breakoutPages[viewerIndex];
    await viewer.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await viewer.hasElement(
      e.wbToolbar,
      `should give ${attendees[viewerIndex].username}, who is not the presenter, the whiteboard tools in the room`,
      ELEMENT_WAIT_LONGER_TIME,
    );
    const room = await readMeetingRow(viewer);
    expect(room.usersPolicies.multiUserWhiteboardEnabled, 'the room should start multi-user').toBe(true);
  }

  // The parent moves to slide 2 of a presentation whose pages all read differently (default.pdf
  // repeats one blank page from slide 2 on), then creates the rooms with the default "current slide"
  async roomShowsTheParentSlide() {
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.closeAllToastNotifications();
    await uploadSinglePresentation(this.modPage, DISTINCT_PAGES_PRESENTATION);
    await this.modPage.closeAllToastNotifications();
    let presentationId = '';
    await expect
      .poll(
        async () => {
          const current = await readCurrentPage(this.modPage);
          presentationId = current?.presentationId ?? '';
          return current?.totalPages;
        },
        { message: `the parent should show ${DISTINCT_PAGES_PRESENTATION}`, timeout: ELEMENT_WAIT_LONGER_TIME },
      )
      .toBe(DISTINCT_PAGES_COUNT);
    const pages = await readPresentationPages(this.modPage, presentationId);
    const secondSlide = pages.find(({ num }) => num === 2)?.content;
    expect(secondSlide, 'slide 2 should carry a text to compare').toBeTruthy();
    expect(
      pages.filter(({ content }) => content === secondSlide),
      'no other slide should read like slide 2',
    ).toHaveLength(1);

    await skipSlide(this.modPage);
    await expect
      .poll(async () => (await readCurrentPage(this.modPage))?.num, {
        message: 'the parent should move to slide 2',
        timeout: ELEMENT_WAIT_LONGER_TIME,
      })
      .toBe(2);

    await this.create();
    const breakoutPage = await this.joinRoom();
    await breakoutPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_EXTRA_LONG_TIME);
    await expect
      .poll(
        async () => {
          const roomPage = await readCurrentPage(breakoutPage);
          return roomPage && { num: roomPage.num, totalPages: roomPage.totalPages, content: roomPage.content };
        },
        { message: "the room should show the parent's slide 2 as its only page", timeout: ELEMENT_WAIT_LONGER_TIME },
      )
      .toEqual({ num: 1, totalPages: 1, content: secondSlide });
  }

  // The parent was created with record=true, breakoutRoomsRecord=true and notifyRecordingIsOn=true,
  // the rooms with the Record option ticked
  async recordingConsentInRooms() {
    // control: the parent asks the attendee to consent once its recording starts
    await this.modPage.waitForSelector(e.whiteboard, ELEMENT_WAIT_LONGER_TIME);
    await startRecording(this.modPage);
    await this.userPage.hasElement(
      e.recordingNotifyModal,
      'should ask the attendee in the parent to consent to the recording',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await this.userPage.waitAndClick(e.recordingNotifyContinue);
    await this.userPage.wasRemoved(e.recordingNotifyModal, 'should close the consent once the attendee continues');

    await this.create(false, false, true);
    const breakoutUserPage = await this.joinRoom();
    const breakoutModPage = new Page(
      this.browser,
      await this.joinFirstBreakoutRoomAsModerator(),
      this.modPage.testInfo,
    );
    await startRecording(breakoutModPage);

    await breakoutUserPage.hasElement(
      e.recordingNotifyModal,
      'should ask the attendee in the room to consent to the recording',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await breakoutUserPage.hasText(
      e.recordingNotifyDescription,
      e.recordingNotifyDefaultText,
      'should show the recording consent text in the room',
    );
    const room = await readMeetingRow(breakoutUserPage);
    expect(room.notifyRecordingIsOn, "the room should take the parent's notifyRecordingIsOn").toBe(true);
  }

  // The parent was created with guestPolicy=ASK_MODERATOR and has only its moderator
  async guestJoinsRoomWithoutLobby() {
    // control: the parent holds the guest in its lobby until the moderator lets them in
    await this.initUserPage(this.context, {
      joinParameter: 'guest=true',
      shouldCloseAudioModal: false,
      shouldCheckAllInitialSteps: false,
    });
    await this.userPage.hasText(e.guestMessage, /wait/, 'should hold the guest in the lobby of the parent');
    await this.modPage.waitAndClick(e.usersListSidebarButton);
    await this.modPage.waitAndClick(e.guestWaitingUsers);
    await this.modPage.waitAndClick(e.acceptGuest);
    await this.userPage.closeAudioModal();
    await this.userPage.hasElement(e.presentationTitle, 'should let the approved guest into the parent');
    const parent = await readMeetingRow(this.modPage);
    expect(parent.usersPolicies.guestPolicy, 'the parent should ask the moderator').toBe('ASK_MODERATOR');

    // nobody approves anyone in the room: the guest gets in only because the room accepts everyone
    await this.createWithAttendeesInFirstRoom([this.userPage]);
    const breakoutPage = await this.joinRoomFromInvitation(this.userPage);
    await breakoutPage.wasRemoved(e.guestMessage, 'should not hold the guest in a lobby of the room');
    const room = await readMeetingRow(breakoutPage);
    expect(room.usersPolicies.guestPolicy, 'the room should accept everyone').toBe('ALWAYS_ACCEPT');
  }

  // The parent was created with cameraBridge=bbb-webrtc-sfu; the rooms from the panel
  async webcamBridgeInRoom() {
    const socketUrls: string[] = [];
    const breakoutPage = await this.openRoomFromPanel(this.userPage, (tab) =>
      tab.on('websocket', (socket) => socketUrls.push(socket.url())),
    );
    await breakoutPage.closeAudioModal();
    await breakoutPage.shareWebcam();
    expect(
      socketUrls.some((url) => url.includes(SFU_SOCKET_PATH)),
      "the room should share the webcam through the parent's bbb-webrtc-sfu",
    ).toBe(true);
  }

  // Control of webcamBridgeInRoom: the parent on the default bridge (LiveKit)
  async webcamOnDefaultBridge() {
    const socketUrls: string[] = [];
    this.userPage.page.on('websocket', (socket) => socketUrls.push(socket.url()));
    await this.userPage.shareWebcam();
    expect(
      socketUrls.filter((url) => url.includes(SFU_SOCKET_PATH)),
      'the default bridge should share the webcam without bbb-webrtc-sfu',
    ).toEqual([]);
  }
}
