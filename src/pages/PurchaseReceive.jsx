import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { RadioButton, RadioGroup } from 'react-radio-buttons';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import plus from '../assets/images/icons/plus.svg';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Swal from 'sweetalert2';
export class PurchaseReceive extends Component {
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
      is_loading: false,
      po_id:"",
      purchase_id:'',
      purchase_orders:[],
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    this.fetchProducts();
    this.fetch_order();
  }

  

  handleCheck = (e) => {
    this.setState({ stock_added: e.target.checked });
  };

 

  create = () => {
   

      this.setState({ save_and_continue: true, isLoading: true });

      var form = new FormData();
      form.append('purchase_id', this.state.purchase_id);
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

      this.setState({save_and_continue:true});

      fetch(api + 'update_stock_purchase_order', {
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
          // if (json.data.data.length > 0) {
            this.setState({ products: json.all.data });
          // }
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

  fetch_order = () => {
    
    fetch(api + 'fetch_purchase_order', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        range: 'lifetime',
        page: 1,
        status:['issued','shipped']
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          // toast.error('Something went wrong');
        } else {
          
          this.setState({ purchase_orders: json.data.data });
        }
         
        
      })
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ is_loading: false });
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

  set_purchase_orders = (index) => {
    
    var data = this.state.purchase_orders[index];
    var one = [];
     data.material.map((item, index) => {
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
              receive_qty:item.receive_qty,
              now_receive:item.material_quantity-item.receive_qty,
              material_id: item.material_id,
            };
            one.push(row);
          });

          this.setState({
            rows: one,
          });

       
          this.setState({
            purchase_id:data.id,
            supplier_id: data.supplier_id,
            invoice_date: data.purchase_date,
            po: data.po_no,
            note: data.note,
            stock_added: data.stock_added,
            payment_type: data.is_paid,
            igst: data.igst,
            sgst: data.sgst,
            cgst: data.cgst,
            total: data.total_price,
          });

  };
  render() {
    return (
      <>
        <Helmet>
          <title>View Stock Purchase</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            {/* {this.state.product_show ? ( */}
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <Link to={'/stockpurchase'} className="new-tabs-for-page-top ">
                  <span className='fa fa-arrow-left'></span>
                  </Link>
                  <h4> Purchase Receive</h4>
                </div>
              </div>
              {this.state.is_loading ? (
                <Loader />
              ) : (
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                     
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>PO No</label>
                          <select className="form-control" onChange={(e) =>{
                            this.set_purchase_orders(e.target.value);
                          }} >
                             <option value={""} key={""}>
                                    Select Your PO
                                    </option>

                            {
                              this.state.purchase_orders.length > 0
                                ? this.state.purchase_orders.map((item, index) => {
                                  return (
                                    <option value={index} key={index}>
                                     {item.po_no} - {moment(item.purchase_date).format('DD-MM-YYYY')}
                                    </option>
                                  );
                                })
                                :
                                null
                            }
                          
                          </select>
                          
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
                                  <th className="text-center">Received</th>
                                  <th className="text-center">Quantity to Receive</th>
                                 
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
                                        disabled
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        name="quantity"
                                        value={this.state.rows[idx].quantity}
                                        onChange={this.handleChange(idx)}
                                        className="form-control"
                                        disabled
                                      />
                                    </td>


                                    <td>
                                      <input
                                        type="text"
                                        name="receive_qty"
                                        value={this.state.rows[idx].receive_qty}
                                        onChange={this.handleChange(idx)}
                                        className="form-control"
                                        disabled
                                      />
                                    </td>

                                    <td>
                                      <input
                                        type="text"
                                        name="now_receive"
                                        value={this.state.rows[idx].now_receive}
                                        onChange={this.handleChange(idx)}
                                        className="form-control"
                                       max={this.state.rows[idx].now_receive}
                                      />
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
                             
                            </div>
                          </div>
                          <br/><br/>
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
                                text: 'You want to receive material',
                                showCancelButton: true,
                                confirmButtonColor: '#0066b2',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes, save it!'
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  this.create();
                                }
                              });
                              
                            
                          }}
                          className="btn btn-secondary btn-sm me-2"
                          style={{ float: 'right',marginTop:'50px' }}
                        >
                        Receive Material
                        </a>
                      )}
                    </div>

                        </div>
                      ) : (
                        <></>
                      )}

                     
                      
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <PurchaseReceive
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
