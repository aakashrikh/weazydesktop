import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import delete_icon from '../assets/images/icons/delete.svg';
import edit_icon from '../assets/images/icons/edit.svg';
import eye_icon from '../assets/images/icons/eye.svg';
import no_img from '../assets/images/no_products_found.png';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';

class Semifinishedrawmaterialproducts extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      isloading: true,
      products: [],
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.fetchProducts();
  }

  fetchProducts = (id, page) => {
    fetch(api + 'fetch_semi_dishes', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        page: page,
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
          if (json.data.length > 0) {
            this.setState({ products: json.data });
          }
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ isloading: false });
      });
  };

  delete_product = (id) => {
    fetch(api + 'delete_inventory_product', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        product_id: id,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
          // Toast.show(msg);
          toast.success(msg);
        } else {
          toast.success('Product Deleted Successfully');
          this.fetchProducts(this.state.active_cat, 1);
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
          <title>Semi Finished Recipe</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Semi Finished Raw Material Recipe</h4>
                </div>
                <div className="page-btn">
                  <Link to="/addsemifinishedrawmaterialproducts">
                    <a className="btn btn-added">Add New Recipe</a>
                  </Link>
                </div>
              </div>
              {this.state.isloading ? (
                <Loader />
              ) : this.state.products.length > 0 ? (
                <div className="card">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table  datanew">
                        <thead>
                          <tr>
                            <th>S.no</th>
                            <th>Dish Name</th>
                            <th>Current Stock</th>
                            <th>Expiry</th>
                            <th>Add Stock</th>
                            <th style={{ textAlign: 'end' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.products.map((item, index) => {
                            return (
                              <tr>
                                <td>{index + 1}</td>
                                <td>{item.dish_name}</td>
                                <td>
                                  {item.dish_current_stock}{' '}
                                  {item.recipe_quantity}
                                </td>
                                <td>
                                  {item.dish_expiry > 1
                                    ? item.dish_expiry + ' Days'
                                    : item.dish_expiry + ' Day'}
                                </td>
                                <td>
                                  <button className="btn btn-secondary btn-sm">
                                    Add Stock
                                  </button>
                                </td>
                                <td style={{ textAlign: 'end' }}>
                                  <Link
                                    to={
                                      '/semifinishedrawmaterialproductsdetails/' +
                                      item.id
                                    }
                                  >
                                    <img
                                      src={eye_icon}
                                      alt="img"
                                      className="mx-2 cursor_pointer"
                                      onClick={() => {
                                        this.setState({
                                          openedit: true,
                                        });
                                      }}
                                    />
                                  </Link>
                                  <Link
                                    to={
                                      '/editsemifinishedrawmaterialproducts/' +
                                      item.id
                                    }
                                  >
                                    <img
                                      src={edit_icon}
                                      alt="img"
                                      className="mx-2 cursor_pointer"
                                    />
                                  </Link>
                                  <a
                                    className="confirm-text"
                                    onClick={() =>
                                      Swal.fire({
                                        title:
                                          'Are you sure you want to delete this product ?',
                                        text: "You won't be able to revert this!",
                                        showCancelButton: true,
                                        confirmButtonColor: '#0066b2',
                                        cancelButtonColor: '#d33',
                                        confirmButtonText: 'Yes, delete it!',
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          this.delete_product(item.id);
                                        }
                                      })
                                    }
                                  >
                                    <img src={delete_icon} alt="img" />
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
                      height: '250px',
                    }}
                  />
                  <h4>No Products Found</h4>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default Semifinishedrawmaterialproducts;
