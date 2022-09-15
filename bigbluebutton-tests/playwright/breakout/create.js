const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');

class Create extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  // Create Breakoutrooms
  async create() {
    await this.modPage.waitAndClick(e.manageUsers);
    await this.modPage.waitAndClick(e.createBreakoutRooms);

    //Change number of rooms
    //await this.modPage.waitAndClick(e.selectNumberOfRooms);
    await this.modPage.getLocator(e.selectNumberOfRooms).selectOption('7');
    await this.modPage.hasText(e.selectNumberOfRooms, '7');

    //Decrease and Increase breakout time
    await this.modPage.waitAndClick(e.increaseBreakoutTime);
    await this.modPage.hasElement(e.numberDurationTime);
    await this.modPage.waitAndClick(e.decreaseBreakoutTime);
    await this.modPage.hasElement(e.numberDurationTime15);

    //Reset assignments
    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.waitAndClick(e.resetAssignments);

    //Remove specific assignment
    //await this.modPage.waitAndClick(e.randomlyAssign);
    //await this.modPage.getLocator(e.)

    //Drag and drop a user in a room
    

    //Change room's name
    /*
    await this.modPage.type(e.roomName, 'Teste');
    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);
    await this.modPage.waitAndClick(e.breakoutRoomsItem);
    await this.modPage.waitAndClick(e.breakoutOptionsMenu);
    await this.modPage.waitAndClick(e.openUpdateBreakoutUsersModal);
    await this.modPage.hasElement(e.roomNameTest);
*/

    //Randomly assignment


    await this.modPage.waitAndClick(e.randomlyAssign);
    await this.modPage.waitAndClick(e.modalConfirmButton, ELEMENT_WAIT_LONGER_TIME);

    await this.userPage.hasElement(e.modalConfirmButton);
    await this.userPage.waitAndClick(e.modalDismissButton);
    await this.modPage.hasElement(e.breakoutRoomsItem);
    
  
  }
}

exports.Create = Create;
