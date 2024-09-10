import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Modal } from 'react-responsive-modal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Drawer, Radio, RadioGroup, SelectPicker,Nav,TagPicker } from 'rsuite';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Loader from '../othercomponent/Loader';
import Skeletonloader from '../othercomponent/Skeletonloader';

const Navbar = ({ active, onSelect, ...props }) => {
  return (
    <Nav {...props} activeKey={active} onSelect={onSelect} style={{ marginBottom: 50 }}>
      <Nav.Item eventKey="overview">Overview</Nav.Item>
      <Nav.Item eventKey="variants">Variants</Nav.Item>
      <Nav.Item eventKey="addons">Addons</Nav.Item>
    </Nav>
  );
};

export class Editproduct extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      images: [],
      newaddon: false,
      new_category_name: '',
      category: [],
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
      active:'overview',
      nn:[],
      product_code:'',
      short_code:'',
      discount_applicable:''
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

 
  fetchCategories = () => {
    fetch(api + 'fetch_vendor_category', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.data.length == 0) {
          this.setState({ open: true });
        }
        this.setState({ category: json.data });
        this.setState({ is_loding: false });
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };






 
  uploadImage = async (e) => {
    let image = this.state.images;
    image.push(e.target.files[0]);
    this.setState({ images: image, product_image: '' });
  };

  add = () => {
    if (this.state.new_category_name != '') {
      this.setState({ createNewCategoryButton: true });
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
            this.setState({ open: false, new_category_name: '' });
            toast.success(json.msg);
            this.fetchCategories();
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ createNewCategoryButton: false });
        });
    } else {
      toast.error('Please add Category first!');
    }
  };

  create = () => {
    let numberValidation = /^[0-9]+$/;
    let isnumValid = numberValidation.test(this.state.our_price);
    var taxValidation = /^[0-9]+$/;
    var isTaxValid = taxValidation.test(this.state.tax);

    if (
      this.state.name == '' ||
      this.state.product_img == '' ||
      this.state.our_price == '' ||
      this.state.description == ''
    ) {
      toast.error('All fields are required !');
    } else if (this.state.category == '') {
      toast.error('Add category first !');
    } else if (this.state.c_id == '') {
      toast.error('Category is required !');
    } else if (!isTaxValid) {
      toast.error('Tax contains digits only!');
    } else {
      this.setState({ isLoading: true });

      var form = new FormData();
      form.append('product_name', this.state.name);
      form.append('vendor_category_id', this.state.c_id);
      form.append('price', this.state.our_price);
      form.append('description', this.state.description);
      form.append('type', this.state.type);
      form.append('product_id', this.state.product_id);
      form.append('tax', this.state.tax);
      form.append('product_code', this.state.product_code);
      form.append('short_code', this.state.short_code);
      form.append('discount_applicable', this.state.discount_applicable);
      form.append('variants',JSON.stringify(this.state.v_data))
      if (this.state.images.length > 0) {
        this.state.images.map((item, index) => {
          form.append('product_img', item);
        });
      }
      form.append('is_veg', this.state.is_veg);
      fetch(api + 'vendor_update_product', {
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

            this.props.update_product(this.props.productkey,json.data)
            toast.success(json.msg);
            this.props.onClose();
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ isLoading: false });
        });
    }
  };

  updateAddon = (value,idx) => {
    
    const v_data=this.state.v_data
    v_data[idx].addon=value
    this.setState({ v_data: v_data });
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
          this.setState({ v_data: [],active :'overview' });
        }}
        onOpen={() => {
          this.setState({ product_id: this.props.product.id });
          this.setState({ name: this.props.product.product_name });
          this.setState({ our_price: this.props.product.our_price });
          this.setState({ description: this.props.product.description });
          this.setState({ image: this.props.product.product_img });
          this.setState({ c_id: this.props.product.vendor_category_id });
          this.setState({ is_veg: this.props.product.is_veg });
          this.setState({ product_image: this.props.product.product_img });
          this.setState({ short_code: this.props.product.short_code });
      
          var v_data=this.props.product.variants;
          var oj=[];
          v_data.map((a,key) => {
                      if(a.addons.length > 0){
                        a.addons.map((b, index) => {
                      oj.push(parseInt(b.id));
                        })
                      }
                    v_data[key].addon=oj;
                    oj=[];
          });
          
          this.setState({ v_data: v_data });
          this.setState({ discount_applicable:this.props.product.discount_applicable });
          // this.setState({ addon: obj.addon_map });
          this.setState({ type: this.props.product.type });
          this.setState({ tax: this.props.product.tax,product_code:this.props.product.product_code });
          this.setState({ category: this.props.category });

          

        }}
      >
        {!this.state.is_loading ? (
          <>
            <Drawer.Header>
              <Drawer.Title>Edit Product - {this.state.name}</Drawer.Title>
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
                            this.props.delete_product(this.state.product_id,
                              this.props.productkey);
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

                      
                      onClick={() => 
                        Swal.fire({
                          title:
                            'Are you sure you want to update this product?  ',
                          showCancelButton: true,
                          confirmButtonColor: '#0066b2',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes, update it!',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            this.create();
                          }
                        })
                        
                        }
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </Drawer.Actions>
            </Drawer.Header>
            <Drawer.Body>
              <div className="content">
              <Navbar active={this.state.active}  appearance="subtle"  onSelect={(e) => 

                this.setState({ active: e })}  />

              {
                this.state.active =='overview' ?
                <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="form-group">
                        <label>Product Name</label>
                        <input
                          type="text"
                          value={this.state.name}
                          onChange={(e) => {
                            this.setState({ name: e.target.value });
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="form-group">
                        <div className="d-flex align-items-center justify-content-between">
                          <label>Category</label>
                        </div>
                        <div className="row">
                          <div className="col-10 pe-0">
                            <SelectPicker
                              data={data}
                              placeholder="Choose Category"
                              onChange={(e) => {
                                this.setState({ c_id: e });
                              }}
                              style={{
                                width: '100%',
                                borderColor: 'rgba(145, 158, 171, 0.32)',
                              }}
                              defaultValue={this.props.product.vendor_category_id}
                            />
                          </div>
                          <div className="col-2">
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ height: '35px' }}
                              onClick={() => {
                                this.setState({ open: true });
                              }}
                            >
                              <i className="fa fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="form-group">
                        <label>Our Price</label>
                        <input
                          value={this.state.our_price}
                          onChange={(e) => {
                            this.setState({ our_price: e.target.value });
                          }}
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>VEG/NON-VEG</label>
                        <RadioGroup
                          name="radioList"
                          inline={true}
                          onChange={(e) => {
                            this.setState({ is_veg: Number(e) });
                          }}
                          value={Number(this.state.is_veg)}
                        >
                          <Radio value={1}>VEG</Radio>
                          <Radio value={0}>NON-VEG</Radio>
                        </RadioGroup>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Short Code</label>

                        <input
                          type="text"
                          value={this.state.short_code == null ? '' : this.state.short_code}
                          onChange={(e) => {
                            this.setState({ short_code: e.target.value });
                          }}
                          className="form-control"
                        />

                        
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Product Code</label>

                        <input
                          type="text"
                          value={this.state.product_code == null ? '' : this.state.product_code}
                          onChange={(e) => {
                            this.setState({ product_code: e.target.value });
                          }}
                          className="form-control"
                        />

                        
                      </div>
                    </div>

                    <div className="col-lg-3 col-sm-6 col-12">
                        <div className="form-group">
                          <label>Discount Applicable</label>
                          <RadioGroup
                            name="radioList"
                            inline={true}
                            onChange={(e) => {
                              this.setState({ discount_applicable: Number(e) });
                            }}
                            value={Number(this.state.discount_applicable)}
                          >
                            <Radio value={1}>Yes</Radio>
                            <Radio value={0}>No</Radio>
                          </RadioGroup>
                        </div>
                      </div>
                      
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          value={this.state.description}
                          onChange={(e) => {
                            this.setState({ description: e.target.value });
                          }}
                          className="form-control"
                        />
                      </div>
                    </div>
                    {this.context.user.gstin !== null && (
                      <div className="col-lg-3">
                        <div className="form-group">
                          <label>G.S.T (%)</label>

                          <select
                            onChange={(e) => {
                              this.setState({ tax: e.target.value });
                            }}
                            className="select-container"
                            value={this.state.tax}
                          >
                            <option value="0">0</option>
                            <option value="5">5</option>
                            <option value="12">12</option>
                            <option value="18">18</option>
                            <option value="28">28</option>
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="col-lg-12">
                      <div className="form-group m-0">
                        <label> Product Image</label>
                        <div className="image-upload mb-0">
                          {this.state.images.length > 0 ? (
                            <></>
                          ) : (
                            <>
                              <label htmlFor="file-input">
                                <i className="iconly-Edit-Square edit-image-product"></i>
                              </label>
                              <input
                                type="file"
                                id="file-input"
                                onChange={(e) => {
                                  this.uploadImage(e);
                                }}
                                accept=".png, .jpg, .jpeg,.svg,.webp"
                                style={{ display: 'none' }}
                                className="upload"
                              />
                            </>
                          )}

                          {this.state.product_image != '' ? (
                            <img id="target" src={this.state.product_image} />
                          ) : (
                            <></>
                          )}

                          {this.state.images.length > 0 &&
                            this.state.images.map((item, index) => {
                              return (
                                <img
                                  key={index}
                                  id="target"
                                  src={URL.createObjectURL(item)}
                                  style={{
                                    width: '200px',
                                    height: '200px',
                                  }}
                                  alt="img"
                                />
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>:
              this.state.active === "variants" ?
                <Variants
                product_id={this.state.product_id}
                onClose={this.props.onClose}
                variants={this.state.v_data}
                addons={this.state.addon}
                update_child={this.update_variant_from_child}
                max_addons={this.state.max_addon}
                free_addons={this.state.free_addon}
                newaddonLoading={this.state.newaddonLoading}
                setMaxAddon={this.setMaxAddon}
                setMaxFreeAddon={this.setMaxFreeAddon}
              />
              :
              <div>
                <h6>Add-on groups like beverages, toppings can be added to individual or all variants of a dish</h6>
                <br/>
                
                  {this.state.v_data.map((item, index) => {
                    return (
                      <div className='row'>
                      <div className="col-lg-3" key={index}>
                        <div style={{ marginTop: "10px",marginBottom: "10px",backgroundColor:'#f2f2f2',padding:'10px',borderRadius:'5px' }}>
                          {item.variants_name}
                        </div>
                      </div>
                      <div className="col-lg-3" key={index}>
                      <div style={{ marginTop: "10px",marginBottom: "10px",backgroundColor:'#f2f2f2',padding:'10px',borderRadius:'5px' }}>
                      <TagPicker data={this.props.addons} style={{ width: 300 }} 
                      defaultValue={item.addon}
                       onChange={(value) => this.updateAddon(value, index)}
                      />
                      </div>
                    </div>
                      <hr/>
                    </div>
                    );
                  })}
              
               
              </div>
  }
  </div>


              
            
            </Drawer.Body>
          </>
        ) : (
          <Loader />
        )}
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
                <h4>Add Category</h4>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    onChange={(e) => {
                      this.setState({ new_category_name: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                {this.state.createNewCategoryButton ? (
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
                  <button
                    onClick={() => {
                      this.add();
                    }}
                    className="btn btn-secondary btn-sm me-2"
                  >
                    Add Category
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </Drawer>
    );
  }
}

class Variants extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      rows: this.props.variants,
      add_data: [],
      addon_name: '',
      addon_price: '',
      object: [],
      add_on_loading: false,
      add_on_dataLoading: true,
      newaddon: false,
      max_addon: this.props.max_addons,
      free_addon: this.props.free_addons,
      newaddonLoading: this.props.newaddonLoading,
    };
  }

  componentDidMount() {
   
  }

  cat_update = (str) => {
    const object = this.state.object;
    object[str] = true;
    this.setState({ object });
    this.props.update_child(this.state.Rows, object);
  };

  

  handleChange = (idx) => (e) => {
    const newRows = [...this.state.rows];
    newRows[idx][e.target.name] = e.target.value;
    this.setState({
      rows: newRows,
    });
    this.props.update_child(newRows, this.state.object);
  };

  handleAddRow = () => {
    const vari = [
      {
        id: 0,
        variants_name: '',
        variants_discounted_price: '',
        variant_status: 'add',
        variants_code: '',
      },
    ];
    this.setState({ rows: [...this.state.rows, ...vari] });
    this.props.update_child(this.state.rows, this.state.object);
  };

  handleRemoveSpecificRow = (idx) => () => {
    const rows = [...this.state.rows];

    rows[idx].variant_status = 'delete';
    this.setState({ rows });
    this.props.update_child(rows, this.state.object);
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Edit Product</title>
        </Helmet>
        <div className="content">
          <div className="page-header">
          <h6>Variants of this item can be created by defining its properties below</h6> <br/><br/>
          </div>
          <div className="card">

            <div className="card-body">
              <div className="row">
               
                <div className="col-md-12 d-flex align-items-center">
                  
                  {this.state.rows.length === 0 && (
                  <center> <button
                      onClick={this.handleAddRow}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Add New Variant
                    </button>
                    </center> 
                  )}
                </div>
              </div>
              {this.state.rows.length > 0 && (
                <div className="row mt-2">
                  <div className="col-mg-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table  datanew">
                            <thead>
                              <tr>
                                <th>#</th>
                             
                                <th>Variant Name</th>
                                <th>Variant Price</th>
                                <th>Variant Code</th>
                                <th style={{ textAlign: 'end' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.state.rows.map((item, idx) => (
                                item.variant_status !== 'delete' &&
                                <tr id="addr0" key={idx}>
                                  <td>{idx + 1}</td>
                                  

                                  <td>
                                    <input
                                      type="text"
                                      name="variants_name"
                                      value={this.state.rows[idx].variants_name}
                                      onChange={this.handleChange(idx)}
                                      className="form-control"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      name="variants_discounted_price"
                                      value={
                                        this.state.rows[idx]
                                          .variants_discounted_price
                                      }
                                      onChange={this.handleChange(idx)}
                                      className="form-control"
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="text"
                                      name="variants_code"
                                      value={this.state.rows[idx].variants_code}
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
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <button
                        onClick={this.handleAddRow}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        Add New Variant
                      </button>
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
    <Editproduct
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
