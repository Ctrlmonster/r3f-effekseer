import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import '../scss/main.scss';


setTimeout(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App/>
    </React.StrictMode>,
  )
}, 1000);




/*
In case the following warning appears: ---------------------------------------------------------------------------------

You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before.
Instead, call root.render() on the existing root instead if you want to update it.

------------------------------------------------------------------------------------------------------------------------

Then replace the above code with the following
(from: https://stackoverflow.com/questions/71792005/react-18-you-are-calling-reactdomclient-createroot-on-a-container-that-has-a):

let container: null | HTMLElement = null;
document.addEventListener('DOMContentLoaded', function(event) {
  if (!container) {
    container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container)
    root.render(
      <React.StrictMode>
        <App/>
      </React.StrictMode>
    );
  }
});*/