import moment from 'moment';
import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';
import { DateRangePicker, Drawer } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no-transaction.webp';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import Productreport from './Productreport';

export class Categoryreport extends Component {
  static contextType = AuthContext;
  state = {
    data: [],
    is_loading: true,
    load_data: false,
    page: 1,
    start_date: new Date(),
    end_date: new Date(),
    range: 'custom',
    is_veg: 'all',
    itemsPerPage: 20,
    downloaded_data: [],
    loading: false,
    sort: 'desc',
    next_page: null,
    openDrawer: false,
  };

  setDate = (e) => {
    this.setState({ start_date: e[0], end_date: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(1, '');
    this.fetch_csv();
  }

  fetch_order = (page_id) => {
    fetch(api + 'fetch_category_reports', {
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
        sort: this.state.sort,
        page_length: this.state.itemsPerPage,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          if (page_id == 1) {
            this.setState({ data: [] });
          }
        } else {
          this.setState({
            next_page: json.data.next_page_url,
          });
          if (page_id == 1) {
            this.setState({ data: json.data.data });
          } else if (json.data.data.length === 0) {
            this.setState({ next_page: null });
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
    // this.setState({ loading: true });
    fetch(api + 'fetch_category_reports', {
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
        page_length: 'all',
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({ downloaded_data: json.data.data });
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
          <title>Category Report</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Category Report</h4>
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
                          <label>Order</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                sort: e.target.value,
                              });
                            }}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value={'desc'}>High to Low</option>
                            <option value={'asc'}>Low to High</option>
                          </select>
                        </li>

                        <li className="nav-item" style={{ paddingTop: 20 }}>
                          <button
                            className="btn btn-secondary"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({ is_loading: true, page: 1 });
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
                        filename={'Category Report.csv'}
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
                                  <th>Category Name</th>
                                  <th>Quantity</th>
                                  <th>Discount</th>
                                  <th>Gross Sales</th>
                                  <th>Tax</th>
                                  <th>Net Sales</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.data.map((item, index) => {
                                  return (
                                    <tr>
                                      <td>{index + 1}</td>
                                      <td>{item.category_name}</td>
                                      <td>{item.total_quantity}</td>
                                      <td>{item.total_discount}</td>
                                      <td>{item.gross_sales}</td>
                                      <td>{item.total_tax.toFixed(2)}</td>
                                      <td>
                                        <Link
                                          // target="_blank"
                                          to={`/productreport/${
                                            item.id
                                          }/${moment(
                                            this.state.start_date
                                          ).format('YYYY-MM-DD')}/${moment(
                                            this.state.end_date
                                          ).format('YYYY-MM-DD')}`}
                                        >
                                       
                                          ₹ {item.net_sales}
                                   
                                        </Link>
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
                </>
              ) : (
                <Loader />
              )}
            </div>
          </div>
        </div>

        <Drawer
          open={this.state.openDrawer}
          onClose={() => this.setState({ openDrawer: false })}
          placement="right"
          size="full"
        >
          <Drawer.Body>
            <Productreport
              product={this.state.product}
              start={this.props.start}
              end={this.props.end}
            />
          </Drawer.Body>
        </Drawer>
      </>
    );
  }
}

export default Categoryreport;
