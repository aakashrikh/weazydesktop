import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { DateRangePicker } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no-transaction.webp';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer';
import Topnav from '../othercomponent/Topnav';
import PerUserOrder from './PerUserOrder';
import moment from 'moment';

export class InventoryReport extends Component {
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
    open: false,
    drawerOrderId: '',
    openPerUserOrder: false,
    user_id: '',
  };

  setDate = (e) => {
    this.setState({ start_date: e[0], end_date: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(1);
    // this.fetch_csv();
  }


  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  fetch_order = (page_id) => {
  
    const formattedStartDate = this.formatDate(this.state.start_date);
    const formattedEndDate = this.formatDate(this.state.end_date);
    fetch(api + 'fetch_inventory_daybook', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        start_date: formattedStartDate,
        end_date:formattedEndDate,
        range: 'custom',
        
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
            });
          }
        } else {
          this.setState({
            next_page: json.data.next_page_url,
          });
          if (page_id == 1) {
            this.setState({
              data: json.data,
            });
          } else {
            {
              this.state.next_page
                ? this.setState({
                    data: [...this.state.data, ...json.data.data],
                    page: this.state.page + 1,
                  })
                : this.setState({
                    data: json.data,
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
    fetch(api + 'fetch_inventory_daybook', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
   
        start_date: this.state.start_date,
        end_date:this.state.end_date,
        range: 'custom',
        
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
          <title>Inventory Report</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Inventory  Report</h4>
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
                              this.fetch_order(1);
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
                              Date: {moment(this.state.start_date).format('DD:MMM:YYYY')} - {moment(this.state.end_date).format('DD:MMM:YYYY')}
                              <table className="table  datanew">
                                <thead>
                                  <tr>

                                    <th className="text-center">#</th>
                              <th className="text-center">Name</th>
                              <th className="text-center">UOM</th>
                              <th className="text-center">Price</th>
                              <th className="text-center">Opening</th>
                              <th className="text-center">IN</th>
                              <th className="text-center">OUT</th>
                              <th className="text-center">Wastage</th>
                              <th className="text-center">Consummation</th>
                              <th className="text-center">Balance</th>
                              <th className="text-center">Physical Stock</th>

                                  </tr>
                                </thead>
                                <tbody>
                                  {this.state.data.map((item, index) => {
                                    return (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
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
                                          {item.product_name}
                                        </td>
                                       
                                        <td> {
                                        item.opening_stock == null ? 0 : parseFloat(item.opening_stock).toFixed(2)
                                        
                                        }</td>
                                        <td> {parseFloat(item.stock_in).toFixed(2)}</td>
                                        <td> {parseFloat(item.stock_out).toFixed(2)}</td>
                                        <td>{parseFloat(item.balance).toFixed(2) }</td>
                                        <td>{parseFloat(item.balance).toFixed(2) }</td>
                                        <td>{parseFloat(item.balance).toFixed(2) }</td>
                                        <td>{parseFloat(item.balance).toFixed(2) }</td>
                                        <td>{parseFloat(item.balance).toFixed(2) }</td>
                                        <td>{parseFloat(item.balance).toFixed(2) }</td>
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

export default InventoryReport;
