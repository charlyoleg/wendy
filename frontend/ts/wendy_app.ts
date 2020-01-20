/*! wendy_app.ts */

//import * as rlSub from './wendy_sub.js';

// =========================
// dummy stuff to be deleted at the end of development
// =========================

console.log("Hello from wendy_app.ts");

// =========================
// Messages and colors
// =========================

interface Messages {
  pwaStatus_installed : string;
  pwaStatus_afterInstallation : string;
  pwaStatus_afterUninstallation : string;
  layoutExplanationStatus_clickBack : string;
  layoutExplanationStatus_clickNext : string;
  voteStatus_reset : string;
  voteStatus_submit : string;
  voteStatus_invalidSubmit : string;
  voteStatus_outOfSync : string;
}

let messagesEn : Messages = {
  pwaStatus_installed : "Wendy is installed on your device",
  pwaStatus_afterInstallation : "Wendy has been installed",
  pwaStatus_afterUninstallation : "Wendy has been uninstalled",
  layoutExplanationStatus_clickBack : "T'as cliqué sur Back",
  layoutExplanationStatus_clickNext : "T'as cliqué sur Next",
  voteStatus_reset : "Back to the submitted value",
  voteStatus_submit : "Vote cast!",
  voteStatus_invalidSubmit : "No submission: ",
  voteStatus_outOfSync : "input and output are out of sync!"
};

// select your language
let messages : Messages = messagesEn;

interface Colors {
  pwaStatus_afterInstallation : string;
  layoutExplanationStatus_clickBack : string;
  layoutExplanationStatus_clickNext : string;
  voteStatus_ok : string;
  voteStatus_nok : string;
}

let colors : Colors = {
  pwaStatus_afterInstallation : 'green',
  layoutExplanationStatus_clickBack : 'lightblue',
  layoutExplanationStatus_clickNext : 'yellowgreen',
  voteStatus_ok : 'yellowgreen',
  voteStatus_nok : '#ff9933'
};


// =========================
// PWA installation
// =========================

// html elements
const btn_pwainstall:HTMLButtonElement = document.querySelector("#pwa_install");
const btn_pwauninstall:HTMLButtonElement = document.querySelector("#pwa_uninstall");
const pwa_install_status:HTMLSpanElement = document.querySelector("#pwa_install_status");

// variable declarations
let deferredPrompt:BeforeInstallPromptEvent;

// browser triggers the following event if this app matches the PWA criteria!
window.addEventListener('beforeinstallprompt', (evt:BeforeInstallPromptEvent) => {
  console.log('INFO020: The browser considered the app Wendy as a PWA');
  console.log('Detected platform: ', evt.platforms);
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  evt.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = evt;
  // Update UI to enable the install button
  btn_pwainstall.disabled = false;
});

// check is the pwa has been installed
window.addEventListener('appinstalled', (evt:Event) => {
  console.log('a2hs installed');
  pwa_install_status.innerHTML = messages.pwaStatus_installed;
  pwa_install_status.style.background = colors.pwaStatus_afterInstallation;
});

// Button to install the app
btn_pwainstall.addEventListener('click', (evt:Event) => {
  console.log('Click on btn_pwainstall');
  // Update UI to disable the install button again
  btn_pwainstall.disabled = true;
  // Show the prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice
    .then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  pwa_install_status.innerHTML = messages.pwaStatus_afterInstallation;
});

// Button to uninstall the app
btn_pwauninstall.addEventListener('click', (evt:Event) => {
  console.log('Click on btn_pwauninstall');
  console.log('Nothing done! Uninstall is not implemented!');
  pwa_install_status.innerHTML = messages.pwaStatus_afterUninstallation;
});


// =========================
// Wendy App Core
// =========================

const input_server_url:HTMLInputElement = document.querySelector("#server_url");
let wendy_server_url = input_server_url.value


// =========================
// Test wendy_server
// =========================

// html elements
//const input_server_url:HTMLInputElement = document.querySelector("#server_url");
const btn_test_server:HTMLButtonElement = document.querySelector("#action_test_server");
const span_server_status:HTMLSpanElement = document.querySelector("#server_status");

btn_test_server.addEventListener('click', (evt:Event) => {
  //const wendy_server_url = input_server_url.value
  console.log('Click on action_test_server with url: ' + wendy_server_url);
  //span_server_status.innerHTML = "hello";
  //span_server_status.style.background = "grey";
  fetch(wendy_server_url + '/yellow_counter')
    .then((res) => { // http response
      if (res.ok) {
        return res.json(); // consuming the http body
      }
      throw new Error('Network response was not ok.');
    }).then((resJson) => {
      // console.log('fetch response json: ', JSON.stringify(resJson));
      // console.log('fetch response json raw: ', resJson);
      console.log(resJson.yellow_counter);
      span_server_status.innerHTML = resJson.yellow_counter.replace(/\n/g, '<br>');
    }).catch(function (error) {
      console.log('Failing fetch operation: ', error.message);
    });
});

// ==========================
// Quantum communication push
// ==========================

// html elements
const txt_quantum_msg_push:HTMLTextAreaElement = document.querySelector("#quantum_msg_push");
const btn_action_quantum_push:HTMLButtonElement = document.querySelector("#action_quantum_push");
const span_quantum_msg_id_push:HTMLSpanElement = document.querySelector("#quantum_msg_id_push");
const span_quantum_push_status:HTMLSpanElement = document.querySelector("#quantum_push_status");

btn_action_quantum_push.addEventListener('click', (evt:Event) => {
  const txt_to_push = txt_quantum_msg_push.value;
  const push_msg_id = "xyz-66";
  console.log('Click on push-message with id: ' + push_msg_id);
  span_quantum_msg_id_push.innerHTML = push_msg_id;
  fetch(wendy_server_url + '/quantumcom/' + push_msg_id, {
    method: "post",
    headers: {
      'Accept': 'text/plain',
      'Content-Type': 'text/plain'
    },
    body: txt_to_push
    })
    .then((res) => { // http response
      if (res.ok) {
        return res.text(); // consuming the http body
      }
      throw new Error('Network response was not ok.');
    }).then((resText) => {
      console.log("Quantum push response: " + resText);
      span_quantum_push_status.innerHTML = resText;
    }).catch(function (error) {
      console.log('Failing fetch operation: ', error.message);
    });
});


// ==========================
// Quantum communication pull
// ==========================

const input_quantum_msg_id_pull:HTMLInputElement = document.querySelector("#quantum_msg_id_pull");
const btn_action_quantum_pull:HTMLButtonElement = document.querySelector("#action_quantum_pull");
const span_quantum_msg_pull_status:HTMLSpanElement = document.querySelector("#quantum_msg_pull_status");
const txt_quantum_msg_pull:HTMLTextAreaElement = document.querySelector("#quantum_msg_pull");

btn_action_quantum_pull.addEventListener('click', (evt:Event) => {
  const pull_msg_id = input_quantum_msg_id_pull.value;
  console.log('Click on pull-message with id: ' + pull_msg_id);
  fetch(wendy_server_url + '/quantumcom/' + pull_msg_id)
    .then((res) => { // http response
      if (res.ok) {
        return res.text(); // consuming the http body
      }
      throw new Error('Network response was not ok.');
    }).then((resText) => {
      console.log("Quantum pull response: " + pull_msg_id);
      span_quantum_msg_pull_status.innerHTML = "Received " + pull_msg_id;
      txt_quantum_msg_pull.innerHTML = resText;
    }).catch(function (error) {
      console.log('Failing fetch operation: ', error.message);
      span_quantum_msg_pull_status.innerHTML = "Error: " + error.message;
    });
});



