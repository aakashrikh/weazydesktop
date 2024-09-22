import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import React, { Component } from 'react';
import OneSignal from 'react-onesignal';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  BrowserRouter as Router,
} from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { api, pusher } from '../config.js';
import { getOS } from '../os.js';
import { AuthContext } from './AuthContextProvider';
import { CheckLogin } from './CheckLogin.jsx';
import { RequireAuth } from './RequireAuth';
import loader from './assets/images/logos/main_logo_black.png';
import Activity from './pages/Activity.jsx';
import AddAddonGroup from './pages/AddAddonGroup.jsx';
import AddStockPurchase from './pages/AddStockPurchase.jsx';
import Addproduct from './pages/Addproduct.jsx';
import Addsemifinishedrawmaterialproducts from './pages/Addsemifinishedrawmaterialproducts.jsx';
import Categorylist from './pages/Categorylist.jsx';
import Categoryreport from './pages/Categoryreport.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import CompanyStockPurchase from './pages/CompanyStockPurchase.jsx';
import CustomerCategory from './pages/CustomerCategory.jsx';
import Customers from './pages/Customers.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DataTable from './pages/DataTable.jsx';
import DineinList from './pages/DineinList.jsx';
import EditStockPurchase from './pages/EditStockPurchase.jsx';
import Editproduct from './pages/Editproduct.jsx';
import Editprofile from './pages/Editprofile.jsx';
import Editsemifinishedrawmaterialproducts from './pages/Editsemifinishedrawmaterialproducts.jsx';
import Insights from './pages/Insights.jsx';
import Inventorycategory from './pages/Inventorycategory.jsx';
import Inventoryledger from './pages/Inventoryledger.jsx';
import Inventoryproducts from './pages/Inventoryproducts.jsx';
import ItemOrders from './pages/ItemOrders.jsx';
import KitchenProducts from './pages/KitchenProducts.jsx';
import Kitchens from './pages/Kitchens.jsx';
import Kot from './pages/Kot.jsx';
import Login from './pages/Login.jsx';
import Logout from './pages/Logout.jsx';
import Myreport from './pages/Myreport.jsx';
import Newtableorder from './pages/Newtableorder.jsx';
import NotAvailable from './pages/NotAvailable.jsx';
import Orderdetails from './pages/Orderdetails.jsx';
import Orderinvoices from './pages/Orderinvoices.jsx';
import Orderlist from './pages/Orderlist.jsx';
import OurServices from './pages/OurServices.jsx';
import Pagenotfound from './pages/Pagenotfound.jsx';
import PerUserOrder from './pages/PerUserOrder.jsx';
import Pickuppoint from './pages/Pickuppoint.jsx';
import Pos from './pages/Pos.jsx';
import Postheme from './pages/Postheme.jsx';
import Print from './pages/Print.jsx';
import ProductAddons from './pages/ProductAddons.jsx';
import ProductRecipe from './pages/ProductRecipe.jsx';
import Productdetails from './pages/Productdetails.jsx';
import Productlist from './pages/Productlist.jsx';
import Productreport from './pages/Productreport.jsx';
import ReleaseStock from './pages/ReleaseStock.jsx';
import Reservation from './pages/Reservation.jsx';
import Roomlist from './pages/Roomlist.jsx';
import Salesreport from './pages/Salesreport.jsx';
import Semifinishedrawmaterialproducts from './pages/Semifinishedrawmaterialproducts.jsx';
import Semifinishedrawmaterialproductsdetails from './pages/Semifinishedrawmaterialproductsdetails.jsx';
import Staffaccounts from './pages/Staffaccounts.jsx';
import StockPurchase from './pages/StockPurchase.jsx';
import Subscription from './pages/Subscription.jsx';
import Suppliers from './pages/Suppliers.jsx';
import Transactionreport from './pages/Transactionreport.jsx';
import Closingreport from './pages/Closingreport.jsx';
import Discountreport from './pages/Discountreport.jsx';
import Cancellationreport from './pages/Cancellationreport.jsx';
import UpdateProductRecipe from './pages/UpdateProductRecipe.jsx';
import Updategst from './pages/Updategst.jsx';
import Updatetiming from './pages/Updatetiming.jsx';
import Uploadcover from './pages/Uploadcover.jsx';
import ViewRoom from './pages/ViewRoom.jsx';
import ViewStockPurchase from './pages/ViewStockPurchase.jsx';
import ViewTableOrder from './pages/ViewTableOrder.jsx';
import Invoice from './pages/Invoice.jsx';
import PurchaseReceive from './pages/PurchaseReceive.jsx';
import InventoryReport from './pages/InventoryReport.jsx';
import LoginPassword from './pages/LoginPassword.jsx';
import StaffLogReport from './pages/StaffLogReport.jsx';
import TransactionNumber from './pages/TransactionNumber.jsx';
import Expense from './pages/Expense.jsx';
import StockAdjustment from './pages/StockAdjustment.jsx';
import Updateprices from './pages/Updateprices.jsx';
OneSignal.init({ appId: '49e49fa7-d31e-42d9-b1d5-536c4d3758cc' });

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      is_login: true,
      loading: true,
      user: [],
      play: false,
      login_data: [],
      step: 'steps',
      subscription_expire: false,
      width: window.innerWidth,
      products: [],
      category: [],
      is_enterprise:false
    };
  }

  isElectron = () =>
    {
      const isElectron = (typeof window.process === 'object' && window.process.versions && window.process.versions.electron) ||
      (typeof window.require === 'function') || /Electron/.test(window.navigator.userAgent);
  
      return isElectron;
    }

    async  componentDidMount() {
    
      let token=null;
  let items = null;
      if(this.isElectron())
        {
          const response = await window.electron.getCredentials('AUTHMAIN');
          
          if (response.status === 'success') {
            token=response.credentials.token;
          } else {
            this.logout();
          }
  
        }
        else
        {
          items = JSON.parse(localStorage.getItem('@auth_login'));
            if(items == null )
            {
              this.logout();
            }
            else
            {
              token=items.token;
            }
        }
  
      //  const items = JSON.parse(localStorage.getItem('@auth_login'));
        if (token != null) {
          this.fetchProducts(0, [], 'all', 1, token);
          this.fetchCategories('sort_order',token);
          this.get_profile(token);
        } else {
          this.logout();
        }
  
  
        window.addEventListener('resize', this.handleWindowSizeChange);
        if (this.state.width <= 768) {
          this.props.navigate('/not-available');
        } else {
          const path = this.props.location.pathname;
          this.props.navigate(path, { replace: true });
        }
        getOS();
      }

  fetchProducts = (category_id, products, type, page, token) => {
    this.setState({ load_item: true });
    fetch(api + 'vendor_get_vendor_product', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        vendor_category_id: category_id,
        product_type: type,
        page: page,
        status: 'active',
        sort_by: this.state.sort_by,
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
          if (json.data.data.length > 0) {
            this.setState({ products: json.data.data });
          }
        }
        this.setState({ load_item: false, isloading: false });
        return json;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {});
  };

  fetchCategories = (sort_by, token) => {
    fetch(api + 'fetch_vendor_category', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        sort_by: sort_by,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (!json.status) {
        } else {
          this.setState({ category: json.data });
        }
        this.setState({ load_item: false, isloading: false });
        return json;
      })
      .catch((error) => console.error(error))
      .finally(() => {});
  };

  handleWindowSizeChange = () => {
    this.setState({
      width: window.innerWidth,
    });
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  login = (step, user, role, token) => {
    this.setState({
      is_login: true,
      step: step,
      user: user,
      token: token,
      loading: false,
      login_data: role,
    });

    OneSignal.sendTag('id', '' + user.id);
    OneSignal.sendTag('account_type', 'vendor-bmguj1sfd77232927ns');

    window.Pusher = Pusher;
    window.Echo = new Echo({
      broadcaster: 'pusher',
      key: pusher,
      // wsHost: '3.109.105.185',
      // wsHost: 'websockets.webixun.com',
      // wsPort: 1337,
      cluster: 'ap2',
      forceTLS: true,
      disableStats: true,
      authEndpoint: api + 'broadcasting/auth',
      auth: {
        headers: {
          Accept: 'application/json',
          Authorization: token,
        },
      },
    });

    window.Echo.private(`NotificationChannel.` + user.id).listen(
      '.notification.created',
      (e) => {
        toast.success(e.orders.msg.title, {
          position: 'top-right',
          toastId: 'success1',
        });

        var sound = new Howl({
          src: ['notification.mp3'],
          html5: true,
        });
        sound.play();
        Dashboard.orderupdate(e.orders.msg.title);
      }
    );
  };

  get_profile = (token) => {
    fetch(api + 'get_vendor_profile', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.message === 'Unauthenticated.') {
          this.logout();
        }
        if (!json.status) {
          this.logout();
        } else {
          this.login(json.step, json.data[0], json.user, token);
          if(json.user.stores.length > 1 && json.data[0].parent_id == 0){
            this.setState({is_enterprise:true})
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

  logout = async () => {
    this.setState({
      is_login: false,
      loading: false,
      token: '',
      user: [],
      login_data: [],
    });

    if(this.isElectron())
    {
        const response = await window.electron.deleteCredentials('AUTHMAIN');
        if (response.status === 'success') {
         
        } else {
          console.log(response.error);
        }
    }
    else
    {
      localStorage.clear();
    }
   
  };


  render() {
    return this.state.loading ? (
      <div className="preloader">
        <img src={loader} alt="img" />
        <span className="loader-70" />
      </div>
    ) : this.state.width <= 768 ? (
      <Routes>
        <Route path="*" element={<NotAvailable />} />
      </Routes>
    ) : (
      <>
        <AuthContext.Provider
          value={{
            login: this.login,
            logout: this.logout,
            is_login: this.state.is_login,
            token: this.state.token,
            user: this.state.user,
            role: this.state.login_data,
            get_vendor_profile: this.get_profile,
            step: this.state.step,
            products: this.state.products,
            category: this.state.category,
            isElectron:this.isElectron,
            is_enterprise:this.state.is_enterprise
          }}
        >
          <Routes>
            <Route
              exact
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/insights"
              element={
                <RequireAuth>
                  <Insights />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/pos"
              element={
                <RequireAuth>
                  <Pos />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/pos/:table_id"
              element={
                <RequireAuth>
                  <Pos />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/pos/new/:order_code"
              element={
                <RequireAuth>
                  <Pos />
                </RequireAuth>
              }
            />
            
            <Route
              exact
              path="/expense"
              element={
                <RequireAuth>
                  <Expense />
                </RequireAuth>
              }
              />

            <Route
              exact
              path="/kot"
              element={
                <RequireAuth>
                  <Kot />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/productlist"
              element={
                <RequireAuth>
                  <Productlist />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/categorylist"
              element={
                <RequireAuth>
                  <Categorylist />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/addproduct"
              element={
                <RequireAuth>
                  <Addproduct />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/orderlist"
              element={
                <RequireAuth>
                  <Orderlist />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/PurchaseReceive"
              element={
                <RequireAuth>
                  <PurchaseReceive />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/orderlist/:type"
              element={
                <RequireAuth>
                  <Orderlist />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/orderdetails/:id"
              element={
                <RequireAuth>
                  <Orderdetails />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/viewtableorder/:id"
              element={
                <RequireAuth>
                  <ViewTableOrder />
                </RequireAuth>
              }
            />{' '}
            <Route
              exact
              path="/productdetails/:id"
              element={
                <RequireAuth>
                  <Productdetails />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/editproduct/:id"
              element={
                <RequireAuth>
                  <Editproduct />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/editprofile"
              element={
                <RequireAuth>
                  <Editprofile />
                </RequireAuth>
              }
            />

<Route
              exact
              path="/Updateprices"
              element={
                <RequireAuth>
                  <Updateprices />
                </RequireAuth>
              }
            />

            <Route
              exact
              path="/InventoryReport"
              element={
                <RequireAuth>
                  <InventoryReport />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/LogReport"
              element={
                <RequireAuth>
                  <StaffLogReport />
                </RequireAuth>
              }
            />

            <Route
              exact
              path="/discountreport"
              element={
                <RequireAuth>
                  <Discountreport />
                </RequireAuth>
              }
            />
     <Route
              exact
              path="/cancellationreport"
              element={
                <RequireAuth>
                  <Cancellationreport />
                </RequireAuth>
              }
            />

            <Route
              exact
              path="/updategst"
              element={
                <RequireAuth>
                  <Updategst />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/updatetiming"
              element={
                <RequireAuth>
                  <Updatetiming />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/uploadcover"
              element={
                <RequireAuth>
                  <Uploadcover />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/dineinlisting"
              element={
                <RequireAuth>
                  <DineinList />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/inventorycategory"
              element={
                <RequireAuth>
                  <Inventorycategory />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/inventoryproducts"
              element={
                <RequireAuth>
                  <Inventoryproducts />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/inventoryledger/:id"
              element={
                <RequireAuth>
                  <Inventoryledger />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/pickuppoint"
              element={
                <RequireAuth>
                  <Pickuppoint />
                </RequireAuth>
              }
            />

<Route
              exact
              path="/StockAdjustment"
              element={
                <RequireAuth>
                  <StockAdjustment />
                </RequireAuth>
              }
            />


            <Route exact path="/subscription" element={<Subscription />} />
            <Route
              exact
              path="/transactionreport/:property/:range/:from/:to"
              element={
                <RequireAuth>
                  <Transactionreport />
                </RequireAuth>
              }
            />

<Route
              exact
              path="/closingreport/"
              element={
                <RequireAuth>
                  <Closingreport />
                </RequireAuth>
              }
            />


            <Route
              exact
              path="/myreport"
              element={
                <RequireAuth>
                  <Myreport />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/salesreport"
              element={
                <RequireAuth>
                  <Salesreport />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/productreport"
              element={
                <RequireAuth>
                  <Productreport />
                </RequireAuth>
              }
            />

<Route
              exact
              path="/transactionnumber"
              element={
                <RequireAuth>
                  <TransactionNumber />
                </RequireAuth>
              }
            />

            <Route
              exact
              path="/productreport/:category_id/:start/:end"
              element={
                <RequireAuth>
                  <Productreport />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/categoryreport"
              element={
                <RequireAuth>
                  <Categoryreport />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/print/:code/1.pdf"
              element={
                <RequireAuth>
                  <Print />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/stockpurchase"
              element={
                <RequireAuth>
                  <StockPurchase />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/releasestock"
              element={
                <RequireAuth>
                  <ReleaseStock />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/addstockpurchase"
              element={
                <RequireAuth>
                  <AddStockPurchase />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/CompanyStockPurchase"
              element={
                <RequireAuth>
                  <CompanyStockPurchase />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/editstockpurchase/:id"
              element={
                <RequireAuth>
                  <EditStockPurchase />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/viewstockpurchase/:id"
              element={
                <RequireAuth>
                  <ViewStockPurchase />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/kitchens"
              element={
                <RequireAuth>
                  <Kitchens />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/semifinishedrawmaterialproducts"
              element={
                <RequireAuth>
                  <Semifinishedrawmaterialproducts />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/addsemifinishedrawmaterialproducts"
              element={
                <RequireAuth>
                  <Addsemifinishedrawmaterialproducts />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/suppliers"
              element={
                <RequireAuth>
                  <Suppliers />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/customers"
              element={
                <RequireAuth>
                  <Customers />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/customersCategory"
              element={
                <RequireAuth>
                  <CustomerCategory />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/semifinishedrawmaterialproductsdetails/:id"
              element={
                <RequireAuth>
                  <Semifinishedrawmaterialproductsdetails />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/editsemifinishedrawmaterialproducts/:id"
              element={
                <RequireAuth>
                  <Editsemifinishedrawmaterialproducts />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/kitchenproducts/:id"
              element={
                <RequireAuth>
                  <KitchenProducts />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/productrecipe"
              element={
                <RequireAuth>
                  <ProductRecipe />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/updateproductrecipe/:product_id/:variant_id"
              element={
                <RequireAuth>
                  <UpdateProductRecipe />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/comingsoon"
              element={
                <RequireAuth>
                  <ComingSoon />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/productaddons"
              element={
                <RequireAuth>
                  <ProductAddons />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/addaddongroup"
              element={
                <RequireAuth>
                  <AddAddonGroup />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/orderinvoices"
              element={
                <RequireAuth>
                  <Orderinvoices />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/staffaccounts"
              element={
                <RequireAuth>
                  <Staffaccounts />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/newtableorder/:id"
              element={
                <RequireAuth>
                  <Newtableorder />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/peruserorder/:id"
              element={
                <RequireAuth>
                  <PerUserOrder />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/item_orders/:id/:variant/:start/:end"
              element={
                <RequireAuth>
                  <ItemOrders />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/activity"
              element={
                <RequireAuth>
                  <Activity />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/ourservices"
              element={
                <RequireAuth>
                  <OurServices />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/postheme"
              element={
                <RequireAuth>
                  <Postheme />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/invoice"
              element={
                <RequireAuth>
                  <Invoice />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/roomlist"
              element={
                <RequireAuth>
                  <Roomlist />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/reservation"
              element={
                <RequireAuth>
                  <Reservation />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/viewroom"
              element={
                <RequireAuth>
                  <ViewRoom />
                </RequireAuth>
              }
            />
            <Route
              exact
              path="/login"
              element={
                <CheckLogin>
                  <Login />
                </CheckLogin>
              }
            />

        <Route exact path="/loginpassword" element={    <CheckLogin><LoginPassword /></CheckLogin>} />


            <Route path="*" element={<Pagenotfound />} />
            <Route exact path="/logout" element={<Logout />} />
            <Route exact path="/datatable" element={<DataTable />} />
            <Route exact path="/not-available" element={<NotAvailable />} />
         
          </Routes>
        </AuthContext.Provider>
        <Toaster
          position="bottom-left"
          richColors
          toastOptions={{
            style: {
              padding: '16px',
            },
          }}
        />
      </>
    );
  }
}

function Navigate(props) {
  const abcd = useNavigate();
  const location = useLocation();
  return (
    <App {...props} {...useParams()} navigate={abcd} location={location} />
  );
}

export default (props) => <Navigate {...props} />;
