import moment from 'moment';
import React, { Component } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';

export class Print extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      data: [],
      vendor_details: [],
      user_details: [],
      cart_details: [],
      transaction_details: [],
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.getOrderDetails();
  }

  getOrderDetails = () => {
    fetch(api + 'get_orders_details_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: this.props.code,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
        } else {
          this.setState({
            data: json.data[0],
            vendor_details: json.data[0].vendor,
            user_details: json.data[0].user,
            cart_details: json.data[0].cart,
            transaction_details: json.data[0].transactions,
            isLoading: false,
          });
          // var content = document.getElementById("divcontents");
          // var pri = document.getElementById("invoice-POS").contentWindow;
          // pri.document.open();
          // pri.document.write(content.innerHTML);
          // pri.document.close();
          // pri.focus();
          // pri.print();
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  render() {
    return (
      <div id="invoice-POS">
        <center id="top">
          <div className="info">
            <h2>{this.state.vendor_details.name}</h2>
          </div>
          {/*End Info*/}
        </center>
        {/*End InvoiceTop*/}
        <div id="mid">
          <div className="info">
            <p
              style={{
                marginBottom: '10px',
                lineHeight: '20px',
              }}
            >
              {this.state.vendor_details.address != null ? (
                <span
                  style={{
                    marginBottom: '5px',
                  }}
                >
                  {this.state.vendor_details.address}
                </span>
              ) : (
                <></>
              )}
              {this.state.vendor_details.area != null ? (
                <span>, {this.state.vendor_details.area}</span>
              ) : (
                <></>
              )}
              {this.state.vendor_details.city != null ? (
                <span>, {this.state.vendor_details.city}</span>
              ) : (
                <></>
              )}
              {this.state.vendor_details.state != null ? (
                <span>, {this.state.vendor_details.state}</span>
              ) : (
                <></>
              )}
              {this.state.vendor_details.pincode != null ? (
                <span>, {this.state.vendor_details.pincode}</span>
              ) : (
                <></>
              )}
            </p>

            {this.state.vendor_details.gstin != null ? (
              <p>
                <span>
                  <center style={{ textAlign: 'center' }}>
                    GSTIN- {this.state.vendor_details.gstin}{' '}
                  </center>
                </span>
              </p>
            ) : (
              <></>
            )}

            <h3 className="new_h3">
              {/* {this.state.data.order_type != 'TakeAway' &&
              this.state.data.order_type != 'Delivery' ? (
                <span>
                  Dine-In -{' '}
                  {this.props.order.table == null ? (
                    <span>Table Not Assigned</span>
                  ) : (
                    <span>{this.props.order.table.table_name}</span>
                  )}
                </span>
              ) : ( */}
              <span>{this.state.data.order_type}</span>
              {/* )} */}
            </h3>
          </div>
        </div>
        {/* customer-details */}
        <div id="customer_details">
          <h3 className="customer_details_h3">---Customer Details---</h3>
          <div className="name_phone_main">
            <div id="name_phone">
              <div className="phone_email_head">Name</div>
              <div className="phone_email_content">
                {this.state.user_details.id != 1
                  ? this.state.user_details.name
                  : 'N/A'}
              </div>
            </div>

            <div id="name_phone">
              <div className="phone_email_head">Phone</div>
              <div className="phone_email_content">
                {this.state.user_details.id != 1
                  ? this.state.user_details.contact
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
        {/* end-customer-details */}
        {/* customer_order_details */}
        <div id="customer_details">
          <div className="customer_order_details_main">
            <div id="customer_order_details">
              <div className="customer_order_details_head">Order Time</div>
              <div className="customer_order_details_content">
                {moment(this.state.data.created_at).format('llll')}
              </div>
            </div>
            <div id="customer_order_details">
              <div className="customer_order_details_head">Order Code</div>
              <div className="customer_order_details_content">
                {this.state.data.order_code}
              </div>
            </div>
            {this.state.data.order_type == 'Dinein' && (
              <div id="customer_order_details">
                <div className="customer_order_details_head">Table Number</div>
                <div className="customer_order_details_content">221</div>
              </div>
            )}

            {this.state.transaction_details.length > 0 && (
              <div>
                <div id="customer_order_details">
                  <div className="customer_order_details_head">
                    Payment Method
                  </div>
                  <div className="customer_order_details_content">
                    {this.state.transaction_details.length == 1 ? (
                      <span>
                        {' '}
                        {this.state.transaction_details[0].txn_method}
                      </span>
                    ) : (
                      this.state.transaction_details.map((item, i) => {
                        return (
                          <span key={i}>
                            {' '}
                            {item.txn_method} - ₹ {item.txn_amount},
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* end_customer_order_details */}
        {/*End Invoice Mid*/}
        <div id="bot">
          {this.state.vendor_details.gstin != null ? (
            <h3>---GST Invoice---</h3>
          ) : (
            <h3>---Invoice---</h3>
          )}
          <div id="table">
            <table>
              <tbody>
                <tr className="tabletitle">
                  <td
                    className="count"
                    style={{
                      width: '10%',
                    }}
                  >
                    <h2 className="table_data">#</h2>
                  </td>
                  <td
                    className="item"
                    style={{
                      width: '50%',
                    }}
                  >
                    <h2 className="table_data">Item</h2>
                  </td>
                  <td
                    className="Hours"
                    style={{
                      width: '10%',
                    }}
                  >
                    <h2 className="table_data">Qty</h2>
                  </td>
                  <td
                    className="Rate"
                    style={{
                      width: '15%',
                    }}
                  >
                    <h2 className="table_data">Rate</h2>
                  </td>
                  <td
                    className="Amount"
                    style={{
                      width: '15%',
                    }}
                  >
                    <h2 className="table_data">Amount</h2>
                  </td>
                </tr>
                {this.state.cart_details.map((values, index) => {
                  return (
                    <tr className="service">
                      <td className="tableitem">
                        <p className="itemtext">{index + 1}</p>
                      </td>
                      <td className="tableitem">
                        <p className="itemtext">
                          {values.product.product_name}
                        </p>
                      </td>
                      <td className="tableitem">
                        <p className="itemtext">{values.product_quantity}</p>
                      </td>
                      <td className="tableitem">
                        <p className="itemtext">
                          ₹ {values.product_price / values.product_quantity}
                        </p>
                      </td>
                      <td className="tableitem">
                        <p className="itemtext">₹ {values.product_price}</p>
                      </td>
                    </tr>
                  );
                })}
                <tr className="tabletitle">
                  <td />
                  <td className="Rate">
                    <h2>Sub Total</h2>
                  </td>
                  <td />
                  <td />
                  <td className="payment">
                    <h2>₹ {this.state.data.order_amount}/-</h2>
                  </td>
                </tr>
                {this.state.data.cgst != '0' && (
                  <tr className="tabletitle">
                    <td />
                    <td className="Rate">
                      <h2>Tax(C.G.S.T)</h2>
                    </td>
                    <td />
                    <td />
                    <td className="payment">
                      <h2>₹ {this.state.data.cgst}/-</h2>
                    </td>
                  </tr>
                )}
                {this.state.data.sgst != '0' && (
                  <tr className="tabletitle">
                    <td />
                    <td className="Rate">
                      <h2>Tax(S.G.S.T)</h2>
                    </td>
                    <td />
                    <td />
                    <td className="payment">
                      <h2>₹ {this.state.data.sgst}/-</h2>
                    </td>
                  </tr>
                )}
                {this.state.data.order_discount != '0' && (
                  <tr className="tabletitle">
                    <td />
                    <td className="Rate">
                      <h2>Discount</h2>
                    </td>
                    <td />
                    <td />
                    <td className="payment">
                      <h2>₹ {this.state.data.order_discount}/-</h2>
                    </td>
                  </tr>
                )}
                <tr className="tabletitle">
                  <td />
                  <td className="Rate">
                    <h2
                      style={{
                        fontSize: '2em !important',
                      }}
                    >
                      Grand Total
                    </h2>
                  </td>
                  <td />
                  <td />
                  <td className="payment">
                    <h2
                      style={{
                        fontSize: '2em !important',
                      }}
                    >
                      ₹ {this.state.data.total_amount}/-
                    </h2>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/*End Table*/}
          <div id="legalcopy">
            <p className="legal">
              <strong>Thank you for your business!</strong>
            </p>
          </div>
        </div>
        {/*End InvoiceBot*/}
        {/*KOT start*/}
        <div id="legalcopy">
          <p className="kot_dT kot_heading">
            Token For: {this.state.data.order_code}
            {'    '}Date: {moment(this.state.data.created_at).format('llll')}
          </p>
        </div>
        <div id="bot" className="mt-10">
          <div id="table">
            <table>
              <tbody>
                <tr className="tabletitle">
                  <td className="count text-center">
                    <h2>#</h2>
                  </td>
                  <td className="item text-center">
                    <h2>Item</h2>
                  </td>
                  <td className="Hours text-center">
                    <h2>Qty</h2>
                  </td>
                </tr>
                {this.state.cart_details.map((values, index) => {
                  return (
                    <tr className="service">
                      <td className="tableitem">
                        <p className="itemtext text-center">{index + 1}</p>
                      </td>
                      <td className="tableitem">
                        <p className="itemtext text-center">
                          {values.product.product_name}
                        </p>
                      </td>
                      <td className="tableitem">
                        <p className="itemtext text-center">
                          {values.product_quantity}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/*KOT End*/}
      </div>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <Print {...props} {...useParams()} navigate={abcd} location={location} />
  );
}

export default (props) => <Navigate {...props} />;
