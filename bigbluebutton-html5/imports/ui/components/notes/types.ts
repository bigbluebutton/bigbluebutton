import { NotesRenderMode } from './constants';

export type NotesRenderModeType = typeof NotesRenderMode[keyof typeof NotesRenderMode];

export default NotesRenderModeType;
