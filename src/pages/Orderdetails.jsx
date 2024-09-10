import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { os } from '../../os';
import { AuthContext } from '../AuthContextProvider';
import PrintKot from '../component/PrintKot';
import PrintReceipt from '../component/PrintReceipt';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';

// let EscPosEncoder = require('esc-pos-encoder');

export class Orderdetails extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      edit_user_modal: false,
      data: [],
      cart: [],
      user: [],
      isLoading: true,
      additional_note: '',
      generateBillModal: false,
      generate_order_buttonLoading: false,
      bill: [],
      cart_new: [],
      payment: 'UPI',
      time: 5,
      total_amount: '',
      split_bill_amount_other: '',
      split_bill_amount_cash: '',
      is_buttonloding: false,
      splitModal: false,
      vendor_details: [],
      user_details: [],
      cart_details: [],
      transaction_details: [],
      split_payment: [
        { amount: 0, method: 'Cash' },
        { amount: 0, method: 'Card' },
        { amount: 0, method: 'UPI' },
      ],
      print_receipt: '',
      cancelModal: false,
      delivery:null,
    };

    this.componentRef = React.createRef([]);
    this.componentRef = [];
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.getOrderDetails(this.props.id);
    this.orderDetails(this.props.id);
  }

  orderDetails = (id) => {
    fetch(api + 'get_orders_details_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
        } else {
          this.setState({
            data: json.data[0],
            cart: json.data[0].cart,
            user: json.data[0].user,
            print_receipt: json.data[0].order_for,
            isLoading: false,
          });


          if(json.data[0].delivery != null){
            this.setState({
              delivery: JSON.parse(json.data[0].delivery.shipping_address, null, 2),

            })
          }

        }
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  change_order_status = (status) => {
    if (status == 'cancelled') {
      if (
        this.state.print_receipt == 'gen_receipt' &&
        this.context.role.staff_role != 'admin' &&
        this.context.role.staff_role != 'owner'
      ) {
        toast.error(
          'You can not Cancel Order once receipt has been generated. Please contact Admin.'
        );
        return;
      }
    }
    this.setState({ mark_complete_buttonLoading: true });
    fetch(api + 'update_order_status', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_id: this.state.data.order_code,
        status: status,
        prepare_time: this.state.time,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({
            open: false,
          });
          this.orderDetails(this.props.id);
          toast.success('Order Status Updated Successfully');
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ mark_complete_buttonLoading: false });
      });
  };

  genrate_bill = (id) => {
    this.setState({ generate_order_buttonLoading: true });
    fetch(api + 'generate_bill_by_table', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        table_id: this.state.data.table.table_uu_id,
        order_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
        } else {
          if (json.data.length > 0) {
            this.setState({
              total_amount: Math.round(json.data[0].total_amount),
              bill: json.data[0],
            });
            this.setState({ cart_new: json.data[0].cart });
          }
          this.setState({ generateBillModal: true });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ generate_order_buttonLoading: false });
      });
  };

  mark_complete = () => {
    this.setState({ mark_complete_buttonLoading: true });
    fetch(api + 'update_order_status_by_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_id: this.state.bill.id,
        payment_method: this.state.payment,
        order_status: 'completed',
        split_payment: this.state.split_payment,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.orderDetails(this.props.id);
          this.setState({ modalVisible: false, splitModal: false });
          toast.success('Order Completed');
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ mark_complete_buttonLoading: false });
      });
  };

  add_split_amount = (amount, index) => {
    if (amount == '') {
      amount = 0;
    }
    var split = this.state.split_payment;

    var tt = 0;
    split.map((item, i) => {
      if (i != index) {
        tt = parseFloat(tt) + parseFloat(item.amount);
      } else {
        tt = parseFloat(tt) + parseFloat(amount);
      }
    });

    split[index].amount = amount;
    this.setState({ split_payment: split, split_total: tt });
  };

  getOrderDetails = (id) => {
    fetch(api + 'get_orders_details_vendor', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: id,
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

  sendUrlToPrint = (url) => {
    var beforeUrl = 'intent:';
    var afterUrl = '#Intent;';
    // Intent call with component
    afterUrl +=
      'component=ru.a402d.rawbtprinter.activity.PrintDownloadActivity;';
    afterUrl += 'package=ru.a402d.rawbtprinter;end;';
    document.location = beforeUrl + encodeURI(url) + afterUrl;
    return false;
  };

  genrate_receipt = () => {
    this.setState({ genrate_receipt_buttonLoading: true });
    fetch(api + 'generate_receipt', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        order_code: this.state.data.order_code,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          this.setState({ receipt_modalVisible: false });
          this.orderDetails(this.props.id);
          toast.success('Receipt Generated');
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ genrate_receipt_buttonLoading: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Order Details</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              {this.state.isLoading ? (
                <Loader />
              ) : (
                <>
                  <div className="page-header">
                    <div className="page-title">
                      <h4>Order Details</h4>
                    </div>
                  </div>
                  <section className="comp-section comp-cards">
                    <div className="row">
                      <div className="col-8">
                        {/* order details */}
                        <div className="card flex-fill bg-white">
                          <div
                            className="card-header order_details"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <h5>
                                Order ID: {this.state.data.bill_no} -{' '}
                                {this.state.data.order_type != 'TakeAway' &&
                                this.state.data.order_type != 'Delivery' ? (
                                  <span
                                    style={{
                                      color: '#0066b2',
                                    }}
                                  >
                                    Dine-In{' '}
                                    {this.state.data.table == null ? (
                                      ''
                                    ) : (
                                      <span>
                                        {this.state.data.table.table_name}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      color: '#0066b2',
                                    }}
                                  >
                                    {this.state.data.order_type}
                                    {this.state.data.order_comment !== null ? (
                                      <span>
                                        {' '}
                                        - {this.state.data.order_comment}
                                      </span>
                                    ) : null}
                                  </span>
                                )}
                              </h5>

                              <h6 className="order_date mt-2">
                                {moment(this.state.data.created_at).format(
                                  'llll'
                                )}{' '}
                                <span
                                  style={{
                                    color:
                                      this.state.data.order_status == 'pending'
                                        ? 'red'
                                        : this.state.data.order_status ==
                                          'confirmed'
                                        ? '#0066b2'
                                        : this.state.data.order_status ==
                                          'cancelled'
                                        ? 'red'
                                        : this.state.data.order_status ==
                                          'in_process'
                                        ? '#0066b2'
                                        : this.state.data.order_status ==
                                          'processed'
                                        ? '#0066b2'
                                        : this.state.data.order_status ==
                                          'completed'
                                        ? 'green'
                                        : '',
                                    textTransform: 'capitalize',
                                    fontSize: '17px',
                                  }}
                                >
                                  (Order Status:{' '}
                                  <strong>
                                    {this.state.data.order_status
                                      .split('_')
                                      .join(' ')}
                                  </strong>
                                  )
                                </span>
                              </h6>


                              {
                                    this.state.delivery != null &&
                                    <h6 className="order_date mt-2">Delivery Address:- {this.state.delivery.house_no } {this.state.delivery.landmark != null && this.state.delivery.landmark +', '+this.state.delivery.address} </h6>
                                }
                              {this.state.transaction_details.length == 0 ? (
                                <></>
                              ) : (
                                <h6 className="order_date mt-2">
                                  Payment Method:
                                  {this.state.transaction_details.length ==
                                  1 ? (
                                    <span>
                                      {'  '}
                                      {
                                        this.state.transaction_details[0]
                                          .txn_method
                                      }{' '}
                                      - ₹{' '}
                                      {
                                        this.state.transaction_details[0]
                                          .txn_amount
                                      }{' '}
                                      {this.state.transaction_details[0]
                                        .txn_status == 'success' ? (
                                        <span style={{ color: 'green' }}>
                                          Success
                                        </span>
                                      ) : (
                                        <span style={{ color: 'red' }}>
                                          Failed
                                        </span>
                                      )}
                                      <br />
                                      Txn ID:{' '}
                                      {
                                        this.state.transaction_details[0]
                                          .payment_txn_id
                                      }
                                    </span>
                                  ) : (
                                    <>
                                      <strong>{'  '}Split </strong>
                                      {this.state.transaction_details.map(
                                        (item, i) => {
                                          return (
                                            <>
                                              <br />
                                              <span key={i}>
                                                {' '}
                                                {item.txn_method} - ₹{' '}
                                                {item.txn_amount}{' '}
                                                <span
                                                  style={{
                                                    fontWeight: 'bold',
                                                  }}
                                                >
                                                  Txn ID
                                                </span>
                                                : {item.payment_txn_id}{' '}
                                                {item.txn_status ==
                                                'success' ? (
                                                  <span
                                                    style={{ color: 'green' }}
                                                  >
                                                    Success
                                                  </span>
                                                ) : (
                                                  <span
                                                    style={{ color: 'red' }}
                                                  >
                                                    Failed
                                                  </span>
                                                )}
                                              </span>
                                            </>
                                          );
                                        }
                                      )}
                                    </>
                                  )}
                                </h6>
                              )}
                            </div>
                          </div>
                          <div className="card-body">
                            <h5 className="card-title">
                              {this.state.cart.length}{' '}
                              {this.state.cart.length > 1 ? 'Items' : 'Item'}
                            </h5>
                            <div className="row">
                              <div className="col-md-12">
                                <section
                                  className="item-section"
                                  style={{
                                    padding: '20px 0 0!important',
                                  }}
                                >
                                  <div className="item_row">
                                    <div className="sno_column_heading">
                                      No.
                                    </div>
                                    <div className="item_name_column_heading">
                                      Item
                                    </div>
                                    <div className="price_column_heading">
                                      Price
                                    </div>
                                    <div className="qty_column_heading">
                                      Qty.
                                    </div>
                                    <div className="amount_column_heading">
                                      Amt.
                                    </div>
                                  </div>
                                  {this.state.cart.map((item, index) => {
                                    return (
                                      <div className="single_item_row">
                                        <div className="sno_column">
                                          {index + 1}
                                        </div>
                                        <div className="item_name_column">
                                          <span
                                            style={{
                                              fontWeight: '600px',
                                              marginRight: '10px',
                                            }}
                                          >
                                            {item.product.product_name}
                                          </span>

                                          {item.variant != null && (
                                            <span>
                                              <strong>Variant</strong> -{' '}
                                              {item.variant.variants_name}
                                            </span>
                                          )}

                                          <div className="media-body-cart">
                                            {item.addons.length > 0 && (
                                              <>
                                                <strong>Addons: </strong>
                                                {item.addons.map((items) => {
                                                  return (
                                                    <span className="addon_text_order">
                                                      {items.addon_name}
                                                    </span>
                                                  );
                                                })}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <div className="price_column">
                                          {(
                                            item.product_price /
                                            item.product_quantity
                                          ).toFixed(2)}
                                        </div>
                                        <div className="qty_column">
                                          x {item.product_quantity}
                                        </div>
                                        <div className="amount_column">
                                          {item.product_price}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </section>
                              </div>
                            </div>
                          </div>
                          <div className="card-footer text-muted">
                            <div className="row">
                              <div className="col-md-6">Item Total</div>
                              <div className="col-md-6 d-flex align-items-start justify-content-end item_total">
                                <div className="d-flex align-items-center">
                                  ₹{this.state.data.order_amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            {this.state.data.cgst > 0 ||
                            this.state.data.sgst > 0 ? (
                              <div className="row">
                                <div className="col-md-6 text-success mt-2">
                                  Taxes and other Charges
                                </div>
                                <div className="col-md-6 d-flex align-items-start justify-content-end item_total">
                                  <div className="d-flex align-items-center text-success mt-2">
                                    ₹{' '}
                                    {(
                                      this.state.data.cgst +
                                      this.state.data.sgst
                                    ).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                            {this.state.data.order_discount > 0 && (
                              <div className="row">
                                <div className="col-md-9 text-danger mt-2">
                                  Discount
                                  {this.state.data.offer.length > 0 && (
                                    <span>
                                      {' [' +
                                        this.state.data.offer[0].offer_code +
                                        ' : ' +
                                        this.state.data.offer[0].offer_name +
                                        ']'}
                                    </span>
                                  )}
                                </div>
                                <div className="col-md-3 d-flex align-items-start justify-content-end item_total">
                                  <div className="d-flex align-items-center text-danger mt-2">
                                    ₹{' '}
                                    {this.state.data.order_discount.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            )}
                            {this.state.data.convenience_fee > 0 && (
                              <div className="row">
                                <div className="col-md-6 text-success mt-2">
                                  Convenience Fee
                                </div>
                                <div className="col-md-6 d-flex align-items-start justify-content-end item_total">
                                  <div className="d-flex align-items-center text-success mt-2">
                                    ₹ {this.state.data.convenience_fee}
                                  </div>
                                </div>
                              </div>
                            )}

{this.state.data.charges.length > 0 && (
                              <div className="row">
                                {this.state.data.charges.map((item, index) => (
                                  <React.Fragment key={index}>
                                    <div className="col-md-6 text-success mt-2">
                                      {item.charge_name}
                                    </div>
                                    <div className="col-md-6 d-flex align-items-start justify-content-end item_total">
                                      <div className="d-flex align-items-center  mt-2">
                                        ₹ {item.charge_amount}
                                      </div>
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                            
                            <div className="row">
                              <div className="col-md-6 grand_total">
                                Grand Total
                              </div>
                              <div className="col-md-6 d-flex align-items-start justify-content-end">
                                <div className="d-flex align-items-center grand_total">
                                  ₹ {this.state.data.total_amount.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* user details */}
                      </div>
                      <div className="col-4">
                        {this.state.mark_complete_buttonLoading ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a className="btn btn-danger w-100 me-2" disabled>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                            </a>
                            <a
                              className="btn btn-secondary w-100 ms-2"
                              disabled
                            >
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              ></span>
                            </a>
                          </div>
                        ) : this.state.data.order_status == 'placed' ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a
                              className="btn btn-danger w-100 me-2"
                              onClick={() => {
                                this.setState({ cancelModal: true });
                              }}
                            >
                              Cancel Order
                            </a>
                            <a
                              className="btn btn-secondary w-100 ms-2"
                              onClick={() => {
                                this.change_order_status('confirmed');
                              }}
                            >
                              <p>Accept Order</p>
                            </a>
                          </div>
                        ) : this.state.data.order_status == 'confirmed' ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a
                              className="btn btn-danger w-100 me-2"
                              onClick={() => {
                                this.setState({ cancelModal: true });
                                // this.change_order_status('cancelled');
                              }}
                            >
                              Cancel Order
                            </a>
                            <a
                              className="btn btn-secondary w-100 ms-2"
                              onClick={() => this.setState({ open: true })}
                            >
                              <p>Order In-Process</p>
                            </a>
                          </div>
                        ) : this.state.data.order_status == 'in_process' ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a
                              className="btn btn-danger w-100 me-2"
                              onClick={() => {
                                this.setState({ cancelModal: true });
                              }}
                            >
                              Cancel Order
                            </a>
                            <a
                              className="btn btn-secondary w-100 ms-2"
                              onClick={() => {
                                this.change_order_status('processed');
                              }}
                            >
                              <p>Order Processed</p>
                            </a>
                          </div>
                        ) : this.state.data.order_status == 'processed' ? (
                          this.state.data.order_type == 'Delivery' ? (
                            <div className="d-flex align-items-center justify-content-around mb-3">
                              <a
                                className="btn btn-danger w-100 me-2"
                                onClick={() => {
                                  this.setState({ cancelModal: true });
                                }}
                              >
                                Cancel Order
                              </a>
                              <a
                                className="btn btn-secondary w-100 ms-2"
                                onClick={() => {
                                  this.change_order_status('out for delivery');
                                }}
                              >
                                <p>Out for Delivery</p>
                              </a>
                            </div>
                          ) : (
                            this.state.data.order_type == 'TakeAway' && (
                              <div className="d-flex align-items-center justify-content-around mb-3">
                                <a
                                  className="btn btn-secondary w-100"
                                  onClick={() => {
                                    this.change_order_status('completed');
                                  }}
                                >
                                  <p>Completed</p>
                                </a>
                              </div>
                            )
                          )
                        ) : this.state.data.order_status ==
                          'out for delivery' ? (
                          <div className="d-flex align-items-center justify-content-around mb-3">
                            <a
                              href="javascript:void(0);"
                              className="btn btn-secondary"
                              onClick={() => {
                                this.change_order_status('completed');
                              }}
                            >
                              <p>Completed</p>
                            </a>
                          </div>
                        ) : (
                          <></>
                        )}
                        <div className="card flex-fill bg-white">
                          <div className="card-header order_details">
                            <h5>Customer details</h5>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-lg-6">
                                <div className="form-group m-0">
                                  <label>Mobile</label>
                                  <input
                                    type="text"
                                    value={this.state.user.contact}
                                    className="form-control"
                                  />
                                </div>
                              </div>
                              <div className="col-lg-6">
                                <div className="form-group m-0">
                                  <label>Name</label>
                                  <input
                                    type="text"
                                    value={this.state.user.name}
                                    className="form-control"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {this.state.data.instruction !== ' ' &&
                        this.state.data.instruction !== '' &&
                        this.state.data.instruction !== null ? (
                          <div className="card flex-fill bg-white">
                            <div className="card-header order_details">
                              <h5>Notes</h5>
                            </div>
                            <div className="card-body">
                              <p className="m-0">
                                {this.state.data.instruction}
                              </p>
                            </div>
                          </div>
                        ) : null}
                       
                     
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>

          <Modal
            focusTrapped={false}
            // open={true}
            open={this.state.cancelModal}
            onClose={() => this.onCloseModal()}
            center
            showCloseIcon={true}
            classNames={{
              modal: 'customModal',
            }}
            styles={{
              modal: {
                height: '600px',
              },
            }}
          >
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Customise as per your taste</h4>
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            focusTrapped={false}
            open={this.state.open}
            onClose={() => this.setState({ open: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Edit Order Status</h4>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Time to prepare the order.</label>
                    <div className="d-flex align-items-center">
                      {this.state.time <= 5 ? (
                        <a className="btn btn-secondary disabled">
                          <i className="fa-solid fa-minus"></i>
                        </a>
                      ) : (
                        <a
                          className="btn btn-secondary"
                          onClick={() => {
                            this.setState({ time: this.state.time - 1 });
                          }}
                        >
                          <i className="fa-solid fa-minus"></i>
                        </a>
                      )}
                      <input
                        type="text"
                        className="text-center"
                        onChange={(e) => {
                          this.setState({
                            time: e.target.value,
                          });
                        }}
                        value={this.state.time}
                        readOnly
                      />
                      <h6>Minutes</h6>
                      <a
                        className="btn btn-secondary"
                        onClick={() => {
                          this.setState({
                            time: this.state.time + 1,
                          });
                        }}
                      >
                        <i className="fa-solid fa-add"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12 d-flex justify-content-end">
                  {this.state.mark_complete_buttonLoading ? (
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      style={{
                        pointerEvents: 'none',
                        opacity: '0.8',
                      }}
                    >
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Updating
                    </button>
                  ) : (
                    <a
                      onClick={() => {
                        this.change_order_status('in_process');
                      }}
                      className="btn btn-secondary btn-sm me-2"
                    >
                      Update Status
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            focusTrapped={false}
            open={this.state.generateBillModal}
            onClose={() => this.setState({ generateBillModal: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header m-0 text-center">
                <div className="page-title text-center">
                  <h4>Generating Bill</h4>
                  <p>Total Bill Amount - ₹ {this.state.total_amount}</p>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    {/* <label>VEG/NON-VEG</label> */}
                    <div>
                      <RadioGroup
                        onChange={(value) => {
                          this.setState({ payment: value });
                        }}
                        value={this.state.payment}
                      >
                        <RadioButton
                          value="upi"
                          pointColor="#0066b2"
                          iconSize={20}
                          rootColor="#f3c783"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Google Pay/Paytm/UPI
                        </RadioButton>
                        <RadioButton
                          value="card"
                          pointColor="#0066b2"
                          iconSize={20}
                          rootColor="#f3c783"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Credit/Debit Card
                        </RadioButton>
                        <RadioButton
                          value="cash"
                          pointColor="#0066b2"
                          iconSize={20}
                          rootColor="#f3c783"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Cash
                        </RadioButton>
                        <RadioButton
                          value="split"
                          pointColor="#0066b2"
                          iconSize={20}
                          rootColor="#f3c783"
                          iconInnerSize={10}
                          padding={10}
                        >
                          Split Payment
                        </RadioButton>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12 d-flex justify-content-end">
                  {this.state.mark_complete_buttonLoading ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{
                        pointerEvents: 'none',
                        opacity: '0.8',
                      }}
                    >
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Please wait
                    </button>
                  ) : this.state.payment == 'split' ? (
                    <a
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        this.setState({
                          splitModal: true,
                          generateBillModal: false,
                        });
                      }}
                    >
                      Complete Order
                    </a>
                  ) : (
                    <a
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        this.mark_complete();
                      }}
                    >
                      Complete Order
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Modal>

          <Modal
            focusTrapped={false}
            open={this.state.splitModal}
            onClose={() => this.setState({ splitModal: false })}
            center
            classNames={{
              modal: 'customModal',
            }}
          >
            <div className="content">
              <div className="page-header m-0 text-center">
                <div className="page-title text-center">
                  <h4>Split Bill Amount</h4>
                  <p>Total Bill Amount - ₹ {this.state.total_amount}</p>
                </div>
              </div>
              <div className="card border-none">
                <div className="card-body p-0 pt-4">
                  <div className="row">
                    {this.state.split_payment.map((item, index) => {
                      var tt = item.amount;
                      return (
                        <div className="row">
                          <div className="col-lg-6">
                            <div className="form-group">
                              <label>{item.method} </label>
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="form-group">
                              <input
                                className="form-control"
                                type="number"
                                onChange={(e) => {
                                  this.add_split_amount(e.target.value, index);
                                }}
                                value={this.state[item.amount]}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <h5>Split Total - {this.state.split_total} </h5>

                    <div className="col-lg-12 d-flex justify-content-end">
                      {this.state.mark_complete_buttonLoading ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{
                            pointerEvents: 'none',
                            opacity: '0.8',
                          }}
                        >
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Please wait
                        </button>
                      ) : (
                        this.state.split_total == this.state.total_amount && (
                          <a
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              this.mark_complete();
                            }}
                          >
                            Complete Order
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <Orderdetails
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
