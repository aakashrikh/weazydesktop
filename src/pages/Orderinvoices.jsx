import moment from 'moment';
import React, { Component } from 'react';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import { Helmet } from 'react-helmet';
import { api } from '../../config';
import no_order from '../assets/images/no-transaction.webp';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import { Link } from 'react-router-dom';

export class Orderinvoices extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      is_loading: true,
      load_data: false,
      page: 1,
      next_page: '',
      status: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(1, '');
  }

  fetch_order = (page_id, status) => {
    fetch(api + 'fetch_credit_orders', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({ data: [] });
          }
        } else {
          this.setState({ data: json.data });
        }
        this.setState({ is_loading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Order Invoice</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Order Invoices</h4>
                </div>
              </div>

              <Topnav array="report" />

              {!this.state.is_loading ? (
                <div className="card mt-4">
                  {this.state.data.length > 0 ? (
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table  datanew">
                          <thead>
                            <tr>
                              <th>S.no</th>
                              <th>Transaction ID</th>
                              <th>Transaction Amount</th>
                              <th>Transaction Status</th>
                              {/* <th>Transaction Method</th> */}
                              <th>Transaction Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.data.map((item, index) => (
                              <tr>
                                <td>{index + 1}</td>
                                <td>
                                  <Link to={`/invoice`}>{item.txn_id}</Link>
                                </td>
                                <td>₹{item.txn_amount}</td>
                                <td
                                  style={{
                                    textTransform: 'capitalize',
                                    color:
                                      item.txn_status == 'success'
                                        ? 'green'
                                        : 'red',
                                  }}
                                >
                                  {item.txn_status}
                                </td>
                                {/* <td>{item.txn_method}</td> */}
                                <td>
                                  {moment(item.created_at).format('llll')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                      <img src={no_order} alt="img" />
                      <h4>
                        Sorry, we couldn't find any records at the moment.
                      </h4>
                    </div>
                  )}
                </div>
              ) : (
                <Loader />
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Orderinvoices;
