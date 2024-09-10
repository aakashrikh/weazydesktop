import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';

export class ReleaseStock extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      is_loding: true,
      open: false,
      images: [],
      variants_addons_div: false,
      newaddon: false,
      new_category_name: '',
      category: [],
      products: [],
      product_show: true,
      product_id: 0,
      name: '',
      c_id: '',
      market_price: '',
      our_price: '',
      description: '',
      type: 'product',
      is_veg: 1,
      save_and_continue: false,
      add_category_loading: false,
      rows: [
        {
          id: 1,
          name: '',
          quantity: '',
          Unit: '',
          material_id: '',
        },
      ],
      total: 0,
      staff_name: '',
      comment: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchProducts();
  }

  create = () => {
    if (this.state.rows.length == 0) {
      toast.error('Add atleast one product !');
    } else if (this.state.staff_name == '') {
      toast.error('Enter staff name !');
    } else if (this.state.rows[0].material_id == '') {
      toast.error('Select product !');
    } else {
      this.setState({ save_and_continue: true, isLoading: true });
      var form = new FormData();
      form.append('purchase_order_product', JSON.stringify(this.state.rows));
      form.append('staff_name', this.state.staff_name);
      {
        this.state.comment != ''
          ? form.append('comment', this.state.comment)
          : form.append('comment', 'N/A');
      }

      fetch(api + 'release_inventory', {
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
            this.setState({
              product_show: false,
              rows: [
                {
                  id: 1,
                  name: '',
                  quantity: '',
                  Unit: '',
                  material_id: '',
                },
              ],
              staff_name: '',
              comment: '',
            });
            this.props.navigate('/inventoryproducts');
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
          if (json.all.data.length > 0) {
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
    }

    newRows[idx][e.target.name] = e.target.value;

    this.setState({ rows: newRows });
  };
  handleAddRow = () => {
    const vari = [
      {
        id: 1,
        name: '',
        quantity: '',
        Unit: '',
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
          <title>Release Stock</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            {/* {this.state.product_show ? ( */}
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Release Stocks</h4>
                </div>
              </div>

              <Topnav array="inventory" />

              {this.state.is_loding ? (
                <Loader />
              ) : (
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label>
                            Released To<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={this.state.staff_name}
                            onChange={(e) =>
                              this.setState({ staff_name: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-md-8">
                        <div className="form-group">
                          <label>Comments</label>
                          <input
                            type="text"
                            className="form-control"
                            value={this.state.comment}
                            onChange={(e) =>
                              this.setState({ comment: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      {this.state.rows.length > 0 ? (
                        <div className="col-lg-12">
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
                                    >
                                      <option disabled selected>
                                        Choose Material
                                      </option>
                                      {this.state.products.length > 0 ? (
                                        this.state.products.map(
                                          (item, index) => (
                                            <option
                                              value={item.id}
                                              unit={item.purchase_unit}
                                              current_quantity={
                                                item.current_stock
                                              }
                                            >
                                              {item.inventory_product_name}
                                            </option>
                                          )
                                        )
                                      ) : (
                                        <></>
                                      )}
                                    </select>
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
                                      value={
                                        this.state.rows[idx].current_quantity
                                      }
                                      onChange={this.handleChange(idx)}
                                      className="form-control"
                                    />
                                  </td>

                                  <td className="text-end">
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={this.handleRemoveSpecificRow(
                                        idx
                                      )}
                                    >
                                      <i className="fa fa-trash"></i>
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
                              className="btn btn-outline-secondary btn-sm"
                              style={{
                                marginBottom: '20px',
                                marginTop: '10px',
                              }}
                            >
                              Add New
                            </button>
                          </div>
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
                            className="btn btn-sm btn-outline-secondary btn-sm"
                            style={{
                              marginBottom: '20px',
                              marginTop: '10px',
                            }}
                          >
                            Add A Row
                          </button>
                        </div>
                      )}
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
                              this.create();
                            }}
                            className="btn btn-secondary btn-sm me-2"
                          >
                            Save Changes
                          </a>
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
                <h4>Add Supplier </h4>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label> Supplier Name</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          this.setState({ new_category_name: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12 d-flex justify-content-end">
                    {this.state.add_category_loading ? (
                      <button
                        className="btn btn-submit me-2"
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
                          this.add();
                        }}
                        className="btn btn-submit me-2"
                      >
                        Add Supplier
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
    <ReleaseStock
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
