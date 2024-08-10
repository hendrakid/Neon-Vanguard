let currentPreset = '';
let isButtonGroupVisible = false;

function changeAttribute(attribute, src) {
    toggleButtonGroup();
    const element = document.getElementById(attribute);
    if (src) {
        element.src = src;
        element.style.display = 'block'; // Show image
    } else {
        element.style.display = 'none'; // Hide image
    }
}

function applyPreset(preset) {
    toggleButtonGroup();
    if (currentPreset === preset) {
        // If the preset is already applied, reset to default
        resetToDefault();
        currentPreset = ''; // Clear current preset
    } else {
        // Apply the new preset
        switch (preset) {
            case "suit":
                changeAttribute("body", "src/armor.png");
                changeAttribute("head", "src/helmet.png");
                break;
            case "casual":
                changeAttribute("body", "src/clothes.png");
                changeAttribute("head", "src/hat.png");
                break;
            default:
                resetToDefault();
                break;
        }
        currentPreset = preset; // Update current preset
    }
}

function resetToDefault() {
    changeAttribute("body", null);
    changeAttribute("head", null);
}

function toggleButtonGroup() {
    const buttonGroupContainer = document.getElementById('button-group-container');
    if (isButtonGroupVisible) {
        buttonGroupContainer.classList.add('hidden');
    } else {
        buttonGroupContainer.classList.remove('hidden');
    }
    isButtonGroupVisible = !isButtonGroupVisible;
}

// Mouse movement background scroll
document.getElementById('interactive-container').addEventListener('mousemove', function(e) {
    const container = this;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse X position within container
    const y = e.clientY - rect.top;  // Mouse Y position within container
    const width = rect.width;
    const height = rect.height;

    // Calculate the background position percentage
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    // Update background position
    container.style.backgroundPosition = `${bgX}% ${bgY}%`;
});


function downloadImage() {
  toggleButtonGroup();
  const container = document.getElementById('interactive-container');
  const buttonContainer = document.getElementById('button-container');
  
  // Temporarily hide the button container
  buttonContainer.style.display = 'none';
  
  html2canvas(container, { 
      allowTaint: true,
      useCORS: true
  }).then(function(canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'interactive-digital-painting.png';
      link.click();
      
      // Show the button container again
      buttonContainer.style.display = 'flex';
  });
}