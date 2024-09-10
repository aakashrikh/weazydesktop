import moment from 'moment';
import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import { DateRangePicker } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no-transaction.webp';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer';

class StaffLogReport extends Component {
  static contextType = AuthContext;
  
  state = {
    data: [],
    is_loading: true,
    load_data: false,
    page: 1,
    isOpen: false,
    end_date: new Date(),
    from:new Date(),
    to: new Date(),
    range: this.props.range,
    last_page: 1,
    total: 0,
    online: 0,
    cash: 0,
    weazypay: 0,
    method: this.props.property,
    itemsPerPage: 50,
    downloaded_data: [],
    loading: false,
    add_data: [],
    staff_id: 0,
    staff_sale: [],
    open: false,
    drawerOrderId: '',
  };

  setDate = (e) => {
    this.setState({ from: e[0], to: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_logs(1, this.state.range);
    this.fetch_staff();
    // this.fetch_csv();
  }

  fetch_staff = () => {
    fetch(api + 'fetch_staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          this.setState({ add_data: data.data, is_loding: false });
        } else {
          this.setState({ is_loding: false });
        }
      })
      .catch((err) => {
        this.setState({ is_loding: false });
      });
  };

  fetch_logs = (page_id, range) => {

    fetch(api + 'fetch_logs', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        range: 'custom',
        start_date: this.state.from,
        end_date: this.state.to,
        page_length: this.state.itemsPerPage,
        staff_id: this.state.staff_id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({
              data: [],
              total: 0,
              online: 0,
              cash: 0,
              weazypay: 0,
            });
          }
        } else {
          if (json.staff != undefined) {
            this.setState({ staff_sale: json.staff });
          }
         

          if (page_id == 1) {
            this.setState({ data: json.data.data });
          } else {
            if (json.data.data.length > 0) {
               this.setState({
                    data: this.state.data.concat(json.data.data),
                    page: this.state.page + 1,
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
    fetch(api + 'fetch_logs', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: 1,
        range: 'custom',
        start_date: this.state.from,
        end_date: this.state.to,
        method: this.state.method,
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

  render() {
    return (
      <>
        <Helmet>
          <title>Logs Report</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Logs Report</h4>
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
                            size="md"
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

                        {/* <li className="nav-item">
                          <label>Select Method</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                method: e.target.value,
                              });
                            }}
                            value={this.state.method}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value="all">All</option>
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                            <option value="card">Debit/Credit Card</option>
                            <option value="online">Weazy Pay</option>
                            <option value="Swiggy Dine In">
                              Swiggy Dine In
                            </option>
                            <option value="Zomato Dine In">
                              Zomato Dine In
                            </option>
                            <option value="Eazy Diner">Eazy Diner</option>
                          </select>
                        </li> */}

                        {this.state.add_data.length > 1 && (
                          <li className="nav-item">
                            <label>Select Employee</label>
                            <select
                              className="form-control"
                              onChange={(e) => {
                                this.setState({
                                  staff_id: e.target.value,
                                });
                              }}
                              value={this.state.staff_id}
                              style={{ width: '150px', marginRight: '10px' }}
                              // className="select-container"
                            >
                              <option value={0}>All</option>
                              {this.state.add_data.map((item, index) => {
                                return (
                                  <option value={item.staff_id}>
                                    {item.staff_name} - {item.staff_role}
                                  </option>
                                );
                              })}
                            </select>
                          </li>
                        )}

                        <li className="nav-item" style={{ paddingTop: 20 }}>
                          <button
                            className="btn btn-secondary"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({ is_loading: true });
                              this.fetch_logs(
                                1,
                                this.state.range
                              );
                              this.fetch_csv();
                            }}
                          >
                            Search
                          </button>
                        </li>
                      </ul>
                      <CSVLink
                        data={this.state.downloaded_data}
                        filename={'Transactions Report.csv'}
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
                    <div className="card">
                      <div className="card-body">
                        <div className="table-responsive">
                          <InfiniteScroll
                            hasChildren={true}
                            dataLength={this.state.data.length}
                            next={() => {
                              this.fetch_logs(
                                this.state.page + 1,
                                this.state.range,
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
                                  <th>Staff</th>
                                  <th>Activity</th>
                                  <th>Module</th>
                                  <th>IP Address</th>
                                  <th>Time Stamp</th>
                                  <th>Details</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>
                                        {item.staff.staff_name}
                                      </td>
                                      <td>
                                        {item.activity}
                                      </td>
                                      <td>{item.module}</td>

                                      <td>
                                        {item.ip_address}
                                      </td>
                                      <td
                                      >
                                       {moment(item.created_at).format('lll')}
                                      </td>
                                      <td
                                        className="cursor-pointer"
                                        onClick={() => {
                                         
                                        }}
                                      >
                                        {item.details}
                                      </td>
                                      {/* <td>{item.payment_txn_id}</td> */}
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
        
      </>
    );
  }
}

export default (props) => <StaffLogReport {...useParams()} {...props} />;
