import { Component } from '@angular/core';
import { Facebook } from '@ionic-native/facebook/ngx';
import { Router } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./login.page.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'List',
      url: '/list',
      icon: 'list'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private nativeStorage: NativeStorage,
    private router: Router
  ) {
    this.initializeApp();
  }
  //added login page from https://ionicthemes.com/tutorials/about/ionic-facebook-login
  export class LoginPage {
  FB_APP_ID: number = 2552949628108929;

  constructor(
    public navCtrl: NavController,
    private fb: Facebook,
    private nativeStorage: NativeStorage,
    public loadingController: LoadingController,
    private router: Router,
  ) {
  }

  async doFbLogin(){
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);
    let permissions = new Array<string>();

    //the permissions your facebook app needs from the user
    const permissions = ["public_profile", "email"];

    this.fb.login(permissions)
    .then(response =>{
      let userId = response.authResponse.userID;

      //Getting name and gender properties
      this.fb.api("/me?fields=name,email", permissions)
      .then(user =>{
        user.picture = "https://graph.facebook.com/" + userId + "/picture?type=large";
        //now we have the users info, let's save it in the NativeStorage
        this.nativeStorage.setItem('facebook_user',
        {
          name: user.name,
          email: user.email,
          picture: user.picture
        })
        .then(() =>{
          this.router.navigate(["/user"]);
          loading.dismiss();
        }, error =>{
          console.log(error);
          loading.dismiss();
        })
      })
    }, error =>{
      console.log(error);
      loading.dismiss();
    });
  }

  async presentLoading(loading) {
    return await loading.present();
  }

export class UserPage implements OnInit {

  user: any;
  userReady: boolean = false;

  constructor(
    private fb: Facebook,
    private nativeStorage: NativeStorage,
    public loadingController: LoadingController,
    private router: Router,
  ) {}

  async ngOnInit(){
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.nativeStorage.getItem('facebook_user')
    .then(data =>{
      this.user = {
        name: data.name,
        email: data.email,
        picture: data.picture
      };
        loading.dismiss();
        this.userReady = true;
    }, error =>{
      console.log(error);
      loading.dismiss();
    });
  }

  doFbLogout(){
    this.fb.logout()
    .then(res =>{
      //user logged out so we will remove him from the NativeStorage
      this.nativeStorage.remove('facebook_user');
      this.router.navigate(["/login"]);
    }, error =>{
      console.log(error);
    });
  }
}


  initializeApp() {
    this.platform.ready().then(() => {
    // Here we will check if the user is already logged in
      // because we don't want to ask users to log in each time they open the app
      this.nativeStorage.getItem('facebook_user')
      .then( data => {
        // user is previously logged and we have his or her data
        // we will let him/her access the app
        this.router.navigate(["/user"]);
        this.splashScreen.hide();
      }, err => {
        //we don't have the user data so we will ask him/her to log in
        this.router.navigate(["/login"]);
        this.splashScreen.hide();
      });

      this.statusBar.styleDefault();
    });
  }

