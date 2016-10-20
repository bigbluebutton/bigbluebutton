import ReactiveStorage from './reactive';

let _singleton = new ReactiveStorage(window.sessionStorage, 'BBB_');

export default _singleton;
