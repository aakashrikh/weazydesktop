import React, { Component } from 'react';
import { os } from '../../os';
import devices from '../assets/images/devices.svg';

export class NotAvailable extends Component {
  componentDidMount() {
    document.getElementById('root').classList.add('content-wrap');
    document.querySelector('body').style.height = '100%';
    document.querySelector('html').style.height = '100%';
  }

  componentWillUnmount() {
    document.getElementById('root').classList.remove('content-wrap');
    document.querySelector('body').style.height = 'auto';
    document.querySelector('html').style.height = 'auto';
  }

  render() {
    return (
      <div className="text-center d-flex justify-content-center align-items-center not-available-page">
        <div className="dialog-close-icon">
          <img src={devices} alt="devices" width="100%" />
        </div>
        <h4 className="section-text-3 all-set-text">You’re all set!</h4>
        <p className="text-2 get-started-text m-0">
          Please log in via a desktop or laptop to use Weazy Billing's web
          version.
        </p>
        <hr className="w-100" />
        <p className="text-2 get-started-text">
          Or you can download our mobile app to enjoy Weazy Billing on the go!
        </p>
        <div className="download-app">
          <div className="page-header m-0">
            <button
              className="btn btn-added"
              onClick={() => {
                os !== 'Linux' && os !== 'Android' && os !== 'Windows'
                  ? window.open(
                      'https://apps.apple.com/in/app/weazy-dine/id1642685572',
                      '_blank'
                    )
                  : window.open(
                      'https://play.google.com/store/apps/details?id=com.weazydinebusiness',
                      '_blank'
                    );
              }}
            >
              Download Our App Now
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default NotAvailable;
