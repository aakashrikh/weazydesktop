import React, { Component } from 'react';
import { AuthContext } from '../AuthContextProvider';
import moment from 'moment';

export class PrintKot extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      vendor: [],
      user: [],
      cart: [],
      transactions: [],
    };
  }

  render() {
    return (
      <div id="invoice-POS">
        <div id="legalcopy">
          <p className="kot_dT" style={{  fontSize: '1.3em',fontWeight: 'bold', fontFamily: 'Roboto, Sans-serif' }}>
            KOT No: {this.props.kot}
            <br
            
            />
            {this.props.order.order_type !== 'TakeAway' &&
            this.props.order.order_type !== 'Delivery' ? (
              <span>
                Dine-In{' '}
                {this.props.order.table == null ? (
                  <>
                    {this.props.order.order_comment !== null ? (
                      <span> - {this.props.order.order_comment}</span>
                    ) : null}
                  </>
                ) : (
                  <span>({this.props.order.table.table_name})</span>
                )}
              </span>
            ) : (
              <span>
                {this.props.order.order_type}
                {this.props.order.order_comment !== null ? (
                  <span> - {this.props.order.order_comment}</span>
                ) : null}
              </span>
            )}
          </p>

          {this.props.order.print_receipt_count > 0 && (
              <center style={{ textAlign: 'center', fontFamily: 'Roboto, Sans-serif' }}>
                <h6>Duplicate Receipt</h6>
              </center>
            )}
            
        </div>
        <br/>
        {/* <!-- {/ customer_order_details /} --> */}
        <div id="customer_details">
          <div className="customer_order_details_main">
            <div id="customer_order_details">
              <div className="customer_order_details_head" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Order Time</div>
              <div
                className="customer_order_details_content"
                style={{
                  fontSize: '1em',fontWeight:'500',fontFamily: 'Roboto, Sans-serif'
                }}
              >
                {moment(this.props.order.created_at).format('L LT')}
              </div>
            </div>
            <div id="customer_order_details">
              <div className="customer_order_details_head" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Invoice</div>
              <div
                className="customer_order_details_content"
                style={{
                  fontSize: '1em',fontWeight:'500',fontFamily: 'Roboto, Sans-serif'
                }}
              >
                {this.props.order.bill_no}
              </div>
            </div>
            
            <div>
              {this.props.order.channel === undefined ? (
                <></>
              ) : (
                <div id="customer_order_details">
                  <div className="customer_order_details_head" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>
                    Source
                  </div>
                  <div
                    className="customer_order_details_content"
                    style={{
                      fontSize: '1em',
                    }}
                  >
                    <span style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>{this.props.order.channel}</span>
                  </div>
                </div>
              )}
            </div>
           
          </div>
        </div>
        {/* <!-- end_customer_order_details  --> */}
        {/* <!-- {/ customer-details /} --> */}
        {this.props.order.user.id !== 1 &&
        this.props.order.user.name !== null ? (
          <div id="customer_details">
            <div className="name_phone_main">
              <div id="name_phone">
                <div className="phone_email_head" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Cust. Name</div>
                <div className="phone_email_content " style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>
                  {this.props.order.user.name}
                </div>
              </div>
              <div id="name_phone">
                <div className="phone_email_head" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Phone</div>
                <div className="phone_email_content" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>
                  {this.props.order.user.contact}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {/* <!-- {/ end-customer-details /} --> */}
        <div
          id="bot"
          style={{
            paddingBottom: '30px',
          }}
        >
          <div id="table">
            <table>
              <tbody>
                <tr className="tabletitle">
                  <td className="item">
                    <h4
                      className="table_data"
                      style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}
                    >
                      Item
                    </h4>
                  </td>
                  <td className="Hours text-center">
                    <h4 className="table_data" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Qty</h4>
                  </td>
                </tr>
                {this.props.order.cart.map((values, index) => {
                  // return null;
                  if (
                    values.kot === this.props.kot ||
                    this.props.kot === 'all'
                  ) {
                    return (
                      <tr className="service">
                        <td
                          className="tableitem"
                          style={{
                            textAlign: 'start',
                            width: '80%',
                          }}
                          
                        >
                          <p className="itemtext" style={{ marginBottom: '2mm',fontSize: '1em',fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>
                            {values.product.product_name}
                            {values.variant != null ? (
                              <span>
                                <br/>
                                 {values.variant.variants_name}
                              </span>
                            ) : (
                              <></>
                            )}
                            {values.addons.length > 0 ? (
                              <span>
                                <strong> | AddOns: </strong>
                                {values.addons.map((pp) => (
                                  <span> {pp.addon_name}</span>
                                ))}
                              </span>
                            ) : (
                              <></>
                            )}
                          </p>
                        </td>
                        <td
                          className="tableitem"
                          style={{
                            textAlign: 'center',
                            width: '20%',fontWeight:'500',fontFamily: 'Roboto, Sans-serif'
                          }}
                        >
                          <p className="itemtext" style={{ fontSize: '1em' }}>
                            {values.product_quantity}
                          </p>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>{' '}
          {/* <div
            style={{
              borderBottom: '1px solid #000',
            }}
          >
            {this.props.order.logs.length > 0 ? (
              <div id="customer_order_details">
                <div className="customer_order_details_head">Cashier</div>
                <div
                  className="customer_order_details_content"
                  style={{
                    fontSize: '0.9em',
                  }}
                >
                  <span>
                    {this.props.order.logs[0].staff.staff_name}
                    <span> - {this.props.order.logs[0].staff.staff_role}</span>
                  </span>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div> */}
          {this.props.order.instruction === ' ' ||
          this.props.order.instruction === '' ||
          this.props.order.instruction === null ? (
            <></>
          ) : (
            <div id="legalcopy">
              <p className="kot_dT" style={{ fontSize: '13px' }}>
                <strong>Instructions:</strong> {this.props.order.instruction}
              </p>
            </div>
          )}

<div
            id="legalcopy"
            style={{
              // paddingBottom: '50px',
            }}
          >
            <p className="legal" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Powered By Weazy Billing</p>
          </div>

        </div>
      </div>
    );
  }
}

export default PrintKot;
