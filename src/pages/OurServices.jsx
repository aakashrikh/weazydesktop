import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import img1 from '../assets/images/dashboard_carousel/1.png';
import img2 from '../assets/images/dashboard_carousel/2.png';
import img3 from '../assets/images/dashboard_carousel/3.png';
import img4 from '../assets/images/dashboard_carousel/4.png';
import Header from '../othercomponent/Header';

export class OurServices extends Component {
  render() {
    return (
      <>
        <Helmet>
          <title>Dashboard</title>
        </Helmet>
        <div className="main-wrappers">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Our Services</h4>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 services-banners">
                  <a href="https://webixun.com/contact-us.html" target="_blank">
                    <img src={img1} alt="banners" />
                  </a>
                </div>
                <div className="col-md-6 services-banners">
                  <a href="https://webixun.com/contact-us.html" target="_blank">
                    <img src={img2} alt="banners" />
                  </a>
                </div>
                <div className="col-md-6 services-banners">
                  <a href="https://webixun.com/contact-us.html" target="_blank">
                    <img src={img3} alt="banners" />
                  </a>
                </div>
                <div className="col-md-6 services-banners">
                  <a href="https://webixun.com/contact-us.html" target="_blank">
                    <img src={img4} alt="banners" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default OurServices;
