import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { DateRangePicker } from 'rsuite';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider.js';
import no_img from '../assets/images/no_product.webp';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Skeletonloader from '../othercomponent/Skeletonloader';

export class Insights extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      total:0,
        discount:0,
        tax:0,
        unsettle:0,
        unsettle_order:0,
        order:{
          total:0,
          completed:0,
          cancelled:0,
          in_process:0,
        },
      isloading: true,
      item: {
        total_earnning: 0,
        orders: 0,
        shop_visit: 0,
        customer: 0,
        cashsale: 0,
        online: 0,
        weazypay: 0,
        discount: 0,
      },
      orders: [],
      isOpen: false,
      from: new Date(),
      to: new Date(),
      shop_status: 1,
      range: 'daily',
      overviewRange: 'today',
      is_veg: 'all',
      itemsPerPage: 50,
      downloaded_data: [],
      inventory: [],
      products: [],
      productsLoading: true,
      inventoryLoading: true,
      chartOptions1: {
        title: {
          text: '',
          margin: 10,
        },

        xAxis: {
          categories: [],
          difference: 100,
        },

        yAxis: {
          title: {
            text: '',
            style: {
              color: '#000',
            },
          },
        },
        legend: {
          enabled: false,
        },

        series: [
          {
            type: 'areaspline',
            data: [],
            name: 'Revenue Graph',
            showInLegend: false,
            color: '#2f7ed8',
            lineWidth: 2,
            pointWidth: 20,
            shadow: true,
            shadowOffsetX: 10,
            anchor: {
              width: 10,
              height: 10,
              radius: 10,
            },
            fillOpacity: 0.1,
          },
        ],
      },
      chartOptions2: {
        title: {
          text: '',
          margin: 20,
        },

        xAxis: {
          categories: [],
          maxRange: 2,
        },

        yAxis: {
          title: {
            text: '',
            style: {
              color: '#000',
            },
          },
        },
        legend: {
          enabled: false,
        },

        series: [
          {
            type: 'areaspline',
            data: [],
            name: 'No Of Bills',
            showInLegend: false,
            color: '#619DD1',
            lineWidth: 2,
            pointWidth: 20,
            shadow: true,
            shadowOffsetX: 10,
            anchor: {
              width: 10,
              height: 10,
              radius: 10,
            },
            fillOpacity: 0.1,
          },
        ],
      },
      chartOptions3: {
        chart: {
          type: 'column',
        },
        title: {
          text: '',
          margin: 10,
        },

        xAxis: {
          categories: [],
        },

        yAxis: {
          title: {
            text: '',
            style: {
              color: '#000',
            },
          },
        },
        legend: {
          enabled: false,
        },

        series: [
          {
            data: [],
            name: 'Avg. Basket',
            showInLegend: false,
            color: '#0066b2',
            fillOpacity: 0.1,
          },
        ],
      },
      chartOptions4: {
        chart: {
          type: 'column',
        },
        title: {
          text: '',
          margin: 10,
        },

        xAxis: {
          categories: [],
        },

        yAxis: {
          title: {
            text: '',
            style: {
              color: '#000',
            },
          },
        },
        legend: {
          enabled: false,
        },

        series: [
          {
            data: [],
            name: 'Top Selling Products',
            showInLegend: false,
            color: '#92A8CD',
            fillOpacity: 0.1,
          },
        ],
        
      },
    };
  }

  setDate = (e) => {
    this.setState({ from: e[0], to: e[1] });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_sales_insides(this.state.range);
    this.fetch_product('custom', this.state.from, this.state.to);
    this.fetch_inventory();
    this.fetch_order(1,this.state.from, this.state.to);
  }

  fetch_sales_insides = (e) => {
    fetch(api + 'fetch_sales_insides', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        range: e,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          let chartOptions1 = { ...this.state.chartOptions1 };
          let chartOptions2 = { ...this.state.chartOptions2 };
          let chartOptions3 = { ...this.state.chartOptions3 };
          let chartOptions4 = { ...this.state.chartOptions4 };
          chartOptions1.xAxis.categories = json.data.revenue_graph
            .map((item) => item.month)
            .reverse();
          chartOptions1.series[0].data = json.data.revenue_graph
            .map((item) => Math.round(item.total))
            .reverse();
          chartOptions2.xAxis.categories = json.data.no_of_bills_graph
            .map((item) => item.month)
            .reverse();
          chartOptions2.series[0].data = json.data.no_of_bills_graph
            .map((item) => Math.round(item.total))
            .reverse();
          chartOptions3.xAxis.categories = json.data.avg_basket_size_graph
            .map((item) => item.month)
            .reverse();
          chartOptions3.series[0].data = json.data.avg_basket_size_graph
            .map((item) => Math.round(item.total))
            .reverse();
          chartOptions4.xAxis.categories = json.data.top_selling_products_graph
            .map((item) => item.product_name + ' (' + item.month + ')')
            .reverse();
          chartOptions4.series[0].data = json.data.top_selling_products_graph
            .map((item) => Math.round(item.total))
            .reverse();
          this.setState({
            chartOptions1,
            chartOptions2,
            chartOptions3,
            chartOptions4,
            sales_insides: json.data,
          });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.get_vendor_data('custom', this.state.from, this.state.to);
      });
  };


  fetch_order = (page_id,from,to) => {
    fetch(api + 'fetch_order_reports', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page_id,
        
        start_date: from,
        end_date: to,
        range: 'custom',
        type: 'all',
        channel: 'all',
        discount_filter: 'all',
        page_length: 1,
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
              unsettle_order: 0,
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
              unsettle_order: json.unsattle_order,
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

  get_vendor_data = (range, from, to) => {
    fetch(api + 'get_vendor_data', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        range: range,
        from: from,
        to: to,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          this.setState({ item: json.data });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false });
      });
  };

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
    let { item, chartOptions1, chartOptions2, chartOptions3, chartOptions4 } =
      this.state;
    return (
      <>
        <Helmet>
          <title>Insights</title>
        </Helmet>
        <div className="main-wrappers">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              {this.state.isloading ? (
                <Loader />
              ) : (
                <>
                  <div className="dashboard-status-card flex-column">
                    <div className="row">
                      {this.context.role.staff_role !== 'staff' && (
                        <>
                          <div className="page-header">
                            <div className="page-title">
                              <h4>Overview</h4>
                            </div>
                            <div
                              className="page-btn d-flex align-items-center"
                              style={{
                                width: '50%',
                              }}
                            >
                              <DateRangePicker
                                onChange={(e) => {
                                  this.setDate(e);
                                  this.get_vendor_data('custom', e[0], e[1]);
                                  this.fetch_product('custom', e[0], e[1]);
                                  this.fetch_inventory();
                                  this.fetch_order(1,e[0], e[1]);
                                }}
                                cleanable={false}
                                className="w-100"
                                ranges={[
                                  {
                                    label: 'Today',
                                    value: [
                                      moment().toDate(),
                                      moment().toDate(),
                                    ],
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
                                      moment(
                                        this.context.user.created_at
                                      ).toDate(),
                                      moment().toDate(),
                                    ],
                                  },
                                ]}
                              />
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
                                    {this.state.total.toFixed(2)}
                                  </span>
                                </h5>
                                <h6>Order Sales</h6>
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
                            <Link to={'../orderlist/unsettled'} className="dash-widget dash1">
                              <div className="dash-widgetimg">
                                <span>
                                  <i className="iconly-Wallet icli sidebar_icons"></i>
                                </span>
                              </div>
                              <div className="dash-widgetcontent">
                                <h5>
                                  
                                  <span className="counters">
                                    {this.state.unsettle_order}/₹
                                    {this.state.unsettle.toFixed(2)}
                                  </span>
                                </h5>
                                <h6>Unsettled Amount</h6>
                              </div>
                            </Link>
                          </div>


                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link
                              to={
                                '/transactionreport/all/custom/' +
                                moment(this.state.from).format('YYYY-MM-DD') +
                                '/' +
                                moment(this.state.to).format('YYYY-MM-DD')
                              }
                            >
                              <div className="dash-widget dash1">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Wallet icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Total Payment</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.total_earnning.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link
                              to={
                                '/transactionreport/cash/custom/' +
                                moment(this.state.from).format('YYYY-MM-DD') +
                                '/' +
                                moment(this.state.to).format('YYYY-MM-DD')
                              }
                            >
                              <div className="dash-widget dash2">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Wallet icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Cash Payment</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.cashsale.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link
                              to={
                                '/transactionreport/upi/custom/' +
                                moment(this.state.from).format('YYYY-MM-DD') +
                                '/' +
                                moment(this.state.to).format('YYYY-MM-DD')
                              }
                            >
                              <div className="dash-widget dash4">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Wallet icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Online Payment</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.online.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link
                              to={
                                '/transactionreport/online/custom/' +
                                moment(this.state.from).format('YYYY-MM-DD') +
                                '/' +
                                moment(this.state.to).format('YYYY-MM-DD')
                              }
                            >
                              <div className="dash-widget dash2">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Wallet icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Weazy Pay</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.weazypay.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>

                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link to="/salesreport">
                              <div className="dash-widget">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Bag icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Total Orders</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <span className="counters">
                                        {item.orders}
                                      </span>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link to="/salesreport">
                              <div className="dash-widget dash1">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Discount icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Discount</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        ₹{' '}
                                        <span className="counters">
                                          {item.discount.toFixed(2)}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link to={'/customers'}>
                              <div className="dash-widget dash4">
                                <div className="dash-widgetimg">
                                  <span>
                                    <span className="ps-menu-icon css-5rih0l">
                                      <i className="iconly-User3 icli sidebar_icons"></i>
                                    </span>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>Total Customers</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <span className="counters">
                                        {item.customer}
                                      </span>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-sm-3 col-12">
                            <Link to={'/customerfeedback'}>
                              <div className="dash-widget dash">
                                <div className="dash-widgetimg">
                                  <span>
                                    <i className="iconly-Heart icli sidebar_icons"></i>
                                  </span>
                                </div>
                                <div className="dash-widgetcontent">
                                  <h6>User Feedback</h6>
                                  <h5>
                                    {this.state.isloading ? (
                                      <Skeletonloader height={23} count={1} />
                                    ) : (
                                      <>
                                        <span className="counters">
                                          {item.feedback}
                                        </span>
                                      </>
                                    )}
                                  </h5>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="row mt-3">
                      <div className="col-lg-6 col-md-12">
                        <div
                          className=" card"
                          style={{
                            borderRadius: '15px',
                            minHeight: '300px',
                            height: 'auto',
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
                              <div
                                className="col-lg-6 col-md-6 col-sm-6 col-12"
                                style={{ textAlign: 'right' }}
                              >
                                <Link to="/productreport">
                                  {this.context.role.staff_role != 'staff' && (
                                    <h6 style={{ fontSize: '16px' }}>
                                      View All{' '}
                                      <i className="fa fa-arrow-right "></i>
                                    </h6>
                                  )}
                                </Link>
                              </div>
                              <div className="col-12 mt-4">
                                {!this.state.isloading ? (
                                  this.state.products.length > 0 ? (
                                    <div className="row">
                                      {this.state.products.map(
                                        (item, index) => {
                                          return (
                                            <div
                                              className="col-lg-6 col-md-6 col-sm-6 col-12"
                                              key={index}
                                            >
                                              <div
                                                className="dash-widget p-0"
                                                style={{ boxShadow: 'none' }}
                                              >
                                                <div className="dash-widgetimg">
                                                  <span>
                                                    <h3>
                                                      <span className="counters">
                                                        <Link
                                                          className="product-img d-flex align-items-center justify-content-center"
                                                          to={
                                                            '/productdetails/' +
                                                            item.id
                                                          }
                                                        >
                                                          <img
                                                            src={
                                                              item.product_img
                                                            }
                                                            alt="P"
                                                            className="product-img"
                                                            style={{
                                                              width: '40px',
                                                              height: '40px',
                                                              borderRadius:
                                                                '50%',
                                                              display: 'flex',
                                                              alignItems:
                                                                'center',
                                                              justifyContent:
                                                                'center',
                                                            }}
                                                          />
                                                        </Link>
                                                      </span>
                                                    </h3>
                                                  </span>
                                                </div>
                                                <div className="dash-widgetcontent">
                                                  <h6>
                                                    {item.product_name}
                                                    {item.variants_name !=
                                                    null ? (
                                                      <span style={{}}>
                                                        - {item.variants_name}
                                                      </span>
                                                    ) : (
                                                      <></>
                                                    )}
                                                  </h6>
                                                  <p className="m-0">
                                                    Order :{' '}
                                                    <span
                                                      style={{
                                                        color: '#ea5455',
                                                      }}
                                                    >
                                                      {item.sales_count}
                                                    </span>{' '}
                                                  </p>
                                                  {item.sales_amount !==
                                                    undefined && (
                                                    <p className="m-0">
                                                      Sales :{' '}
                                                      <span
                                                        style={{
                                                          color: '#ea5455',
                                                        }}
                                                      >
                                                        ₹
                                                        {item.sales_amount.toFixed(
                                                          2
                                                        )}
                                                      </span>
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
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
                                        Sorry, we couldn't find any records at
                                        this moment.{' '}
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
                              <div
                                className="col-lg-6 col-md-6 col-sm-6 col-12"
                                style={{ textAlign: 'right' }}
                              >
                                <Link to={'/inventoryproducts'}>
                                  {this.context.role.staff_role != 'staff' && (
                                    <h6 style={{ fontSize: '16px' }}>
                                      View All{' '}
                                      <i className="fa fa-arrow-right "></i>
                                    </h6>
                                  )}
                                </Link>
                              </div>
                              <div className="col-12 mt-4">
                                {!this.state.isloading ? (
                                  this.state.inventory.length > 0 ? (
                                    <div className="row">
                                      {this.state.inventory.map(
                                        (item, index) => {
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
                                                  <h6>
                                                    {' '}
                                                    {
                                                      item.inventory_product_name
                                                    }{' '}
                                                  </h6>
                                                  <p>
                                                    {item.current_stock == 0 ? (
                                                      <span
                                                        style={{
                                                          color: '#ea5455',
                                                        }}
                                                      >
                                                        Out of Stock
                                                      </span>
                                                    ) : (
                                                      <span>
                                                        {' '}
                                                        Stock :{' '}
                                                        <span
                                                          style={{
                                                            color: '#ea5455',
                                                          }}
                                                        >
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
                                        }
                                      )}
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
                                        Sorry, we couldn't find any records at
                                        this moment.{' '}
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

                  {/* <ProductReport /> */}

                  <div className="page-header">
                    <div className="page-title">
                      <h4>Insights</h4>
                    </div>
                    <div className="page-btn">
                      <select
                        className="form-control ml-3"
                        onChange={(e) => {
                          this.setState({ range: e.target.value });
                          this.fetch_sales_insides(e.target.value);
                        }}
                        value={this.state.range}
                        style={{ width: '150px' }}
                      >
                        {/* <option value="today">Today</option> */}
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="lifetime">LifeTime</option>
                      </select>
                    </div>
                  </div>
                  <div className="graphs-row row">
                    <div className="col-md-6 col-12">
                      <div className="card">
                        <div className="card-body">
                          <div className="rating-breakdown-chart">
                            <h3 className="chart_graph_heading">Revenue</h3>
                            <HighchartsReact
                              updateArgs={[true]}
                              highcharts={Highcharts}
                              options={chartOptions1}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <div className="rating-breakdown-chart">
                        <div className="card">
                          <div className="card-body">
                            <h3 className="chart_graph_heading">
                              No. Of Bills
                            </h3>
                            <HighchartsReact
                              updateArgs={[true]}
                              highcharts={Highcharts}
                              options={chartOptions2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <div className="card">
                        <div className="card-body">
                          <div className="rating-breakdown-chart">
                            <h3 className="chart_graph_heading">Avg. Basket</h3>
                            <HighchartsReact
                              updateArgs={[true]}
                              highcharts={Highcharts}
                              options={chartOptions3}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-12">
                      <div className="card">
                        <div className="card-body">
                          <div className="rating-breakdown-chart">
                            <h3 className="chart_graph_heading">
                              Top Selling Products
                            </h3>
                            <HighchartsReact
                              updateArgs={[true]}
                              highcharts={Highcharts}
                              options={chartOptions4}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Insights;
