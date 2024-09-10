import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Swal from 'sweetalert2';

export class AddStockPurchase extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      new_category_name: '',
      category: [],
      products: [],
      save_and_continue: false,
      rows: [
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
          material_id: 0,
        },
      ],
      supplier_id: '',
      invoice_date: moment(new Date()).format('YYYY-MM-DD'),
      po: '',
      note: '',
      stock_added: 0,
      payment_type: 0,
      igst: 0,
      sgst: 0,
      cgst: 0,
      total: 0,
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
    this.fetchCategories();
    this.fetchProducts();
  }

  fetchCategories = () => {
    fetch(api + 'fetch_supplier', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          if (json.data.length == 0) {
            this.setState({ open: true });
          }
          this.setState({ category: json.data, is_loding: false });
        } else {
          this.setState({ is_loding: false, category: [] });
        }
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  handleCheck = (e) => {
    this.setState({ stock_added: e.target.checked });
  };

  addsupplier = () => {
    var contect = this.state.contact;
    //validate contact
    let number = /^[0]?[6789]\d{9}$/;

    if (!number.test(this.state.contact)) {
      toast.error('Please enter valid contact');
      return;
    }

    if (this.state.name == '') {
      toast.error('Please enter name');
      return;
    }
    if (this.state.contact == '') {
      toast.error('Please enter contact');
      return;
    } else {
      this.setState({ is_buttonloding: true });
      fetch(api + 'add_supplier', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          supplier_name: this.state.name,
          supplier_email: this.state.email,
          supplier_contact: this.state.contact,
          supplier_address: this.state.address,
          supplier_gstin: this.state.gstin,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            if (json.errors[0] != undefined) {
              toast.error(json.errors[0]);
            } else {
              var msg = json.msg;
              toast.error(msg);
            }
          } else {
            this.setState({ open: false, new_category_name: '' });
            toast.success(json.msg);
            this.fetchCategories();
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ isloading: false, is_buttonloding: false });
        });
    }
  };

  add = () => {
    if (this.state.new_category_name != '') {
      this.setState({ add_category_loading: true });
      fetch(api + 'create_category_vendor', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          category_name: this.state.new_category_name,
          status: 'active',
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
              new_category_name: '',
            });
            toast.success(json.msg);
            this.fetchCategories();
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ add_category_loading: false });
        });
    } else {
      toast.error('Please add Category first!');
    }
  };

  create = () => {
    var po_no = this.state.po;
    let rjx = /^[0-9]*$/;
    let isValid = rjx.test(po_no);
    if (
      this.state.supplier_id == '' ||
      this.state.invoice_date == '' 
    ) {
      toast.error('All fields are required !');
    } else if (this.state.category == '') {
      toast.error('Add category first !');
    } else if (this.state.rows.length == 0) {
      toast.error('Add atleast one product !');
    } else if (!isValid) {
      toast.error('PO number should be numeric !');
    } else if (this.state.po_no == '') {
      toast.error('PO number is required !');
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
      // form.append('po', po_no);
      form.append('is_paid', this.state.payment_type);

      form.append('note', this.state.note);

      if (this.state.stock_added) {
        form.append('stock_added', 1);
      } else {
        form.append('stock_added', 0);
      }
      form.append('igst', this.state.igst);
      form.append('sgst', this.state.sgst);
      form.append('cgst', this.state.cgst);
      form.append('total_price', this.state.total);
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

  handleChange = (idx) => (e) => {
    const newRows = [...this.state.rows];

    if (e.target.name == 'material_id') {
      var index = e.target.selectedIndex;
      var optionElement = e.target.childNodes[index];
      var option = optionElement.getAttribute('unit');
      newRows[idx]['unit'] = option;
      newRows[idx][e.target.name] = parseInt(e.target.value);
    } else {
      newRows[idx][e.target.name] = e.target.value;
    }

    var total = 0;

    if (newRows[idx]['sgst'] == '') {
      var sgst = 0;
    } else {
      var sgst = newRows[idx]['sgst'];
    }

    if (newRows[idx]['igst'] == '') {
      var igst = 0;
    } else {
      var igst = newRows[idx]['igst'];
    }

    if (newRows[idx]['cgst'] == '') {
      var cgst = 0;
    } else {
      var cgst = newRows[idx]['cgst'];
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
      (parseFloat(price) * parseInt(quantity) * parseFloat(sgst)) / 100 +
      (parseFloat(price) * parseInt(quantity) * parseFloat(cgst)) / 100 +
      (parseFloat(price) * parseInt(quantity) * parseFloat(igst)) / 100;

    var final = 0;
    var igst = 0;
    var cgst = 0;
    var sgst = 0;
    newRows.map((item, index) => {
      final = final + parseInt(item.total);

      if (item.igst == '') {
        igst = igst + 0;
      } else {
        igst =
          igst +
          (parseInt(item.quantity) *
            parseFloat(item.price) *
            parseFloat(item.igst)) /
            100;
      }

      if (item.cgst == '') {
        cgst = cgst + 0;
      } else {
        cgst =
          cgst +
          (parseInt(item.quantity) *
            parseFloat(item.price) *
            parseFloat(item.cgst)) /
            100;
      }

      if (item.sgst == '') {
        sgst = sgst + 0;
      } else {
        sgst =
          sgst +
          (parseInt(item.quantity) *
            parseFloat(item.price) *
            parseFloat(item.sgst)) /
            100;
      }
    });

    this.setState({
      rows: newRows,
      total: final,
      igst: igst,
      cgst: cgst,
      sgst: sgst,
    });
  };
  handleAddRow = () => {
    const vari = [
      {
        id: 1,
        name: '',
        quantity: '',
        unit: '',
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

  setproducts = (supplier) =>
    {
      var data=[];
      this.state.category.map((item) => {

        if (item.id == supplier) {
          
          item.products.map((item2) => {
            
            const db = {
            id: 1,
            name: '',
            quantity: '',
            unit: item2.purchase_unit,
            price: '',
            sgst: '',
            cgst: '',
            igst: '',
            total: '',
            material_id: item2.id,
            product_id: item2.product_id
          };
          data.push(db);
        })
          }
        });

        // console.log(data);
        this.setState({ rows: data });
      
      // console.log(item);
    }
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
                  <h4>Purchase Stock</h4>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="form-group">
                        <label>
                          Supplier <span className="text-danger"> *</span>
                        </label>
                        <div className="row">
                          <div className="col-10 pe-0">
                            <select
                              onChange={(e) => {
                                this.setproducts(e.target.value);
                                this.setState({ supplier_id: e.target.value });
                                // alert(e.target.value);
                              }}
                              className="select-container"
                            >
                              <option disabled selected>
                                Choose Suplier
                              </option>
                              {this.state.category.length > 0 ? (
                                this.state.category.map((item, index) => (
                                  <option
                                  products={item.products}
                                  value={item.id}>
                                    {item.supplier_name}
                                  </option>
                                ))
                              ) : (
                                <></>
                              )}
                            </select>
                          </div>
                          <div className="col-2">
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ height: '35px' }}
                              onClick={() => {
                                this.setState({ open: true });
                              }}
                            >
                              <i className="fa fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="form-group">
                        <label>
                          {' '}
                          Invoice Date<span className="text-danger"> *</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={this.state.invoice_date}
                          onChange={(e) => {
                            this.setState({ invoice_date: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    {/* <div className="col-lg-3 col-sm-6 col-12">
                      <div className="form-group">
                        <label>
                          PO No<span className="text-danger"> *</span>
                        </label>
                        <input
                          onChange={(e) => {
                            this.setState({ po: e.target.value });
                          }}
                          type="text"
                        />
                      </div>
                    </div> */}

                    {this.state.rows.length > 0 ? (
                      <div className="col-mg-12">
                        <label>Row Material Details</label>
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
                              <th className="text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.rows.map((item, idx) => (
                              <tr id="addr0" key={idx}>
                                <td>{idx + 1}</td>
                                <td>
                                  <select
                                    onChange={this.handleChange(idx)}
                                    className="select-container"
                                    name="material_id"
                                    value={this.state.rows[idx].material_id}
                                  >
                                    <option disabled selected>
                                      Choose Material
                                    </option>
                                    {this.state.products.length > 0 ? (
                                      this.state.products.map((item, index) => (
                                        <option
                                          value={item.id}
                                          unit={item.purchase_unit}
                                          
                                        >
                                          {item.inventory_product_name}
                                        </option>
                                      ))
                                    ) : (
                                      <></>
                                    )}
                                  </select>

                                  {/* <input
                              type="text"
                              name="variants_name"
                              value={this.state.rows[idx].name}
                              onChange={this.handleChange(idx)}
                              className="form-control"
                            /> */}
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="unit"
                                    value={this.state.rows[idx].unit}
                                    onChange={this.handleChange(idx)}
                                    className="form-control"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="quantity"
                                    value={this.state.rows[idx].quantity}
                                    onChange={this.handleChange(idx)}
                                    className="form-control"
                                  />
                                </td>

                                <td>
                                  <input
                                    type="text"
                                    name="price"
                                    value={this.state.rows[idx].price}
                                    onChange={this.handleChange(idx)}
                                    className="form-control"
                                  />
                                </td>
                               
                                <td>
                                  <input
                                    type="text"
                                    name="igst"
                                    value={this.state.rows[idx].igst}
                                    onChange={this.handleChange(idx)}
                                    className="form-control"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="total"
                                    value={this.state.rows[idx].total}
                                    onChange={this.handleChange(idx)}
                                    className="form-control"
                                  />
                                </td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={this.handleRemoveSpecificRow(idx)}
                                  >
                                    X
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {
                          this.state.rows.length < this.state.products.length && (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'end',
                          }}
                        >
                          <button
                            onClick={this.handleAddRow}
                            className="btn btn-sm btn-outline-secondary"
                            style={{
                              marginBottom: '20px',
                              marginTop: '10px',
                            }}
                          >
                            Add New
                          </button>
                        </div>
                          )
                        }
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'end',
                        }}
                      >
                        <button
                          onClick={this.handleAddRow}
                          className="btn btn-sm btn-outline-secondary"
                          style={{
                            marginBottom: '20px',
                            marginTop: '10px',
                          }}
                        >
                          Add A Row
                        </button>
                      </div>
                    )}

                    <div className="col-md-3 col-sm-6 col-12">
                      <div className="form-group">
                        <label>Payment type</label>
                        <RadioGroup
                          value={this.state.payment_type}
                          onChange={(e) => {
                            this.setState({ payment_type: e });
                          }}
                          horizontal
                        >
                          <RadioButton
                            value="0"
                            pointColor="#f3c783"
                            iconSize={20}
                            rootColor="#bf370d"
                            iconInnerSize={10}
                            padding={10}
                          >
                            Unpaid
                          </RadioButton>
                          <RadioButton
                            value="1"
                            pointColor="#f3c783"
                            iconSize={20}
                            rootColor="#065f0a"
                            iconInnerSize={10}
                            padding={10}
                          >
                            Paid
                          </RadioButton>
                        </RadioGroup>
                      </div>
                    </div>

                    {this.state.payment_type == 1 && (
                      <>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>Paid Amount</label>
                            <input
                              type="text"
                              name="paid_amount"
                              value={this.state.total}
                              disabled
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-6 col-12">
                          <div className="form-group">
                            <label>Payment Method</label>
                            <select
                              className="form-control"
                              name="payment_mode"
                              onChange={(e) => {
                                this.setState({
                                  payment_mode: e.target.value,
                                });
                              }}
                            >
                              <option>Select</option>
                              <option value="Cash">Cash</option>
                              <option value="Card">Card</option>
                              <option value="Cheque">Cheque</option>
                              <option value="Online">Online</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-6 col-12">
                          <div className="form-group">
                            <label>Payment Date</label>
                            <input
                              type="date"
                              name="payment_date"
                              value={this.state.payment_date}
                              onChange={(e) =>
                                this.setState({ payment_date: e })
                              }
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="xol-md-">
                          <div className="form-group">
                            <label>Payment Note</label>
                            <input
                              type="text"
                              className="form-control"
                              value={this.state.payment_note}
                              onChange={(e) =>
                                this.setState({ payment_note: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="d-flex align-items-center single_checkbox new_checkbox w-100 my-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={this.state.stock_added}
                        onChange={this.handleCheck}
                        id="stock_added"
                      />
                      <label
                        htmlFor="stock_added"
                        className="checkbox_text d-flex justify-content-between align-items-center"
                      >
                        <p className="m-0 mx-3">
                          Do you want to add stock in your inventory?
                        </p>
                      </label>
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
                              title: 'Are you sure?',
                              text: "You want to create the purchase order?",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#3085d6',
                              cancelButtonColor: '#d33',
                              confirmButtonText: 'Yes, save it!',
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
    <AddStockPurchase
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
