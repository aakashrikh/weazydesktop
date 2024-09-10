import React, { Component } from 'react';
import Modal from 'react-responsive-modal';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';

export class ImportProducts extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      button_loading: false,
      file: null,
      download_loading: false
    };
  }

  componentDidMount() {
    this.setState({ open: this.props.open });
  }

  download_products = () => {
this.setState({download_loading: true});
    fetch(api + 'download_product_update_billing', {
      method: 'POST',
          headers: {
            Authorization: this.context.token,
          },
    })
      .then((respose) => respose.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'products.csv');
        document.body.appendChild(link);
        link.click();
        this.setState({download_loading: false});
      });
  };
  
  import_customer = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to import Products?',
      showCancelButton: true,
      confirmButtonColor: '#0066b2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, import it!',
    }).then((result) => {
      if (result.isConfirmed) {
        //create form data
        const formData = new FormData();
        formData.append('csv', this.state.file);

        this.setState({ button_loading: true });
        fetch(api + 'bulk_product_update_billing', {
          method: 'POST',
          headers: {
            Authorization: this.context.token,
          },
          body: formData,
        })
          .then((response) => response.json())
          .then((json) => {
            if (!json.status) {
              toast.error(json.msg);
            } else {
              toast.success(json.msg);
              this.props.fetch_order();
              this.props.close();
            }

            return json;
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            this.setState({ button_loading: false });
          });
      }
    });
  };

  render() {
    return (
      <Modal
        focusTrapped={false}
        open={this.props.open}
        onClose={() => this.props.close()}
        center
        classNames={{
          modal: 'customModal',
        }}
      >
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>Import Products</h4>
            </div>
          </div>
          <div className="import-customer-page">
            <div className="import-customers-row-divs">
              <div className="import-customer-steps">
                <div className="step-1">
                  <div>
                    <h6>Step 1</h6>
                    <h4>Download Import Template</h4>
                  </div>
                {this.state.download_loading ? (
                  <button
                    className="btn btn-secondary btn-sm w-120"
                    disabled
                  >
                    <i
                      className="fa-regular fa-circle-down"
                      style={{
                        fontSize: 18,
                        marginRight: 10,
                      }}
                    ></i>
                    Downloading
                  </button>
                ) : (
                  <a
                    onClick={() => this.download_products()}
                    download
                    className="btn btn-secondary btn-sm w-120"
                  >
                    <i
                      className="fa-regular fa-circle-down"
                      style={{
                        fontSize: 18,
                        marginRight: 10,
                      }}
                    ></i>
                    Download
                  </a>
                )}
                </div>
                <div className="step-2">
                  <div className="step-2-header">
                    <div>
                      <h6>Step 2</h6>
                      <h4>Upload your file here</h4>
                    </div>

                    {this.state.button_loading ? (
                      <button
                        className="btn btn-secondary btn-sm w-120"
                        disabled
                      >
                        <i
                          className="fa-regular fa-circle-up"
                          style={{
                            fontSize: 18,
                            marginRight: 10,
                          }}
                        ></i>
                        Uploading
                      </button>
                    ) : (
                      <>
                        <input
                          type="file"
                          name="file"
                          id="file"
                          className="inputfile"
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            this.setState({ file: e.target.files[0] });
                            this.import_customer();
                          }}
                        />
                        <label
                          htmlFor="file"
                          className="btn btn-secondary btn-sm w-120"
                        >
                          <i
                            className="fa-regular fa-circle-up"
                            style={{
                              fontSize: 18,
                              marginRight: 10,
                            }}
                          ></i>
                          Upload
                        </label>
                      </>
                    )}
                  </div>
                  <div className="step-2-body">
                    <h4>Before you upload</h4>
                    <ul>
                      <li>
                        Make sure the file is in CSV format and all fields are
                        required
                      </li>
                      <li>
                        The is_veg field must be [0 / 1] (0 for non-veg, 1 for
                        veg)
                      </li>
                      <li>
                        The product image field must be a valid image URL
                        <br />
                        (eg. https://dine-cdn.weazy.in/products/1662527000.jpg)
                      </li>
                      <li>
                        The product type field must be [product / package] (
                        product for products, package for combos/package )
                      </li>
                      <li>
                        The variant field must be variant name and variant price{' '}
                        <br />
                        (eg.
                        [variant1:half],[variant_price1:100],[variant2:full],[variant_price2:200]...and
                        so on). Note: Variants can be left blank if there are no
                        variants and also variants can be unlimited.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default ImportProducts;
