import { Component } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate, useParams,Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import logo from '../assets/images/logos/main_logo_black2.png';
import welcome from '../assets/images/welcome.svg';

class LoginPassword extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      otp: '',
      otpButton: false,
      heading: 'Log in (Password)',
      subheading: 'Continue to WeazyDine Dashboard',
      sendotploading: false,
      verifyotploading: false,
      password: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  }

  login = async  () => {
    var phoneNumber = this.state.phoneNumber;
    let rjx = /^[0]?[6789]\d{9}$/;
    let isValid = rjx.test(phoneNumber);
    if (!isValid) {
      toast.error('Enter Valid mobile number!');
    } else if (this.state.password == '') {
      toast.error('Enter Password!');
    } else {
      this.setState({ sendotploading: true });
      const response = await  fetch(api + 'loginpassword', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: this.state.phoneNumber,
          passcode: this.state.password,
          secret: 'ggMjF4waGewcI*7#3F06',
        }),
      });

      try{
        const json = await response.json();
      
        if (json.status) {
          toast.success('Password verified successfully');
          let data; 
          if (json.user_type == 'login') {
            var steps = 'done';
            data = {
              token: json.token,
              vendor_id: json.usr,
              step: 'done',
            };
          
          } else {
            var steps = 'steps';
            data = {
              token: json.token,
              vendor_id: json.usr,
              step: 'steps',
            };
           
          }

            json.data.token=json.token;

            if(this.context.isElectron())
            {
              const response = await window.electron.saveCredentials('AUTHMAIN', json.data);
              if (response.status === 'success') {
                // alert('Credentials saved successfully!');
                } else {
                 console.log(response.error);
               }
            }
            else
            {
              localStorage.setItem('@auth_login', JSON.stringify(data));
            }

          //redirect to dashboard
          window.location.href = '/';
        } else {
          toast.error(json.msg);
          this.setState({
            otp: '',
          });
        }
      }
      catch(error)  {
        console.error(error);
      }
      finally {
        this.setState({ sendotploading: false });
      }
    }
  };

  render() {
    return (
      <>
        <Helmet>
          <title>Login</title>
        </Helmet>
        <div className="main-wrapper">
          <div className="account-content">
            <div className="login-wrapper loginpassword">
           
              <div className="login-content">
                <div className="login-userset">
                  <div className="login-logo">
                    <img
                      src={logo}
                      alt="img"
                      style={{
                        maxWidth: '60%',
                        margin: '20px auto 10px',
                      }}
                    />
                  </div>
                  <div className="top-welcome-card">
                    <img
                      src={welcome}
                      alt="img"
                      style={{ width: 90, height: 90, marginTop: '-10px' }}
                    />
                    <div>
                      <h6
                        className="sb-typography sb-typography--heading-lg sb-typography--semibold "
                        style={{ fontSize: '16px' }}
                      >
                        Welcome! <br />
                        This is a Login Password Module
                        <br />
                        <small style={{ fontSize: '12px' }}>
                          Continue to WeazyDine Dashboard
                        </small>
                      </h6>
                    </div>
                  </div>
                  <div className="form-login">
                    <label>Mobile Number</label>
                    <div className="form-addons">
                      <input
                        type="tel"
                        placeholder="Enter your mobile number"
                        maxLength={10}
                        value={this.state.phoneNumber}
                        onChange={(e) =>
                          this.setState({
                            phoneNumber: e.target.value,
                          })
                        }
                      />
                      <img
                        src="https://img.icons8.com/ios/50/000000/phone.png"
                        alt="img"
                        style={{
                          width: '20px',
                          height: '20px',
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-login">
                    <label>Password</label>
                    <div className="form-addons mb-3">
                      <input
                        type="password"
                        placeholder="Enter Password"
                        value={this.state.password}
                        onChange={(e) =>
                          this.setState({
                            password: e.target.value,
                          })
                        }

                      />
                      <img
                        src="https://img.icons8.com/ios/50/000000/password.png"
                        alt="img"
                        style={{
                          width: '20px',
                          height: '20px',
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-login">
                    {this.state.sendotploading ? (
                      <button className="btn btn-login" disabled="">
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Continue
                      </button>
                    ) : (
                      <div
                        className="btn btn-login"
                        onClick={() => {
                          this.login();
                        }}
                      >
                        Continue
                      </div>
                    )}
                  </div>

                  <Link to="/login">
                   <br/> <p
                      className="forgot-password"
                      style={{ cursor: 'pointer',fontWeight:'500',textAlign:'center',color:'#0066b2' }}
                    >
                     Login with OTP instead
                    </p>
                  </Link>
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
    <LoginPassword
      {...props}
      {...useParams()}
      navigate={abcd}
      location={location}
    />
  );
}

export default (props) => <Navigate {...props} />;
