import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import ActivityReportService from '../service';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  label: {
    id: 'app.activity-report.label',
    description: 'Activity Report button label',
  },
  description: {
    id: 'app.activity-report.description',
    description: 'Connection status button description',
  },
});

class ActivityReportButton extends PureComponent {
  render() {
    const {
      intl,
      activityReportAccessToken,
      isModerator,
    } = this.props;

    return (
      isModerator
      && activityReportAccessToken != null
        ? (
          <div className={styles.buttonWrapper}>
            <Button
              icon="multi_whiteboard"
              label={intl.formatMessage(intlMessages.label)}
              hideLabel
              aria-label={intl.formatMessage(intlMessages.description)}
              size="sm"
              color="primary"
              circle
              onClick={ActivityReportService.openActivityReportUrl}
              data-test="activityReportButton"
            />
          </div>
        ) : null
    );
  }
}

export default injectIntl(ActivityReportButton);
