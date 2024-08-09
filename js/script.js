let currentPreset = "";
let currentAttribute = "";

function changeAttribute(attribute, src) {
  const element = document.getElementById(attribute);

  // If the image needs to change
  if (src) {
      // Fade out the current image
      element.style.opacity = 0;

      // Wait for the fade-out to complete before changing the source
      setTimeout(() => {
          element.src = src;
          element.style.display = 'block';
          // Fade in the new image
          element.style.opacity = 1;
      }, 500); // Matches the duration of the CSS transition
  } else {
      // If hiding the image, fade out
      element.style.opacity = 1;
      setTimeout(() => {
          element.style.display = 'none';
      }, 500); // Matches the duration of the CSS transition
  }
}

function applyPreset(preset) {
  // if (currentPreset === preset) {
  //     // If the preset is already applied, reset to default
  //     resetToDefault();
  //     currentPreset = ''; // Clear current preset
  // } else {
      // Apply the new preset
      switch (preset) {
          case "suit":
              changeAttribute("body", "src/armor_anim.png");
              changeAttribute("head", "src/helmet_anim.png");
              break;
          case "casual":
              changeAttribute("body", "src/clothes.png");
              changeAttribute("head", "src/hat.png");
              break;
          default:
              resetToDefault();
              break;
      }
  //     currentPreset = preset; // Update current preset
  // }
}

function resetToDefault() {
  changeAttribute("body", null);
  changeAttribute("head", null);
}

function downloadImage() {
  return;
  // Create a canvas element
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Get the dimensions of the image container
  const container = document.querySelector(".image-container");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;

  // Get the images
  const baseBody = document.getElementById("base-body");
  const body = document.getElementById("body");
  const head = document.getElementById("head");

  // Set the crossOrigin attribute for the images
  baseBody.crossOrigin = "Anonymous";
  body.crossOrigin = "Anonymous";
  head.crossOrigin = "Anonymous";

  // Draw the images on the canvas
  const drawImageOnCanvas = (image) => {
    return new Promise((resolve, reject) => {
      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      image.onerror = reject;
    });
  };

  // Draw all images in sequence
  Promise.all([
    drawImageOnCanvas(baseBody),
    drawImageOnCanvas(body),
    drawImageOnCanvas(head),
  ])
    .then(() => {
      // Convert the canvas to a data URL
      const dataURL = canvas.toDataURL("image/png");

      // Create a link element to download the image
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "customized-image.png";
      link.click();
    })
    .catch((error) => {
      console.error("Error drawing images on canvas:", error);
    });
}
