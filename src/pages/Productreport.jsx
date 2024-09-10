import moment from 'moment';
import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useParams } from 'react-router-dom';
import nonveg from '../assets/non-veg.svg';
import veg from '../assets/veg.svg';
import { CheckPicker, DateRangePicker, Drawer } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no-transaction.webp';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer';
import Topnav from '../othercomponent/Topnav';

export class Productreport extends Component {
  static contextType = AuthContext;
  //define props
  constructor(props) {
    super(props);
    if (this.props.start != undefined && this.props.end != undefined) {
      var start_date = new Date(this.props.start);
      var end_date = new Date(this.props.end);
    } else {
      var start_date = new Date();
      var end_date = new Date();
    }
    const category = [];
    if (this.props.category_id != undefined) {
      category.push(parseInt(this.props.category_id));
    }

    // console.log(category);
    this.state = {
      data: [],
      is_loading: true,
      load_data: false,
      page: 1,
      start_date: start_date,
      end_date: end_date,
      range: 'custom',
      is_veg: 'all',
      itemsPerPage: 20,
      downloaded_data: [],
      loading: false,
      sort: 'desc',
      next_page: null,
      category: category,
      category_data: [],
      openDrawer: false,
      item_id: '',
      variant_id: '',
      download_csv: false,
    };
  }

  setDate = (e) => {
    this.setState({ start_date: e[0], end_date: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchCategories();
    this.fetch_order(1, '');
    // this.fetch_csv();
  }

  fetchCategories = () => {
    fetch(api + 'fetch_vendor_category', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({ category_data: json.data, is_loding: false });
        } else {
          this.setState({ is_loding: false, category_data: [] });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  onSelect = (selectedList) => {
    {
      this.props.category_id !== undefined
        ? this.setState({ category: [] })
        : null;
    }
    const category = [];
    selectedList.map((item, index) => {
      category.push(item);
    });
    this.setState({ category: category });
  };

  onRemove = (selectedList) => {
    // remove from selectedList.
    const category = [];
    selectedList.map((item, index) => {
      category.push(item);
    });
    this.setState({ category: category });
  };

  fetch_order = (page_id) => {
    fetch(api + 'fetch_product_reports', {
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
        categories: this.state.category,
        is_veg: this.state.is_veg,
        page_length: this.state.itemsPerPage,
        sort: this.state.sort,
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
     this.setState({ download_csv: true });
    fetch(api + 'fetch_product_reports', {
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
        categories: this.state.category,
        is_veg: this.state.is_veg,
        page_length: 'all',
        sort: this.state.sort,
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

  onClose = () => {
    this.setState({ openDrawer: false });
  };

  render() {
    const data = this.state.category_data.map((item, index) => {
      return {
        label: item.name,
        value: item.id,
      };
    });
    return (
      <>
        <Helmet>
          <title>Product Report</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Product Report</h4>
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
                            {...(this.props.start != undefined &&
                            this.props.end != undefined
                              ? {
                                  defaultValue: [
                                    new Date(this.props.start),
                                    new Date(this.props.end),
                                  ],
                                }
                              : null)}
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
                          <label>Category</label>
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

                        <li className="nav-item">
                          <label>Select type</label>
                          <select
                            className="form-control"
                            onChange={(e) => {
                              this.setState({
                                is_veg: e.target.value,
                              });
                            }}
                            style={{ width: '150px', marginRight: '10px' }}
                            // className="select-container"
                          >
                            <option value={'all'}>All</option>
                            <option value={1}>Veg</option>
                            <option value={0}>Non-Veg</option>
                          </select>
                        </li>

                        <li className="nav-item">
                          <label>Sort</label>
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
                this.state.data.length > 0 ? (
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
                                <th>Product Name</th>
                              
                            
                                <th>Orders</th>
                                <th>Avg Sales Count</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                       
                                <th>Discount</th>
                                <th>Net Amount</th>
                                <th>Tax</th>
                               
                                <th>Total</th>
                                <th>Complimentry</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.data.map((item, index) => {
                                return (
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>
                                    {item.is_veg ? (
                                              <img src={veg} alt="veg" />
                                            ) : (
                                              <img src={nonveg} alt="non-veg" />
                                            )}
&nbsp; 
                                      {item.product_name + ' '}
                                      {item.variants_name != null ? (
                                        <span >
                                          | {item.variants_name}
                                        </span>
                                      ) : null}
                                    </td>
                                    {/* <td>
                                      {item.is_veg == 1 ? (
                                        <span style={{ color: 'green' }}>
                                          Veg
                                        </span>
                                      ) : (
                                        <span style={{ color: 'red' }}>
                                          Non-Veg
                                        </span>
                                      )}
                                    </td> */}
                                    
                                   
                                    <td
                                     onClick={() => {
                                      this.setState({
                                        openDrawer: true,
                                        item_id: item.product_id,
                                        variant_id: item.variant_id,
                                      });
                                    }}
                                    >
                                          {
                                            item.order_count
                                          }
                                        </td>
                                        <td>
                                          {
                                            item.avg_sales_count
                                          }
                                        </td>
                                        <td>
                                      <button
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                        }}
                                        onClick={() => {
                                          this.setState({
                                            openDrawer: true,
                                            item_id: item.product_id,
                                            variant_id: item.variant_id,
                                          });
                                        }}
                                      >
                                        {item.sales_count}
                                      </button>
                                    </td>
                                        <td>{item.rate}</td>
                                       
                                        <td>{
                                            item.discount}</td>
                                        <td>
                                          {
                                            item.net_amount
                                          }
                                        </td>

                                    
                                            <td>
                                              {
                                                item.total_tax
                                              }
                                            </td>
                         



                                    <td>
                                      <button
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                        }}
                                        onClick={() => {
                                          this.setState({
                                            openDrawer: true,
                                            item_id: item.id,
                                            variant_id: item.v_id,
                                          });
                                        }}
                                      >
                                         {item.total_amount}
                                      </button>
                                    </td>
                                    <td>
                                      {item.complimentary_quantity}
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
                    <h4>Sorry, we couldn't find any records at the moment.</h4>
                  </div>
                )
              ) : (
                <Loader />
              )}
            </div>
          </div>
        </div>
        <ItemOrder
          openDrawer={this.state.openDrawer}
          onClose={() => this.onClose()}
          start={moment(this.state.start_date).format('YYYY-MM-DD')}
          end={moment(this.state.end_date).format('YYYY-MM-DD')}
          id={'' + this.state.item_id}
          variant={'' + this.state.variant_id}
        />
      </>
    );
  }
}

export class ItemOrder extends React.Component {
  static contextType = AuthContext;
  state = {
    product: [],
    orders: [],
    is_loading: true,
    load_data: false,
    page: 1,
    isOpen: false,
    from: this.props.start,
    to: this.props.end,
    range: 'custom',
    last_page: 1,
    itemsPerPage: 50,
    downloaded_data: [],
    loading: false,
    open: false,
    drawerOrderId: '',
  };

  fetch_order = (page_id, range) => {
    fetch(api + 'fetch_item_orders', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        range: range,
        start_date: this.props.start,
        end_date: this.props.end,
        item_id: this.props.id,
        variant_id: this.props.variant,
        page_length: this.state.itemsPerPage,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          if (page_id == 1) {
            this.setState({
              orders: [],
            });
          }
        } else {
          this.setState({
            next_page: json.order.next_page_url,
            orders: json.order,
            product: json.product,
          });
          if (page_id == 1) {
            this.setState({ orders: json.order.data, product: json.product });
          } else {
            {
              this.state.next_page
                ? this.setState({
                    orders: [...this.state.orders, ...json.order.data],
                    page: this.state.page + 1,
                  })
                : this.setState({
                    orders: json.order.data,
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
        <Drawer
          open={this.props.openDrawer}
          onClose={() => this.props.onClose()}
          placement="right"
          size="full"
          onOpen={() => {
            this.setState({ is_loading: true });
            this.fetch_order(1, this.state.range);
          }}
        >
          <Drawer.Header>
            <Drawer.Title>
              <h4>
                {' '}
                Orders for {this.state.product.product_name} From{' '}
                {moment(this.props.start).format('lll')} To{' '}
                {moment(this.props.end).format('lll')}
              </h4>
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <div className="content">
              {!this.state.is_loading ? (
                this.state.orders.length > 0 ? (
                  <div className="card">
                    <div className="card-body">
                      <div className="table-responsive">
                        <InfiniteScroll
                          hasChildren={true}
                          dataLength={this.state.orders.length}
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
                            this.state.orders.length > 0
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
                                <th>OrderID</th>
                                <th>Amount</th>
                                <th>DateTime</th>
                                <th>Item Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.orders.map((item, index) => {
                                return (
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>
                                      <button
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                        }}
                                        onClick={() => {
                                          this.setState({
                                            open: true,
                                            drawerOrderId: item.order_code,
                                          });
                                        }}
                                      >
                                        {item.bill_no}
                                      </button>
                                    </td>
                                    <td>₹ {item.product_price}</td>
                                    <td>
                                      {moment(item.created_at).format('lll')}
                                    </td>
                                    <td>{item.quantity}</td>
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
                    <h3>No Records Found</h3>
                  </div>
                )
              ) : (
                <Loader />
              )}
            </div>
          </Drawer.Body>
        </Drawer>
        <OrderDetailsDrawer
          drawerOrderId={this.state.drawerOrderId}
          open={this.state.open}
          onClose={() => this.setState({ open: false })}
        />
      </>
    );
  }
}

export default (props) => <Productreport {...useParams()} {...props} />;
