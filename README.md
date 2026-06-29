# BE ADVISED THIS DOCUMENT IS BEING IMPROVED

# What is MindCanvas?

<p>A private, offline multi purpose tool to explore, analysize, create, make sense of complex data. For example does A4 page content feel too bland for when it comes to opening 16 word documents which makes data comparison hard to read? </p>

<p>This tool is an alternative and does not replace Word, Excel but this tool offers flexiblity that may be critized as not a clean, pure software. Yes you do require training to use it correctly but its simple compared to how a person would navigate other apps out there.

<p>MindCanvas has powerful features that permit you to bring image and video content inside the same canvas, making summaries, data extraction from past recorded videos easier than traditional platforms that promise simplicity over flexibility and strong ux/user experience.</p>

<p>Designed for large screens | Working on better solution for small screens</p>

## Public Collaboration

<p>Kind note: This is a private project and when public, users will not be given permission to push new features to the original code.</p>

## (Instructions for local use)

<p>STRICTLY FOLLOW THE GUIDE FOR STABLE OPERATIONS:</p>

<h2>Install MongoDB software to run a local database as a service.</h2>
<div>  
<p style="inline">MongoDB Community Server Download
<a target="_blank"  href="https://www.mongodb.com/try/download/community">www.mongodb.com/try/download/community</a> 
</p>
</div>
<h2>Download & Install Nodejs via <a href=https://www.nodejs.org target="_blank">www.nodejs.org</a> software to create a runtime(backend server) environment to run javascript code.</h2>

### Missing config | You need to create this yourself since .env uploads are dangerous</p>
<pre><code><p>SECURE=false</p>
<p>SESSION_SECRET=&lt;your-session-secret(128 character(string) value)&gt;</p>
<p>JWT=&lt;your-jwt-secret(128 character(string) value)&gt;</p>
<p>DB_CONNECTION_STRING="mongodb://127.0.0.1:27017/mind-canvas?appName=mind-canvas"</p>
<p>LOCAL_URL=http://localhost:3176</p>
<p>PORT=5176</p>
</code></pre>
<p>============================================================================</p>
<h2>Prerequisite: Install PowerShell 7 (The "One-Command" Way)</h2>
<p>To ensure MindCanvas automation works correctly, you need PowerShell 7. Select your Operating System below and run the command in your terminal.</p>
<p><i>Note: If the terminal asks "Do you agree to all the source agreements terms?", type <b>Y</b> and press <b>Enter</b>. Once finished, you can close that window and proceed to the guide below.</i></p>
  <strong>Steps:</strong>
  <div style="background-color: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 8px; font-family: 'Consolas', 'Monaco', monospace;">
  <h3>Windows (via Winget)</h3>
  <p>Right-click <strong>Start</strong> > select <strong>Terminal (Admin)</strong> and paste:</p>
  <code style="color: #4ec9b0;">winget install --id Microsoft.PowerShell --source winget</code>
  <hr style="border: 0.5px solid #333; margin: 20px 0;">
  <h3>macOS (via Homebrew)</h3>
  <p>Open <strong>Terminal</strong> and paste (This requires <a href="https://brew.sh/" style="color: #569cd6;">Homebrew</a>):</p>
  <code style="color: #4ec9b0;">brew install powershell</code>
  <hr style="border: 0.5px solid #333; margin: 20px 0;">
  <h3>Linux (via Snap)</h3>
  <p>Open your terminal and paste (Recommended for most distros like Ubuntu/Fedora):</p>
  <code style="color: #4ec9b0;">sudo snap install powershell --classic</code>
</div>

<h2>Step-by-Step Installation Guide</h2>

<ol>
    <li>
        <strong>Prepare the Backend Environment:</strong>
        <p>Navigate into the <code>/server</code> folder. Locate the initialization script (pwsh basis script). Run this to generate your <code>.env</code> file. Open the new <code>.env</code> file and ensure the 6 items listed in the "Missing Config" section above are filled in.</p>
    </li>
    <li>
        <strong>Configure .ps1 Files to use PowerShell 7:</strong>
        <p>Before installing libraries, we must tell Windows to use the correct version of PowerShell. This is a one-time setup:</p>
        <ul>
            <li>Right-click on <code>run-this-to-install-server-libraries.ps1</code> and select <strong>Properties</strong> (You may need to click 'Show more options' first on Windows 11).</li>
            <li>Under the <strong>General</strong> tab, look for "Opens with:" and click the <strong>Change</strong> button.</li>
            <li>Scroll down and select "Choose an app on your PC".</li>
            <li>In the file explorer window that opens, you need to find the <code>pwsh.exe</code> executable. Typically, it is located at: <code>C:\Program Files\PowerShell\7\pwsh.exe</code>.</li>
            <li>Select <strong>pwsh.exe</strong>, click <strong>Open</strong>, then click <strong>Apply</strong> and <strong>OK</strong> on the Properties window.</li>
        </ul>
    </li>
    <li>
        <strong>Install Backend Libraries:</strong>
        <p>In the <code>/server</code> folder, right-click <code>run-this-to-install-server-libraries.ps1</code>. Instead of 'Run with PowerShell', look for the <strong>Open PowerShell icon</strong> or <strong>'Open with PowerShell 7'</strong>. This will open a terminal and download the necessary Node.js modules. Wait for it to finish and close automatically.</p>
    </li>
    <li>
        <strong>Install UI (Frontend) Libraries:</strong>
        <p>Go back to the root folder, then enter the <code>/client</code> folder. Right-click <code>run-this-to-install-ui-libraries.ps1</code> and run it using the same method as the previous step.</p>
    </li>
    <li>
        <strong>Create Your Desktop Shortcut:</strong>
        <p>Go to the <code>/scripts</code> folder. Find <code>start-mindcanvas.ps1</code>. Right-click it and select <strong>Send to > Desktop (create shortcut)</strong>. You can now start your entire app by double-clicking this shortcut on your desktop!</p>
    </li>
</ol>

<h2>Closing the App (Proper Termination)</h2>
<p>Because MindCanvas runs a backend, a frontend, and a database, simply closing the browser window won't stop the servers. To "dance" with the terminal and close everything safely:</p>
<ul>
    <li>Locate the terminal windows that opened when you started the app.</li>
    <li>Click into the terminal window to make it active.</li>
    <li>Press <strong>Ctrl + C</strong> on your keyboard. If it asks "Terminate batch job? (Y/N)", type <code>Y</code> and press <strong>Enter</strong>.</li>
    <li>Alternatively, simply closing the terminal window (the "X" at the top right) will force the local servers to stop.</li>
</ul>

<p>============================================================================</p>

## Automation

<p>Currently testing how the latest automated dual server startups function on different Operating systems.</p>
<p>.ps1 files are config files to automate the start up of servers and have no malicous code. Feel free to use an AI to help you verify.</p>

## Features

<ul> 
  <li>Smooth UX: Modern, responsive UI for organizing, creating and exploring complex data coming from the creator who uses it. The data is on your device including the database and no one else manages that data but the local creator of that data.</li>
  
  <li>Personalization: Limitless Canvaspaces. (Eg. Total privacy- no trackers, algorithms). Should there be later on, it may be a survey linked to google drive where mindcanvas creators fill the survey asked about how they are using it and which other/current features they would like to have/have improved) for better UX/User Experience.</li>
  
  <li>Fragment Management: Create, edit, delete data. (I call these pieces of data fragments).</li>
  
  <li>Reliable Backend: Built with Node.js, Express, MongoDB, and strong. (This is the first release and parts may still break.)</li>
  
  <li>Responsive Design: Uses SCSS and CSS for smooth experience across devices.</li>
  
  <li>Basic Authentication: User account creation and login powered by a library making it impossible to reverse password hashing which makes it harder to brute force for credentials. Bcrypt.js will be replaced by Argon2 for stronger login protection. The password reset feature is implemented but encryption is not yet integrated, passwords are still not physically readable even when stored in the database. </li>
</ul>

## Tests / App status

<p>The app is stable and all operations are functional</p>

## Installs and Bugs

<p>Installation and error log management guides are being improved over time. I thank you for your patience on this.</p>
<p>The app's libraries will be updated when required to ensure vulnerabilities are patched before they get exploited.</p>

## Status of the following features (Scheduled for development | Not yet started):

<ul>
  <li>Data Backups: To minimize data loss</li>
</ul>

## personal notes

<ul>
  <li>MindCanvas is not some tool with AI. This doesnt have AI in it yet. </li>
  <li>At first, April 2025, the app was designed to showcase my <i>Software Development/(Full stack) Engineer (SDE) skills which made me feel utterly useless</i>. After October 2025, I gained foresight to take it much further.</li>
  <li>I've never had got the opportunity to actively showcase my potential anywhere, thus i decided to build software that levels me up and provides flexiblity to content that other may want.</li>7 apps... failed, the 8th one... is this app. I've had many tears... but this surely is an app that will bring ease to minds and hearts. I hope this brings changes to your life, whether for work, research, or others, it's your data, be responsible for it even when i don't know what the heck you store in it. Be ethical with it... I do understand that this may also be abused in ways i dont fully see but i designed it to do good.
</ul>

## Version

**Current local version:** 2.1.1

## Tech Stack / Languages

<p>MERN | TypeScript | Bcryptjs | Mongoose - ODM | SCSS | Tailwind | Material UI | Framer Motion | CSS</p>

---
