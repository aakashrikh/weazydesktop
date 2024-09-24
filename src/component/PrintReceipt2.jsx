import React, { Component } from 'react';

import moment from 'moment';

const BoldLastFourDigits = ({ number }) => {
  const lastFour = number.slice(-4); // Get the last 4 digits
  const remaining = number.slice(0, -4); // Get the remaining part of the string

  return (
    <span>
      {remaining}
      <strong>{lastFour}</strong>
    </span>
  );
};
export class PrintReceipt2 extends Component {

  



  render() {
    var delivery = null;
    if (this.props.order.delivery != null) {
      delivery = JSON.parse(
        this.props.order.delivery.shipping_address,
        null,
        2
      );
    }

    return (
      <div id="invoice-POS">
        <center id="top">
          {this.props.user.profile_pic != '' &&
          this.props.user.logo_printed_on_bill == 1 ? (
            <img
              src={"https://cdn.myweazy.com/shop_pic/1724675850.jpeg"}
              alt="logo"
              style={{ width: '200px' }}
            />
          ) : null}
          <div className="info" style={{ textAlign: 'center', fontSize: '1.3em',fontWeight: 'bold', fontFamily: 'Roboto, Sans-serif'}}>
            <h3 >
              {this.props.order.vendor.shop_name}
            </h3>
          </div>
          {/* <!-- End Info --> */}
        </center>
        {/* <!-- End InvoiceTop --> */}
        <div id="mid">
          <div className="info">
            <p
              style={{
                marginBottom: '10px',
                lineHeight: '20px',
                fontSize: '12px',
                fontweight: 'bold',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {this.props.order.vendor.area !== null ? (
                <span style={{fontWeight: '500',fontSize: '1.2em',fontFamily: 'Roboto, sans-serif'}}>{this.props.order.vendor.area}</span>
              ) : null}
              <br/>
               {this.props.order.vendor.address !== null ? (
                <span style={{fontWeight: '500',fontSize: '1.2em',fontFamily: 'Roboto, sans-serif'}}>{this.props.order.vendor.address}</span>
              ) : null}

              <br/>

              {this.props.order.vendor.business_contact !== null ? (
             
                <span style={{fontWeight: '500',fontSize: '1.2em',fontFamily: 'Roboto, sans-serif'}}>
                  Contact - {this.props.order.vendor.business_contact}
                </span>
         
            ) : null}

            </p>
           

           

            {this.props.order.vendor.gstin !== null ? (
              <p>
                <span>
                  <center style={{ textAlign: 'center', fontFamily: 'Roboto, Sans-serif' }}>
                    GSTIN- {this.props.order.vendor.gstin}{' '}
                  </center>
                </span>
              </p>
            ) : null}

            {this.props.order.vendor.fssai_number !== null ? (
              <p>
                <span>
                  <center style={{ textAlign: 'center', fontFamily: 'Roboto, Sans-serif' }}>
                    FSSAI - {this.props.order.vendor.fssai_number}{' '}
                  </center>
                </span>
              </p>
            ) : null}
            {this.props.order.print_receipt_count > 0 && (
              <center style={{ textAlign: 'center', fontFamily: 'Roboto, Sans-serif' }}>
                <h6>Duplicate Receipt</h6>
              </center>
            )}
          </div>
        </div>

        {/* <!-- {/ customer_order_details /} --> */}
        <div id="customer_details">
          <div className="customer_order_details_main">
            <div id="customer_order_details">
              <div className="customer_order_details_head kot_head">Order Time</div>
              <div
                className="customer_order_details_content kot_head"
                style={{
                  fontSize: '0.9em',
                }}
              >
                :{" "}{moment(this.props.order.created_at).format('L LT')}
              </div>
            </div>
            <div id="customer_order_details">
              <div className="customer_order_details_head">Invoice</div>
              <div
                className="customer_order_details_content"
                style={{
                  fontSize: '0.9em',
                }}
              >
                :{" "}{this.props.order.bill_no}
              </div>
            </div>

            <div id="customer_order_details">
              <div className="customer_order_details_head kot_head"><h4>Kot </h4></div>
              <div
                className="customer_order_details_content kot_head"
                style={{
                  fontSize: '1.1em',
                }}
              >
               <h4>
                  :{
                    Array.isArray(this.props.order.kot)?
                    this.props.order.kot.map((kot)=>{return <span>{kot.kot+', '}</span>})
                    :
                    this.props.order.kot

                  }
                </h4>
               
                {/* {this.props.order.kot} */}
              </div>
            </div>
            {/* <!-- <div id="customer_order_details">
                  <div className="customer_order_details_head">Table Number</div>
                  <div className="customer_order_details_content">221</div>
                  </div> --> */}
            <div>
              {this.props.order.channel === undefined ? (
                <></>
              ) : (
                <div id="customer_order_details">
                  <div className="customer_order_details_head">
                     Source
                  </div>
                  <div
                    className="customer_order_details_content"
                    style={{
                      fontSize: '0.9em',fontFamily: 'Roboto, Sans-serif' }}
                 
                  >
                    :{" "}<span>{this.props.order.channel}

                    {
  this.props.order.external_order_id !== null 
  ? (
      <> 
        {" - "}
        <BoldLastFourDigits number={this.props.order.external_order_id} />
      </>
    ) 
  : null
}

                    </span>
                  </div>
                </div>
              )}



            </div>
           
            <div>
              <div id="customer_order_details">
                <div className="customer_order_details_head">Order Type</div>
                <div
                  className="customer_order_details_content"
                  style={{
                    fontSize: '0.9em',
                    fontFamily: 'Roboto, Sans-serif'
                  }}
                >
                  {this.props.order.order_type !== 'TakeAway' &&
                  this.props.order.order_type !== 'Delivery' ? (
                    <span>:{" "}
                      Dine-In
                      {this.props.order.table === null ? (
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
                      :{" "} {this.props.order.order_type}
                      {this.props.order.order_comment !== null ? (
                        <span> - {this.props.order.order_comment}</span>
                      ) : null}
                    </span>
                  )}
                </div>
              </div>


{
                                    this.props.order.channel == 'POS' &&
                                    <div id="customer_order_details">
                                    <div className="customer_order_details_head">
                                    Cashier
                                    </div>
                                    <div
                                      className="customer_order_details_content"
                                      style={{
                                        fontSize: '0.9em',
                                        fontFamily: 'Roboto, Sans-serif'
                                      }}
                                    >
                                     :{" "}<span> {this.props.order.staff.staff_name}</span>
                                    </div>
                                  </div>

                                  }
                                  
            </div>
          </div>
        </div>
        {/* <!-- end_customer_order_details  --> */}
        {/* <!-- {/ customer-details /} --> */}
        <div id="customer_details">
          <div className="name_phone_main">
            <div id="name_phone">
              <div className="phone_email_head">Name: </div>
              <div className="phone_email_content">
                {this.props.order.user.id === 1 ||
                this.props.order.user.name === '' ? (
                  <span>N/A</span>
                ) : (
                  this.props.order.user.name
                )}
              </div>
            </div>
            <div id="name_phone">
              <div className="phone_email_head">Phone: </div>
              <div className="phone_email_content">
                {this.props.order.user.id === 1 ||
                this.props.order.user.name === '' ? (
                  <span>N/A</span>
                ) : (
                  this.props.order.user.contact
                )}
              </div>
            </div>

            {delivery !== null && (
              <div id="name_phone">
                <div className="phone_email_head" style={{fontFamily: 'Roboto, Sans-serif'}}>Address: </div>
                <div className="phone_email_content" style={{fontFamily: 'Roboto, Sans-serif'}}>
                  {delivery.address}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* <!-- {/ end-customer-details /} --> */}
        {/* <!-- End Invoice Mid --> */}
        <div id="bot">
          {/* <!-- if gst!==null --> */}
          {/* <!-- <h3>---GST Invoice---</h3> --> */}
          {this.props.order.vendor.gstin !== null ? (
            <h4 className="invoice_heading">----- Tax Invoice -----</h4>
          ) : (
            <h4 className="invoice_heading">----- Invoice -----</h4>
          )}
          <div id="table">
            <table>
              <tbody>
                <tr className="tabletitle" style={{ width: '100% !important' }}>
                  {/* <td className="count" style={{ width: '5%' }}>
                    <h4 className="table_data">#</h4>
                  </td> */}
                  <td className="item" style={{ width: '80%' }}>
                    <h4 className="table_data" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Item</h4>
                  </td>
                  <td className="Hours" style={{ width: '15%' }}>
                    <h4 className="table_data" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Qty</h4>
                  </td>
                  {/* <td className="Rate" style={{ width: '15%' }}>
                    <h4 className="table_data">Rate</h4>
                  </td> */}
                  <td className="Amount" style={{ width: '15%' }}>
                    <h4 className="table_data" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Amt.</h4>
                  </td>
                </tr>
                {this.props.order.cart.map((product, index) => (
                  <tr className="service" style={{ width: '100% !important' }}>
                    {/* <td className="tableitem">
                      <p
                        className="itemtext"
                        style={{ fontSize: '1em', marginBottom: '2mm' }}
                      >
                        {index + 1}
                      </p>
                    </td> */}
                    <td className="tableitem">
                      <p
                        className="itemtext"
                        style={{ fontSize: '1em', marginBottom: '2mm',fontWeight:'500',fontFamily: 'Roboto, Sans-serif' }}
                      >
                        {product.product.product_name}
                        <br/>
                        {product.variant !== null ? (
                          <span> {product.variant.variants_name}</span>
                        ) : (
                          <></>
                        )}
                        {product.addons.length > 0 ? (
                          <span>
                            <strong> | AddOns: </strong>
                            {product.addons.map((pp) => (
                              <span>
                                {' '}
                                {pp.addon_name} - ₹{pp.addon_price}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <></>
                        )}
                      </p>
                    </td>
                    <td className="tableitem">
                      <p
                        className="itemtext"
                        style={{ fontSize: '1em', marginBottom: '2mm',fontWeight:'500',fontFamily: 'Roboto, Sans-serif' }}
                      >
                        {product.product_quantity}
                      </p>
                    </td>
                    {/* <td className="tableitem">
                      <p
                        className="itemtext"
                        style={{ fontSize: '1em', marginBottom: '2mm' }}
                      >
                        {(
                          product.product_price / product.product_quantity
                        ).toFixed(2)}
                      </p>
                    </td> */}
                    <td className="tableitem">
                      <p
                        className="itemtext"
                        style={{ fontSize: '1em', marginBottom: '2mm', fontWeight:'500',fontFamily: 'Roboto, Sans-serif' }}
                      >
                        {product.product_price.toFixed(2)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div id="table">
            <table>
              <tbody>
                <tr className="tabletitle">
                  <td className="Rate" style={{ width: '60%' }}>
                    <h2 style={{ fontSize: '2.15em', fontWeight: '500', fontFamily: 'Roboto, Sans-serif' }}>
                      Sub Total
                    </h2>
                  </td>
                  <td style={{ width: '20%' }}></td>
                  <td className="" style={{ width: '20%' }}>
                    <h2
                      style={{
                        fontSize: '14px',
                        fontWeight: '300',
                        display: 'flex',
                        justifyContent: 'end',
                        fontFamily: 'Roboto, Sans-serif',
                      }}
                    >
                      {this.props.order.order_amount.toFixed(2)}
                    </h2>
                  </td>
                </tr>

                {this.props.order.order_discount !== 0 ? (
                  <tr className="tabletitle">
                    <td className="Rate" style={{ width: '60%' }}>
                      <h2 style={{ fontSize: '2.15em', fontWeight: '300', fontFamily: 'Roboto, Sans-serif' }}>
                        Discount
                        {this.props.order.discount_type == 'pe'}
                      </h2>
                    </td>
                    <td style={{ width: '20%' }}></td>
                    <td style={{ width: '20%' }}>
                      <h2
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          display: 'flex',
                          justifyContent: 'end',
                          fontFamily: 'Roboto, Sans-serif',
                        }}
                      >
                        {Math.round(this.props.order.order_discount)}
                      </h2>
                    </td>
                  </tr>
                ) : (
                  <></>
                )}

                {this.props.order.charges.length > 0 ? (
                  this.props.order.charges.map((charge) => (
                    <tr className="tabletitle">
                      <td className="Rate" style={{ width: '60%' }}>
                        <h2 style={{ fontSize: '2.15em', fontWeight: '300', fontFamily: 'Roboto, Sans-serif' }}>
                          {charge.charge_name}
                        </h2>
                      </td>
                      <td style={{ width: '20%' }}></td>
                      <td style={{ width: '20%' }}>
                        <h2
                          style={{
                            fontSize: '14px',
                            fontWeight: '300',
                            display: 'flex',
                            justifyContent: 'end',
                            fontFamily: 'Roboto, Sans-serif',
                          }}
                        >
                          {charge.charge_amount}
                        </h2>
                      </td>
                    </tr>
                  ))
                ) : (
                  <></>
                )}

                {this.props.order.cgst !== 0 ? (
                  <tr className="tabletitle">
                    <td className="Rate" style={{ width: '60%' }}>
                      <h2 style={{ fontSize: '2.15em', fontWeight: '500', fontFamily: 'Roboto, Sans-serif' }}>
                        CGST
                        {/* @ {this.context.user.gst_percentage / 2}% */}
                      </h2>
                    </td>
                    <td style={{ width: '20%' }}></td>
                    <td style={{ width: '20%' }}>
                      <h2
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          display: 'flex',
                          justifyContent: 'end',
                          fontFamily: 'Roboto, Sans-serif',
                        }}
                      >
                        {this.props.order.cgst.toFixed(2)}
                      </h2>
                    </td>
                  </tr>
                ) : (
                  <></>
                )}
                {this.props.order.sgst !== 0 ? (
                  <tr className="tabletitle">
                    <td className="Rate" style={{ width: '60%' }}>
                      <h2 style={{ fontSize: '2.15em', fontWeight: '500', fontFamily: 'Roboto, Sans-serif' }}>
                        SGST
                        {/* @ {this.context.user.gst_percentage / 2}% */}
                      </h2>
                    </td>
                    <td style={{ width: '20%' }}></td>
                    <td style={{ width: '20%' }}>
                      <h2
                        style={{
                          fontSize: '14px',
                          fontWeight: '300',
                          display: 'flex',
                          justifyContent: 'end',
                          fontFamily: 'Roboto, Sans-serif',
                        }}
                      >
                        {this.props.order.sgst.toFixed(2)}
                      </h2>
                    </td>
                  </tr>
                ) : (
                  <></>
                )}

                <tr className="tabletitle">
                  <td className="Rate" style={{ width: '40%' }}>
                    <h1 id="grandtotal" style={{ fontSize: '3em', fontWeight: '500',fontFamily: 'Roboto, Sans-serif' }}>
                       Total
                    </h1>
                  </td>
                  <td style={{ width: '15%' }}></td>
                  <td style={{ width: '40%' }}>
                    <h1
                      id="grandtotal"
                      style={{
                        fontSize: '3em',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'end',
                        fontFamily: 'Roboto, Sans-serif',
                      }}
                    >
                      ₹{Math.round(this.props.order.total_amount)}
                    </h1>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* <!-- {/ customer_order_details /} --> */}
          <div id="customer_details">
            <div className="customer_order_details_main">
              <div>
                {this.props.order.transactions === undefined ? (
                  <></>
                ) : (
                  <div id="customer_order_details">
                    
                      {this.props.order.transactions.length == 0  ? (
                        <span style={{fontFamily: 'Roboto, Sans-serif' }}>
                          UnPaid Order
                        </span>
                      ) : (
                        <>
                        <div className="customer_order_details_head">
                      Paid
                    </div>
                    <div
                      className="customer_order_details_content"
                      style={{
                        fontSize: '1em',
                        fontFamily: 'Roboto, Sans-serif',
                      }}
                    >
                        {this.props.order.transactions.map((tt) => (
                          <span>
                            {tt.txn_method} - {tt.txn_amount}{' '}
                          </span>
                        ))
                      }
                    </div>
                        </>
                      )}
                    </div>


                )}
              </div>

              {/* <div>
                  {this.props.order.logs.length > 0 &&
                  this.props.order.logs === undefined ? (
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
                          <span>
                            {' '}
                            - {this.props.order.logs[0].staff.staff_role}
                          </span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
              </div> */}
            </div>
          </div>
          {/* <!-- end_customer_order_details  --> */}
          {this.props.order.instruction === ' ' ||
          this.props.order.instruction === '' ||
          this.props.order.instruction === null ? (
            <></>
          ) : (
            <div
              id="legalcopy"
              style={{
                borderBottom: '1px solid #000',
              }}
            >
              <p className="kot_dT" style={{ fontSize: '13px', fontFamily: 'Roboto, Sans-serif' }}>
                <strong>Instructions:</strong> {this.props.order.instruction}
              </p>
            </div>
          )}
          {/* <!-- End Table --> */}
          <div
            id="legalcopy"
            style={{
              borderBottom: '1px solid #000',
            }}
          >
            <p className="legal" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Thank you! Please visit again.</p>
          </div>
          <div
            id="legalcopy"
            style={{
              paddingBottom: '50px',
            }}
          >
            <p className="legal" style={{fontWeight:'500',fontFamily: 'Roboto, Sans-serif'}}>Powered By Weazy Billing</p>
          </div>
        </div>
      </div>
    );
  }
}

export default PrintReceipt2;
