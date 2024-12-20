document.addEventListener("DOMContentLoaded", function () {
  /*MAP FUNCTION FOR SENDING LOCATION SPECIFIC ALERTS START*/

  let map;
  let marker;
  let circle;
  let mapInitialized = false;
  let initCheckInterval;

  const selectLocation = document.getElementById("selectedLocation");

  function initMap() {
    const selectedLocation = document.getElementById("selectedLocation");
    const selectedLocationValue = selectedLocation.value;
    //split [lat, lng] string into 2 values
    const location = selectedLocationValue.split(",");
    let lat = parseFloat(location[0].replace("[", ""));
    let lng = parseFloat(location[1].replace("]", ""));

    let locationObj = {
      lat: lat,
      lng: lng,
    };

    initializeMap(locationObj);
  }

  function initializeMap(location) {
    console.log("InitializeMap called with location:", location);
    if (mapInitialized) {
      console.log("Map already initialized, returning");
      return;
    }

    if (typeof google === "undefined" || typeof google.maps === "undefined") {
      console.error("Google Maps API not loaded");
      alert(
        "Google Maps API not loaded. Please check your API key and script inclusion."
      );
      return;
    }

    try {
      map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: location,
      });

      marker = new google.maps.Marker({
        position: location,
        map: map,
        draggable: true,
      });

      // Create a circle with a radius of 500 meters around the marker
      circle = new google.maps.Circle({
        map: map,
        radius: 250, // Radius in meters
        fillColor: "blue", // Fill color for the circle
        fillOpacity: 0.3, // Opacity of the fill
        strokeColor: "black", // Stroke color for the circle
        strokeOpacity: 0.8, // Opacity of the stroke
        strokeWeight: 2, // Thickness of the stroke
      });

      // Attach the circle to the marker's location
      circle.bindTo("center", marker, "position");

      google.maps.event.addListener(marker, "dragend", function (event) {
        console.log("Marker dragged to:", event.latLng.toString());
        //update the select to the value "other"
        const selectedLocation = document.getElementById("selectedLocation");
        selectedLocation.value = "other";

        //make the map scroll to the new marker position
        map.panTo(marker.getPosition());
      });

      google.maps.event.addListener(map, "click", function (event) {
        marker.setPosition(event.latLng);
        console.log("Map clicked at:", event.latLng.toString());
        //update the select to the value "other"
        const selectedLocation = document.getElementById("selectedLocation");
        selectedLocation.value = "other";

        //make the map scroll to the new marker position
        map.panTo(marker.getPosition());
      });

      // Start checking for map initialization
      initCheckInterval = setInterval(checkMapInitialized, 100);
    } catch (error) {
      console.error("Error initializing map:", error);
      alert("Error initializing map. Please check the console for details.");
    }
  }

  function checkMapInitialized() {
    if (map && map.getZoom() !== 0) {
      console.log("Map initialized (zoom != 0)");
      clearInterval(initCheckInterval);
      mapInitialized = true;
      updateMapVisibility();
    } else {
      console.log("Map not yet initialized, checking again...");
    }
  }

  let slider = document.getElementById("labels-range-input");
  slider.addEventListener("input", function () {
    let rangeValue = document.getElementById("current-value");
    rangeValue.innerText = slider.value + " m ";
    circle.setRadius(parseInt(slider.value));
  });

  function updateMapVisibility() {
    console.log("Updating map visibility");
    const checkbox = document.getElementById("locationSpecific");
    const mapDiv = document.getElementById("map");
    const loader = document.getElementById("mapLoader");
    const selectedLocation = document.getElementById("selectedLocation");
    const slider = document.getElementById("slider");

    if (checkbox.checked) {
      //show checkbox
      selectedLocation.style.display = "block";
      slider.style.display = "block";
      if (mapInitialized) {
        console.log("Map initialized, showing map and hiding loader");
        loader.style.display = "none";
        mapDiv.style.display = "block";
        //pan map to marker position
      } else {
        console.log("Map not initialized, showing loader and hiding map");
        loader.style.display = "block";
        mapDiv.style.display = "none";
      }
    } else {
      console.log("Checkbox unchecked, hiding map and loader");
      mapDiv.style.display = "none";
      loader.style.display = "none";
      selectedLocation.style.display = "none";
      slider.style.display = "none";
    }
  }

  function onCheckboxChange() {
    console.log("Checkbox changed");
    if (!mapInitialized) {
      console.log("Map not initialized, calling initMap");
      initMap();
    }
    updateMapVisibility();
  }

  selectLocation.addEventListener("change", () => {
    const selectedLocationValue = selectLocation.value;

    // Split the [lat, lng] string into two values
    const location = selectedLocationValue.split(",");
    let lat = parseFloat(location[0].replace("[", ""));
    let lng = parseFloat(location[1].replace("]", ""));
    let locationObj = {
      lat: lat,
      lng: lng,
    };

    // Move map marker to new location
    marker.setPosition(locationObj);

    // Bind circle to new marker position
    circle.bindTo("center", marker, "position");

    // Pan the map to the new marker position
    map.panTo(marker.getPosition());

    console.log("Map panned to:", marker.getPosition().toString());
  });

  // Initialize the map when the page loads, but keep it hidden
  window.onload = function () {
    console.log("Window loaded");
    const checkbox = document.getElementById("locationSpecific");
    if (checkbox) {
      // wait 1s before initializing the map
      setTimeout(initMap, 1000);
    }
    checkbox.addEventListener("change", onCheckboxChange);
    updateMapVisibility();
    const selectedLocation = document.getElementById("selectedLocation");
    selectedLocation.addEventListener("change", () => {
      const selectedLocationValue = selectedLocation.value;
      //split [lat, lng] string into 2 values
      const location = selectedLocationValue.split(",");
      let lat = parseFloat(location[0].replace("[", ""));
      let lng = parseFloat(location[1].replace("]", ""));
      let locationObj = {
        lat: lat,
        lng: lng,
      };
      // move map marker to new location
      marker.setPosition(locationObj);
      circle.bindTo("center", marker, "position");
    });
  };

  /* MAP FUNCTION FOR SENDING LOCATION SPECIFIC ALERTS END  */

  function showLoader() {
    document.getElementById("loader").style.display = "block";
  }

  function hideLoader() {
    document.getElementById("loader").style.display = "none";
  }

  let sendButton = document.getElementById("sendNotificationBtn");

  sendButton.addEventListener("click", async function (event) {
    event.preventDefault();

    let title = document.getElementById("notificationTitle").value;

    let message = document.getElementById("notificationMessage").value;

    let notificationType = document.getElementById("notificationType").value;

    let recipient = document.getElementById("recipient").value;
    recipient = recipient.toLowerCase();

    console.log("notificationType", notificationType);

    let locationSpecificCheckBox = document.getElementById("locationSpecific");

    let targetLocation = null;
    let radius = null;

    if (locationSpecificCheckBox.checked) {
      let markerPosition = marker.getPosition();
      //console.log the lat and long of the marker
      console.log(
        "Marker position",
        markerPosition.lat(),
        markerPosition.lng()
      );

      targetLocation = [markerPosition.lat(), markerPosition.lng()];

      targetLocation = JSON.stringify(targetLocation);

      radius = slider.value;
    }

    showLoader();
    console.log("title", title);
    console.log("message", message);

    if (title === "" || message === "") {
      var alert = document.getElementById("alert");
      alert.innerText = "Please fill in all fields";
      alert.style.display = "block";
      window.scrollTo(0, 0);
      hideLoader();
      return;
    }

    try {
      const response = await fetch("/notifications/sendNotification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message,
          notificationType,
          recipient,
          targetLocation,
          radius,
        }),
      });

      const data = await response.json();

      window.scrollTo(0, 0);

      if (response.status === 200) {
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.style.color = "green";
        alert.style.backgroundColor = "#ddffdd";
        alert.style.border = "green";
        alert.innerText = data.message;
        hideLoader();
      } else {
        var alert = document.getElementById("alert");
        alert.style.display = "block";
        alert.innerText = data.error;
        hideLoader();
      }
    } catch (error) {
      console.log(error);
      var alert = document.getElementById("alert");
      alert.style.display = "block";
      alert.innerText = "An error occurred. Please try again.";
      window.scrollTo(0, 0);
      hideLoader();
    }
  });
});
