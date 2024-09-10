import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';
import { Modal } from 'react-responsive-modal';
import Swal from 'sweetalert2';
export class Editprofile extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      is_loading: true,
      submit_buttonLoading: false,
      shop_name: '',
      email: '',
      website: '',
      description: '',
      whatsapp: '',
      name: '',
      contact: '',
      subscription_expire: '',
      data: [],
      images: [],
      image_button_loading: false,
      profile_pic: '',
      business_contact: '',
      fssai_number: '',
      address:'',
      open: false,
      add_franchise_name: '',
      add_franchise_address: '',
      add_franchise_contact: '',
      add_franchise_royalty: '',
      add_franchise_email: '',
      add_franchise_gst: '',
      add_franchise_tenure_from: '',
      add_franchise_tenure_to: '',
      add_business_name: '',
      buttonLoader: false,
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.get_vendor_profile();
  }

  addFranchise = () => {
    const GSTREGEX =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    // Check if GST number is provided and validate it
    if (
      this.state.add_franchise_gst &&
      !GSTREGEX.test(this.state.add_franchise_gst)
    ) {
      toast.error('Please enter a valid GST number');
      return;
    }
    if (
      this.state.add_franchise_name == '' ||
      this.state.add_franchise_address == '' ||
      this.state.add_franchise_contact == '' ||
      this.state.add_franchise_royalty == '' ||
      this.state.add_franchise_email == ''
    ) {
      toast.error('Please fill all the fields');
      return;
    }
    this.setState({
      buttonLoader: true,
    });

    fetch(api + 'add_franchise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        name: this.state.add_franchise_name,
        email: this.state.add_franchise_email,
        contact: this.state.add_franchise_contact,
        royalty_charge: this.state.add_franchise_royalty,
        business_name: this.state.add_business_name,
        gstin: this.state.add_franchise_gst,
        address: this.state.add_franchise_address,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success('franchise Added Successfully');
          this.setState({
            buttonLoader: false,
            open: false,
          });
        } else {
          toast.error(json.error);
          this.setState({
            subscription_end: '',
            start_date: '',
            payment_method: '',

            amount: '',
            payment_through: '',
            tenure: '',
            payment_received: '',
            transaction_id: '',
          });
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({
          add_modal: false,
          buttonLoader: false,
        });
        this.get_franchise();
      });
  };

  get_vendor_profile = () => {
    fetch(api + 'get_vendor_profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          this.setState({
            name: json.data[0].name,
            shop_name: json.data[0].shop_name,
            email: json.data[0].email,
            website: json.data[0].website,
            description: json.data[0].description,
            whatsapp: json.data[0].whatsapp,
            contact: json.data[0].contact,
            data: json.data[0],
            subscription_expire: json.data[0].subscription_expire,
            profile_pic: json.data[0].profile_pic,
            business_contact: json.data[0].business_contact,
            fssai_number: json.data[0].fssai_number,
            address: json.data[0].address
          });
        } else {
          toast.error(json.message);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        this.setState({ is_loading: false });
      });
  };

  save = () => {
    if (this.state.name == '') {
      toast.error('Name Cannot be Empty');
    } else if (this.state.shop_name == '') {
      toast.error('Shop Name Cannot be Empty');
    } else if (this.state.email == '') {
      toast.error('Email Cannot be Empty');
    } else {
      this.setState({ submit_buttonLoading: true });
      fetch(api + 'update_profile_vendor', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: this.context.token,
        },
        body: JSON.stringify({
          email: this.state.email,
          shop_name: this.state.shop_name,
          website: this.state.website,
          description: this.state.description,
          whatsapp: this.state.whatsapp,
          name: this.state.name,
          business_contact: this.state.business_contact,
          fssai_number: this.state.fssai_number,
          address: this.state.address
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (!json.status) {
            toast.error(json.errors[0]);
          } else {
            toast.success(json.msg);

            this.context.get_vendor_profile(this.context.token);
          }
          return json;
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.setState({ submit_buttonLoading: false });
        });
    }
  };

  uploadImage = async (e) => {
    let image = this.state.images;
    image.push(e.target.files[0]);
    this.setState({ images: image, profile_pic: '' });
  };

  upload_image = () => {
    this.setState({ image_button_loading: true });
    let form = new FormData();
    for (let i = 0; i < this.state.images.length; i++) {
      form.append('update_profile_picture', this.state.images[i]);
    }
    fetch(api + 'update_profile_picture_vendor', {
      method: 'POST',
      body: form,
      headers: {
        Authorization: this.context.token,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.status) {
          toast.success('Store Logo uploaded!');
          // this.setState({ profile_pic: json.profile_pic });
        }
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        this.setState({ image_button_loading: false });
      });
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Edit Profile</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Profile</h4>
                </div>

                <div className="page-btn d-flex align-items-center">
                  <button
                    className="btn btn-added me-2"
                    onClick={() => {
                      this.setState({ open: true });
                    }}
                  >
                    Add New Store
                  </button>
                  <Link to="/subscription">
                    <button className="btn btn-secondary btn-sm">
                      Subscription Expires in :{' '}
                      {this.context.user.subscription_expire} Day
                      {this.context.user.subscription_expire > 1 ? 's' : ''}
                    </button>
                  </Link>
                </div>
              </div>

              <Topnav array="setup" />

              {this.state.is_loading ? (
                <Loader />
              ) : (
                <>
                  <div
                    className="dashboard-status-card flex-column"
                    style={{
                      padding: '20px',
                    }}
                  >
                    <div className="row">
                      <div className="col-lg-12 col-sm-12">
                        <div className="page-header">
                          <div className="page-title">
                            <h4>Store logo</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-2">
                        <div className="form-group m-0">
                          <div
                            className="image-upload mb-0"
                            // style={{
                            //   width: 'max-content',
                            // }}
                          >
                            <>
                              <label for="file-input">
                                <i className="iconly-Edit-Square edit-image-product"></i>
                              </label>
                              <input
                                type="file"
                                id="file-input"
                                onChange={(e) => {
                                  this.uploadImage(e);
                                }}
                                accept=".png, .jpg, .jpeg, .svg, .webp"
                                style={{ display: 'none' }}
                                className="upload"
                              />
                            </>

                            {this.state.profile_pic != '' ? (
                              <img
                                id="target"
                                src={this.state.profile_pic}
                                // style={{
                                //   width: '96px',
                                //   height: '96px',
                                // }}
                              />
                            ) : (
                              <></>
                            )}

                            {this.state.images.length > 0 && (
                              <img
                                id="target"
                                src={URL.createObjectURL(
                                  this.state.images[
                                    this.state.images.length - 1
                                  ]
                                )}
                                // style={{
                                //   width: '96px',
                                //   height: '96px',
                                // }}
                                alt="img"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-10 d-flex align-items-center justify-content-start">
                        {this.state.image_button_loading ? (
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
                            Please Wait...
                          </button>
                        ) : (
                          <a
                            onClick={() => {
                              this.upload_image();
                            }}
                            className="btn btn-secondary btn-sm me-2"
                          >
                            Update Store Logo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-lg-12 col-sm-12">
                          <div className="page-header">
                            <div className="page-title">
                              <h4>Edit Profile</h4>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Name</label>
                            <input
                              type="text"
                              placeholder="Name"
                              value={this.state.name}
                              onChange={(e) => {
                                this.setState({
                                  name: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Shop Name</label>
                            <input
                              type="text"
                              placeholder="Shop Name"
                              value={this.state.shop_name}
                              onChange={(e) => {
                                this.setState({
                                  shop_name: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Contact</label>
                            <input
                              type="text"
                              placeholder="Contact"
                              value={this.state.contact}
                              disabled
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Email Address(Optional)</label>
                            <input
                              type="email"
                              placeholder="example@example.com"
                              value={this.state.email}
                              onChange={(e) => {
                                this.setState({
                                  email: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Website (Optional)</label>
                            <input
                              type="text"
                              placeholder="https://example.com"
                              value={this.state.website}
                              onChange={(e) => {
                                this.setState({
                                  website: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Shop Description</label>
                            <input
                              type="text"
                              placeholder="Description"
                              value={this.state.description}
                              onChange={(e) => {
                                this.setState({
                                  description: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Whatsapp Number</label>
                            <input
                              type="text"
                              placeholder="Whatsapp Number"
                              value={this.state.whatsapp}
                              onChange={(e) => {
                                this.setState({
                                  whatsapp: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Business Contact(Optional)</label>
                            <input
                              type="text"
                              placeholder="Business Contact"
                              maxLength="10"
                              value={this.state.business_contact}
                              onChange={(e) => {
                                this.setState({
                                  business_contact: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Fssai Number</label>
                            <input
                              type="text"
                              placeholder="Fssai Number"
                              maxLength="15"
                              value={this.state.fssai_number}
                              onChange={(e) => {
                                this.setState({
                                  fssai_number: e.target.value,
                                });
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-lg-6 col-sm-12">
                          <div className="form-group">
                            <label>Store ID</label>
                            <input
                              type="text"
                              placeholder="Fssai Number"
                              maxLength="15"
                              value={this.state.data.vendor_uu_id}
                              readOnly
                            />
                          </div>
                        </div>

                      
                          <>
                            <div className="col-lg-6 col-sm-12">
                              <div className="form-group">
                                <label>
                                  Address{' '}
                                  <span
                                    className="text-muted"
                                    style={{
                                      fontSize: '12px',
                                    }}
                                  >
                                    
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Address"
                                  value={this.state.data.address}
                                  onChange={(e) => {
                                    this.setState({
                                      address: e.target.value,
                                    });
                                  }}
                             
                                />
                              </div>
                            </div>
                          </>
                       
                        <div className="col-12 d-flex align-items-center justify-content-end">
                          {this.state.submit_buttonLoading ? (
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
                              Please Wait
                            </button>
                          ) : (
                            <a
                              onClick={() => {
                                this.save();
                              }}
                              className="btn btn-secondary btn-sm me-2"
                            >
                              Submit
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
                  <h4>Add New Store</h4>
                </div>
              </div>

              <div className="row">
                {/* <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Select Parents <span className="text-danger">*</span>
                    </label>

                    <SelectPicker
                      style={{ width: "100%" }}
                      data={parent_list}
                      onChange={(e) => {
                        this.setState({ vendor_uu_id: e });
                      }}
                    />

                <input
                    type="text"
                    className="form-control"
                    value={this.state.add_franchise_name}
                    onChange={(e) => {
                      this.setState({
                        add_franchise_name: e.target.value,
                      });
                    }}
                    placeholder="Enter Franchise Name"
                  />
                  </div>
                </div> */}

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Store Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.add_franchise_name}
                      onChange={(e) => {
                        this.setState({
                          add_franchise_name: e.target.value,
                        });
                      }}
                      placeholder="Enter Franchise Name"
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Store Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.add_franchise_email}
                      onChange={(e) => {
                        this.setState({ add_franchise_email: e.target.value });
                      }}
                      placeholder="Enter Franchise Email"
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Store Contact <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      maxLength="10"
                      value={this.state.add_franchise_contact}
                      onChange={(e) => {
                        this.setState({
                          add_franchise_contact: e.target.value,
                        });
                      }}
                      placeholder="Enter Franchise Contact"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Royalty Charge
                      <small className="text-muted">(in Percentage)</small>{' '}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.add_franchise_royalty}
                      onChange={(e) => {
                        this.setState({
                          add_franchise_royalty: e.target.value,
                        });
                      }}
                      placeholder="Enter Royalty Charge"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Business Name
                      {/* <span className="text-danger">*</span> */}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.add_business_name}
                      onChange={(e) => {
                        this.setState({
                          add_business_name: e.target.value,
                        });
                      }}
                      placeholder="Enter Business"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>G.S.T. Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.add_franchise_gst}
                      onChange={(e) => {
                        this.setState({ add_franchise_gst: e.target.value });
                      }}
                      placeholder="Enter G.S.T. Number"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Franchise Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={this.state.add_franchise_address}
                      onChange={(e) => {
                        this.setState({
                          add_franchise_address: e.target.value,
                        });
                      }}
                      placeholder="Enter Franchise Address"
                    />
                  </div>
                </div>

                <div className="col-lg-12 d-flex justify-content-end">
                  {this.state.buttonLoader ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      disabled
                      id="add-btn"
                    >
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Loading...
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: 'Are you sure?',
                          text: "You won't be able to revert this!",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Yes, update it!',
                        }).then((result) => {
                          if (result.isConfirmed) {
                            this.addFranchise();
                          }
                        });
                      }}
                      className="btn btn-sm btn-secondary"
                      id="add-btn"
                    >
                      Add Franchise
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </>
    );
  }
}

export default Editprofile;
