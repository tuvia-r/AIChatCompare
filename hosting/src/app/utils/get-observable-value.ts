import { Observable, Subscription, last, lastValueFrom, take } from "rxjs";



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
