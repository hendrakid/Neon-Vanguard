// Track current active states
let isAllActive = false; // Can be 'suit' or 'casual'
let isHeadActive = false; // Can be 'suit' or 'casual'
let isBodyActive = false; // Can be 'armor' or 'clothes'
let isAuraActive = false; // Flag to check if preloading is complete
let isButtonGroupVisible = false;
let isTransitioning = false; // Prevent overlapping transitions
let preloadComplete = false; // Flag to check if preloading is complete

// Mapping of attributes to their image sources
const imagePaths = {
  bodyBase: "src/body.png",
  background: "src/background.jpg",
  menuBox: "src/UI/menu-box.png",
  bodyClothes: "src/body-clothes.png",
  headClothes: "src/head-clothes.png",
  bodyArmor: "src/body-armor.png",
  headArmor: "src/head-armor.png",
};

// Mapping of transition videos
const videoPaths = {
  body: "src/transition_body.webm",
  head: "src/transition_head.webm",
  aura: "src/aura.webm",
};

// Function to preload images
function preloadImages() {
  return new Promise((resolve) => {
    let loadedImages = 0;
    const totalImages = Object.values(imagePaths).flat().length;

    for (const key in imagePaths) {
      const img = new Image();
      img.src = imagePaths[key];
      img.onload = () => {
        loadedImages++;
        if (loadedImages === totalImages) resolve();
      };
      img.onerror = () => {
        loadedImages++;
        if (loadedImages === totalImages) resolve();
      };
    }
  });
}
// Function to preload videos
function preloadVideos() {
  return new Promise((resolve) => {
    let loadedVideos = 0;
    const totalVideos = Object.keys(videoPaths).length;

    for (const key in videoPaths) {
      const video = document.createElement("video");
      video.src = videoPaths[key];
      video.onloadeddata = () => {
        loadedVideos++;
        if (loadedVideos === totalVideos) resolve();
      };
      video.onerror = () => {
        loadedVideos++;
        if (loadedVideos === totalVideos) resolve();
      };
    }
  });
}

// Preload images and videos on page load
window.onload = function () {
  console.log("start preload " + new Date().toLocaleTimeString());

  const container = document.getElementById("container");
  container.style.display = "none"; // Hide container initially
  container.style.opacity = 0;

  const loading = document.getElementById("loading");
  loading.src = "src/loading.webp";
  loading.style.opacity = 1;

  Promise.all([preloadImages(), preloadVideos()]).then(() => {
    setTimeout(() => {
      // dummy loading time
      preloadComplete = true;
      console.log("finish preload " + new Date().toLocaleTimeString());

      loading.style.opacity = 0;
      setTimeout(() => {
        container.style.display = "block"; // Show container once preloading is complete
        container.style.opacity = 1; // Show container once preloading is complete

        const bodyBase = document.getElementById("base-body");
        bodyBase.src = imagePaths.bodyBase;
        const background = document.getElementById("background");
        background.src = imagePaths.background;
        setImage("head", false);
        setImage("body", false);
        moveBackground(125);

        loading.remove();
      }, 250);
    }, 1000);
  });
};

function toggleAllButtonHandler(element) {
  // atribute head / body

  const currentSrc = element.src;
  element.classList.remove("on"); // Remove 'on' class
  element.classList.add("off"); // Remove 'off' class
  var activated = currentSrc.includes("button-switch-off.png");
  isAllActive = activated;

  setActiveToggle(element, activated);

  const head = document.getElementById("toggle-img-head");
  const body = document.getElementById("toggle-img-body");
  toggleButtonHandler(head, "head", isAllActive);
  toggleButtonHandler(body, "body", isAllActive);
}

// Function to toggle the image between ON and OFF states with smooth transition
function toggleButtonHandler(element, attribute, forceCondition = null) {
  // atribute head / body
  const currentSrc = element.src;
  var activated = currentSrc.includes("button-switch-off.png");

  if (forceCondition !== null) {
    if (attribute === "head") if (isHeadActive === forceCondition) return;
    if (attribute === "body") if (isBodyActive === forceCondition) return;

    activated = forceCondition;
  }

  if (attribute === "head") isHeadActive = activated;
  if (attribute === "body") isBodyActive = activated;

  setActiveToggle(element, activated); // Wait for the transition to finish before changing the image

  if (forceCondition === null) {
    // null means handle if toggle trigger from individual toggle
    if (isHeadActive && isBodyActive && !isAllActive) {
      const toggleAllElement = document.getElementById("toggle-img-all");
      setActiveToggle(toggleAllElement, true);
    } else if ((!isHeadActive || !isBodyActive) && isAllActive) {
      const toggleAllElement = document.getElementById("toggle-img-all");
      setActiveToggle(toggleAllElement, false);
    }
  }

  // Play the transition animation with reverse flag
  playTransition(attribute, activated, true, () => {
    console.log("no call back");
    // Clear the transitioning flag
    isTransitioning = false;
  });
}

function setActiveToggle(element, activated) {
  element.classList.remove("on"); // Remove 'on' class
  element.classList.add("off"); // Remove 'off' class

  // Use a small timeout to allow the transition to take effect before changing the image source
  setTimeout(() => {
    if (activated) {
      element.src = "src/UI/button-switch-on.png"; // Change to 'ON' state
      element.classList.remove("off");
      element.classList.add("on");
    } else {
      element.src = "src/UI/button-switch-off.png"; // Change to 'OFF' state
      element.classList.remove("on"); // Remove 'on' class
      element.classList.remove("off"); // Remove 'off' class
    }
  }, 100);
}

function playAura(element, attribute) {
  const currentSrc = element.src;
  var activated = currentSrc.includes("button-switch-off.png");
  setActiveToggle(element, activated);

  isAuraActive = activated;
  const videoElement = document.getElementById(attribute + "-video");
  if (activated) {
    videoElement.src = "src/" + attribute + ".webm";
    videoElement.style.display = "block"; // Show the video element
    videoElement.onloadedmetadata = function () {
      videoElement.play();
      videoElement.onended = function () {};
    };
  } else {
    videoElement.style.display = "none"; // Show the video element
  }
  hideButtonGroup();
}

// Function to play a transition video and execute a callback afterward
function playTransition(attribute, activated, hasTransition, callback) {
  hideButtonGroup();

  if (!hasTransition) {
    setImage(attribute, value);
    callback();
    return;
  }

  const videoElement = document.getElementById(
    "transition-" + attribute + "-video"
  );
  const videoSrc = "src/transition_" + attribute + ".webm";

  if (videoElement.src !== videoSrc) videoElement.src = videoSrc;
  videoElement.style.display = "block"; // Show the video element

  videoElement.onloadedmetadata = function () {
    if (!activated) {
      videoElement.pause();
      videoElement.currentTime = videoElement.duration; // Start at the end

      let frame = 0;
      const stepBackward = () => {
        if (videoElement.currentTime > 0) {
          videoElement.currentTime = Math.max(
            videoElement.currentTime - 0.075,
            0
          ); // Move back one frame (approximately 33ms for 30fps)
          videoElement.requestVideoFrameCallback(() => {
            stepBackward(); // Call next frame
            if (frame === 1) setImage(attribute, activated);
            frame++;
          });
        } else {
          videoElement.pause();
          setTimeout(() => {
            videoElement.style.display = "none";
          }, 50); // Hide the video element
          callback(); // Execute callback after reverse playback
        }
      };

      stepBackward(); // Start the reverse playback loop
    } else {
      videoElement.play();

      // When the video ends, hide it and execute the callback
      videoElement.onended = function () {
        setImage(attribute, activated);
        videoElement.pause();
        setTimeout(() => {
          videoElement.style.display = "none";
        }, 50);

        callback();
      };

      // Handle video playback errors
      videoElement.onerror = function () {
        console.error(`Error playing transition video: ${videoSrc}`);
        videoElement.style.display = "none";
        callback(); // Proceed even if the video fails
      };
    }
  };

  // Handle cases where the video fails to load metadata
  videoElement.onerror = function () {
    console.error(`Failed to load video metadata: ${videoSrc}`);
    videoElement.style.display = "none";
    callback(); // Proceed even if the video fails
  };
}
function setImage(attribute, activated) {
  const element = document.getElementById(attribute);

  if (activated) {
    element.src = "src/" + attribute + "-armor.png";
    element.style.display = "block"; // Show image
  } else {
    element.src = "src/" + attribute + "-clothes.png";
    element.style.display = "block"; // Show image
  }
}

function showButtonGroup() {
  const buttonGroupContainer = document.getElementById(
    "button-group-container"
  );
  const buttonGroupContainerBackground = document.getElementById(
    "button-group-container-background"
  );
  const collapseButton = document.getElementById("collapse-button");

  buttonGroupContainer.classList.remove("hidden");
  buttonGroupContainerBackground.classList.remove("hidden");
  collapseButton.classList.add("hidden");

  // Add event listener for clicks outside the button group
  document.addEventListener("click", hideButtonGroupOnClickOutside);
}

function hideButtonGroup() {
  const buttonGroupContainer = document.getElementById(
    "button-group-container"
  );
  const buttonGroupContainerBackground = document.getElementById(
    "button-group-container-background"
  );
  const collapseButton = document.getElementById("collapse-button");

  buttonGroupContainer.classList.add("hidden");
  buttonGroupContainerBackground.classList.add("hidden");
  collapseButton.classList.remove("hidden");

  // Remove the event listener
  document.removeEventListener("click", hideButtonGroupOnClickOutside);
}

function hideButtonGroupOnClickOutside(event) {
  const buttonGroupContainer = document.getElementById(
    "button-group-container"
  );
  const collapseButton = document.getElementById("collapse-button");

  // Check if the click is outside the button group container
  if (
    !buttonGroupContainer.contains(event.target) &&
    !collapseButton.contains(event.target)
  ) {
    hideButtonGroup();
  }
}

function moveBackground(value) {
  const background = document.getElementById("background");
  const slider = document.getElementById("slider");

  // Get dimensions
  const bgWidth = background.offsetWidth;
  const viewportWidth = window.innerWidth;

  // Calculate the maximum allowed movement
  const maxMovement = (bgWidth - viewportWidth) / 2;

  // Map slider value to range [-maxMovement, maxMovement]
  const mappedValue = (value / slider.max) * 2 * maxMovement - maxMovement;

  // Clamp the movement value to prevent exceeding boundaries
  const clampedValue =
    Math.max(-maxMovement, Math.min(mappedValue, maxMovement)) - maxMovement;

  // Apply translation
  background.style.transform = `translateX(${clampedValue}px)`;
}

// Function to download the current state of the container as an image
function downloadImage() {
  hideButtonGroup();
  const container = document.getElementById("container");
  const buttonContainer = document.getElementById("button-container");

  const aura = document.getElementById("aura-video");
  aura.style.zIndex = 999;
  // Temporarily hide the button group and transition video to exclude them from the screenshot
  buttonContainer.style.opacity = 0;

  // Use html2canvas to capture the container
  html2canvas(container, {
    allowTaint: true,
    useCORS: true,
  }).then(function (canvas) {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "Neon-Vanguard.png";
    link.click();

    // Restore the visibility of the button group and transition video
    buttonContainer.style.opacity = 1;
    const aura = document.getElementById("aura-video");
    aura.style.zIndex = 14;
  });
}
