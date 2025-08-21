import { MeetingStaticData } from '/imports/ui/Types/meetingStaticData';

class MeetingStaticDataStore {
  private data: MeetingStaticData | null = null;

  // Store meeting data
  setMeetingData(data: MeetingStaticData): void {
    if (!data.meetingId || !data.name) {
      throw new Error('Invalid meeting data: missing meetingId or name');
    }
    if (!data.voiceSettings || !data.voiceSettings.voiceConf) {
      throw new Error('Invalid meeting data: missing voice settings');
    }
    this.data = data;
  }

  // Retrieve stored meeting data
  getMeetingData(): MeetingStaticData | null {
    return this.data;
  }

  // Check if data is initialized
  hasData(): boolean {
    return this.data !== null;
  }

  // Clear stored data
  clear(): void {
    this.data = null;
  }
}

// Export the same instance everywhere
export default new MeetingStaticDataStore();
