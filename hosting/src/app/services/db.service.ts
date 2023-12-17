import { Injectable, inject } from '@angular/core';
import {
  QueryConstraint,
  QueryNonFilterConstraint,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  doc,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  deleteDoc,
  writeBatch,
  Timestamp,
  collectionGroup
} from '@angular/fire/firestore';
import { Subject, tap } from 'rxjs';
import { sanitizeUndefined } from '../utils/sanitize-undefined';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  firestore: Firestore = inject(Firestore);

  async collection<T>(collectionName: string) {
    const collectionRef = collection(this.firestore, collectionName);
    const collectionSnapshot = await getDocs(collectionRef);
    return collectionSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  collection$<T>(collectionName: string) {
    const collectionRef = collection(this.firestore, collectionName);
    const state = new Subject<T[]>();
    const unsubscribe = onSnapshot(
      query(collectionRef, orderBy('createdAt', 'asc')),
      (collectionSnapshot) =>
        state.next(
          collectionSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]
        )
    );

    const observableUnsubscribe = state.subscribe;
    state.unsubscribe = () => {
      unsubscribe();
      observableUnsubscribe();
    };

    return state.asObservable().pipe(
      tap((data) => {
        console.log(`Collection: ${collectionName}` ,data);
      })
    );
  }

  group$<T>(
    collectionName: string,
    ...filter: (QueryConstraint | QueryNonFilterConstraint)[]
  ) {
    const collectionRef = collectionGroup(this.firestore, collectionName);
    const state = new Subject<T[]>();
    const unsubscribe = onSnapshot(
      query(collectionRef, ...filter),
      (collectionSnapshot) =>
        state.next(
          collectionSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]
        )
    );

    const observableUnsubscribe = state.subscribe;
    state.unsubscribe = () => {
      unsubscribe();
      observableUnsubscribe();
    };

    return state.asObservable().pipe(
      tap((data) => {
        console.log(`Query Collection Group: ${collectionName}` ,data);
      })
    );
  }

  async getDocument<T>(collectionName: string, documentId: string) {
    const documentRef = doc(this.firestore, collectionName, documentId);
    const documentSnapshot = await getDoc(documentRef);
    return { id: documentSnapshot.id, ...documentSnapshot.data() } as T;
  }

  async queryCollection<T>(
    collectionName: string,
    ...filter: (QueryConstraint | QueryNonFilterConstraint)[]
  ) {
    const collectionRef = collection(this.firestore, collectionName);
    const collectionSnapshot = await getDocs(query(collectionRef, ...filter));
    return collectionSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  query$<T>(
    collectionName: string,
    ...filter: (QueryConstraint | QueryNonFilterConstraint)[]
  ) {
    const collectionRef = collection(this.firestore, collectionName);
    const state = new Subject<T[]>();
    const unsubscribe = onSnapshot(
      query(collectionRef, ...filter),
      (collectionSnapshot) =>
        state.next(
          collectionSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]
        )
    );

    const observableUnsubscribe = state.subscribe;
    state.unsubscribe = () => {
      unsubscribe();
      observableUnsubscribe();
    };

    return state.asObservable().pipe(
      tap((data) => {
        console.log(`Query: ${collectionName}` ,data);
      })
    );
  }

  document$<T>(collectionName: string, documentId: string) {
    const documentRef = doc(this.firestore, collectionName, documentId);
    const state = new Subject<T>();
    const unsubscribe = onSnapshot(documentRef, (documentSnapshot) => {
      state.next({ id: documentSnapshot.id, ...documentSnapshot.data() } as T);
    });

    const observableUnsubscribe = state.subscribe;
    state.unsubscribe = () => {
      unsubscribe();
      observableUnsubscribe();
    };

    return state.asObservable().pipe(
      tap((data) => {
        console.log(`Document: ${collectionName}/${documentId}` ,data);
      })
    );
  }

  async document<T>(collectionName: string, documentId: string) {
    const documentRef = doc(this.firestore, collectionName, documentId);
    const documentSnapshot = await getDoc(documentRef);
    return {
      id: documentSnapshot.id,
      ...documentSnapshot.data(),
    } as T;
  }

  async updateDocument<T>(
    collectionName: string,
    documentId: string,
    data: Partial<T>
  ) {
    const documentRef = doc(this.firestore, collectionName, documentId);
    await updateDoc(documentRef, {...sanitizeUndefined(data) as any, updatedAt: Timestamp.now()});
  }

  async setDocument<T>(collectionName: string, documentId: string, data: T) {
    const documentRef = doc(this.firestore, collectionName, documentId);
    await setDoc(documentRef, {...sanitizeUndefined(data) as any, updatedAt: Timestamp.now()});
  }

  async createDocument<T>(collectionName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) {
    const documentRef = doc(collection(this.firestore, collectionName));
    await setDoc(documentRef, {
      ...sanitizeUndefined(data),
      id: documentRef.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as any);
    return documentRef.id;
  }

  async deleteDocument(collectionName: string, documentId: string) {
    const documentRef = doc(this.firestore, collectionName, documentId);
    await deleteDoc(documentRef);
  }

  async documentExists(collectionName: string, documentId: string) {
    const documentRef = doc(this.firestore, collectionName, documentId);
    const documentSnapshot = await getDoc(documentRef);
    return documentSnapshot.exists();
  }

  async batchCreateDocuments<T>(collectionName: string, data: Omit<T, 'id'>[]) {
    const batch = writeBatch(this.firestore);
    const collectionRef = collection(this.firestore, collectionName);
    data.forEach((d) => {
      const documentRef = doc(collectionRef);
      batch.set(documentRef, {
        ...d,
        id: documentRef.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });
    await batch.commit();
  }
}
