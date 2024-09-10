import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import theme1 from '../assets/images/postheme/theme1.png';
import theme2 from '../assets/images/postheme/theme2.png';
import Header from '../othercomponent/Header';
import Topnav from '../othercomponent/Topnav';

export class Postheme extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      select: false,
      theme: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    this.setState({
      theme: this.context.user.pos_theme_id,
    });
  }

  setTheme = (id) => {
    this.setState({
      theme: id,
    });

    fetch(api + 'update_theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.context.token,
      },
      body: JSON.stringify({
        theme_type: 'pos',
        theme_id: id,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status) {
          this.context.get_vendor_profile(this.context.token);
          toast.success('Theme Updated Successfully');
        } else {
          toast.error('Something went wrong');
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {});
  };

  render() {
    return (
      <>
        <Helmet>
          <title>POS Themes</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>
                    POS Themes
                    <span
                      className="text-muted"
                      style={{
                        fontSize: '14px',
                      }}
                    ></span>
                  </h4>
                </div>
              </div>

              <Topnav array="setup" />

              <div className="row">
                <div className="col-md-6">
                  <div
                    onClick={() => {
                      this.setTheme(1);
                    }}
                    className={
                      this.state.theme == 1 ? 'theme-box active' : 'theme-box'
                    }
                  >
                    <img src={theme1} className="img-fluid" />
                    <div
                      className=""
                      style={{
                        backgroundColor: '#000',
                        padding: '10px',
                        color: '#fff',
                        borderRadius: '8px',
                      }}
                    >
                      <h6>
                        {this.state.theme == 1 ? 'Active: ' : ''}
                        Positive Vibes
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div
                    onClick={() => {
                      this.setTheme(2);
                    }}
                    className={
                      this.state.theme == 2 ? 'theme-box active' : 'theme-box'
                    }
                  >
                    <img src={theme2} className="img-fluid" />
                    <div
                      className=""
                      style={{
                        backgroundColor: '#000',
                        padding: '10px',
                        color: '#fff',
                        borderRadius: '8px',
                      }}
                    >
                      <h6>
                        {this.state.theme == 2 ? 'Active: ' : ''}
                        Rise and Shine
                      </h6>
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

export default Postheme;
