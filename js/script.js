// Track current active states
let currentBody = null; // Can be 'armor' or 'clothes'
let currentHead = null; // Can be 'helmet' or 'hat'
let isButtonGroupVisible = false;
let isTransitioning = false; // Prevent overlapping transitions

// Mapping of attributes to their image sources
const imagePaths = {
  body: {
    armor: "src/armor.png",
    clothes: "src/clothes.png",
  },
  head: {
    helmet: "src/helmet.png",
    hat: "src/hat.png",
  },
};

// Function to change an attribute (body or head)
function changeAttribute(attribute, newValue) {
  toggleButtonGroup();

  if (isTransitioning) {
    console.warn("Transition in progress. Please wait.");
    return;
  }

  if (attribute !== "body" && attribute !== "head") {
    console.error(`Unknown attribute: ${attribute}`);
    return;
  }

  let currentValue = attribute === "body" ? currentBody : currentHead;

  // Determine if the video should play in reverse
  let reverse = currentValue === "armor" || currentValue === "helmet";

  // Set the transitioning flag
  isTransitioning = true;
  let setImageOnStart = false;
  let hasTransition = true;
  if (currentValue === newValue && reverse) {
    // reset
    // show image onended
    console.log(" RESET|REVERSE | hide image onstart");
    newValue = null;
    setImageOnStart = true;
  } else if (reverse && (newValue === "clothes" || newValue === "hat")) {
    console.log(" REVERSE | show image onstart");
    setImageOnStart = true;
  } else if (newValue === "armor" || newValue === "helmet") {
    console.log(" NORMAL | show image onended");
  } else {
    console.log("no transition");
    if (currentValue === newValue) newValue = null;
    hasTransition = false;
  }
  // Play the transition animation with reverse flag
  playTransition(
    attribute,
    hasTransition,
    newValue,
    () => {
      // Update the current state
      if (attribute === "body") {
        currentBody = newValue;
      } else {
        currentHead = newValue;
      }
      // Clear the transitioning flag
      isTransitioning = false;
    },
    reverse,
    setImageOnStart
  );
}

function setImage(attribute, newValue) {
  const element = document.getElementById(attribute);
  if (newValue) {
    element.src = "src/" + newValue + ".png";
    element.style.display = "block"; // Show image
  } else {
    element.style.display = "none";
  }
}

// if armor   to clothes  show image onstart
// if armor   to null     show image onended
// if null    to armor    show image onended
// if clothes to armor    show image onended

// if helmet  to hat      show image onstart
// if helmet  to null     show image onended
// if null    to helmet   show image onended
// if hat     to helmet   show image onended

// Function to play a transition video and execute a callback afterward
function playTransition(
  attribute,
  hasTransition,
  value,
  callback,
  reverse = false,
  setImageOnStart = false
) {
  if (!hasTransition) {
    setImage(attribute, value);
    callback();
    return;
  }
  const videoElement = document.getElementById("transition-video");
  const videoSrc = "src/transition_" + attribute + ".webm";

  if (videoElement.src !== videoSrc) videoElement.src = videoSrc;
  videoElement.style.display = "block"; // Show the video element

  videoElement.onloadedmetadata = function () {
    if (reverse) {
      videoElement.pause();
      videoElement.currentTime = videoElement.duration; // Start at the end

      const stepBackward = () => {
        if (videoElement.currentTime > 0) {
          videoElement.currentTime = Math.max(
            videoElement.currentTime - 0.033,
            0
          ); // Move back one frame (approximately 33ms for 30fps)
          videoElement.requestVideoFrameCallback(() => {
            stepBackward(); // Call next frame
          });
        } else {
          videoElement.style.display = "none"; // Hide the video element
          if (!setImageOnStart) setImage(attribute, value);
          callback(); // Execute callback after reverse playback
        }
      };

      stepBackward(); // Start the reverse playback loop
      if (setImageOnStart) setImage(attribute, value);
    } else {
      videoElement.play();

      // When the video ends, hide it and execute the callback
      videoElement.onended = function () {
        videoElement.pause();
        videoElement.style.display = "none";
        if (!setImageOnStart) setImage(attribute, value);

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

// Function to apply a preset (e.g., 'casual' or 'suit')
function applyPreset(preset) {
  if (isTransitioning) {
    console.warn("Transition in progress. Please wait.");
    return;
  }

  toggleButtonGroup();

  // Define what each preset applies
  const presetMappings = {
    casual: {
      body: "clothes",
      head: "hat",
    },
    suit: {
      body: "armor",
      head: "helmet",
    },
  };

  const mappings = presetMappings[preset];
  if (!mappings) {
    console.error(`Unknown preset: ${preset}`);
    return;
  }

  // Apply the preset by changing body and head attributes
  changeAttribute("body", mappings.body);
  changeAttribute("head", mappings.head);
}

// Function to toggle the visibility of the button group
function toggleButtonGroup() {
  const buttonGroupContainer = document.getElementById(
    "button-group-container"
  );
  if (isButtonGroupVisible) {
    buttonGroupContainer.classList.add("hidden");
  } else {
    buttonGroupContainer.classList.remove("hidden");
  }
  isButtonGroupVisible = !isButtonGroupVisible;
}

// Event listener for mouse movement to scroll the background
// document.getElementById('interactive-container').addEventListener('mousemove', function (e) {
//     const container = this;
//     const rect = container.getBoundingClientRect();
//     const x = e.clientX - rect.left; // Mouse X position within container
//     const y = e.clientY - rect.top;  // Mouse Y position within container
//     const width = rect.width;
//     const height = rect.height;

//     // Calculate the background position percentage
//     const bgX = (x / width) * 100;
//     const bgY = (y / height) * 100;

//     // Update background position
//     container.style.backgroundPosition = `${bgX}% ${bgY}%`;
// });

// Function to download the current state of the container as an image
function downloadImage() {
  const container = document.getElementById("interactive-container");
  const buttonContainer = document.getElementById("button-container");
  const transitionVideo = document.getElementById("transition-video");

  // Temporarily hide the button group and transition video to exclude them from the screenshot
  buttonContainer.style.display = "none";
  transitionVideo.style.display = "none";

  // Use html2canvas to capture the container
  html2canvas(container, {
    allowTaint: true,
    useCORS: true,
  }).then(function (canvas) {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "interactive-digital-painting.png";
    link.click();

    // Restore the visibility of the button group and transition video
    buttonContainer.style.display = "block";
    transitionVideo.style.display = "none"; // Ensure it's hidden
  });
}
