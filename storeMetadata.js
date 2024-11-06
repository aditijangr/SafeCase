// Event listener for the upload button
document.getElementById('upload-btn').addEventListener('click', function() {
    const optionContainer = document.createElement('div');
    document.body.appendChild(optionContainer);

    // Event listener for uploading a new image
    document.getElementById('upload-new-image').addEventListener('click', function() {
        optionContainer.remove();
        handleNewImageUpload();
    });

    // Event listener for uploading a new version of an existing image
    document.getElementById('upload-version-image').addEventListener('click', function() {
        optionContainer.remove();
        handleVersionImageUpload();
    });
});
// Function to show a modal
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
  }

  // Function to close a modal
  function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  // Get all close buttons
  const closeButtons = document.querySelectorAll('.close');

  // Add click event listener to each close button
  closeButtons.forEach(button => {
    button.onclick = function() {
      const modal = button.closest('.modal');
      if (modal) {
        modal.style.display = 'none';
      }
    };
  });
    // Function to toggle dark mode
    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
      }

  // Close modal if user clicks outside of the modal content
  window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  };

// Function to handle uploading a new original image
function handleNewImageUpload() {
    const imageCid = prompt('Enter IPFS CID for the new image:');

    if (imageCid) {
        const imageUrl = `https://ipfs.io/ipfs/${imageCid}`;
        const confirmContainer = document.createElement('div');
        confirmContainer.innerHTML = `
            <p>Is this the image you want to upload?</p>
            <img src="${imageUrl}" alt="Image Preview" style="max-width: 300px; display: block; margin: 20px auto;">
            <button id="confirm-yes">Yes</button>
            <button id="confirm-no">No</button>
        `;
        document.body.appendChild(confirmContainer);

        document.getElementById('confirm-yes').addEventListener('click', function() {
            const title = prompt('Enter the title of the image:');
            const description = prompt('Enter a description:');
            const tagsInput = prompt('Enter tags (comma-separated):');
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : []; // Trim tags to remove extra spaces
            const uploader = loggedInUsername || 'unknown_user';
            const timestamp = new Date().toISOString();

            if (title && description && tags.length > 0) {
                const metadata = {
                    image_cid: imageCid,
                    title: title,
                    description: description,
                    tags: tags,
                    uploader: uploader,
                    timestamp: timestamp,
                    version_name: 'v1', // First version
                    version_number: 1,
                    fork_of: null // No previous version for the first upload
                };

                // Hive Keychain custom JSON request for the new image
                hive_keychain.requestCustomJson(
                    loggedInUsername,
                    'safecase_image',
                    'Posting',
                    JSON.stringify(metadata),
                    'Store Image Metadata on Hive',
                    function(response) {
                        if (response.success) {
                            alert('New image metadata successfully stored on Hive!');
                        } else {
                            console.error('Failed to store image metadata on Hive:', response.message);
                            alert('Failed to store image metadata on Hive: ' + response.message);
                        }
                    }
                );
            } else {
                alert('Please fill in all required fields before uploading the image.');
            }
        });

        document.getElementById('confirm-no').addEventListener('click', function() {
            confirmContainer.remove();
            alert('Image upload canceled.');
        });
    } else {
        alert('No IPFS CID provided.');
    }
}

// Function to handle uploading a new version of an existing image
function handleVersionImageUpload() {
    const originalCid = prompt('Enter the IPFS CID of the original image:');

    if (originalCid) {
        const originalImageUrl = `https://ipfs.io/ipfs/${originalCid}`;
        const confirmContainer = document.createElement('div');
        confirmContainer.innerHTML = `
            <p>Is this the original image you want to append a new version to?</p>
            <img src="${originalImageUrl}" alt="Image Preview" style="max-width: 300px; display: block; margin: 20px auto;">
            <button id="confirm-original-yes">Yes</button>
            <button id="confirm-original-no">No</button>
        `;
        document.body.appendChild(confirmContainer);

        document.getElementById('confirm-original-yes').addEventListener('click', function() {
            confirmContainer.remove();

            const newImageCid = prompt('Enter the IPFS CID for the new image version:');
            if (newImageCid) {
                const newTitle = prompt('Enter the new title (or leave blank to keep original):') || 'Updated Title';
                const newDescription = prompt('Enter a new description (or leave blank to keep original):') || 'Updated Description';
                const newTagsInput = prompt('Enter new tags (comma-separated, or leave blank to keep original):');
                const newTags = newTagsInput ? newTagsInput.split(',').map(tag => tag.trim()) : ['default_tag']; // Trim tags
                const newVersionName = prompt('Enter the version name:');
                const newVersionNumber = prompt('Enter the version number:');
                const uploader = loggedInUsername || 'unknown_user';
                const timestamp = new Date().toISOString();

                if (newVersionName && newVersionNumber) {
                    const metadata = {
                        image_cid: newImageCid,
                        title: newTitle,
                        description: newDescription,
                        tags: newTags,
                        uploader: uploader,
                        timestamp: timestamp,
                        version_name: newVersionName,
                        version_number: newVersionNumber,
                        fork_of: originalCid // Linking to the original image's CID
                    };

                    // Hive Keychain custom JSON request for the new version
                    hive_keychain.requestCustomJson(
                        loggedInUsername,
                        'safecase_image',
                        'Posting',
                        JSON.stringify(metadata),
                        'Store New Version Metadata on Hive',
                        function(response) {
                            if (response.success) {
                                alert('New version metadata successfully stored on Hive!');
                            } else {
                                console.error('Failed to store new version on Hive:', response.message);
                                alert('Failed to store new version on Hive: ' + response.message);
                            }
                        }
                    );
                } else {
                    alert('Please provide valid version details.');
                }
            } else {
                alert('No new IPFS CID provided for the new version.');
            }
        });

        document.getElementById('confirm-original-no').addEventListener('click', function() {
            confirmContainer.remove();
            alert('Version upload canceled.');
        });
    } else {
        alert('No original IPFS CID provided.');
    }
}
  // Function to upload and display image in the gallery
  function uploadImage() {
    const cid = document.getElementById('imageCid').value;
    const title = document.getElementById('imageTitle').value;
    const description = document.getElementById('imageDesc').value;
    const tags = document.getElementById('imageTags').value;

    if (!cid || !title || !description || !tags) {
        alert("Please fill in all fields.");
        return;
    }

    // Construct IPFS image URL
    const imageUrl = `https://ipfs.io/ipfs/${cid}`;

    // Create a new gallery item
    const gallery = document.getElementById('imageGallery');
    const item = document.createElement('div');
    item.classList.add('image-item');

    item.innerHTML = `
        <img src="${imageUrl}" alt="${title}">
        <h4>${title}</h4>
        <p>${description}</p>
        <div>${tags.split(',').map(tag => `<span>#${tag.trim()}</span>`).join(' ')}</div>
    `;

    // Append new item to the gallery
    gallery.appendChild(item);

    // Clear form fields and close the modal
    document.getElementById('imageCid').value = '';
    document.getElementById('imageTitle').value = '';
    document.getElementById('imageDesc').value = '';
    document.getElementById('imageTags').value = '';
    toggleModal('uploadModal');
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('uploadModal');
    if (event.target == modal) {
        toggleModal('uploadModal');
    }
}

