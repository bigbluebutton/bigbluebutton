import React from 'react';
import './App.css';
import {
  FormattedMessage, injectIntl,
} from 'react-intl';

function parseErrors() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('errors');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      errorMessage: '',
      errorKey: '',
      detailsVisible: false,
    };
  }

  componentDidMount() {
    const { intl } = this.props;
    document.title = `${intl.formatMessage({ id: 'api.welcome.welcomeMessage', defaultMessage: 'Welcome to BigBlueButton!' })}`;

    const errors = parseErrors();
    if (errors.length > 0) {
      this.setState({
        errorMessage: errors[0].message ?? '',
        errorKey: errors[0].key ?? '',
      });
    }
  }

  render() {
    const { errorMessage, errorKey, detailsVisible } = this.state;
    const { intl } = this.props;

    let errorId = `api.errors.${errorKey}`;
    const intlMessageExists = Object.prototype.hasOwnProperty.call(intl.messages, errorId);

    if (!intlMessageExists) {
      errorId = 'api.errors.genericError';
    }

    const showTechnicalDetails = !intlMessageExists || (errorKey === 'validationError');

    const errorMessageElement = (
      <FormattedMessage
        id={errorId}
        defaultMessage={errorMessage}
      />
    );

    return errorKey && errorMessageElement ? (
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-black">
          <FormattedMessage
            id="api.errors.errorPageTitle"
            defaultMessage="BigBlueButton"
          />
        </h1>
        <br />
        <p className="error-message bg-red-100 text-red-700 px-6 py-4 rounded-xl text-lg max-w-xl mx-auto">
          <FormattedMessage
            id="api.errors.errorPrefix"
            defaultMessage="Error"
          />
          :&nbsp;
          { errorMessageElement }
        </p>

        { showTechnicalDetails && errorMessage && (
          <button
            type="button"
            onClick={() => {
              this.setState((prev) => ({ detailsVisible: !prev.detailsVisible }));
            }}
            className="mt-2 text-sm text-blue-600 hover:underline focus:outline-none"
          >
            {detailsVisible
              ? intl.formatMessage({ id: 'api.errors.hideTechnicalDetails', defaultMessage: 'Hide technical details' })
              : intl.formatMessage({ id: 'api.errors.showTechnicalDetails', defaultMessage: 'Show technical details' })}
          </button>
        )}

        {detailsVisible && (
          <div className="mt-3 rounded-md border border-gray-300 bg-gray-100 p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap">
            {errorKey}
            <br />
            {errorMessage}
          </div>
        )}

      </div>
    ) : (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          <FormattedMessage
            id="api.welcome.welcomeMessage"
            defaultMessage="Welcome to BigBlueButton!"
          />
        </h1>
      </div>
    );
  }
}

export default injectIntl(App);
