import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import delete_icon from '../assets/images/icons/delete.svg';
import edit_icon from '../assets/images/icons/edit.svg';
import no_img from '../assets/images/no_product.webp';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Editaddon from './Editaddon.jsx';
export class ProductAddons extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      openedit: false,
      is_loding: true,
      add_data: [],
      edit_addon_name: '',
      edit_addon_price: '',
      edit_addon_id: '',
      newaddonLoading: false,
      editaddonLoading: false,
      is_buttonloding: false,
      addon_name: '',
      addon_price: '',
      editaddonId: 0,
      openEditDrawer: false,
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetch_addon();
  }

  fetch_addon = () => {
    fetch(api + 'fetch_product_addon', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          // toast.error(json.msg);
          this.setState({ add_data: [] });
        } else {
          this.setState({ add_data: json.data });
        }
        this.setState({ is_loding: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  create_addon = () => {
    if (this.state.addon_name == '' || this.state.addon_price == '') {
      toast.error('All field is required!');
    } else {
      this.setState({ newaddonLoading: true });
      fetch(api + 'add_product_addon', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          addon_name: this.state.addon_name,
          addon_price: this.state.addon_price,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            toast.error(json.msg);
          } else {
            this.fetch_addon();
            this.setState({
              addon_name: '',
              addon_price: '',
              newaddonLoading: false,
              open: false,
            });
            toast.success(json.msg);
          }

          return json;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  edit_addon = () => {
    if (this.state.edit_addon_name == '' || this.state.edit_addon_price == '') {
      toast.error('All field is required!');
    } else {
      this.setState({ editaddonLoading: true });
      fetch(api + 'update_product_addon', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          addon_id: this.state.edit_addon_id,
          addon_name: this.state.edit_addon_name,
          addon_price: this.state.edit_addon_price,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            toast.error(json.msg);
          } else {
            this.fetch_addon();
            this.setState({
              openedit: false,
            });
            toast.success(json.msg);
          }

          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ editaddonLoading: false });
        });
    }
  };

  delete_addon = (id) => {
    fetch(api + 'delete_product_addon', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        addon_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          // Toast.show(msg);
        } else {
          toast.success('Category deleted');
          this.fetch_addon();
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Addons Management</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Product Addons</h4>
                </div>
                <div className="page-btn">
                  <Link to="/addaddongroup" className="btn btn-added">
                    Create a new Addon
                  </Link>
                </div>
              </div>

              <Topnav array="catalogue" />

              {this.state.is_loding ? (
                <Loader />
              ) : (
                <div className="card">
                  {this.state.add_data.length > 0 ? (
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table  datanew">
                          <thead>
                            <tr>
                              <th>S.no</th>
                              <th>Addon Name</th>
                              <th>Display Name</th>
                              {/* <th>is_multiple_selection</th> */}
                              <th>Products</th>
                              <th>Created at</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.add_data.map((item, index) => (
                              <tr>
                                <td>{index + 1}</td>
                                <td>{item.group_name}</td>
                                <td>
                                  {item.group_display_name}
                                </td>
                                <td
                                  onClick={() => {
                                    this.setproducts(
                                      item.kitchen_product,
                                      item.id
                                    );
                                    this.setState({
                                      productsKitchenModal: true,
                                    });
                                  }}
                                >
                                  product
                                </td>
                                <td>{moment(item.created_at).format('ll')}</td>
                                <td>
                                  <a
                                    className="me-3"
                                    onClick={() => {
                                      this.setState({
                                        openEditDrawer: true,
                                        editaddonId: item,
                                      });
                                    }}
                                  >
                                    <img src={edit_icon} alt="img" />
                                  </a>
                                  <a
                                    className="confirm-text"
                                    onClick={() => {
                                      Swal.fire({
                                        title:
                                          'Are you sure you want to delete this Addon?',
                                        text: "You won't be able to revert this!",
                                        showCancelButton: true,
                                        confirmButtonColor: '#0066b2',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'Yes, delete it!',
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          this.delete_addon(item.id);
                                        }
                                      });
                                    }}
                                  >
                                    <img src={delete_icon} alt="img" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center flex-column"
                      style={{
                        height: '70vh',
                      }}
                    >
                      <img
                        src={no_img}
                        alt="img"
                        style={{
                          height: '400px',
                        }}
                      />
                      <h4>
                        {' '}
                        Sorry, we couldn't find any records at this moment.{' '}
                      </h4>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Editaddon
          openEditDrawer={this.state.openEditDrawer}
          onClose={() => this.setState({ openEditDrawer: false })}
          id={this.state.editaddonId}
          delete_product={this.delete_product}
          addon_data={this.state.addon_data}
        />
      </>
    );
  }
}

export default ProductAddons;
