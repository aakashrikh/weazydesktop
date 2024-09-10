import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pageNotFound from '../assets/images/404_page_error.png';

export class Pagenotfound extends Component {
  render() {
    return (
      <>
        <Helmet>
          <title>404</title>
        </Helmet>
        <div className="error-page">
          <div className="main-wrapper">
            <div className="error-box">
              <img src={pageNotFound} alt="img" />
              {/* <h1>404</h1> */}
              <h3 className="h2 mb-3 mt-4">
                <i className="fas fa-exclamation-circle"></i> Oops! Page not
                found!
              </h3>
              <p className="h4 font-weight-normal">
                The page you requested was not found.
              </p>
              <Link to="/" className="btn btn-secondary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Pagenotfound;
