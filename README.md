# AIChatCompare

AIChatCompare is an Angular web application developed using TypeScript. The application is designed to compare multiple Language Model (LLM) text generators. It uses the user-inputted API keys, stored in the local storage of the browser, to communicate with the respective LLM APIs. It also saves the chat history in local storage for future reference.

The application is deployed to Google Firebase with Server-Side Rendering (SSR) and utilizes Google Cloud Platform (GCP) Cloud Functions.

## Features

* Comparison of multiple LLM text generators
* Persistent storage of API keys and chat history in local storage
* Server-side rendering for improved performance


## Usage

To use the application in a development environment, run the following command:

```
ng serve
```

You can then access the application by navigating to `http://localhost:4200` in your browser.

To build the application for a production environment, run:

```
ng build --prod
```

## Firebase Deployment

Before deployment, make sure you have the Firebase CLI installed. If not, install it using:

```
npm install -g firebase-tools
```

Login to Firebase using:

```
firebase login
```

To deploy the project to Firebase, run:

```
firebase deploy
```

## Contributing

We welcome contributions to the AIChatCompare project. Please first discuss the change you wish to make via an issue before making any changes.

Ensure that all PRs are small to facilitate easy reviewing.

## License

The AIChatCompare project is licensed under the [Apache 2.0](./LICENSE) License.

## Contact

If you have any questions, issues, or just want to contribute, don't hesitate to send us an email at [Website](https://tuviarumpler.web.app/welcome).

## Disclaimer

The use of AIChatCompare is subject to acceptance of our [terms of service](./TERMS_OF_SERVICE.md). Please use responsibly.
