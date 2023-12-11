import ChatService from '/imports/ui/components/chat/service';
import BreakoutService from '/imports/ui/components/breakout-room/service';

export const handleSendMessage = (message: string) => BreakoutService
  .sendMessageToAllBreakouts(message);

export default {
  handleSendMessage,
};
