import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import plus from '../assets/images/icons/plus.svg';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';

export class EditStockPurchase extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      new_category_name: '',
      category: [],
      products: [],
      save_and_continue: false,
      rows: [],
      supplier_id: 0,
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
      is_loading: true,
      po_status:''
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchCategories();
    this.fetchProducts();
    this.fetch_order();
  }

  fetch_order = () => {
    fetch(api + 'fetch_purchase_order_details', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        purchase_order_id: this.props.id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error('Something went wrong');
        } else {
          let one = [];
          json.data.material.map((item, index) => {
            let row = {
              id: index + 1,
              name: item.name,
              quantity: item.material_quantity,
              unit: item.material_unit,
              price: item.material_price,
              sgst: item.material_sgst,
              cgst: item.material_cgst,
              igst: item.material_igst,
              total: item.material_total_price,
              material_id: item.material_id,
            };
            one.push(row);
          });

          this.setState({
            rows: one,
          });

          this.setState({
            supplier_id: json.data.supplier_id,
            invoice_date: json.data.purchase_date,
            po: json.data.po_no,
            note: json.data.note,
            stock_added: json.data.stock_added,
            payment_type: json.data.is_paid,
            igst: json.data.igst,
            sgst: json.data.sgst,
            cgst: json.data.cgst,
            total: json.data.total_price,
            po_status:json.data.po_status
          });
        }
      })

      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ is_loading: false });
      });
  };

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

  create = (status) => {
    if (
      this.state.supplier_id == '' &&
      this.state.invoice_date == '' &&
      this.state.po == ''
    ) {
      toast.error('All fields are required !');
    } else if (this.state.category == '') {
      toast.error('Add category first !');
    } else if (this.state.rows.length == 0) {
      toast.error('Add atleast one product !');
    }
    // else if (this.state.market_price<this.state.our_price) {
    //     toast.error("Your price should be less than market price !");
    // }
   else {
      this.setState({ save_and_continue: true, isLoading: true });

      var form = new FormData();
      form.append('purchase_id', this.props.id);
      form.append('supplier_id', this.state.supplier_id);
      form.append('purchase_date', this.state.invoice_date);
      form.append('po_id', this.state.po);
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
      
      form.append('po_status',status);

      fetch(api + 'update_purchase_order', {
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
            this.props.navigate('/stockpurchase');
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
            this.setState({ products: json.all.data });
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
          <title>Edit Stock Purchase</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            {/* {this.state.product_show ? ( */}
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Edit Purchase Stocks</h4>
                </div>
              </div>
              {this.state.is_loading ? (
                <Loader />
              ) : (
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      {
                        this.state.supplier_id != 0 &&
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <div className="d-flex align-items-center justify-content-between">
                            <label>Supplier </label>
                            <div className="page-btn">
                              <a
                                className="btn btn-added  d-flex align-items-center pt-0"
                                onClick={() => {
                                  this.setState({ open: true });
                                }}
                              >
                                <img src={plus} alt="img" className="me-1" />
                                Add
                              </a>
                            </div>
                          </div>
                          <select
                            onChange={(e) => {
                              this.setState({ supplier_id: e.target.value });
                            }}
                            value={this.state.supplier_id}
                            className="select-container"
                          >
                            <option>Choose Suplier</option>
                            {this.state.category.length > 0 ? (
                              this.state.category.map((item, index) => (
                                <option value={item.id}>
                                  {item.supplier_name}
                                </option>
                              ))
                            ) : (
                              <></>
                            )}
                          </select>
                        </div>
                      </div>
  }
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label> Invoice Date</label>
                          <input
                            type="text"
                            value={this.state.invoice_date}
                            onChange={(e) => {
                              this.setState({ invoice_date: e.target.value });
                            }}
                          />
                        </div>
                      </div>
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>PO No</label>
                          <input
                            onChange={(e) => {
                              this.setState({ po: e.target.value });
                            }}
                            value={this.state.po}
                            type="text"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Payment type</label>
                          <RadioGroup
                            name="payment_type"
                            value={
                              this.state.payment_type === 0 ? 'unpaid' : 'paid'
                            }
                            onChange={(e) => {
                              this.setState({
                                payment_type: e == 'paid' ? 1 : 0,
                              });
                            }}
                            horizontal
                          >
                            <RadioButton
                              value="paid"
                              pointColor="#f3c783"
                              iconSize={20}
                              rootColor="#065f0a"
                              iconInnerSize={10}
                              padding={10}
                            >
                              Paid
                            </RadioButton>
                            <RadioButton
                              value="unpaid"
                              pointColor="#f3c783"
                              iconSize={20}
                              rootColor="#bf370d"
                              iconInnerSize={10}
                              padding={10}
                            >
                              Unpaid
                            </RadioButton>
                          </RadioGroup>
                        </div>
                      </div>

                      {this.state.rows.length > 0 ? (
                        <div className="row">
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
                                        disabled
                                      >
                                        <option>Choose Material</option>
                                        {this.state.products.length > 0 ? (
                                          this.state.products.map(
                                            (item, index) => (
                                              <option
                                                value={item.id}
                                                unit={item.purchase_unit}
                                              >
                                                {item.inventory_product_name}
                                              </option>
                                            )
                                          )
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
                                        disabled={ 
                                          this.state.supplier_id == 0&&
                                          "disabled"
                                          
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        name="quantity"
                                        value={this.state.rows[idx].quantity}
                                        onChange={this.handleChange(idx)}
                                        className="form-control"
                                        disabled={ 
                                         (this.state.supplier_id == 0 && this.state.po_status != 'draft') &&
                                          "disabled"
                                          
                                        }
                                      />
                                    </td>

                                    <td>
                                      <input
                                        type="text"
                                        name="price"
                                        value={this.state.rows[idx].price}
                                        onChange={this.handleChange(idx)}
                                        className="form-control"
                                        disabled={ 
                                          this.state.supplier_id == 0&&
                                          "disabled"
                                          
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        name="igst"
                                        value={this.state.rows[idx].igst}
                                        onChange={this.handleChange(idx)}
                                        className="form-control"
                                        disabled={ 
                                          this.state.supplier_id == 0&&
                                          "disabled"
                                          
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        name="total"
                                        value={this.state.rows[idx].total}
                                        onChange={this.handleChange(idx)}
                                        className="form-control"
                                        disabled={ 
                                          this.state.supplier_id == 0&&
                                          "disabled"
                                          
                                        }
                                      />
                                    </td>
                                    <td className="text-end">
                                      <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={this.handleRemoveSpecificRow(
                                          idx
                                        )}
                                      >
                                        X
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'end',
                              }}
                            >
                              <button
                                onClick={this.handleAddRow}
                                className="btn btn-outline-secondary"
                                style={{
                                  marginBottom: '20px',
                                  marginTop: '10px',
                                }}
                              >
                                Add New
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}

                      {/* <div className="col-md-12 mb-4">
                        <label>
                          <input
                            type="checkbox"
                            checked={this.state.stock_added}
                            onChange={this.handleCheck}
                            className="me-2"
                          />
                          you want to add stock in your inventory
                        </label>
                      </div> */}

                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Grand Total</label>
                          <input value={this.state.total} type="text" />
                        </div>
                      </div>

                      <div className="col-lg-9 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Comment</label>
                          <input
                            onChange={(e) => {
                              this.setState({ note: e.target.value });
                            }}
                            value={this.state.note}
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
                          <>
                          <a 
                          onClick={() => {
                            var confrm = window.confirm(
                              'Are you sure you want to save ?'
                            );
                            if (confrm) {
                            
                                this.create(this.state.po_status);
                               
                            }
                            
                          }}
                          className="btn btn-secondary btn-sm me-2"
                          >
                            Save Order
                          </a>
                          {
                            this.state.supplier_id != 0 &&
                            <a
                            onClick={() => {
                              var confrm = window.confirm(
                                'Are you sure you want to save ?'
                              );
                              if (confrm) {
                                if(this.state.po_status == 'draft'){
                                  this.create('issued');
                                }
                                else if(this.state.po_status == 'issued'){
                                  this.create('completed');
                                }
                                else{
                                  this.create('draft');
                                }
                              }
                              
                            }}
                            className="btn btn-secondary btn-sm me-2"
                          >
                            {
                              this.state.po_status == 'draft'?
                              "Issued to Supplier":
                              this.state.po_status == 'issued'? 
                              'Material Received':
                              'Save and Continue'
                            }
                          </a>
                          }
                         
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Supplier Name</label>
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
                      <label>Supplier Contact</label>
                      <input
                        type="text"
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
                        href="javascript:void(0);"
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
    <EditStockPurchase
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
