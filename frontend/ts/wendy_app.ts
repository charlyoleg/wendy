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
// Helper functions
// =========================

async function digestMessage(message: string) {
  const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);           // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}


// =========================
// Wendy App Core
// =========================

const c_404_body = "NULL"; // body value if request-status is 404
const c_invalid_message = "NULL"; // to be displayed if request-status is 404
const c_message_size_min = 2; // don't push message shorter than that
const c_message_size_max = 20; // don't push message longer than that
const c_msg_id_digest_size = 5; // size of the first part of msg_id "abcde-134"

const input_server_url:HTMLInputElement = document.querySelector("#server_url");
let wendy_server_url = input_server_url.value


// =========================
// Test wendy_server
// =========================

// html elements
//const input_server_url:HTMLInputElement = document.querySelector("#server_url");
const btn_test_server:HTMLButtonElement = document.querySelector("#action_test_server");
const span_server_status:HTMLSpanElement = document.querySelector("#server_status");

// Update the wendy server url to the current url
window.onload = (event: Event) => {
  //console.log("Event: windows on load");
  //console.log(window.location);
  //console.log(window.location.protocol + window.location.host);
  //console.log(window.location.origin);
  input_server_url.value = window.location.origin;
};
//console.log("Event: wendy_app loading");

btn_test_server.addEventListener('click', (evt:Event) => {
  wendy_server_url = input_server_url.value
  console.log('Click on action_test_server with url: ' + wendy_server_url);
  //span_server_status.innerHTML = "hello";
  //span_server_status.style.background = "grey";
  fetch(wendy_server_url + '/yellow_counter')
    .then((res) => { // http response
      if (res.ok) {
        return res.json(); // consuming the http body
      }
    }).then((resJson) => {
      // console.log('fetch response json: ', JSON.stringify(resJson));
      // console.log('fetch response json raw: ', resJson);
      console.log(resJson.yellow_counter);
      span_server_status.innerHTML = resJson.yellow_counter;
    }).catch(function (error) {
      console.log('Failing fetch operation: ', error.message);
      span_server_status.innerHTML = "Error: " + error.message;
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

btn_action_quantum_push.addEventListener('click', async (evt:Event) => {
  const txt_to_push = txt_quantum_msg_push.value;
  const msg_size = txt_to_push.length;
  //const msg_size = txt_to_push.length + 1; // to stress-test the server checks
  if((msg_size > c_message_size_max)||(msg_size < c_message_size_min)){
    span_quantum_msg_id_push.innerHTML = "";
    const text_explanation = c_message_size_min.toString() + " < " + msg_size.toString() + " < " + c_message_size_max.toString()
    console.log("Warning: Message won't be pushed because too short or too large: " + text_explanation);
    span_quantum_push_status.innerHTML = "The message is too short or too large to be sent: " + text_explanation;
    return;
  }
  //const push_msg_id = "xyz-66";
  const push_msg_digest = await digestMessage(txt_to_push);
  const push_msg_id = push_msg_digest.substring(0, c_msg_id_digest_size) + "-" + msg_size.toString();
  //const push_msg_id = push_msg_digest.substring(0, c_msg_id_digest_size) + "_" + msg_size.toString(); // To stress-test the server
  //const push_msg_id = push_msg_digest.substring(0, c_msg_id_digest_size-1) + "a-" + msg_size.toString(); // To stress-test the server
  //const push_msg_id = push_msg_digest.substring(0, c_msg_id_digest_size) + "-" + msg_size.toString() + "0"; // To stress-test the server
  console.log('Click on push-message with id: ' + push_msg_id);
  span_quantum_msg_id_push.innerHTML = push_msg_id;
  fetch(wendy_server_url + '/quantumcom/' + push_msg_id, {
    method: "post",
    headers: {
      'Accept': 'text/plain',
      'Content-Type': 'text/plain'
    },
    body: txt_to_push
    //body: txt_to_push + 'a' // To stress-test the server
    })
    .then((res) => { // http response
      //console.log("res.ok: " + res.ok);
      //console.log("res.status: " + res.status);
      return res.text(); // consuming the http body
    }).then((resText) => {
      console.log("Quantum push response: " + resText);
      span_quantum_push_status.innerHTML = resText;
    }).catch(function (error) {
      console.log('Failing fetch operation: ', error.message);
      span_quantum_push_status.innerHTML = "Error: " + error.message;
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
      //console.log("res.ok: " + res.ok);
      //console.log("res.status: " + res.status);
      const resBody = res.text();
      if (res.status == 404) {
        return c_404_body;
      }
      return resBody;
    }).then( async (resText) => {
      if (resText == c_404_body) {
        console.log("Quantum pull 404 response: " + pull_msg_id);
        span_quantum_msg_pull_status.innerHTML = "No message with ID " + pull_msg_id;
        txt_quantum_msg_pull.innerHTML = c_invalid_message;
      } else {
        console.log("Quantum pull 200 response: " + pull_msg_id);

        const msg_size = resText.length;
        if((msg_size > c_message_size_max)||(msg_size < c_message_size_min)){
          const text_explanation = c_message_size_min.toString() + " < " + msg_size.toString() + " < " + c_message_size_max.toString();
          console.log("Warning: Message dropped because too short or too large: " + text_explanation);
          span_quantum_msg_pull_status.innerHTML = "Warning: Message dropped because too short or too large: " + text_explanation;
          return;
        }
        const msg_digest = await digestMessage(resText);
        const expected_msg_id = msg_digest.substring(0, c_msg_id_digest_size) + "-" + msg_size.toString();
        if(expected_msg_id != pull_msg_id){
          const text_explanation = pull_msg_id + " != " + expected_msg_id;
          console.log("Warning: Message dropped because unexpected digest or ID: " + text_explanation);
          span_quantum_msg_pull_status.innerHTML = "Warning: Message dropped because unexpected digest or ID: " + text_explanation;
          return;
        }
        span_quantum_msg_pull_status.innerHTML = "Received message with ID " + pull_msg_id;
        txt_quantum_msg_pull.innerHTML = resText;
      }
    }).catch((error) => {
      console.log('Failing fetch operation: ', error.message);
      span_quantum_msg_pull_status.innerHTML = "Error: " + error.message;
      txt_quantum_msg_pull.innerHTML = c_invalid_message;
    });
});



// ==========================
// Navigation
// ==========================

// navigation button
const btn_create_profile:HTMLButtonElement = document.querySelector("#button_create_profile");
const btn_load_profile:HTMLButtonElement = document.querySelector("#button_load_profile");
const btn_entropy:HTMLButtonElement = document.querySelector("#button_entropy");
const btn_restart_array:NodeList = document.querySelectorAll(".button_restart");
// section
const section_entrance:HTMLDivElement = document.querySelector("#entrance");
const section_entropy:HTMLDivElement = document.querySelector("#entropy");
const section_profile_loading:HTMLDivElement = document.querySelector("#profile_loading");
const section_loom:HTMLDivElement = document.querySelector("#loom");

btn_create_profile.addEventListener('click', async (evt:Event) => {
  section_entrance.style.display = "none";
  section_entropy.style.display = "block";
});

btn_load_profile.addEventListener('click', async (evt:Event) => {
  section_entrance.style.display = "none";
  section_profile_loading.style.display = "block";
});

btn_entropy.addEventListener('click', async (evt:Event) => {
  section_entropy.style.display = "none";
  section_loom.style.display = "block";
});

let btn_idx:number;
for (btn_idx = 0; btn_idx < btn_restart_array.length; btn_idx++) {
  let btn_restart_one:HTMLButtonElement = btn_restart_array.item(btn_idx) as HTMLButtonElement;
  btn_restart_one.addEventListener('click', (evt:Event) => {
    section_entrance.style.display = "block";
    section_entropy.style.display = "none";
    section_profile_loading.style.display = "none";
    section_loom.style.display = "none";
  });
}

