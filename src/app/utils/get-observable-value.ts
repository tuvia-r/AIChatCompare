import { Observable, Subscription, take } from "rxjs";


/**
 * utility function to get the value of an observable, - make sure you do not get hanged up by an observable that never completes (replace the 'lastValueFrom' function);
 */
export async function getObservableValue<T>(observable: Observable<T>, waitUntil = 5000 /** 5 seconds */): Promise<T | undefined> {
  let subscription: Subscription | undefined;

  return new Promise<T | undefined>(async(resolve) => {
    subscription = observable.pipe(take(1)).subscribe(resolve);
    // lastValueFrom(observable).then(resolve);
    await new Promise((resolve) => setTimeout(resolve, waitUntil));
    resolve(undefined)
  }).finally(() => {
    subscription?.unsubscribe();
  });

}
