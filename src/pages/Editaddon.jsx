import React, { Component } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Drawer, Radio, RadioGroup } from 'rsuite';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Loader from '../othercomponent/Loader';

export class Editaddon extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      images: [],
      newaddon: false,
      product_show: true,
      product_id: 0,
      name: '',
      c_id: '',
      our_price: '',
      description: '',
      type: '',
      is_veg: 1,
      is_loading: false,
      v_data: [],
      product_image: '',
      addon_object: [],
      createNewCategoryButton: false,
      isLoading: false,
      tax: 0,
      max_addon: 0,
      free_addon: 0,
      category: [],
      products: [],
      save_and_continue: false,
      rows: [],
      group_name: '',
      group_display_name: '',
      is_multiple_selection: 0,
      min_selection: 0,
      max_selection: 0,
      addon_type: 1,
      group_id: 0,
    };
  }

  update_variant_from_child = (v_data, addon) => {
    this.setState({ v_data: v_data, addon_object: addon });
  };

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  create = () => {

    this.setState({ open: false });

    if (this.state.group_name == '') {
      toast.error('Please Enter Group Name');
      return;
    }

    if(this.state.group_display_name == ''){
      toast.error('Please Enter Display Name');
      return;
    }
    if (this.state.is_multiple_selection == 1) {
      
      if (this.state.max_selection == 0) {
        toast.error('Please Enter Max Selection');
        return;
      }
    }

    this.setState({ open: true, save_and_continue: true });

    fetch(api + 'update_product_addon', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        group_name: this.state.group_name,
        group_display_name: this.state.group_display_name,
        is_multiple_selection: this.state.is_multiple_selection,
        min_selection: this.state.min_selection,
        max_selection: this.state.max_selection,
        items: this.state.rows,
        addon_type: this.state.addon_type,
        group_id: this.state.group_id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          toast.error(json.msg);
        } else {
          toast.success(json.msg);
          this.setState({
            group_name: '',
            is_multiple_selection: 0,
            min_selection: 0,
            max_selection: 0,
            rows: [
              {
                id: 1,
                name: '',
                addon_type: '',
                price: '',
                status: 'active',
              },
            ],
          });
          this.setState({ open: false, save_and_continue: false });
          this.props.onClose();
          // this.props.history.push('/addongroup');
        }

        return json;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  handleCheck = (e) => {
    this.setState({ stock_added: e.target.checked });
  };

  handleChange = (idx) => (event) => {
    const { name, value } = event.target;
    const newRows = [...this.state.rows];
    newRows[idx] = { ...newRows[idx], [name]: value };
    this.setState({ rows: newRows });
  };

  handleAddRow = () => {
    const vari = [
      {
        id: 1,
        name: '',
        addon_type: '',
        price: '',
        status: 'active',
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
    const data = this.state.category.map((item, index) => ({
      label: item.name,
      value: item.id,
    }));
    return (
      <Drawer
        open={this.props.openEditDrawer}
        size="full"
        placement="right"
        onClose={() => {
          this.props.onClose();
          this.setState({ v_data: [] });
        }}
        onOpen={() => {
          this.setState({
            group_name: this.props.id.group_name,
            group_display_name: this.props.id.group_display_name,
            is_multiple_selection: this.props.id.is_multiple_selection,
            min_selection: this.props.id.min_selection,
            max_selection: this.props.id.max_selection,
            addon_type: this.props.id.addon_type,
            group_id: this.props.id.id,
          });
          if (this.props.id.addons.length > 0) {
            this.props.id.addons.map((item, index) => {
              this.state.rows.push({
                id: index + 1,
                name: item.addon_name,
                addon_type: item.addon_type,
                price: item.addon_price,
                status: item.addon_status,
              });
            });
          } else {
            this.state.rows = [];
          }
        }}
      >
        {!this.state.is_loading ? (
          <>
            <Drawer.Header>
              <Drawer.Title>
                Addons Group - {this.state.group_name}
              </Drawer.Title>
              <Drawer.Actions>
                <div className="d-flex">
                  {this.state.isLoading ? (
                    <button
                      className="btn btn-danger btn-sm me-2"
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
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() =>
                        Swal.fire({
                          title:
                            'Are you sure you want to delete this product?  ',
                          showCancelButton: true,
                          confirmButtonColor: '#0066b2',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes, delete it!',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            this.props.delete_product(this.state.product_id);
                          }
                        })
                      }
                    >
                      Delete Product
                    </button>
                  )}
                  {this.state.isLoading ? (
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
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      onClick={() => this.create()}
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </Drawer.Actions>
            </Drawer.Header>
            <Drawer.Body>
              <div className="content">
                <div className="page-header"></div>
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>
                            Group Name<span className="text-danger"> *</span>
                          </label>
                          <input
                            onChange={(e) => {
                              this.setState({ group_name: e.target.value });
                            }}
                            value={this.state.group_name}
                            type="text"
                          />
                        </div>
                      </div>


                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="form-group">
                        <label>
                         Display Group Name<span className="text-danger"> *</span>
                        </label>
                        <input
                          onChange={(e) => {
                            this.setState({ group_display_name: e.target.value });
                          }}
                          value={this.state.group_display_name}
                          type="text"
                        />
                      </div>
                    </div>


                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>
                            Addon Type<span className="text-danger"> *</span>
                          </label>
                          {/* add radio button for veg nonveg and egg */}
                          <RadioGroup
                            name="radioList"
                            inline={true}
                            onChange={(e) => {
                              this.setState({ addon_type: Number(e) });
                            }}
                            value={Number(this.state.addon_type)}
                          >
                            <Radio value={1}>VEG</Radio>
                            <Radio value={0}>NON-VEG</Radio>
                            <Radio value={2}>EGG</Radio>
                          </RadioGroup>
                        </div>
                      </div>
                      {/* <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>
                            Selection Type
                            <span className="text-danger"> *</span>
                          </label>
                          <select
                            value={this.state.is_multiple_selection}
                            onChange={(e) => {
                              this.setState({
                                is_multiple_selection: e.target.value,
                              });
                            }}
                            className="form-control"
                          >
                            <option value="0">Single</option>
                            <option value="1">Multiple</option>
                          </select>
                        </div>
                      </div> */}
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>
                            Min Selection<span className="text-danger"> *</span>
                          </label>
                          <select
                            value={this.state.min_selection}
                            onChange={(e) => {
                              this.setState({ min_selection: e.target.value });
                            }}
                            className="form-control"
                          >
                            <option value="0">0</option>
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
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>
                            Max Selection<span className="text-danger"> *</span>
                          </label>

                          <select
                            value={this.state.max_selection}
                            onChange={(e) => {
                              this.setState({ max_selection: e.target.value });
                            }}
                            className="form-control"
                          >
                            <option value="0">Unlimited</option>
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
                          </select>
                        </div>
                      </div>

                      {this.state.rows.length > 0 ? (
                        <div className="col-mg-12">
                          <label>Addon Items</label>
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
                                <th className="text-center">Addon Type</th>
                                <th className="text-center">Price</th>
                                <th className="text-end">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.rows.map((item, idx) => (
                                <tr id="addr0" key={idx}>
                                  <td>{idx + 1}</td>

                                  <td>
                                    <input
                                      type="text"
                                      name="name"
                                      value={item.name}
                                      onChange={this.handleChange(idx)}
                                      className="form-control"
                                    />
                                  </td>

                                  <td>
                                    <select
                                      name="addon_type"
                                      value={item.addon_type}
                                      onChange={this.handleChange(idx)}
                                      className="form-control"
                                    >
                                      <option value="" disabled>
                                        Select
                                      </option>
                                      <option value="1">Veg</option>
                                      <option value="0">Non - Veg</option>
                                      <option value="2">Egg</option>
                                    </select>
                                  </td>

                                  <td>
                                    <input
                                      type="text"
                                      name="price"
                                      value={item.price}
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
            </Drawer.Body>
          </>
        ) : (
          <Loader />
        )}
      </Drawer>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <Editaddon
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
