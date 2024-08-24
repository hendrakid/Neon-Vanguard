// Track current active states
let currentPreset = null; // Can be 'suit' or 'casual'
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
  other: {
    body: "src/body.png",
    background: "src/BG.jpg",
  },
};

// Mapping of transition videos
const videoPaths = {
  body: "src/transition_body.webm",
  head: "src/transition_head.webm",
};

function preload() {
  console.log("start preload " + new Date().toLocaleTimeString());
  for (const key in imagePaths) {
    for (const value in imagePaths[key]) {
      const img = new Image();
      img.src = imagePaths[key][value];
      console.log(value + " loaded");
    }
  }
  for (const key in videoPaths) {
    const video = document.createElement("video");
    video.src = videoPaths[key];
    video.load(); // Preload the video
    console.log(key + " loaded");
  }
  console.log("finish preload " + new Date().toLocaleTimeString());
}
// Preload images and videos on page load
window.onload = function () {
  preload();
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
  // isTransitioning = true; // comment for multiple transition
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
      if (attribute === "body") currentBody = newValue;
      else currentHead = newValue;

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
  const videoElement = document.getElementById(
    "transition-" + attribute + "-video"
  );
  const videoSrc = "src/transition_" + attribute + ".webm";

  if (videoElement.src !== videoSrc) videoElement.src = videoSrc;
  videoElement.style.display = "block"; // Show the video element

  videoElement.onloadedmetadata = function () {
    if (reverse) {
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
            if (frame === 1) if (setImageOnStart) setImage(attribute, value);
            frame++;
          });
        } else {
          if (!setImageOnStart) setImage(attribute, value);
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
        if (!setImageOnStart) setImage(attribute, value);
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

  if (currentBody === mappings.body && currentHead === mappings.head) {
    changeAttribute("body", mappings.body);
    changeAttribute("head", mappings.head);
  } else {
    // Apply the preset by changing body and head attributes
    if (currentBody !== mappings.body) changeAttribute("body", mappings.body);
    if (currentHead !== mappings.head) changeAttribute("head", mappings.head);
  }
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
  const transitionBodyVideo = document.getElementById("transition-body-video");
  const transitionHeadVideo = document.getElementById("transition-head-video");

  // Temporarily hide the button group and transition video to exclude them from the screenshot
  buttonContainer.style.display = "none";
  transitionBodyVideo.style.display = "none";
  transitionHeadVideo.style.display = "none";

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
