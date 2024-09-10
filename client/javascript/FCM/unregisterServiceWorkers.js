if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister().then(function(boolean) {
          if (boolean) {
            console.log('Service worker unregistered:', registration);
          } else {
            console.log('Service worker failed to unregister:', registration);
          }
        });
      }
    }).catch(function(error) {
      console.log('Error getting service worker registrations:', error);
    });
  }
  