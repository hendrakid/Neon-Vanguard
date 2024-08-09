let currentPreset = '';
let isButtonGroupVisible = false;

function changeAttribute(attribute, src) {
    const element = document.getElementById(attribute);
    if (src) {
        element.src = src;
        element.style.display = 'block'; // Show image
    } else {
        element.style.display = 'none'; // Hide image
    }
}

function applyPreset(preset) {
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
