import { User } from "./user";

export interface TalkingIndicatorProps {
    muteUser: Function,
    talkers: Array<User>,
    moreThanMaxIndicators: Boolean,
    color: String,
    muted: Boolean,
    name: String,
    userId: String,
    talking: Boolean,
    transcribing: Boolean,
    floor: Boolean,
}