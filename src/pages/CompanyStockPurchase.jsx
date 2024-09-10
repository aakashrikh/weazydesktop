import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';

export class CompanyStockPurchase extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      new_category_name: '',
      category: [],
      products: [],
      company_products:[],
      save_and_continue: false,
      rows: [
        {
          id: 1,
          name: '',
          quantity: 0,
          Unit: '',
          price: 0,
          igst: 0,
          total: 0,
          material_id: 0,
          product_id:0,
        },
      ],     
      supplier_id: '0',
      invoice_date: moment(new Date()).format('YYYY-MM-DD'),
      po_no: '',
      note: '',
      stock_added: 0,
      payment_type: 0,
      igst: 0,
      total: 0,
      cart_total:0,
      name: '',
      email: '',
      contact: '',
      address: '',
      gstin: '',
      payment_date: moment(new Date()).format('YYYY-MM-DD'),
      payment_mode: '',
      txn_note: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchProducts();

  }

  handleCheck = (e) => {
    this.setState({ stock_added: e.target.checked });
  };
  
  create = () => {
   
    if (
      this.state.supplier_id == ''
    ) {
      toast.error('All fields are required !');
    }  else if (this.state.rows.length == 0) {
      toast.error('Add atleast one product !');
    } else if (this.state.supplier_id == '') {
      toast.error('supplier is required !');
    } else if (
      this.state.payment_type === '1' &&
      this.state.payment_mode === ''
    ) {
      toast.error('Payment mode is required !');
    } else if (this.state.rows[0].material_id == 0) {
      toast.error('Please select product !');
    } else if (this.state.rows[0].quantity == 0) {
      toast.error('Quantity should be greater than 0 !');
    } else {
      this.setState({ save_and_continue: true, isLoading: true });

      var form = new FormData();
      form.append('supplier_id', this.state.supplier_id);
      form.append('purchase_date', this.state.invoice_date);
      form.append('is_paid', this.state.payment_type);

      form.append('note', this.state.note);

      if (this.state.stock_added) {
        form.append('stock_added', 1);
      } else {
        form.append('stock_added', 0);
      }
      form.append('igst', this.state.igst);
      form.append('total_price', this.state.total);
      form.append('cart_total', this.state.cart_total);
      form.append('purchase_order_product', JSON.stringify(this.state.rows));

      fetch(api + 'create_purchase_order', {
        method: 'POST',
        body: form,
        headers: {
          Authorization: this.context.token,
        },
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            var msg = json.msg;
            toast.error(msg);
          } else {
            toast.success(json.msg);
            this.setState({ product_show: false });
            if (this.state.payment_type === '1') {
              this.addPayment(json.purchase_order_id);
            } else {
              this.props.navigate('/stockpurchase');
            }
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ isLoading: false, save_and_continue: false });
        });
    }
  };

  addPayment = (id) => {
    if (this.state.payment_mode == '') {
      toast.error('Payment mode is required !');
    } else if (this.state.payment_date == '') {
      toast.error('Payment date is required !');
    }
    // else if (this.state.txn_note == '') {
    //   toast.error('Transaction note is required !');
    // }
    else if (this.state.txn_amount == '') {
      toast.error('Total amount is required !');
    } else {
      fetch(api + 'add_payment_purchase_order', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          purchase_id: id,
          txn_amount: this.state.total,
          txn_method: this.state.payment_mode,
          txn_notes: this.state.txn_note,
          txn_date: moment(this.state.payment_date).format('YYYY-MM-DD'),
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (json.status) {
            toast.success(json.msg);
            this.setState({ open: false });
            this.props.navigate('/stockpurchase');
          } else {
            toast.error(json.msg);
          }
          return json;
        })
        .catch((error) => console.error(error))
        .finally(() => {
          this.setState({ save_and_continue: false });
        });
    }
  };

  fetchProducts = (id, page) => {
    fetch(api + 'fetch_inventory_products', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page,
        inventory_category_id: 0,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          if (page == 1) {
            this.setState({ products: [] });
          }
        } else {
          if (json.data.data.length > 0) {
            this.setState({ products: json.data.data });

          }
      
              this.setState({
                company_products:json.campany_products.data,
                po_no:json.po_no
              })

              var pp=json.campany_products.data;
              const vari = [];
              
              pp.map((item,index)=>{

               var str = 0;
               item.price.map((item2)=>{

                  if(item2.price_type == this.context.user.child_type)
                    {
                      str = item2.product_price;
                    }
                })

                vari.push(
                  {
                    id: index,
                    material_id:item.id,
                    name: item.inventory_product_name,
                    quantity: '',
                    unit: item.purchase_unit,
                    price: str,
                    igst: item.product.tax,
                    total: 0,
                    product_id:item.product_id
                  },
                );

                
              });

              console.log(vari);
              this.setState({
                rows:vari,
              });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_loding: false });
      });
  };

  
  
  handleChange2 = (idx) => (e) => {
   
    const newRows = [...this.state.rows];

 
    if (e.target.name == 'material_id') {
      var index = e.target.selectedIndex;
      var optionElement = e.target.childNodes[index];
      var option = optionElement.getAttribute('unit');
      // alert(optionElement.getAttribute('igst'));
      // newRows[idx]['unit'] = option;
      // newRows[idx]['price'] = optionElement.getAttribute('price').replace(/,/g, '');
      // newRows[idx]['igst']=optionElement.getAttribute('tax');

      // newRows[idx]['product_id'] = optionElement.getAttribute('product_id');
      
      // newRows[idx][e.target.name] = parseInt(e.target.value);
    } else {
      newRows[idx][e.target.name] = e.target.value;
    }

    var total = 0;


    if (newRows[idx]['igst'] == '') {
      var igst = 0;
    } else {
      var igst = newRows[idx]['igst'];
    }


    if (newRows[idx]['price'] == '') {
      var price = 0;
    } else {
      var price = newRows[idx]['price'];
    }

    if (newRows[idx]['quantity'] == '') {
      var quantity = 0;
    } else {
      var quantity = newRows[idx]['quantity'];
    }

    newRows[idx]['total'] =
      total +
      parseFloat(price) * parseInt(quantity) +
      (parseFloat(price) * parseInt(quantity) * parseFloat(igst)) / 100;

    var final = 0;
    var igst = 0;
   
    newRows.map((item, index) => {
      final = final + parseInt(item.total);

      if (item.igst == '') {
        igst = igst + 0;
      } else {
        if(item.quantity == '')
        {
          igst = igst + 0;
        }
        else
        {
          igst =
          igst +
          (parseInt(item.quantity) *
            parseFloat(item.price) *
            parseFloat(item.igst)) /
            100;
        }
        
      }
   
    });

    alert(igst);
    this.setState({
      rows: newRows,
      total: final,
      igst: igst,
      cart_total:final-igst
    });
  };
  
  handleAddRow = () => {
    const vari = [
      {
        id: 1,
        name: '',
        quantity: '',
        Unit: '',
        price: '',
        sgst: '',
        cgst: '',
        igst: '',
        total: '',
      },
    ];
    this.setState({ rows: [...this.state.rows, ...vari] });
  };
  handleRemoveSpecificRow = (idx) => () => {
    const rows = [...this.state.rows];
    rows.splice(idx, 1);
    this.setState({ rows });
  };
  render() {
    return (
      <>
        <Helmet>
          <title> Add Stock Purchase</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            {/* {this.state.product_show ? ( */}
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Company Purchase Stock</h4>
<br/>
     
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="row">
                     <>

<div className="col-mg-12">
                        <label>Row Material Details {this.context.user.child_type}</label>
                        <br />
                        <table
                          className="table table-bordered table-hover"
                          id="tab_logic"
                          style={{
                            border: '1px solid #d9d9d9',
                          }}
                        >
                          <thead>
                            <tr>
                              <th className="text-center">#</th>
                              <th className="text-center">Name</th>
                              <th className="text-center">Unit</th>
                              <th className="text-center">Quantity</th>
                              <th className="text-center">Price</th>
                              <th className="text-center">Tax(%)</th>
                              <th className="text-center">Total</th>
                              {/* <th className="text-end">Action</th> */}
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.rows.map((item, idx) => (
                              <tr id="addr0" key={idx}>
                                <td>{idx + 1}</td>
                                <td>
                                  <input
                                    type="text"
                                    name="material_id"
                                    value={this.state.rows[idx].name}
                                    onChange={this.handleChange2(idx)}
                                    className="form-control"
                                 readOnly
                                 disabled
                                  />
                           
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="unit"
                                    value={this.state.rows[idx].unit}
                                    onChange={this.handleChange2(idx)}
                                    className="form-control"
                                    readOnly
                                    disabled
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="quantity"
                                    value={this.state.rows[idx].quantity}
                                    onChange={this.handleChange2(idx)}
                                    className="form-control"
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    name="price"
                                    value={this.state.rows[idx].price}
                                    onChange={this.handleChange2(idx)}
                                    className="form-control"
                                    readOnly
                                    disabled
                                  />
                                </td>
                                {/* <td>
                                  <input
                                    type="text"
                                    name="cgst"
                                    value={this.state.rows[idx].cgst}
                                    onChange={this.handleChange(idx)}
                                    className="form-control"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="sgst"
                                    value={this.state.rows[idx].sgst}
                                    onChange={this.handleChange(idx)}
                                    className="form-control"
                                  />
                                </td> */}
                                <td>
                                  <input
                                    type="text"
                                    name="tax"
                                    value={this.state.rows[idx].igst}
                                    onChange={this.handleChange2(idx)}
                                    className="form-control"
                                    readOnly
                                    disabled
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="total"
                                    value={this.state.rows[idx].total}
                                    onChange={this.handleChange2(idx)}
                                    className="form-control"
                                    readOnly
                                    disabled
                                  />
                                </td>
                                {/* <td className="text-end"> */}
                                  {/* <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={this.handleRemoveSpecificRow(idx)}
                                  >
                                    X
                                  </button> */}
                                {/* </td> */}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      
                      </div>
                      </>

                      <div className="col-lg-3 col-sm-12 col-12">
                      <div className="form-group">
                        <label>SubTotal </label>
                        <input value={this.state.cart_total} type="text" />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-12 col-12">
                      <div className="form-group">
                        <label>Tax</label>
                        <input value={this.state.igst} type="text" />
                      </div>
                    </div>


                    <div className="col-lg-3 col-sm-12 col-12">
                      <div className="form-group">
                        <label>Grand Total</label>
                        <input value={this.state.total} type="text" />
                      </div>
                    </div>

                    <div className="col-lg-9 col-sm-12 col-12">
                      <div className="form-group">
                        <label>Comment</label>
                        <input
                          onChange={(e) => {
                            this.setState({ note: e.target.value });
                          }}
                          type="text"
                        />
                      </div>
                    </div>

                    <div className="col-lg-12 d-flex justify-content-end">
                      {this.state.save_and_continue ? (
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
                          Saving
                        </button>
                      ) : (
                        <a
                          onClick={() => {
                             Swal.fire({
                                  title: 'Are you sure',
                                  text: 'You want to save it!',
                                  showCancelButton: true,
                                  confirmButtonColor: '#0066b2',
                                  cancelButtonColor: '#d33',
                                  confirmButtonText: 'Yes, Save it!',
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    this.create();
                                  }
                                });
                            
                          }}
                          className="btn btn-secondary btn-sm me-2"
                          style={{ float: 'right' }}
                        >
                          Save Changes
                        </a>
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
                <h4>Add New Supplier </h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Supplier Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ name: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Supplier Contact <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    onChange={(e) => {
                      this.setState({ contact: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.is_buttonloding ? (
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
                    Adding
                  </button>
                ) : (
                  <a
                    onClick={() => {
                      this.addsupplier();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Add
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <CompanyStockPurchase
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
