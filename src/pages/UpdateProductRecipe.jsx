import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';

export class UpdateProductRecipe extends Component {
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
      semifinishedrecipe: [],
      rawmaterial: [],
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
      is_save_button_loding: false,
      rowsRaw: [
        {
          id: 1,
          name: '',
          quantity: '',
          unit: '',
          material_id: '',
        },
      ],

      total: 0,
      product_name: '',
      variant_name: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchRawMaterial();
    this.fetch_product_recipe();
  }

  fetch_product_recipe = () => {
    fetch(api + 'fetch_product_recipe', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        product_id: this.props.product_id,
        varient_id: this.props.variant_id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          if (json.raw_materials.length > 0) {
            const vari = [];
            json.raw_materials.map((item, index) => {
              var one = {
                id: item.raw_product_id,
                name: 'one',
                quantity: item.raw_product_quantity,
                unit: item.raw_product_unit,
                material_id: item.raw_product_id,
              };
              vari.push(one);
            });

            this.setState({ rowsRaw: vari });
          }

          if (json.varient != null) {
            this.setState({ variant_name: json.varient.variants_name });
          }
          this.setState({
            // rowsRaw: json.raw_materials,
            // rowsSemi: json.semi_dishes,
            product_name: json.product.product_name,
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

  fetchRawMaterial = (id, page) => {
    alert("sss");
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
            this.setState({ rawmaterial: [] });
          }
        } else {
          if (json.all.data.length > 0) {
            this.setState({ rawmaterial: json.all.data });
          } else {
            this.setState({ rawmaterial: [] });
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

  handleChangeRaw = (idx) => (e) => {
    const newRows = [...this.state.rowsRaw];
    if (e.target.name == 'material_id') {
      var index = e.target.selectedIndex;
      var optionElement = e.target.childNodes[index];
      var option = optionElement.getAttribute('unit');
      newRows[idx]['unit'] = option;
      newRows[idx][e.target.name] = parseInt(e.target.value);
    }

    newRows[idx][e.target.name] = e.target.value;

    this.setState({ rowsRaw: newRows });
  };

  handleAddRowRawMaterial = () => {
    const vari = [
      {
        id: 1,
        name: '',
        quantity: '',
        unit: '',
      },
    ];
    this.setState({ rowsRaw: [...this.state.rowsRaw, ...vari] });
  };

  handleRemoveSpecificRowRaw = (idx) => () => {
    const rowsRaw = [...this.state.rowsRaw];
    rowsRaw.splice(idx, 1);
    this.setState({ rowsRaw });
  };

  update_product_recipe = () => {
    this.setState({ is_save_button_loding: true });
    fetch(api + 'update_product_recipe', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        product_id: this.props.product_id,
        varient_id: this.props.variant_id,
        raw_materials: this.state.rowsRaw,
        semi_dishes: this.state.rowsSemi,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          this.setState({ is_save_button_loding: false });
          this.setState({ is_error: true, error_msg: msg });
        } else {
          toast.success(json.msg);
          this.setState({ is_save_button_loding: false });
          this.setState({ is_success: true, success_msg: json.msg });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ is_save_button_loding: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Update Product Recipe</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            {/* {this.state.product_show ? ( */}
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Update Product Recipe</h4>
                </div>
              </div>
              {this.state.is_loding ? (
                <Loader />
              ) : (
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label>Product Name : </label>
                          <span>{this.state.product_name}</span>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label>Variant Name : </label>
                          <span>
                            {this.state.variant_name != undefined
                              ? this.state.variant_name
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <h5>Select Raw Materials</h5>
                      {this.state.rowsRaw.length > 0 ? (
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
                              {this.state.rowsRaw.map((item, idx) => (
                                <tr id="addr0" key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>
                                    <select
                                      onChange={this.handleChangeRaw(idx)}
                                      className="select-container"
                                      name="material_id"
                                      value={
                                        this.state.rowsRaw[idx].material_id
                                      }
                                    >
                                      <option>Choose Material</option>
                                      {this.state.rawmaterial.length > 0 ? (
                                        this.state.rawmaterial.map(
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
                                      value={this.state.rowsRaw[idx].unit}
                                      onChange={this.handleChangeRaw(idx)}
                                      className="form-control"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      name="quantity"
                                      value={this.state.rowsRaw[idx].quantity}
                                      onChange={this.handleChangeRaw(idx)}
                                      className="form-control"
                                    />
                                  </td>

                                  <td className="text-end">
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={this.handleRemoveSpecificRowRaw(
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
                              onClick={this.handleAddRowRawMaterial}
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
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'end',
                          }}
                        >
                          <button
                            onClick={this.handleAddRowRawMaterial}
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
                    </div>

                    <div className="d-flex justify-content-end">
                      {this.state.is_save_button_loding ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled
                          style={{
                            cursor: 'not-allowed',
                            opacity: '0.8',
                          }}
                        >
                          Saving...
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            this.update_product_recipe();
                          }}
                        >
                          Save Recipe
                        </button>
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
    <UpdateProductRecipe
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
