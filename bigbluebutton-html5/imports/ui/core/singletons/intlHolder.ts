import { IntlShape } from 'react-intl';

class IntlHolder {
  private intl: IntlShape | null = null;

  public setIntl(intl: IntlShape) {
    this.intl = intl;
  }

  public getIntl() {
    return this.intl;
  }
}

export default new IntlHolder();
