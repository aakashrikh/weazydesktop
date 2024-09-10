import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';
import Loader from '../othercomponent/Loader';
import Topnav from '../othercomponent/Topnav';

export class Uploadcover extends Component {
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
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.get_vendor_profile();
  }

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
          <title>Cover Pictures</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Upload Cover Pictures</h4>
                </div>
              </div>

              <Topnav array="setup" />

              {this.state.is_loading ? (
                <Loader />
              ) : (
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
                          style={{
                            width: 'max-content',
                          }}
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
                              style={{
                                width: '96px',
                                height: '96px',
                              }}
                            />
                          ) : (
                            <></>
                          )}

                          {this.state.images.length > 0 && (
                            <img
                              id="target"
                              src={URL.createObjectURL(
                                this.state.images[this.state.images.length - 1]
                              )}
                              style={{
                                width: '96px',
                                height: '96px',
                              }}
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
                          Update Photo
                        </a>
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

export default Uploadcover;
