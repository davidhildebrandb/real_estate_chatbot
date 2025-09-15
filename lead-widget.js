const LEAD_ENDPOINT = "https://real-estate-chatbot-wewk.vercel.app/api/lead-capture"; // Your Vercel API
const RECAPTCHA_SITE_KEY = "YOUR_SITE_KEY_HERE"; // Replace with your site key

// Helper
function createElement(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k,v]) => el[k] = v);
  children.forEach(c => el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return el;
}

// Chat button
const chatButton = createElement('button', { innerText: 'W', style: `
  position: fixed; bottom: 20px; right: 20px;
  background: #c81c29; color: white; border: none; border-radius: 50%;
  width: 60px; height: 60px; font-size: 24px; cursor: pointer; z-index: 1000;
`});
document.body.appendChild(chatButton);

// Chat window
const chatWindow = createElement('div', { style: `
  position: fixed; bottom: 90px; right: 20px; width: 320px; max-height: 500px;
  background: #093157; color: white; border-radius: 10px; padding: 10px; display: none;
  flex-direction: column; z-index: 1000; overflow-y: auto;
`});
document.body.appendChild(chatWindow);
chatButton.onclick = () => chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
chatWindow.style.display = 'flex';

const leadData = { isSeller: false };

// Chat helpers
function addMessage(text, from='bot') {
  const msg = createElement('div', { style: `margin:5px 0; text-align:${from==='bot'?'left':'right'};` }, text);
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addQuickReplies(options, callback) {
  const container = createElement('div', { style: 'margin:5px 0; display:flex; flex-wrap:wrap; gap:5px;' });
  options.forEach(opt => {
    const btn = createElement('button', { innerText: opt, style: 'flex:1; padding:5px; cursor:pointer;' });
    btn.onclick = () => { chatWindow.removeChild(container); callback(opt); };
    container.appendChild(btn);
  });
  chatWindow.appendChild(container);
}

// Chat sequence
function startChat() {
  addMessage("Hi! I'm Wayne's virtual assistant. Are you looking to buy or sell?");
  addQuickReplies(["Buy", "Sell", "Both"], (resp) => {
    leadData.isSeller = resp === "Sell" || resp === "Both";
    askName();
  });
}

function askName() {
  addMessage("Great! What's your name?");
  const input = createElement('input', { placeholder:'Your Name' });
  chatWindow.appendChild(input);
  input.onkeydown = (e) => { if(e.key==='Enter') { leadData.name=input.value; chatWindow.removeChild(input); askEmail(); } };
}

function askEmail() {
  addMessage("Your email?");
  const input = createElement('input', { placeholder:'Email' });
  chatWindow.appendChild(input);
  input.onkeydown = (e) => { if(e.key==='Enter') { leadData.email=input.value; chatWindow.removeChild(input); askPhone(); } };
}

function askPhone() {
  addMessage("Your phone number?");
  const input = createElement('input', { placeholder:'Phone' });
  chatWindow.appendChild(input);
  input.onkeydown = (e) => { if(e.key==='Enter') { leadData.phone=input.value; chatWindow.removeChild(input); askBudget(); } };
}

function askBudget() {
  addMessage("What's your budget?");
  const input = createElement('input', { placeholder:'Budget' });
  chatWindow.appendChild(input);
  input.onkeydown = (e) => { if(e.key==='Enter') { leadData.budget=input.value; chatWindow.removeChild(input); askLocation(); } };
}

function askLocation() {
  addMessage("Preferred location?");
  const input = createElement('input', { placeholder:'Location' });
  chatWindow.appendChild(input);
  input.onkeydown = (e) => { if(e.key==='Enter') { leadData.location=input.value; chatWindow.removeChild(input); askPropertyType(); } };
}

function askPropertyType() {
  addMessage("Property type?");
  addQuickReplies(["House","Condo","Townhouse","Other"], (resp) => { leadData.propertyType = resp; askTimeline(); });
}

function askTimeline() {
  addMessage("Timeline to move?");
  addQuickReplies(["Immediately","1-3 months","3-6 months","6+ months"], (resp) => { leadData.timeline = resp; askConsent(); });
}

function askConsent() {
  addMessage("Do you consent to us contacting you regarding real estate services? (required for submission)");
  addQuickReplies(["Yes","No"], async (resp) => {
    leadData.consent = resp==="Yes";
    if(!leadData.consent) { addMessage("Consent is required to submit."); return; }
    await submitLead();
  });
}

// Submit lead
async function submitLead() {
  addMessage("Submitting your info...");
  try {
    const token = await grecaptcha.execute(RECAPTCHA_SITE_KEY, {action:'submit'});
    const response = await fetch(LEAD_ENDPOINT, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ...leadData, token })
    });
    const data = await response.json();
    if(data.success) addMessage("Thanks! Your info has been captured. Wayne will be in touch soon.");
    else addMessage("Oops! Something went wrong: "+data.error);
  } catch(e) {
    console.error(e);
    addMessage("Failed to capture lead. Please try again later.");
  }
}

// Load reCAPTCHA
const recaptchaScript = document.createElement('script');
recaptchaScript.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
recaptchaScript.onload = startChat;
document.head.appendChild(recaptchaScript);

