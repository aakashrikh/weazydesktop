import React, { Component } from 'react';
import Modal from 'react-responsive-modal';
import { AuthContext } from '../AuthContextProvider';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { api } from '../../config';

export class ImportCustomers extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      button_loading: false,
      file: null,
    };
  }

  componentDidMount() {
    this.setState({ open: this.props.open });
  }

  import_customer = () => {
    //sweet alert for confirmation
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to import customers?',
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
        fetch(api + 'import_users_from_csv', {
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

            this.setState({ button_loading: false });

            return json;
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {});
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
              <h4>Import Customers</h4>
            </div>
          </div>
          <div className="import-customer-page">
            <div className="import-customers-row-divs">
              <div className="import-customer-steps">
                <div className="step-1">
                  <div>
                    <h6>Step 1</h6>
                    <h4>Download Import Template</h4>
                    <p>
                      Only <span>mobile number</span> is mandatory
                    </p>
                    <p>All the other fields are optional</p>
                  </div>
                  <a
                    href="Import_user_csv.csv"
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
                        Remove duplicate, incorrect, Zomato/ Swiggy virtual
                        numbers
                      </li>
                      <li>
                        Make sure your birthday and anniversary are in format:
                        YYYY-MM-DD
                      </li>
                      <li>
                        Imported customers that haven’t visited will be a part
                        of the imported segment
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

export default ImportCustomers;
