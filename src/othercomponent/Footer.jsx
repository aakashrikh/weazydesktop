import React, { Component } from 'react';

export class Footer extends Component {
  componentDidMount() {
    console.log(`${process.env.VITE_APP_NAME} ${process.env.VITE_APP_VERSION}`);
  }
  render() {
    return (
      <div className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-6">ss</div>
            <div className="col-md-6">ss</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Footer;
