importScripts('./ngsw-worker.js');

self.addEventListener('sync', (event) => {
    if (event.tag === 'notif') {
        event.waitUntil(post());
    }
})

function post() {
    let db;
    const idb = indexedDB.open('my-db');
    idb.onerror = (event) => {
        console.log("Please allow Indexed DB");
    };
    idb.onsuccess = (event) => {
        db = idb.result;
        const transaction = db.transaction(['notif-store'])
        const objStore = transaction.objectStore('notif-store');
        const req = objStore.get('endpoint');
        req.onerror = (event) => {
            console.log(event);
        }
        req.onsuccess = (event) => {
            fetch('http://notif-dummy.herokuapp.com/notif', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({obj: 'obj'})
    }).then(Promise.resolve());
        }
    }
}