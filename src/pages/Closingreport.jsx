import moment from 'moment';
import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import { DateRangePicker,CheckPicker } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no-transaction.webp';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer';

class Closingreport extends Component {
  static contextType = AuthContext;
  state = {
    data: [],
    is_loading: true,
    load_data: false,
    page: 1,
    isOpen: false,
    from: new Date(),
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
    store:[],
    store_id:0,
    download_csv: false,
  };

  setDate = (e) => {
    this.setState({ from: e[0], to: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(1);
  
  }

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

  fetch_order = (page_id) => {
    fetch(api + 'fetch_closing_reports', {
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
        method: this.state.method,
        page_length: this.state.itemsPerPage,
        store: this.state.store
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({
              data: [],
            });
          }
        } else {
          
          this.setState({
            next_page: json.data.next_page_url,
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

  fetch_csv = () => {
    this.setState({ download_csv: true });
    fetch(api + 'fetch_closing_reports', {
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
        page_length: "all",
        store: this.state.store
      }),
    })
    .then((respose) => respose.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'closing_report.csv');
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
          <title>Closing Report</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Closing Report</h4>
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
                            <option value="comb">Combined</option>
                            <option value="ind">Indivisual</option>

                          </select>
                        </li>

                        <li>
                        {
                this.context.role.stores.length>1 && 
            <li className="nav-item">
                  {/* <label>Select Store</label> */}
                  <label>Outlets</label>
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


                        <li className="nav-item" style={{ paddingTop: 20 }}>
                          <button
                            className="btn btn-secondary"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({ is_loading: true });
                              this.fetch_order(
                                1
                              );
                              // this.fetch_csv();
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
                                  {
                                      this.context.role.stores.length>1 ? <th>Outlet</th>:null
                                    }
                                  <th>Date</th>
                                  <th>Bills</th>
                                  <th>Gross Sales</th>
                                  <th>Tax</th>
                                  <th>Discount</th>
                                 
                                  <th>Net Sales</th>
                                  <th>FOC</th>
                                  <th>Cancellation</th>
                                  
                                  
                                  {/* <th>Payment TXN Id</th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.data.map((item, index) => {
                                 return (
                                  <tr>
                                    <td>{index + 1}</td>
                                    {
                                          this.context.role.stores.length>1 ? <td>{item.shop_name	}  - {item.area} </td>:null
                                        }
                                    <td>{moment(item.order_date).format('DD-MMM-YYYY')}</td>
                                    <td>{item.bills}</td>
                                    <td>{item.grosssales}</td>
                                    <td>{item.tax}</td>
                                    <td>{item.discount}</td>
                                    <td>{item.netsales}</td>
                                    <td>{item.foc}</td>
                                    <td>{item.cancelled}</td>
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

export default (props) => <Closingreport {...useParams()} {...props} />;
