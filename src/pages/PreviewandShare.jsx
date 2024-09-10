import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { api } from '../../config';
import { AuthContext } from '../AuthContextProvider';
import Header from '../othercomponent/Header';

export class PreviewandShare extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      remove_last_slash_and_word: '',
      img_url: '',
    };
  }

  componentDidMount() {
    window.setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
    var remove_last_slash_and_word = api
      .split('/')
      .slice(0, -2)
      .join('/')
      .concat('/');

    this.setState({
      img_url:
        remove_last_slash_and_word +
        'loyalty-img/' +
        this.context.user.vendor_uu_id,
    });
  }
  render() {
    return (
      <>
        <Helmet>
          <title>Preview & Share</title>
        </Helmet>
        <div className="main-wrapper">
          <Header sidebar={true} />
          <div className="page-wrapper">
            <div className="content">
              <div className="page-header">
                <div className="page-title">
                  <h4>Preview & Share </h4>
                </div>
              </div>
              <div className="row">
                <div
                  className="col-md-12 pb-2 mb-3 mt-3 "
                  style={{ borderBottom: '1px solid #ececec' }}
                >
                  <Link to="/loyalty" className="new-tabs-for-page-top ">
                    Overview
                  </Link>
                  <Link
                    to="/loyaltyprogramsetup"
                    className="new-tabs-for-page-top "
                  >
                    Setup Loyalty
                  </Link>

                  <Link
                    to="/previewandshare"
                    className="new-tabs-for-page-top active"
                  >
                    Preview & Share
                  </Link>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <img
                    src={this.state.img_url}
                    alt="image"
                    className="loyalty-image"
                  />
                </div>
                <div className="col-md-8">
                  <div className="card">
                    <div className="card-body">
                      <h4 className="card-title">Preview & Share</h4>
                      <p className="card-text">
                        Share your loyalty program with your customers and get
                        them to join your program.
                      </p>
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

export default PreviewandShare;
