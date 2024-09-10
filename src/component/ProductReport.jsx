import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContextProvider.js';
import Skeletonloader from '../othercomponent/Skeletonloader';
import no_img from '../assets/images/no_product.webp';
import Loader from '../othercomponent/Loader';
import moment from 'moment';
import { DateRangePicker } from 'rsuite';
import { api } from '../../config.js';

class ProductReport extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      isloading: true,
      value: [new Date(), new Date()],
      start_date: new Date(),
      end_date: new Date(),
      range: 'today',
      is_veg: 'all',
      inventory: [],
      productsLoading: true,
      inventoryLoading: true,
    };
  }

  setDate = (e) => {
    this.setState({ start_date: e[0], end_date: e[1] });
  };

  componentDidMount() {
    this.fetch_product('custom', this.state.from, this.state.to);
    this.fetch_inventory();
  }

  fetch_product = (e, from, to) => {
    this.setState({ productsLoading: true });
    fetch(api + 'fetch_product_reports', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: 1,
        start_date: from,
        end_date: to,
        range: e,
        is_veg: this.state.is_veg,
        page_length: 6,
        sort: 'desc',
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          products: responseJson.data.data,
          isloading: false,
        });
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ productsLoading: false });
      });
  };

  fetch_inventory = () => {
    this.setState({ inventoryLoading: true });
    fetch(api + 'fetch_inventory_reports', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: 1,
        page_length: 6,
        sort: 'desc',
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.status) {
          this.setState({
            inventory: responseJson.data.data,
            isloading: false,
          });
        } else {
          this.setState({
            inventory: [],
            isloading: false,
          });
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ inventoryLoading: false });
      });
  };

  render() {
    return (
      <div className="dashboard-status-card">
        <div className="row w-100">
          <div className="page-header">
            <div className="page-title"></div>
            <div className="page-btn d-flex align-items-center">
              {' '}
              <DateRangePicker
                onChange={(e) => {
                  this.setDate(e);
                  this.fetch_product('custom', e[0], e[1]);
                  this.fetch_inventory();
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
                      moment().subtract(1, 'week').startOf('week').toDate(),
                      moment().subtract(1, 'week').endOf('week').toDate(),
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
                      moment().subtract(1, 'month').startOf('month').toDate(),
                      moment().subtract(1, 'month').endOf('month').toDate(),
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
            </div>
          </div>
          <div className="col-lg-6 col-md-12">
            <div
              className=" card"
              style={{
                borderRadius: '15px',
                minHeight: '300px',
                height: '350px',
                padding: '10px',
              }}
            >
              {this.state.productsLoading ? (
                <Loader />
              ) : (
                <div className="row p-2">
                  <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                    <div className="page-header">
                      <div className="page-title">
                        <h4>Trending Dishes</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 mt-4">
                    {!this.state.isloading ? (
                      this.state.products.length > 0 ? (
                        <div className="row">
                          {this.state.products.map((item, index) => {
                            return (
                              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                <div
                                  className="dash-widget p-0"
                                  style={{ boxShadow: 'none' }}
                                >
                                  <div className="dash-widgetimg">
                                    <span>
                                      <h3>
                                        <span className="counters">
                                          <Link
                                            className="product-img mt-2"
                                            to={'/productdetails/' + item.id}
                                          >
                                            <img
                                              src={item.product_img}
                                              alt="P"
                                              className="product-img"
                                              style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                              }}
                                            />
                                          </Link>
                                        </span>
                                      </h3>
                                    </span>
                                  </div>
                                  <div className="dash-widgetcontent">
                                    <h6>
                                      {' '}
                                      {item.product_name}
                                      {item.variants_name != null ? (
                                        <span style={{}}>
                                          - {item.variants_name}
                                        </span>
                                      ) : (
                                        <></>
                                      )}
                                    </h6>
                                    <p>
                                      Order :{' '}
                                      <span style={{ color: '#ea5455' }}>
                                        {item.sales_count}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-center flex-column">
                          <img
                            src={no_img}
                            alt="img"
                            style={{
                              height: '180px',
                            }}
                          />
                          <h6>
                            {' '}
                            Sorry, we couldn't find any records at this moment.{' '}
                          </h6>
                        </div>
                      )
                    ) : (
                      <Loader />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6 col-md-12">
            <div
              className=" card"
              style={{
                borderRadius: '15px',
                minHeight: '300px',
                height: '350px',
                padding: '10px',
              }}
            >
              {this.state.inventoryLoading ? (
                <Loader />
              ) : (
                <div className="row p-2">
                  <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                    <div className="page-header">
                      <div className="page-title">
                        <h4>Inventory</h4>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 mt-4">
                    {!this.state.isloading ? (
                      this.state.inventory.length > 0 ? (
                        <div className="row">
                          {this.state.inventory.map((item, index) => {
                            return (
                              <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                <div
                                  className="dash-widget p-0"
                                  style={{ boxShadow: 'none' }}
                                >
                                  <div className="dash-widgetimg">
                                    <span>
                                      <h3>
                                        {this.state.isloading ? (
                                          <Skeletonloader
                                            height={23}
                                            count={1}
                                          />
                                        ) : (
                                          <>
                                            <span className="counters">
                                              <i className="iconly-Bag icli sidebar_icons"></i>
                                            </span>
                                          </>
                                        )}
                                      </h3>
                                    </span>
                                  </div>
                                  <div className="dash-widgetcontent">
                                    <h6> {item.inventory_product_name} </h6>
                                    <p>
                                      {item.current_stock == 0 ? (
                                        <span style={{ color: '#ea5455' }}>
                                          Out of Stock
                                        </span>
                                      ) : (
                                        <span>
                                          {' '}
                                          Stock :{' '}
                                          <span style={{ color: '#ea5455' }}>
                                            {parseInt(
                                              item.current_stock
                                            ).toFixed(2) +
                                              ' ' +
                                              item.purchase_unit}{' '}
                                          </span>
                                        </span>
                                      )}
                                      {/* {item.current_stock.toFixed(1)} */}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-center flex-column">
                          <img
                            src={no_img}
                            alt="img"
                            style={{
                              height: '180px',
                            }}
                          />
                          <h6>
                            {' '}
                            Sorry, we couldn't find any records at this moment.{' '}
                          </h6>
                        </div>
                      )
                    ) : (
                      <Loader />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductReport;
