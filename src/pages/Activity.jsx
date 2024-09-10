import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { AuthContext } from '../AuthContextProvider';
import no_customer from '../assets/images/no-customer.webp';
import no_order from '../assets/images/no_orders.webp';
import Header from '../othercomponent/Header';
import Topnav from '../othercomponent/Topnav';
export class Activity extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      customer_insights: [],
      is_loading: true,
      load_data: false,
      page: 1,
      value: [new Date(), new Date()],
      start_date: new Date(),
      end_date: new Date(),
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Activity</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Activity</h4>
                </div>
              </div>

              <Topnav array="customer" />

              {this.state.customer_insights.length > 0 ? (
                <div className="row">
                  <div className="col-md-6">
                    <div className="customer_activity_main_div">
                      <img src={no_order} alt="no_order" />
                      <div className="customer_activity_main_div_content">
                        <h3>Sunaina Singh</h3>
                        <p>Sunaina Singh Tagged you in a post on Facebook.</p>
                        <p>2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="customer_activity_main_div">
                      <img src={no_order} alt="no_order" />
                      <div className="customer_activity_main_div_content">
                        <h3>Sunaina Singh</h3>
                        <p className="m-0">
                          Sunaina Singh Tagged you in a post on Facebook.
                        </p>
                        <p className="m-0">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="customer_activity_main_div">
                      <img src={no_order} alt="no_order" />
                      <div className="customer_activity_main_div_content">
                        <h3>Sunaina Singh</h3>
                        <p className="m-0">
                          Sunaina Singh Tagged you in a post on Facebook.
                        </p>
                        <p className="m-0">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="customer_activity_main_div">
                      <img src={no_order} alt="no_order" />
                      <div className="customer_activity_main_div_content">
                        <h3>Sunaina Singh</h3>
                        <p className="m-0">
                          Sunaina Singh Tagged you in a post on Facebook.
                        </p>
                        <p className="m-0">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="customer_activity_main_div">
                      <img src={no_order} alt="no_order" />
                      <div className="customer_activity_main_div_content">
                        <h3>Sunaina Singh</h3>
                        <p className="m-0">
                          Sunaina Singh Tagged you in a post on Facebook.
                        </p>
                        <p className="m-0">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="content"
                  style={{
                    height: '60vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    margin: '40px 0',
                  }}
                >
                  <img
                    src={no_customer}
                    alt="img"
                    style={{
                      width: '300px',
                    }}
                  />
                  <h5 className="mt-3">
                    Oops... No records found at this moment.{' '}
                  </h5>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Activity;
