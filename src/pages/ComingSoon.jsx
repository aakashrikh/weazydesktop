import React, { Component } from 'react';
import Countdown from 'react-countdown';
import { Helmet } from 'react-helmet';
import { AuthContext } from '../AuthContextProvider';
import coming_soon from '../assets/images/coming_soon.png';
import Header from '../othercomponent/Header';

class ComingSoon extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      date: '2023/11/12',
    };
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Coming Soon</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title w-100 text-center">
                  <h1>We're Cooking Some Brand New Dishes For You!</h1>
                  <h5>
                    We're working on it. We'll be back soon with some new and
                    exciting updates.
                  </h5>
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-center">
                <img src={coming_soon} alt="img" />
              </div>
              <h3 className="text-center mt-4">
                To have a taste of our new updates, please wait for
              </h3>
              <Countdown
                date={this.state.date}
                renderer={(props) => (
                  <div className="d-flex align-items-end justify-content-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="coming_soon_timings">{props.days}</span>{' '}
                      -
                      <span className="coming_soon_timings">{props.hours}</span>{' '}
                      -
                      <span className="coming_soon_timings">
                        {props.minutes}
                      </span>{' '}
                      -
                      <span className="coming_soon_timings">
                        {props.seconds}
                      </span>
                    </div>
                    <h4 className="mb-3">Days</h4>
                  </div>
                )}
              />
              <h4 className="text-center">Thank you for your patience.</h4>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ComingSoon;
