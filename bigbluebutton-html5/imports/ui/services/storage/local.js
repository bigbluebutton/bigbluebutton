import ReactiveStorage from './reactive';

let _singleton = new ReactiveStorage(window.localStorage, 'BBB_');

export default _singleton;
