import React, { Component } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { withRouter } from 'react-router';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import PropTypes from 'prop-types';
import { styles } from './styles';
import Button from "../button/component";
import Clock from "./clock/component";

const propTypes = {
    currentUser: PropTypes.shape({}).isRequired,
    increaseTime: PropTypes.func.isRequired,
    formatTimeInterval: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
    startLabel: {
        id: 'app.timer.startButton',
        description: 'Start Class',
    },
    stopLabel: {
        id: 'app.timer.stopButton',
        description: 'Stop Class',
    }
});

class Timer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            btnLabel: intlMessages.startLabel,
            second: 0,
            minute: 0,
            timeInterval: {}
        };
        this.handleClickButton = this.handleClickButton.bind(this);
        this.setTimeInterval = this.setTimeInterval.bind(this);
    }

    handleClickButton() {
        if(this.state.btnLabel === intlMessages.startLabel) {
            this.setState({
                btnLabel: intlMessages.stopLabel,
                timeInterval: this.setTimeInterval()
            });
        } else {
            this.setState({
                btnLabel: intlMessages.startLabel
            });
            this.removeTimeInterval();
        }
    }

    setTimeInterval() {
        const { increaseTime } = this.props;
        return setInterval(()=>{
            let times = increaseTime(this.state.minute, this.state.second);
            this.setState({
                minute: times[0],
                second: times[1]
            });
        },10);
    }

    removeTimeInterval() {
        clearInterval(this.state.timeInterval);
    }

    render() {
        const {
            intl,
            formatTimeInterval,
            currentUser
        } = this.props;
        const blockClassName = styles.block + ' '+ (currentUser.isModerator ? styles.blockModerator : styles.blockViewer);
        return (
            <div className={blockClassName}>
                <Clock formatTimeInterval={formatTimeInterval} second={this.state.second} minute={this.state.minute} />
                { currentUser.isModerator ? <Button
                    data-test="modalBaseCloseButton"
                    className={styles.startBtn}
                    label={intl.formatMessage(this.state.btnLabel)}
                    size="md"
                    onClick={this.handleClickButton}
                /> : '' }
            </div>
        );
    }
}

Timer.propTypes = propTypes;
// Timer.defaultProps = defaultProps;

export default withRouter(injectWbResizeEvent(injectIntl(Timer)));
