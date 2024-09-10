import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { DatePicker } from 'rsuite';
import Header from '../othercomponent/Header';

export class Reservation extends Component {
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
      amount: '',
      advance: '',
    };
  }
  render() {
    return (
      <>
        <Helmet>
          <title>Room Reservation</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Reservation</h4>
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
                          Amount
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          onChange={(e) => {
                            this.setState({ amount: e.target.value });
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
                          Method
                          <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          onChange={(e) => {
                            this.setState({ method: e.target.value });
                          }}
                          value={this.state.method}
                          defaultValue="cash"
                        >
                          <option value="cash">Cash</option>
                          <option value="cheque">Cheque</option>
                          <option value="credit">Credit</option>
                          <option value="debit">Debit</option>
                          <option value="transfer">Transfer</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-lg-12 d-flex justify-content-end">
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
                          Saving
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            this.create();
                          }}
                          className="btn btn-secondary btn-sm  me-2"
                        >
                          Save and continue
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Reservation;
