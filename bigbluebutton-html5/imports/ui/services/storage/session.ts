import ObservableStorage from './observable';

const singleton = new ObservableStorage(window.sessionStorage, 'BBB_');

export default singleton;
