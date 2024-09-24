import moment from 'moment';
import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import { DateRangePicker,CheckPicker  } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no-transaction.webp';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer';

class Transactionreport extends Component {
  static contextType = AuthContext;
  state = {
    data: [],
    is_loading: true,
    load_data: false,
    page: 1,
    isOpen: false,
    from: this.props.from,
    to: this.props.to,
    range: this.props.range,
    last_page: 1,
    total: 0,
   payment_methods: [],
    method: this.props.property,
    itemsPerPage: 50,
    downloaded_data: [],
    loading: false,
    add_data: [],
    staff_id: 0,
    staff_sale: [],
    open: false,
    drawerOrderId: '',
    download_csv: false,
    store:[],
  };

  setDate = (e) => {
    this.setState({ from: e[0], to: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(1, this.state.range, this.state.method);
    this.fetch_staff();

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

  fetch_order = (page_id, range, method) => {
    fetch(api + 'fetch_sales_reports', {
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
        method: method,
        page_length: this.state.itemsPerPage,
        staff_id: this.state.staff_id,
        store:this.state.store
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({
              data: [],
              total: 0,
              payment_methods: [],
              staff_sale: []
            });
          }
        } else {
          if (json.staff != undefined) {
        
            this.setState({ staff_sale: json.staff });
          }
          else
          {
            this.setState({ staff_sale: [] });
          }
          this.setState({
            next_page: json.data.next_page_url,
            total: json.total_earnning,
            payment_methods:json.method
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


  fetch_csv = () => {
    this.setState({ download_csv: true });
   fetch(api + 'fetch_sales_reports', {
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
      staff_id: this.state.staff_id,
      store:this.state.store
    }),
  })
   .then((respose) => respose.blob())
   .then((blob) => {
     const url = window.URL.createObjectURL(new Blob([blob]));
     const link = document.createElement('a');
     link.href = url;
     link.setAttribute('download', 'products_report.csv');
     document.body.appendChild(link);
     link.click();
     this.setState({download_csv: false});
   });
 };



  render() {
    const data = this.context.role.stores.map((item, index) => (
      
      {
      label: item.shop_name == null ? 'N/A' : item.shop_name + '-' + item.area,
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
                  <h4>Transactions Report</h4>
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

                        <li className="nav-item">
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
                            <option value={'swiggy'}>Swiggy</option>
                            <option value={'zomato'}>Zomato</option>
                            <option value="Eazy Diner">Eazy Diner</option>
                            <option value="Paytm">Paytm</option>
                            <option value="PhonePe">PhonePe</option>
                            <option value="Amazon Pay">Amazon Pay</option>
                            <option value="Gpay">Gpay</option>
                            <option value="'BharatPe">BharatPe</option>
                            <option value="MagicPin">MagicPin</option>
                            <option value="DotPe">DotPe</option>
                            <option value="Dunzo">Dunzo</option>

                          </select>
                        </li>

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

{/* <li>
                        {
                this.context.role.stores.length>1 && 
            <li className="nav-item">
                              <label>Select Outlet</label>
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
                        </li> */}

                        <li className="nav-item" style={{ paddingTop: 20 }}>
                          <button
                            className="btn btn-secondary"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({ is_loading: true });
                              this.fetch_order(
                                1,
                                this.state.range,
                                this.state.method
                              );
                            
                            }}
                          >
                            Search
                          </button>
                        </li>
                      </ul>
                      {
                        !this.state.download_csv ? <button
                          className="btn btn-secondary"
                          onClick={() => {
                            this.fetch_csv();
                          }}
                        >
                          {this.state.loading ? 'Loading csv...' : 'Download CSV'}
                        </button> : //show loading button
                        <button
                        className="btn btn-secondary btn-sm w-120"
                        disabled
                      >
                        <i
                          className="fa-regular fa-circle-down"
                          style={{
                            fontSize: 18,
                            marginRight: 10,
                          }}
                        ></i>
                        Downloading
                      </button>
                      }
                     
                    </div>
                  </div>
                </section>
              </div>
              {!this.state.is_loading ? (
                <>
                
                    <div className="dashboard-status-card">
                      <div className="row w-100">
                        <div className="col-lg-3 col-sm-3 col-12">
                          <div className="dash-widget dash">
                            <div className="dash-widgetimg">
                              <span>
                                <i className="iconly-Wallet icli sidebar_icons"></i>
                              </span>
                            </div>
                            <div className="dash-widgetcontent">
                              <h5>
                                ₹
                                <span className="counters">
                                  {this.state.total}
                                </span>
                              </h5>
                              <h6>Total</h6>
                            </div>
                          </div>
                        </div>
                        {
                          this.state.payment_methods.length > 0 &&
                          this.state.payment_methods.map((item, index) => {
                            return (
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
                                      {item.total}
                                    </span>
                                  </h5>
                                  <h6>{item.txn_method	} </h6>
                                </div>
                              </div>
                            </div>
                            )
                          })
                          
                        }
                       
                      
                      </div>
                    </div>
                 



{this.state.staff_sale.length > 1 &&
                  
                    this.state.staff_sale.map((item, index) => {
                      return (
                        <div className="dashboard-status-card">
                          <div className="row w-100">
                            <h6
                              style={{
                                borderBottom: '1px solid #ececec',
                                marginBottom: '10px',
                              }}
                            >
                              {item.staff_name}
                            </h6>

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
                                      {item.total}
                                    </span>
                                  </h5>
                                  <h6>Total</h6>
                                </div>
                              </div>
                            </div>

                        {
                          item.method.map((item, index) => {
                            return (
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
                                    {
                                      item.total
                                    }
                                    </span>
                                  </h5>
                                  <h6>{item.txn_method}</h6>
                                </div>
                              </div>
                            </div>
                            )
                          })
                        }
                      
                          </div>
                        </div>
                      );
                    })
                  }


                
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
                                this.state.range,
                                this.state.method
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
                                  <th>Date</th>
                                  {
                                      this.context.role.stores.length>1 ? <th>Store</th>:null
                                    }
                                  <th>Bill No</th>
                                  <th>Amount</th>
                                  <th>Time</th>
                                  <th>Staff Name</th>
                              
                                  <th>Method</th>
                                  <th>Channel</th>
                                  
                                  <th>Reference</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td> {moment(item.created_at).format('DD-MM-YYYY')}</td>
                                      <td>{item.shop_name} {'-'} {item.area} </td>
                                      {/* {
                                        this.context.role.stores.length>1 ? <td>{item.orders.store.store_name}</td>:null
                                      } */}
                                      <td
                                        className="cursor-pointer"
                                        onClick={() => {
                                          this.setState({
                                            open: true,
                                            drawerOrderId:
                                              item.order_code,
                                          });
                                        }}
                                      >
                                        {item.bill_no}
                                      </td>
                                      <td>₹{item.txn_amount}</td>
                                      <td>
                                        {moment(item.created_at).format('hh:mm A')}
                                      </td>
                                      <td>
                                        {item.staff_name !== null
                                          ? item.staff_name
                                          : 'N/A'}
                                      </td>
                                   

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
                                          : item.txn_method}
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
                                      <td>{item.txn_reference === null ? 'N/A' : item.txn_reference}</td>
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

export default (props) => <Transactionreport {...useParams()} {...props} />;
