import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no-transaction.webp';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer';

class Myreport extends Component {
  static contextType = AuthContext;
  state = {
    data: [],
    is_loading: true,
    load_data: false,
    page: 1,
    isOpen: false,
    from: new Date(),
    to: new Date(),
    range: 'today',
    last_page: 1,
    total: 0,
    upi: 0,
    card:0,
    cash: 0,
    weazypay: 0,
    method: 'all',
    itemsPerPage: 50,
    downloaded_data: [],
    loading: false,
    open: false,
    drawerOrderId: '',
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(1, 'today');
  }

  fetch_order = (page_id, range) => {
    fetch(api + 'get_staff_data', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        range: range,
        start_date: this.state.from,
        end_date: this.state.to,
        method: this.state.method,
        page_length: this.state.itemsPerPage,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({
              data: [],
              total: 0,
              card: 0,
              upi: 0,
              cash: 0,
              weazypay: 0,
            });
          }
        } else {
          this.setState({
            next_page: json.data.next_page_url,
            total: json.total_earnning,
            card: json.card,
            upi: json.upi,
            cash: json.cashsale,
            weazypay: json.weazypay,
          });
          if (page_id == 1) {
            this.setState({ data: json.data.data });
          } else {
            {
              this.state.next_page
                ? this.setState({
                    data: [...this.state.data, ...json.data.data],
                    page: this.state.page + 1,
                  })
                : this.setState({
                    data: json.data.data,
                  });
            }
          }
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_loading: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>My Report</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>My Report</h4>
                </div>
              </div>

              <Topnav array="report" />

              <div className="comp-sec-wrapper mt-4">
                <section className="comp-section">
                  <div className="row pb-4">
                    <div className="col-md-12 d-flex align-items-center justify-content-between w-100">
                      <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified">
                        <li className="nav-item">
                          <label>Time</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              if (e.target.value == 'customrange') {
                                this.setState({
                                  isOpen: !this.state.isOpen,
                                  range: 'custom',
                                });
                              } else {
                                this.setState({
                                  isOpen: false,
                                  range: e.target.value,
                                });
                              }
                            }}
                            value={this.state.value}
                            style={{ width: '150px', marginRight: '10px' }}
                          >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                          </select>
                        </li>
                        <li className="nav-item" style={{ paddingTop: 20 }}>
                          <button
                            className="btn btn-secondary"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({ is_loading: true });
                              this.fetch_order(1, this.state.range);
                            }}
                          >
                            Search
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
              {!this.state.is_loading ? (
                <>
                  {this.state.method == 'all' ? (
                    <div className="dashboard-status-card">
                      <div className="row w-100">
                        <div className="col-lg-3 col-sm-3 col-12">
                          <div className="dash-widget dash1">
                            <div className="dash-widgetimg">
                              <span>
                                <i className="iconly-Wallet icli sidebar_icons"></i>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h5>
                                ₹
                                <span className="counters">
                                  {this.state.total.toFixed(2)}
                                </span>
                              </h5>
                              <h6>Total</h6>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-3 col-sm-3 col-12">
                          <div className="dash-widget dash3">
                            <div className="dash-widgetimg">
                              <span>
                                <i className="iconly-Wallet icli sidebar_icons"></i>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h5>
                                ₹
                                <span className="counters">
                                  {this.state.cash.toFixed(2)}
                                </span>
                              </h5>
                              <h6>Cash Sales</h6>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-lg-3 col-sm-3 col-12">
                          <div className="dash-widget dash2">
                            <div className="dash-widgetimg">
                              <span>
                                <i className="iconly-Wallet icli sidebar_icons"></i>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h5>
                                ₹
                                <span className="counters">
                                  {this.state.upi.toFixed(2)}
                                </span>
                              </h5>
                              <h6>UPI</h6>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-3 col-sm-3 col-12">
                          <div className="dash-widget dash2">
                            <div className="dash-widgetimg">
                              <span>
                                <i className="iconly-Wallet icli sidebar_icons"></i>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h5>
                                ₹
                                <span className="counters">
                                  {this.state.card.toFixed(2)}
                                </span>
                              </h5>
                              <h6>Card</h6>
                            </div>
                          </div>
                        </div>

                       

                        <div className="col-lg-3 col-sm-3 col-12">
                          <div className="dash-widget dash4">
                            <div className="dash-widgetimg">
                              <span>
                                <i className="iconly-Wallet icli sidebar_icons"></i>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h5>
                                ₹
                                <span className="counters">
                                  {this.state.weazypay.toFixed(2)}
                                </span>
                              </h5>
                              <h6>Weazy Pay</h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="dashboard-status-card">
                      <div className="row w-100">
                        <div className="col-lg-3 col-sm-3 col-12">
                          <div className="dash-widget dash1">
                            <div className="dash-widgetimg">
                              <span>
                                <i className="iconly-Wallet icli sidebar_icons"></i>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h5>
                                ₹
                                <span className="counters">
                                  {this.state.total.toFixed(2)}
                                </span>
                              </h5>
                              <h6>Total</h6>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {this.state.data.length > 0 ? (
                    <div className="card">
                      <div className="card-body">
                        <div className="table-responsive">
                          <InfiniteScroll
                            hasChildren={true}
                            dataLength={this.state.data.length}
                            next={() => {
                              this.fetch_order(
                                this.state.page + 1,
                                this.state.range
                              );
                              this.setState({
                                // page: this.state.page + 1,
                                loadMore: true,
                              });
                            }}
                            hasMore={
                              this.state.next_page !== null &&
                              this.state.data.length > 0
                            }
                            loader={
                              <div className="d-flex align-items-center justify-content-center w-full mt-xl">
                                <InfiniteLoader />
                              </div>
                            }
                          >
                            <table className="table  datanew">
                              <thead>
                                <tr>
                                  <th>S.no</th>
                                  <th>Order ID</th>
                                  <th>Time</th>
                                  <th>Amount</th>
                                  <th>Method</th>
                                  <th>Channel</th>
                                  
                                  <th>Payment TXN Id</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td
                                        className="cursor-pointer"
                                        onClick={() => {
                                          this.setState({
                                            open: true,
                                            drawerOrderId:
                                              item.orders.order_code,
                                          });
                                        }}
                                      >
                                        {item.orders.bill_no}
                                      </td>
                                      <td>
                                        {moment(item.created_at).format('lll')}
                                      </td>
                                      <td>₹{item.txn_amount}</td>
                                      <td>
                                        {item.txn_method === 'upi' ||
                                        item.txn_method === 'UPI'
                                          ? 'UPI'
                                          : item.txn_method === 'netbanking' ||
                                            item.txn_method === 'NB'
                                          ? 'Net Banking'
                                          : item.txn_method === 'Card'
                                          ? 'CARD'
                                          : item.txn_method === 'Cash'
                                          ? 'CASH'
                                          : item.txn_method === 'Weazy Pay'
                                          ? 'Weazy Pay'
                                          : item.txn_method === 'offline-cash'
                                          ? 'Offline Cash'
                                          : ''}
                                      </td>
                                      <td
                                        style={{
                                          color:
                                            item.txn_channel === 'online'
                                              ? 'green'
                                              : 'red',
                                        }}
                                      >
                                        {item.txn_channel}
                                      </td>
                                     
                                      <td>{item.payment_txn_id}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </InfiniteScroll>
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
                      <img src={no_order} alt="img" />
                      <h4>
                        Sorry, we couldn't find any records for this date.
                      </h4>
                    </div>
                  )}
                </>
              ) : (
                <Loader />
              )}
            </div>
          </div>
        </div>
        <OrderDetailsDrawer
          drawerOrderId={this.state.drawerOrderId}
          open={this.state.open}
          onClose={() => this.setState({ open: false })}
        />
      </>
    );
  }
}

export default Myreport;
