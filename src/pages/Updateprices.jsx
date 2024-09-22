import MenuIcon from '@mui/icons-material/Menu';
import SpeedDial from '@mui/material/SpeedDial';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Modal } from 'react-responsive-modal';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import no_img from '../assets/images/no_product.webp';
import nonveg from '../assets/non-veg.svg';
import veg from '../assets/veg.svg';
import Header from '../othercomponent/Header';
import ImportProducts from '../othercomponent/ImportProducts';
import InfiniteLoader from '../othercomponent/InfiniteLoader';
import Loader from '../othercomponent/Loader';
import { Toggle } from '../othercomponent/Toggle';
import Topnav from '../othercomponent/Topnav';
import Editproduct from './Editproduct';
import Swal from 'sweetalert2';

export class Updateprices extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      category: [],
      data: [],
      active_cat: 0,
      is_loding: true,
      category_loding: true,
      type: 'product',
      next_page: '',
      page: 1,
      openCategoryModal: false,
      open: false,
      openEditDrawer: false,
      editProductId: '',
      addons: [],
      select_product: [],
      all_data: [],
    };
  }

  componentDidMount() {
   
    this.fetchProducts(0, this.state.type, 1);
   
  }

  closeModal = () => {
    this.setState({ open: false });
  };

 

  fetchProducts = (category_id, type, page) => {
    fetch(api + 'vendor_get_vendor_product_prices', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        vendor_category_id: category_id,
        product_type: type,
        page: page,
        page_length: 50,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
 
            this.setState({ data: [] });

        } else {
         
            this.setState({ data: json.data, all_data: json.data });
          
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

  

  handlePriceChange = (index, priceType, value) => {
//alert(index,priceType,value)

      const data = this.state.data;

      data[index][priceType] = value;
      this.setState({ data: data });
  };

 

  handleSaveChanges = () => {
    this.setState({
      button_load: true
    });
    fetch(api + 'update_product_prices', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        data: this.state.data,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
          var msg = json.msg;
 
          toast.error(msg);
            // this.setState({ data: [] });

        } else {
         
          toast.success(json.msg);
            // this.setState({ data: json.data });
          
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ button_load: false });
      });
  };


  renderTable() {
    const { data} = this.state;

    return (
      <table className="table  datanew" >
        <thead>
          <tr>
          <th >S.no</th>
            <th >Product Name</th>
            <th >Variant Name</th>
            {/* Add headers for each price type dynamically */}
            {data.length > 0 && Object.keys(data[0]).filter(key => key !== 'product_name' && key !== 'variant_name' && key !== 'product_id' && key !== 'variant_id').map(pricePoint => (
              <th key={pricePoint} >{pricePoint}</th>
            ))}
          </tr>
        </thead>
        <tbody>
        {data.map((product, index) => (
  <tr key={product.id}>
    <td >{index + 1}</td>
    <td >{product.product_name}</td>
    <td >{product.variant_name}</td> {/* Assuming this is a column */}
    {/* Render input fields for each price type dynamically */}
    {Object.keys(product).filter(key => key !== 'product_name' && key !== 'variant_name' && key !== 'product_id' && key !== 'variant_id').map(priceType => (
      <td key={priceType} >
        <input
          type="number"
          className='form-control'
          value={product[priceType] } // Default to 0 if the price is undefined
          onChange={e => this.handlePriceChange(index, priceType, e.target.value)} // No variant ID needed
          style={{ width: '100%' }}
        />
      </td>
    ))}
  </tr>
))}
        </tbody>
      </table>
    );
  }


  search = (e) => {
  
    if (e.target.value.length >= 1) {
      var search = e.target.value;
      var products = this.state.all_data;

      var filteredProducts = products.filter((product) => {
        const nameMatches = product.product_name
          .toLowerCase()
          .includes(search.toLowerCase());
        const shortCodeMatches = product.product_code
          ? product.product_code.toLowerCase().includes(search.toLowerCase())
          : false;
        return nameMatches || shortCodeMatches;
      });
      this.setState({
        data: filteredProducts,
      });
    } else {
      this.setState({
        data: this.state.all_data,
      });
    }
  };


  render() {
    return (
      <>
        <Helmet>
          <title>Product List</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Product Prices</h4>
                </div>
                {this.context.role.staff_role != 'staff' && (
                  <>
                    <div className="page-btn d-flex align-items-center">
                      {
                        this.state.button_load?
                        <button className="btn btn-added me-2" disabled>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </button>
                        :
                        
                     <button
                        className="btn btn-added me-2"
                        onClick={() => {
                          Swal.fire({
                            title: 'Are you sure?',
                            text: 'You want to update prices of all products',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, update it!',
                          }).then((result) => {
                            if (result.isConfirmed) {
                              this.handleSaveChanges();
                            }
                          });
                          
                        }}
                      >
                    Update Product
                      </button>
 }
                      
                      <Link to="/productlist" className="btn btn-added">
                        Back
                      </Link>  

                      {/* <Link to="/addproduct" className="btn btn-added">
                        Add New Product
                      </Link> */}
                    </div>
                  </>
                )}
              </div>
              {/* {this.context.role.staff_role != 'staff' && (
                <Topnav array="catalogue" />
              )} */}
              {/* <Topnav array="catalogue" /> */}
              <div className="comp-sec-wrapper mt-20">
                <section className="comp-section">
                  <div className="row pb-4">
                    <div className="col-md-9">
                      <input
                        type={'text'}
                        className={'form-control search-input'}
                        onChange={(e) => {
                          this.search(e);
                        }}
                        placeholder={'Search your product here...'}
                      />
                    </div>
                    <div className="col-md-3">
                      <ul className="nav nav-tabs nav-tabs-solid nav-tabs-rounded nav-justified">
                        {/* <li className="nav-item">
                          <a
                            className="nav-link active pb-2 pt-2"
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loding: true,
                                type: 'product',
                              });
                              this.fetchProducts(
                                this.state.active_cat,
                                'product',
                                1
                              );
                            }}
                          >
                            Product
                          </a>
                        </li>
                        <li className="nav-item">
                          <a
                            className="nav-link pb-2 pt-2 "
                            href="#solid-rounded-justified-tab1"
                            data-bs-toggle="tab"
                            onClick={() => {
                              this.setState({
                                is_loding: true,
                                type: 'package',
                              });
                              this.fetchProducts(
                                this.state.active_cat,
                                'package',
                                1
                              );
                            }}
                          >
                            Combos
                          </a>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
              {this.state.is_loding ? (
                <Loader />
              ) : (
                <>
                  {this.state.data.length > 0 ? (
                    <>
                      <div className="card">
                        <div className="card-body">
                          <div className="table-responsive">
                            <InfiniteScroll
                              hasChildren={true}
                              dataLength={this.state.data.length}
                              next={() => {
                                this.fetchProducts(
                                  this.state.active_cat,
                                  this.state.type,
                                  this.state.page + 1
                                );
                                this.setState({
                                  // page: this.state.page + 1,
                                  loadMore: true,
                                });
                              }}
                              hasMore={
                                this.state.next_page !== null &&
                                this.state.data.length > 0
                              }
                              loader={
                                <div className="d-flex align-items-center justify-content-center w-full mt-xl">
                                  <InfiniteLoader />
                                </div>
                              }
                            >

{this.renderTable()}
                              {/* <table className="table  datanew">
                                <thead>
                                  <tr>
                                    <th>S.no</th>
                                    <th>Product Name</th>
                                    <th>Short Code</th>
                                    <th>Price</th>
                                    <th>Category</th>
                                    <th>Type</th>
                                    <th>QR Enable</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {this.state.products.map((item, index) => {
                                    return (
                                      <tr>
                                        <td>{index + 1}</td>
                                        <td
                                          className="productimgname cursor_pointer"
                                          onClick={() => {
                                            if (
                                              this.context.role.staff_role !=
                                              'staff'
                                            ) {
                                              this.setState({
                                                openEditDrawer: true,
                                                editProductId: item.id,
                                                editProductkey: index,
                                                select_product: item,
                                              });
                                            }
                                          }}
                                        >
                                          <div className="product-img">
                                            {item == undefined ? null : (
                                              <img
                                                src={item.product_img}
                                                alt="product"
                                              />
                                            )}
                                          </div>
                                          <div className="product-img-veg-nonveg">
                                            {item.is_veg ? (
                                              <img src={veg} alt="veg" />
                                            ) : (
                                              <img src={nonveg} alt="non-veg" />
                                            )}
                                          </div>
                                          <p>{item.product_name}</p>
                                        </td>
                                        <td>{item.product_code || 'N/A'}</td>
                                        <td>₹{item.our_price}</td>

                                        <td>{item.category.name}</td>
                                        <td
                                          style={{
                                            textTransform: 'capitalize',
                                          }}
                                        >
                                          {item.type}
                                        </td>
                                        <td>
                                          <Toggle
                                            id={index + 'one'}
                                            status={item.qr_enable}
                                            product_id={item.id}
                                            action_type="qr"
                                          />
                                        </td>

                                        <td>
                                          <Toggle
                                            id={index + 'two'}
                                            status={item.status}
                                            product_id={item.id}
                                            action_type={
                                              this.state.type === 'product'
                                                ? 'product'
                                                : 'package'
                                            }
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table> */}
                            </InfiniteScroll>
                          </div>
                        </div>
                      </div>
                    </>
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
                </>
              )}
            </div>
          </div>
        </div>
        {this.state.category.length > 0 && (
          <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: 'fixed', bottom: 70, right: 7 }}
            icon={<MenuIcon />}
            direction="up"
            onClick={() => {
              this.setState({
                openCategoryModal: !this.state.openCategoryModal,
              });
            }}
          ></SpeedDial>
        )}

        <Modal
          focusTrapped={false}
          open={this.state.openCategoryModal}
          onClose={() => this.setState({ openCategoryModal: false })}
          center
          classNames={{
            modal: 'customModal categoryModal',
          }}
        >
          <div className="content">
            <div className="page-header">
              <div className="page-title">
                <h4>Categories</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3">
                <button
                  className={
                    'btn btn-secondary me-3 my-2 w-100' +
                    (this.state.active_cat === 0 ? ' active' : '')
                  }
                  onClick={() => {
                    this.active_cat(0);
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: '400',
                  }}
                >
                  All
                </button>
              </div>

              {this.state.category.map((item, index) => {
                return (
                  <div className="col-lg-3">
                    <button
                      className={
                        'btn btn-secondary me-3 my-2 w-100' +
                        (this.state.active_cat === item.id ? ' active' : '')
                      }
                      onClick={() => {
                        this.active_cat(item.id);
                      }}
                      style={{
                        fontSize: '11px',
                        fontWeight: '400',
                      }}
                    >
                      {item.name}({item.products_count})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
        <ImportProducts
          fetch_order={() => this.fetchProducts(0, this.state.type, 1)}
          close={this.closeModal}
          open={this.state.open}
        />

        <Editproduct
          openEditDrawer={this.state.openEditDrawer}
          onClose={() => this.setState({ openEditDrawer: false })}
          id={this.state.editProductId}
          productkey={this.state.editProductkey}
          delete_product={this.delete_product}
          addons={this.state.addons}
          product={this.state.select_product}
          category={this.state.category}
          update_product={this.update_product}
        />
      </>
    );
  }
}

export default Updateprices;
