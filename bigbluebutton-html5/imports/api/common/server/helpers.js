
export const indexOf = [].indexOf || function (item) {
  for (let i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item) {
      return i;
    }
  }

  return -1;
};

//used in 1.1
export const inReplyToHTML5Client = function (arg) {
  return arg.routing.userId === 'nodeJSapp';
};
