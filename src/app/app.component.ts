import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SwPush, SwRegistrationOptions } from '@angular/service-worker';
import { posix } from 'path';
import { IdbService } from './idb/idb.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'book-app';
  searchForm: FormGroup;
  offline: boolean;
  pushNotif: PushSubscription;
  private readonly notifPublicKey = 'BPfuGqkKjhZ6KGBzJaJUKO1XkxjGQgAmYA3WZqIigu8xq129o542EoiQJuGV7gEykSTAVmUOE_aDklOU8FuiaOo';

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private swPush: SwPush,
              private http: HttpClient,
              private idbService: IdbService) {
    
  }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      search: [''],
    });
    window.addEventListener('online',  this.onNetworkStatusChange.bind(this));
    window.addEventListener('offline', this.onNetworkStatusChange.bind(this));

    this.pushNotification();
    this.swPush.messages.subscribe(message => console.log(message));
    this.swPush.notificationClicks.subscribe(
      ({action, notification}) => {
        window.open(notification.data);
      }
    )

    if (!navigator.geolocation) {
      console.log("Unable to get location");
    }
  }

  onSearch(): void {
    if (!this.searchForm.valid) { return; }
    this.router.navigate(['search'], { queryParams: {query: this.searchForm.get('search').value}});
  }

  onNetworkStatusChange(): void {
    this.offline = !navigator.onLine;
    console.log('offline ' + this.offline);
  }

  pushNotification() {
    if (!this.swPush.isEnabled) {
      console.log('Notification is not enabled');
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.notifPublicKey
    })
    .then(sub => {
      console.log(JSON.stringify(sub))
      this.pushNotif = sub;
    })
    .catch(err => console.log(err))
  }

  postEP() {
    console.log(this.pushNotif);

    if (this.pushNotif != undefined) {
      this.http.post('http://notif-dummy.herokuapp.com/notif', this.pushNotif, 
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      })
      .subscribe(
        res => {},
        err => {
          this.idbService.addEP(this.pushNotif)
          .then(this.backgroundSync)
          .catch(console.log);
        }
      )
    }
  }

  backgroundSync() {
    navigator.serviceWorker.ready.then((swRegistration) =>
      swRegistration.sync.register('notif')
    ).catch(console.log)
  }

  watchPosition() {
    navigator.geolocation.watchPosition(
      pos => {
        console.log(`lat: ${pos.coords.latitude}, lon: ${pos.coords.longitude}`);
      }, err => {
        console.log(err);
      }, {
        timeout: 5000,
        maximumAge: 0
      }
    )
  }
}


interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

declare global {
  interface ServiceWorkerRegistration {
    readonly sync: SyncManager;
  }
}