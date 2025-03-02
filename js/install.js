// PWA installation logic
let deferredPrompt;
const installButton = document.getElementById('installBtn');
const installContainer = document.querySelector('.install-container');

// Check if the app can be installed
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 76+ from automatically showing the prompt
  e.preventDefault();
  
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show the install button
  installContainer.style.display = 'block';
});

// Handle the install button click
if (installButton) {
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We no longer need the prompt. Clear it up
    deferredPrompt = null;
    
    // Hide the install button
    installContainer.style.display = 'none';
  });
}

// Listen for successful installation
window.addEventListener('appinstalled', (e) => {
  // Log successful installation
  console.log('App was installed', e);
  
  // Hide the install button
  installContainer.style.display = 'none';
});

// Check if the app is already installed (launched from home screen)
if (window.matchMedia('(display-mode: standalone)').matches) {
  // App is already installed and is running in standalone mode
  installContainer.style.display = 'none';
}