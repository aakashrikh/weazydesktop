import moment from 'moment';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Radio, RadioGroup, SelectPicker } from 'rsuite';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';

export class AddAddonGroup extends Component {
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
          addon_type: '',
          price: '',
          status: 'active',
        },
      ],

      group_name: '',
      display_group_name:'',
      is_multiple_selection: 0,
      min_selection: 0,
      max_selection: 0,
      addon_type: 1,
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
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

  create = () => {

    this.setState({ open: false });
    if (this.state.group_name == '') {
      toast.error('Please Enter Group Name');
      return;
    }

    if(this.state.display_group_name == ''){
      toast.error('Please Enter Display Group Name');
      return;
    }

    if (this.state.is_multiple_selection == 1) {
     
      if (this.state.max_selection == 0) {
        toast.error('Please Enter Max Selection');
        return;
      }
    }

    this.setState({ open: true, save_and_continue: true });

    fetch(api + 'add_product_addon', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        group_name: this.state.group_name,
        is_multiple_selection: this.state.is_multiple_selection,
        min_selection: this.state.min_selection,
        max_selection: this.state.max_selection,
        items: this.state.rows,
        addon_type: this.state.addon_type,
        display_group_name: this.state.display_group_name
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
          this.props.navigate('/productaddons');
        }

        return json;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  handleChange = (idx) => (e) => {
    const newRows = [...this.state.rows];

    newRows[idx][e.target.name] = e.target.value;

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
    return (
      <>
        <Helmet>
          <title> Add Addons Group</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            {/* {this.state.product_show ? ( */}
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Add Addons Group</h4>
                </div>
              </div>
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
                            this.setState({ display_group_name: e.target.value });
                          }}
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
                          Selection Type<span className="text-danger"> *</span>
                        </label>
                        <select
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
                                    value={this.state.rows[idx].name}
                                    onChange={this.handleChange(idx)}
                                    className="form-control"
                                  />
                                </td>

                                <td>
                                  <select
                                    name="addon_type"
                                    value={this.state.rows[idx].addon_type}
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
    <AddAddonGroup
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
