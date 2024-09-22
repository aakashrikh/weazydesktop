import moment from 'moment';
import React, { Component } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import OrderDetailsDrawer from '../othercomponent/OrderDetailsDrawer';
import InfiniteLoader from './InfiniteLoader';
import PerUserOrder from '../pages/PerUserOrder';
import { AuthContext } from '../AuthContextProvider';
export class OrdersTable extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      drawerOrderId: '',
      openPerUserOrder: false,
    };
  }
  render() {
    return (
      <>
        <InfiniteScroll
          hasChildren={true}
          dataLength={this.props.data.length}
          next={() => {
            this.props.fetch_order(this.props.page + 1, this.props.status);
            this.setState({
              loadMore: true,
            });
          }}
          hasMore={this.props.next_page !== null && this.props.data.length > 0}
          loader={
            <div className="d-flex align-items-center justify-content-center w-full">
              <InfiniteLoader />
            </div>
          }
        >
          <table className="table  datanew">
            <thead>
              <tr>
                <th>S.no</th>
                {
                          this.context.role.stores.length>1  &&
                  <th>Store Name</th>
                }
                <th>Order ID</th>
                <th>Customer  </th>
                <th>Contact</th>
                <th>Amount</th>
                {
                  this.props.status == 'unsettled'&&
                  <>
                  <th>Settle Amount</th>
                  <th>Balance Amount</th>
                  </>

                }
               
               
                <th>Type</th>
                <th>Source</th>
                <th>Time</th>
                <th style={{ textAlign: 'end' }}>Status</th>
                {/* <th style={{ textAlign: 'end' }}>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {this.props.data.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  { this.context.role.stores.length>1 &&
                  <td>{item.vendor.shop_name}{'-'} {item.vendor.area}</td>
                }

                  <td>
                    <p
                      onClick={() => {
                        this.setState({
                          open: true,
                          drawerOrderId: item.order_code,
                        });
                      }}
                    >
                      {item.bill_no === null ? item.order_code : item.bill_no}
                    </p>
                  </td>
                  <td>
                    {
                    item.user != null &&(
                    item.user.user_uu_id === null ? (
                      'N/A'
                    ) : (
                      <div
                        onClick={() => {
                          this.setState({
                            openPerUserOrder: true,
                            user_id: item.user.user_uu_id,
                          });
                        }}
                        className="cursor-pointer"
                      >
                        {item.user.name}
                        
                      </div>
                    )
                  )}
                  </td>
                  <td>
                    {
                    item.user != null &&
                    item.user.contact !== '0000000000'
                      ? item.user.contact
                      : 'N/A'}
                  </td>
                  <td>₹ {item.total_amount}</td>

                  {
                  this.props.status == 'unsettled'&&
                  <>
                  <td>₹ {item.sum_txn_amount}</td>
                  <td>₹ {item.total_amount-item.sum_txn_amount}</td>
                  </>

                }

                 
                  <td>
                    {item.order_type !== 'TakeAway' &&
                    item.order_type !== 'Delivery' ? (
                      <>Dine-In</>
                    ) : (
                      <>{item.order_type}</>
                    )}
                  </td>
                  <td>{item.channel}</td>
                  <td>{moment(item.created_at).fromNow()}</td>
                  <td style={{ textAlign: 'end' }}>
                    {item.order_status === 'placed' ? (
                      <span
                        style={{
                          color: '#619DD1',
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.order_status}
                      </span>
                    ) : item.order_status === 'ongoing' ? (
                      <span
                        style={{
                          color: '#619DD1',
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.order_status}
                      </span>
                    ) : item.order_status === 'processed' ? (
                      <span
                        style={{
                          color: '#619DD1',
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.order_status}
                      </span>
                    ) : item.order_status === 'completed' ? (
                      <span
                        style={{
                          color: 'green',
                          textTransform: 'capitalize',
                        }}
                      >
                        Completed
                      </span>
                    ) : item.order_status === 'complated' ? (
                      <span
                        style={{
                          color: 'green',
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.order_status}
                      </span>
                    ) : item.order_status === 'in_process' ? (
                      <span
                        style={{
                          color: '#0066b2',
                          textTransform: 'capitalize',
                        }}
                      >
                        In Process
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
                  {/* <td>
                    <button
                      className="btn btn-secondary table-action-btn"
                      style={{
                        padding: '2px 6px',
                      }}
                      onClick={() => {
                        this.setState({
                          open: true,
                          drawerOrderId: item.order_code,
                        });
                      }}
                    >
                      <i className="fa fa-eye"></i>
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
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

export default OrdersTable;
