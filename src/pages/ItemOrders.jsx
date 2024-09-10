import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_order from '../assets/images/no_orders.webp';
import Header from '../othercomponent/Header';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';

class ItemOrders extends Component {
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
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_order(1, this.state.range);
  }

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
        start_date: this.state.from,
        end_date: this.state.to,
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
        <Helmet>
          <title>Sales Report</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>
                    Orders for {this.state.product.product_name}{' '}
                    <h6>
                      {' From '}
                      {moment(this.state.from).format('DD/MMM/YY') +
                        ' to ' +
                        moment(this.state.to).format('DD/MMM/YY')}
                    </h6>{' '}
                  </h4>
                </div>
              </div>
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
                                      <Link
                                        to={'/orderdetails/' + item.order_code}
                                      >
                                        {' '}
                                        {item.order_code}
                                      </Link>
                                    </td>
                                    <td>₹{item.total_amount}</td>

                                    <td>
                                      {moment(item.created_at).format('lll')}
                                    </td>
                                    <td>{item.cart[0].product_quantity}</td>
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
          </div>
        </div>
      </>
    );
  }
}

export default (props) => <ItemOrders {...useParams()} {...props} />;
