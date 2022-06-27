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
    let epclone = JSON.parse(JSON.stringify(ep));
    
    return this.db.put('notif-store', epclone, 'endpoint');
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
