import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { DatePicker } from 'rsuite';
import Header from '../othercomponent/Header';

export class ViewRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      save_and_continue: false,
      name: '',
      contact: '',
      pricePerDay: '',
      from: new Date(),
      to: new Date(),
      extraBed: false,
      finalPrice: '',
      total_cost: '',
      advance: '',
      balance: '',
      checkoutModal: false,
      split: false,
      split_payment: [
        { amount: 0, method: 'Cash' },
        { amount: 0, method: 'Card' },
        { amount: 0, method: 'UPI' },
      ],
      split_total: 0,
    };
  }
  render() {
    return (
      <>
        <Helmet>
          <title>View Room</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>
                    View Room - <span className="text-sm">Room 101</span>
                  </h4>
                </div>

                <div className="page-btn">
                  <div className="btn btn-added">Print Bill</div>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          Customer Name
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          onChange={(e) => {
                            this.setState({ name: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>Contact</label>
                        <input
                          onChange={(e) => {
                            this.setState({ contact: e.target.value });
                          }}
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          From
                          <span className="text-danger">*</span>
                        </label>
                        <DatePicker
                          selected={this.state.from}
                          onChange={(date) => {
                            this.setState({ from: date });
                          }}
                          className="w-100"
                          minDate={new Date()}
                          format="dd-MM-yyyy"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          To
                          <span className="text-danger">*</span>
                        </label>
                        <DatePicker
                          selected={this.state.to}
                          onChange={(date) => {
                            this.setState({ to: date });
                          }}
                          className="w-100"
                          minDate={this.state.from}
                          format="dd-MM-yyyy"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          Adult
                          <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          onChange={(e) => {
                            this.setState({ adult: e.target.value });
                          }}
                          value={this.state.adult}
                          defaultValue="1"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          Child
                          <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          onChange={(e) => {
                            this.setState({ child: e.target.value });
                          }}
                          defaultValue="1"
                          value={this.state.child}
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          Price / Day
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          onChange={(e) => {
                            this.setState({ pricePerDay: e.target.value });
                          }}
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 d-flex align-items-center justify-content-start">
                      <div className="row w-100">
                        <div className="col-lg-6 d-flex align-items-center justify-content-center">
                          <input
                            type="checkbox"
                            name="extraBed"
                            id="extraBed"
                            className="form-group mx-2 m-0"
                            checked={this.state.extraBed}
                            onChange={(e) => {
                              this.setState({ extraBed: e.target.checked });
                            }}
                          />
                          <label htmlFor="extraBed">Extra Bed</label>
                        </div>
                        {this.state.extraBed && (
                          <div className="col-lg-6">
                            <div className="form-group">
                              <label>
                                Extra Bed
                                <span className="text-danger">*</span>
                              </label>
                              <select
                                className="form-control"
                                onChange={(e) => {
                                  this.setState({
                                    extraBedLimit: e.target.value,
                                  });
                                }}
                                value={this.state.extraBedLimit}
                                defaultValue="1"
                              >
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          Final Price
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          onChange={(e) => {
                            this.setState({ finalPrice: e.target.value });
                          }}
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          Total Cost
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          onChange={(e) => {
                            this.setState({ total_cost: e.target.value });
                          }}
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          Advance
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          onChange={(e) => {
                            this.setState({ advance: e.target.value });
                          }}
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3">
                      <div className="form-group">
                        <label>
                          Balance
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          onChange={(e) => {
                            this.setState({ balance: e.target.value });
                          }}
                          type="text"
                        />
                      </div>
                    </div>

                    <div className="col-lg-12 d-flex justify-content-between align-items-center">
                      <button
                        // onClick={() => {
                        //   this.create();
                        // }}
                        className="btn btn-secondary btn-sm  me-2"
                      >
                        Kitchen Orders
                      </button>
                      {this.state.save_and_continue ? (
                        <button
                          className="btn btn-secondary btn-sm  me-2"
                          style={{
                            pointerEvents: 'none',
                            opacity: '0.8',
                          }}
                        >
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Please Wait
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            this.setState({ checkoutModal: true });
                          }}
                          className="btn btn-secondary btn-sm  me-2"
                        >
                          Checkout
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal
          focusTrapped={false}
          open={this.state.checkoutModal}
          onClose={() => this.setState({ checkoutModal: false })}
          center
          classNames={{
            modal: 'customModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Room 101</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <div className="row">
                    <div className="col-lg-4">
                      <h6>
                        Total Cost - <strong>₹{this.state.grandTotal}</strong>
                      </h6>
                    </div>
                    <div className="col-lg-4">
                      <h6>
                        Advance - <strong>₹{this.state.grandTotal}</strong>
                      </h6>
                    </div>
                    <div className="col-lg-4">
                      <h6>
                        Balance - <strong>₹{this.state.grandTotal}</strong>
                      </h6>
                    </div>
                  </div>
                  {this.state.order_method != 'DineIn' ? (
                    <label style={{ marginTop: '20px' }}>
                      Select Payment Method
                    </label>
                  ) : (
                    <label style={{ marginTop: '20px' }}>Confirm Order </label>
                  )}

                  {this.state.is_buttonloding ? (
                    <div className="setvaluecash">
                      <ul style={{ justifyContent: 'center' }}>
                        <li>
                          <a
                            onClick={() => {
                              this.place_order('offline-cash');
                            }}
                            href="javascript:void(0);"
                            className="paymentmethod"
                          >
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Please Wait...
                          </a>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="setvaluecash">
                      {this.state.order_method != 'DineIn' ? (
                        !this.state.split ? (
                          <ul>
                            <li>
                              <a
                                onClick={() => {
                                  this.place_order('Cash');
                                }}
                                href="javascript:void(0);"
                                className="paymentmethod"
                              >
                                <i className="fa-solid fa-money-bill"></i>
                                Cash
                              </a>
                            </li>
                            <li>
                              <a
                                href="javascript:void(0);"
                                onClick={() => {
                                  this.place_order('Card');
                                }}
                                className="paymentmethod"
                              >
                                <i className="fa-solid fa-credit-card"></i>
                                Card
                              </a>
                            </li>
                            <li>
                              <a
                                href="javascript:void(0);"
                                onClick={() => {
                                  this.place_order('UPI');
                                }}
                                className="paymentmethod"
                              >
                                <i className="fa-solid fa-qrcode"></i>
                                Scan
                              </a>
                            </li>

                            <li>
                              <a
                                href="javascript:void(0);"
                                onClick={() => {
                                  this.setState({ split: true });
                                  // this.place_order("offline-UPI");
                                }}
                                className="paymentmethod"
                              >
                                <i className="fa-solid fa-arrows-turn-to-dots"></i>
                                Split
                              </a>
                            </li>
                          </ul>
                        ) : (
                          <>
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
                                        type="number"
                                        className="form-control w-100"
                                        onChange={(e) => {
                                          this.add_split_amount(
                                            e.target.value,
                                            index
                                          );
                                        }}
                                        value={this.state[item.amount]}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            <h5>Total - {this.state.split_total} </h5>
                            {this.state.split_total ==
                              this.state.grandTotal && (
                              <div
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%' }}
                                onClick={() => {
                                  this.place_order('split');
                                }}
                              >
                                <h5>Place Order</h5>
                              </div>
                            )}
                          </>
                        )
                      ) : (
                        <ul style={{ justifyContent: 'center' }}>
                          <li>
                            <a
                              onClick={() => {
                                this.place_order('offline-cash');
                              }}
                              href="javascript:void(0);"
                              className="paymentmethod"
                            >
                              <i className="fa-solid fa-check-double"></i>
                              Confirm Order
                            </a>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

export default ViewRoom;
