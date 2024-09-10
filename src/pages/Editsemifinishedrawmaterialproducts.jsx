import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';

export class Editsemifinishedrawmaterialproducts extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      is_loding: true,
      products: [],
      product_show: true,

      save_and_continue: false,
      add_category_loading: false,
      rows: [
        {
          id: 1,
          name: '',
          quantity: '',
          unit: '',
          material_id: '',
        },
      ],
      dish_name: '',
      recipe_quantity: '',
      dish_expiry: 0,
      production_quantity_estimate: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchProducts();
    this.productDetails();
  }

  productDetails = () => {
    fetch(api + 'fetch_semi_dishes_single', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        semi_dish_id: this.props.id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          toast.error(msg);
        } else {
          let one = [];
          json.data.semi_dish_materials.map((item, index) => {
            let row = {
              id: index + 1,
              name: item.name,
              quantity: item.material_quantity,
              unit: item.material_unit,
              material_id: item.material_id,
            };
            one.push(row);
          });

          this.setState({
            rows: one,
          });

          this.setState({
            dish_name: json.data.dish_name,
            recipe_quantity: json.data.recipe_quantity,
            dish_expiry: json.data.dish_expiry,
            production_quantity_estimate:
              json.data.production_quantity_estimate,
          });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  create = () => {
    if (
      this.state.dish_name === '' ||
      this.state.recipe_quantity === '' ||
      this.state.dish_expiry === ''
    ) {
      toast.error('All fields are required !');
    } else if (this.state.rows.length === 0) {
      toast.error('Please add atleast one ingredient !');
    }
    // else if (this.state.market_price<this.state.our_price) {
    //     toast.error("Your price should be less than market price !");
    // }
    else {
      this.setState({ save_and_continue: true, isLoading: true });

      var form = new FormData();
      form.append('semi_dish_id', this.props.id);
      form.append('dish_name', this.state.dish_name);
      form.append('recipe_quantity', this.state.recipe_quantity);
      form.append('dish_expiry', this.state.dish_expiry);
      form.append(
        'production_quantity_estimate',
        this.state.production_quantity_estimate
      );
      form.append('production_materials[]', JSON.stringify(this.state.rows));

      fetch(api + 'edit_semi_dishes', {
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
            this.props.navigate('/semifinishedrawmaterialproducts');
            this.setState({ product_show: false, product_id: json.data.id });
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
          <title>Edit Semi Finished Dishes</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            {/* {this.state.product_show ? ( */}
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Edit Semi-Finished Raw Material Recipe</h4>
                </div>
              </div>
              {this.state.is_loding ? (
                <Loader />
              ) : (
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Product Name</label>
                          <input
                            onChange={(e) => {
                              this.setState({ dish_name: e.target.value });
                            }}
                            type="text"
                            value={this.state.dish_name}
                          />
                        </div>
                      </div>
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Product Expiry(In Days)</label>

                          <select
                            onChange={(e) => {
                              this.setState({
                                dish_expiry: e.target.value,
                              });
                            }}
                            value={this.state.dish_expiry}
                            className="select-container"
                          >
                            <option>Choose Product Expiry Date</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                            <option value="6">6</option>
                            <option value="7">7</option>
                            <option value="8">8</option>
                            <option value="9">9</option>
                            <option value="10">10</option>
                            <option value="11">11</option>
                            <option value="12">12</option>
                            <option value="13">13</option>
                            <option value="14">14</option>
                            <option value="15">15</option>
                            <option value="16">16</option>
                            <option value="17">17</option>
                            <option value="18">18</option>
                            <option value="19">19</option>
                            <option value="20">20</option>
                            <option value="21">21</option>
                            <option value="22">22</option>
                            <option value="23">23</option>
                            <option value="24">24</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Product Quantity</label>
                          <input
                            onChange={(e) => {
                              this.setState({
                                production_quantity_estimate: e.target.value,
                              });
                            }}
                            value={this.state.production_quantity_estimate}
                            type="text"
                          />
                        </div>
                      </div>
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Quantity Unit</label>
                          <select
                            onChange={(e) => {
                              this.setState({
                                recipe_quantity: e.target.value,
                              });
                            }}
                            value={this.state.recipe_quantity}
                            className="select-container"
                          >
                            <option>Choose Quantity Unit</option>
                            <option value="kg">KG</option>
                            <option value="gm">GM</option>
                            <option value="ltr">LTR</option>
                            <option value="ml">ML</option>
                            <option value="pcs">PCS</option>
                            <option value="bori">Bori</option>
                            <option value="dozen">Dozen</option>
                            <option value="box">Box</option>
                            <option value="pack">Pack</option>
                            <option value="bundle">Bundle</option>
                            <option value="bag">Bag</option>
                            <option value="bottle">Bottle</option>
                            <option value="carton">Carton</option>
                            <option value="coil">Coil</option>
                            <option value="drum">Drum</option>
                            <option value="pair">Pair</option>
                            <option value="ream">Ream</option>
                            <option value="roll">Roll</option>
                            <option value="set">Set</option>
                            <option value="tube">Tube</option>
                            <option value="unit">Unit</option>
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
                                className="btn btn-sm btn-outline-secondary"
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
    <Editsemifinishedrawmaterialproducts
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
