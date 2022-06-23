import { Injectable } from '@angular/core';
import { DBSchema, IDBPDatabase, openDB } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class IdbService {
  private db: IDBPDatabase<DB>;

  constructor() {
    this.connectDB();
   }

  async connectDB() {
    this.db = await openDB<DB>('my-db', 1, {
      upgrade(db) {
        db.createObjectStore('notif-store')
      }
    })
  }

  addEP(ep: PushSubscription) {
    let eee = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/eRtHeBGy0KQ:APA91bEL7jzFosQ5mAhj4M6IAVhNkK0O7Iqvw_0I8PvQOSmJGAn386kpgDyyQtriZloS163jpPXEGQTlei4zPhE6QlIgw8oIuiXuV9yHQzGLATj0ui36VpC7C7FINMjzUgo3Y-ez7iW3',
      expirationTime: null,
      keys: {
        p256dh: 'BAmjpeeBVFqfCbscAER_5m92ZG797YxR3rllDa_6usmnUilgjMI7OPNI17x60HDYxNWyLzAKzA-4ek-81_E6jDQ',
        auth: 'LIevD8hbiOTYNPoJnT7iXg'
      }
    }
    return this.db.put('notif-store', eee, 'endpoint');
  }

  deleteEP(key: string) {
    return this.db.delete('notif-store', key);
  }
}

interface DB extends DBSchema {
  'notif-store': {
    key: string,
    value: any
  }
}
