import moment from 'moment';
import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DateRangePicker,CheckPicker } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no-transaction.webp';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer';
import Topnav from '../othercomponent/Topnav';
import PerUserOrder from './PerUserOrder';
import { Link } from 'react-router-dom';

export class Salesreport extends Component {
  static contextType = AuthContext;
  state = {
    data: [],
    is_loading: true,
    load_data: false,
    page: 1,
    start_date: new Date(),
    end_date: new Date(),
    range: 'today',
    type: 'all',
    channel: 'all',
    total: 0.0,
    discount: 0.0,
    itemsPerPage: 50,
    downloaded_data: [],
    loading: false,
    discount_filter: 'all',
    tax: 0.0,
    unsettle: 0.0,
    unsettle_order:0,
    open: false,
    drawerOrderId: '',
    openPerUserOrder: false,
    user_id: '',
    order:{
      total:0,
      completed:0,
      cancelled:0,
      in_process:0,
    },
    store:[],
    store_id:0
  };

  setDate = (e) => {
    this.setState({ start_date: e[0], end_date: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(1, this.state.itemsPerPage);
    this.fetch_csv();
  }

  fetch_order = (page_id) => {
    fetch(api + 'fetch_order_reports', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        start_date: this.state.start_date,
        end_date: this.state.end_date,
        range: 'custom',
        type: this.state.type,
        channel: this.state.channel,
        discount_filter: this.state.discount_filter,
        page_length: this.state.itemsPerPage,
        store:this.state.store
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          if (page_id == 1) {
            this.setState({
              data: [],
              total: 0,
              discount: 0,
              tax: 0,
              unsettle: 0,
              unsettle_order:0,
              order:{
                total:0,
                completed:0,
                cancelled:0,
                in_process:0,
              }
            });
          }
        } else {
          this.setState({
            next_page: json.data.next_page_url,
          });
          if (page_id == 1) {
            this.setState({
              data: json.data.data,
              total: json.total,
              discount: json.total_discount,
              tax: json.tax,
              unsettle: json.unsattle,
              unsettle_order:json.unsattle_order,
              order: json.order,
            });
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

  fetch_csv = () => {
    this.setState({ loading: true });
    fetch(api + 'fetch_order_reports', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: 1,
        start_date: this.state.start_date,
        end_date: this.state.end_date,
        range: 'custom',
        type: this.state.type,
        channel: this.state.channel,
        discount_filter: this.state.discount_filter,
        page_length: 'all',
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({ downloaded_data: json.data });
        } else {
          this.setState({ downloaded_data: [] });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };


  onSelect = (selectedList) => {
    {
      this.props.store_d !== undefined
        ? this.setState({ store: [] })
        : null;
    }
    const store = [];
    selectedList.map((item, index) => {
      store.push(item);
    });
    this.setState({ store: store });
  };

  onRemove = (selectedList) => {
    // remove from selectedList.
    const store = [];
    selectedList.map((item, index) => {
      store.push(item);
    });
    this.setState({ store: store });
  };

  render() {

    const data = this.context.role.stores.map((item, index) => (
      
      {
      label: item.shop_name == null ? 'N/A' : item.shop_name,
      value: item.vendor_uu_id,
    }));


    return (
      <>
        <Helmet>
          <title>Sales Report</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Sales Report</h4>
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
                          <DateRangePicker
                            onChange={(e) => {
                              this.setDate(e);
                            }}
                            cleanable={false}
                            className="form-control border-none py-0 ps-0"
                            style={{ height: '38px' }}
                            ranges={[
                              {
                                label: 'Today',
                                value: [moment().toDate(), moment().toDate()],
                              },
                              {
                                label: 'Yesterday',
                                value: [
                                  moment().subtract(1, 'days').toDate(),
                                  moment().subtract(1, 'days').toDate(),
                                ],
                              },
                              {
                                label: 'This Week',
                                value: [
                                  moment().startOf('week').toDate(),
                                  moment().endOf('week').toDate(),
                                ],
                              },
                              {
                                label: 'Last Week',
                                value: [
                                  moment()
                                    .subtract(1, 'week')
                                    .startOf('week')
                                    .toDate(),
                                  moment()
                                    .subtract(1, 'week')
                                    .endOf('week')
                                    .toDate(),
                                ],
                              },
                              {
                                label: 'This Month',
                                value: [
                                  moment().startOf('month').toDate(),
                                  moment().endOf('month').toDate(),
                                ],
                              },
                              {
                                label: 'Last Month',
                                value: [
                                  moment()
                                    .subtract(1, 'month')
                                    .startOf('month')
                                    .toDate(),
                                  moment()
                                    .subtract(1, 'month')
                                    .endOf('month')
                                    .toDate(),
                                ],
                              },
                              {
                                label: 'Life-Time',
                                value: [
                                  moment(this.context.user.created_at).toDate(),
                                  moment().toDate(),
                                ],
                              },
                            ]}
                          />
                        </li>
                        <li className="nav-item">
                          <label>Select type</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                type: e.target.value,
                              });
                            }}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value={'all'}>All</option>
                            <option value={'TakeAway'}>TakeAway</option>
                            <option value={'Delivery'}>Delivery</option>
                            <option value={'DineIn'}>Dine-In</option>
                          </select>
                        </li>

                        <li className="nav-item">
                          <label>Channel</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                channel: e.target.value,
                              });
                            }}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value={'all'}>All</option>
                            <option value={'pos'}>Offline</option>
                            <option value={'website'}>QR Scan</option>
                            <option value={'online'}>Online</option>
                          </select>
                        </li>

                        <li className="nav-item">
                          <label>Discount</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                discount_filter: e.target.value,
                              });
                            }}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value={'all'}>All</option>
                            <option value={'discount'}>Discounted</option>
                            <option value={'nodiscount'}>No Discount</option>
                          </select>
                        </li>
                        <li>
                        {
                this.context.role.stores.length>1 && 
            <li className="nav-item">
                         <br/>
                          <CheckPicker
                            data={data}
                            style={{ width: '250px' }}
                            className="form-control border-none py-0 ps-0"
                            onChange={(e) => {
                              this.onSelect(e);
                            }}
                            onClean={() => {
                              this.onRemove('');
                            }}
                            defaultValue={this.state.category}
                            
                          />
                        </li>

          }
                        </li>
                        <li
                          className="nav-item"
                          style={{
                            paddingTop: '20px',
                          }}
                        >
                          <button
                            className="btn btn-secondary"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({ is_loading: true });
                              this.fetch_order(1, '');
                              this.fetch_csv();
                            }}
                          >
                            Search
                          </button>
                        </li>
                      </ul>
                      <CSVLink
                        data={this.state.downloaded_data}
                        filename={'Order Report.csv'}
                        className="btn btn-secondary"
                        style={{ marginTop: '20px' }}
                        target="_blank"
                      >
                        {this.state.loading ? 'Loading csv...' : 'Download CSV'}
                      </CSVLink>
                    </div>
                  </div>
                </section>
              </div>
              {!this.state.is_loading ? (
                <>
                  {this.state.data.length > 0 ? (
                    <>
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
                                <h6>Gross Sales</h6>
                              </div>
                            </div>
                          </div>

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
                                    {this.state.discount.toFixed(2)}
                                  </span>
                                </h5>
                                <h6>Discount</h6>
                              </div>
                            </div>
                          </div>

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
                                    {this.state.tax.toFixed(2)}
                                  </span>
                                </h5>
                                <h6>Tax</h6>
                              </div>
                            </div>
                          </div>

                          <div className="col-lg-3 col-sm-3 col-12">
                            <div className="dash-widget dash1">
                              <div className="dash-widgetimg">
                                <span>
                                  <i className="iconly-Wallet icli sidebar_icons"></i>
                                </span>
                              </div>
                              <div className="dash-widgetcontent">
                                <h5>
                                 <span className="counters">
                                  {(this.state.total.toFixed(2)-this.state.tax.toFixed(2))}
                                  </span>
                                </h5>
                                <h6>Net Sales</h6>
                              </div>
                            </div>
                          </div>


                          <div className="col-lg-3 col-sm-3 col-12">
                  
                              <div className="dash-widget">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Bag icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Total Bills</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <span className="counters">
                                        {
                                          this.state.order.total
                                        }
                                      </span>
                                    )}
                                  </h5>
                                </div>
                              </div>
                    
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                 
                              <div className="dash-widget dash1">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Bag icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Completed Orders</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        
                                        <span className="counters">
                                        {
                                          this.state.order.completed
                                        }
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                      
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                           <Link to="/orderlist/cancelled">
                              <div className="dash-widget dash4">
                                <div className="dash-widgetimg">
                                  <span>
                                    <span className="ps-menu-icon css-5rih0l">
                                      <i className="iconly-Bag icli sidebar_icons"></i>
                                    </span>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Cancelled Bills</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <span className="counters">
                                        {
                                          this.state.order.cancelled
                                        }
                                      </span>
                                    )}
                                  </h5>
                                </div>
                              </div>
                              </Link>
                   
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                          <Link to="/orderlist/unsettled">
                            <div className="dash-widget dash1">
                              <div className="dash-widgetimg">
                                <span>
                                  <i className="iconly-Wallet icli sidebar_icons"></i>
                                </span>
                              </div>
                              <div className="dash-widgetcontent">
                                <h5>
                                 <span className="counters">
                                  {this.state.unsettle_order}/₹ {this.state.unsettle.toFixed(2)}
                                  </span>
                                </h5>
                                <h6>Unsettled Bills</h6>
                              </div>
                            </div>
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-body">
                          <div className="table-responsive">
                            <InfiniteScroll
                              hasChildren={true}
                              dataLength={this.state.data.length}
                              next={() => {
                                this.fetch_order(this.state.page + 1);
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
                                    {
                                      this.context.role.stores.length>1 ? <th>Store</th>:null
                                    }
                                    <th>Order ID</th>
                                    <th>Customer</th>
                            
                                    <th>Time</th>
                                    <th>Amount</th>
                                    <th>Discount</th>
                                    <th>Tax</th>
                               
                                    {/* <th>Other</th> */}
                                    <th>Total Amount</th>
                                    <th>Channel</th>
                                    <th>Order Type</th>
                                    <th>Order Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {this.state.data.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        {
                                          this.context.role.stores.length>1 ? <td>{item.vendor.shop_name}</td>:null
                                        }
                                        <td
                                          onClick={() => {
                                            this.setState({
                                              open: true,
                                              drawerOrderId: item.order_code,
                                            });
                                          }}
                                          className="cursor-pointer"
                                        >
                                          {item.bill_no}
                                        </td>
                                        {/* <td>
                                          <Link
                                            to={
                                              '/peruserorder/' +
                                              item.user.user_uu_id
                                            }
                                            target="_blank"
                                          >
                                            {item.user.name === null
                                              ? 'N/A'
                                              : item.user.name}
                                          </Link>
                                        </td> */}
                                        <td
                                          onClick={() => {
                                            this.setState({
                                              openPerUserOrder: true,
                                              user_id: item.user.user_uu_id,
                                            });
                                          }}
                                          className="cursor-pointer"
                                        >
                                          {item.user.name === null
                                            ? 'N/A'
                                            : item.user.name}
                                        </td>
                                        <td>
                                          {moment(item.created_at).format(
                                            'llll'
                                          )}
                                        </td>
                                        <td> {item.order_amount}</td>
                                        <td> {item.order_discount}</td>
                                        <td> {item.sgst+item.cgst}</td>
                                
                                        {/* <td>₹ {item.order_charges}</td> */}
                                        <td>{item.total_amount}</td>
                                        <td>{item.channel}</td>
                                        <td>
                                          {item.order_type != 'TakeAway' &&
                                          item.order_type != 'Delivery'
                                            ? 'Dine In'
                                            : item.order_type}
                                        </td>

                                        <td>
                                          {item.order_status == 'placed' ? (
                                            <span
                                              style={{
                                                color: '#619DD1',
                                                textTransform: 'capitalize',
                                              }}
                                            >
                                              {item.order_status}
                                            </span>
                                          ) : item.order_status == 'ongoing' ? (
                                            <span
                                              style={{
                                                color: '#619DD1',
                                                textTransform: 'capitalize',
                                              }}
                                            >
                                              {item.order_status}
                                            </span>
                                          ) : item.order_status ==
                                            'processed' ? (
                                            <span
                                              style={{
                                                color: '#619DD1',
                                                textTransform: 'capitalize',
                                              }}
                                            >
                                              {item.order_status}
                                            </span>
                                          ) : item.order_status ==
                                            'completed' ? (
                                            <span
                                              style={{
                                                color: 'green',
                                                textTransform: 'capitalize',
                                              }}
                                            >
                                              {item.order_status}
                                            </span>
                                          ) : item.order_status ==
                                            'complated' ? (
                                            <span
                                              style={{
                                                color: 'green',
                                                textTransform: 'capitalize',
                                              }}
                                            >
                                              Completed
                                            </span>
                                          ) : item.order_status ==
                                            'in_process' ? (
                                            <span
                                              style={{
                                                color: '#0066b2',
                                                textTransform: 'capitalize',
                                              }}
                                            >
                                              In-Process
                                            </span>
                                          ) : (
                                            <span
                                              style={{
                                                color: 'red',
                                                textTransform: 'capitalize',
                                              }}
                                            >
                                              {item.order_status}
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </InfiniteScroll>
                          </div>
                        </div>
                      </div>
                    </>
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

        <PerUserOrder
          openPerUserOrder={this.state.openPerUserOrder}
          onClose={() => this.setState({ openPerUserOrder: false })}
          id={this.state.user_id}
        />
      </>
    );
  }
}

export default Salesreport;
