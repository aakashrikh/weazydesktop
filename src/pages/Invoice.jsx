import React, { Component } from 'react';
import Header from '../othercomponent/Header';
import logo_black_full from '../assets/images/logos/main_logo_black.png';

export class Invoice extends Component {
  render() {
    return (
      <div className="main-wrappers" style={{display:'none'}}>
        <Header sidebar={true} />
        <div className="page-wrapper">
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Invoice for - [WI-120919273]</h4>
              </div>
              <div className="page-btn">
                <button className="btn btn-secondary btn-sm">
                  Print Invoice
                </button>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h5 className="text-center">
                  <strong>
                    <u>PURCHASE ORDER</u>
                  </strong>
                </h5>
                <hr />
                <div className="row mb-4">
                  <div className="col-lg-6">
                    <div className="row m-0">
                      <div className="col-md-4 border p-2">
                        <img src={logo_black_full} alt="" />
                      </div>
                      <div className="col-md-8 border border-left-0 p-2">
                        Invoice To
                        <br />
                        <strong>{this.context.user.legal_business_name}</strong>
                        <br />
                     {this.context.user.address}
                        <div className="total-order w-100 max-widthauto m-auto mt-1">
                          <ul>
                            <li>
                              <h4>GSTIN/UIN</h4>
                              <h5>{this.context.user.gstin}</h5>
                            </li>
                            <li>
                              <h4>State Name</h4>
                              <h5>{this.context.user.state}</h5>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-12 border border-top-0 p-2">
                        Consignee (Ship to)
                        <br />
                        <strong>{this.context.user.legal_business_name}</strong>
                        <br />
                        {this.context.user.address}
                        <div className="total-order w-100 max-widthauto m-auto mt-1">
                          <ul>
                            <li>
                              <h4>GSTIN/UIN</h4>
                              <h5>{this.context.user.gstin}</h5>
                            </li>
                            <li>
                              <h4>State Name</h4>
                              <h5>{this.context.user.state}</h5>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-12 border border-top-0 p-2">
                        Supplier (Bill from)
                        <br />
                        <strong>Design Maxx</strong>
                        <br />
                        <div className="total-order w-100 max-widthauto m-auto mt-1">
                          <ul>
                            <li>
                              <h4>GSTIN/UIN</h4>
                              <h5>07AANCM8247K1ZT</h5>
                            </li>
                            <li>
                              <h4>State Name</h4>
                              <h5>Delhi,Code : 07</h5>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="total-order w-100 max-widthauto m-auto mb-4">
                      <ul>
                        <li>
                          <h4>Voucher No.</h4>
                          <h5>1</h5>
                        </li>
                        <li>
                          <h4>Dated</h4>
                          <h5>20-May-24</h5>
                        </li>
                        <li>
                          <h4>Reference No. & Date.</h4>
                          <h5>1</h5>
                        </li>
                        <li>
                          <h4>Other References</h4>
                          <h5>1</h5>
                        </li>
                        <li>
                          <h4>Mode/Terms of Payment</h4>
                          <h5></h5>
                        </li>
                        <li>
                          <h4>Dispatched through</h4>
                          <h5></h5>
                        </li>
                        <li>
                          <h4>Destination</h4>
                          <h5></h5>
                        </li>
                        <li>
                          <h4>Terms Of Delivery</h4>
                          <h5></h5>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="table-responsive no-pagination">
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>S. No.</th>
                          <th>Description of Goods</th>
                          <th>HSN/SAC</th>
                          <th>Due on</th>
                          <th>Quantity</th>
                          <th>Rate</th>
                          <th>per</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>
                            <strong>main signage</strong>
                          </td>
                          <td>5901</td>
                          <td>29/10/2025 </td>
                          <td>
                            <strong>1 PCS</strong>
                          </td>
                          <td>550.00</td>
                          <td>PCS</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-lg-6">
                    Amount Chargeable (in words)
                    <br />
                    <strong>INR Eighty Two Thousand Six Hundred Only</strong>
                  </div>
                  <div className="col-lg-6">
                    <div className="total-order w-100 max-widthauto m-auto mb-4">
                      <ul>
                        <li>
                          <h4>Order Tax</h4>
                          <h5> ₹ 0.00</h5>
                        </li>
                        <li>
                          <h4>Discount</h4>
                          <h5> ₹ 0.00</h5>
                        </li>
                        <li>
                          <h4>Shipping</h4>
                          <h5> ₹ 0.00</h5>
                        </li>
                        <li>
                          <h4>Grand Total</h4>
                          <h5> ₹ 0.00</h5>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-4 ms-auto border rounded">
                    <div className="p-5"></div>
                    <p className="text-end">Authorised Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Invoice;
