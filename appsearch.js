// ImagePreview.js
export class ImagePreview {
    constructor(container) {
      this.container = container;
      this.previewContainer = null;
      this.setupPreviewContainer();
    }
  
    setupPreviewContainer() {
      this.previewContainer = document.createElement('div');
      this.previewContainer.className = 'preview-container';
      this.previewContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: none;
      `;
      this.container.appendChild(this.previewContainer);
    }
  
    async showPreview(cid) {
      try {
        const imageUrl = `https://ipfs.io/ipfs/${cid}`;
        
        this.previewContainer.innerHTML = `
          <div class="preview-header">
            <h3>Image Preview</h3>
            <button class="close-preview">&times;</button>
          </div>
          <div class="preview-content">
            <img src="${imageUrl}" alt="IPFS Preview" style="max-width: 100%; max-height: 70vh; object-fit: contain;">
            <div class="preview-details">
              <p>IPFS CID: ${cid}</p>
            </div>
          </div>
        `;
  
        this.previewContainer.style.display = 'block';
        
        // Add close button functionality
        const closeBtn = this.previewContainer.querySelector('.close-preview');
        closeBtn.onclick = () => this.hidePreview();
        
        // Close on click outside
        window.onclick = (event) => {
          if (event.target === this.previewContainer) {
            this.hidePreview();
          }
        };
      } catch (error) {
        console.error('Error showing preview:', error);
        alert('Failed to load image preview');
      }
    }
  
    hidePreview() {
      this.previewContainer.style.display = 'none';
    }
  }// Function to handle uploading a new original image
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
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
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
                    version_name: 'v1',
                    version_number: 1,
                    fork_of: null
                };
  
                hive_keychain.requestCustomJson(
                    loggedInUsername,
                    'safecase_image',
                    'Posting',
                    JSON.stringify(metadata),
                    'Store Image Metadata on Hive',
                    function(response) {
                        if (response.success) {
                            // Create and display the image immediately after successful upload
                            displayUploadedImage(metadata);
                            confirmContainer.remove();
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
  
  // Function to display the uploaded image
  function displayUploadedImage(metadata) {
    const gallery = document.getElementById('imageGallery');
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-card';
    
    const imageUrl = `https://ipfs.io/ipfs/${metadata.image_cid}`;
    
    imageContainer.innerHTML = `
        <img src="${imageUrl}" alt="${metadata.title}" class="uploaded-image">
        <h2>${metadata.title}</h2>
        <p>${metadata.description}</p>
        <div class="tags">
            ${metadata.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
        </div>
        <div class="metadata">
            <span>Uploaded by: ${metadata.uploader}</span>
            <span>Version: ${metadata.version_name}</span>
        </div>
        <div class="actions">
            <button class="vote-btn" onclick="vote('${metadata.image_cid}')">Vote</button>
            <button class="delete-btn" onclick="deleteImage('${metadata.image_cid}')">Delete</button>
        </div>
        <p class="votes">Votes: 0</p>
    `;
    
    gallery.insertBefore(imageContainer, gallery.firstChild);
  }
  
  // Function to handle uploading a new version of an existing image
  function handleVersionImageUpload() {
    // ... (previous version upload code remains the same)
    // Add displayUploadedImage call in the success callback similar to handleNewImageUpload
  }
  // Function to create and show modal
  function showModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = content;
    document.body.appendChild(modal);
  
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
  
    // Prevent scrolling of background content
    document.body.style.overflow = 'hidden';
  }
  
  // Function to close modal
  function closeModal(modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
  
  // Function to check if image exists and is loadable
  function checkImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => reject(false);
        img.src = url;
    });
  }
  
  // Function to handle uploading a new original image
  async function handleNewImageUpload() {
    const imageCid = prompt('Enter IPFS CID for the new image:');
  
    if (imageCid) {
        const imageUrl = `https://ipfs.io/ipfs/${imageCid}`;
        
        try {
            // Check if image loads successfully
            await checkImage(imageUrl);
            
            const modalContent = `
                <div class="modal-content">
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove();">&times;</button>
                    <div class="modal-header">
                        <h2 class="modal-title">Image Upload Details</h2>
                    </div>
                    <div class="modal-body">
                        <div class="image-preview-container">
                            <img src="${imageUrl}" alt="Image Preview" class="preview-image">
                            <div class="image-loading">Loading image...</div>
                        </div>
                        <form id="imageUploadForm" class="upload-form">
                            <div class="form-group">
                                <label for="imageTitle">Title</label>
                                <input type="text" id="imageTitle" required class="form-input">
                            </div>
                            <div class="form-group">
                                <label for="imageDescription">Description</label>
                                <textarea id="imageDescription" required class="form-input"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="imageTags">Tags (comma-separated)</label>
                                <input type="text" id="imageTags" required class="form-input" 
                                       placeholder="e.g., art, nature, photography">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn btn-confirm" id="submit-upload">Upload</button>
                        <button class="modal-btn btn-cancel" id="cancel-upload">Cancel</button>
                    </div>
                </div>
            `;
  
            showModal(modalContent);
  
            // Handle image loading in modal
            const previewImage = document.querySelector('.preview-image');
            const loadingDiv = document.querySelector('.image-loading');
            
            previewImage.onload = () => {
                loadingDiv.style.display = 'none';
                previewImage.style.display = 'block';
            };
  
            previewImage.onerror = () => {
                loadingDiv.textContent = 'Failed to load image';
                previewImage.style.display = 'none';
            };
  
            // Add event listeners for the modal buttons
            document.getElementById('submit-upload').addEventListener('click', function() {
                const form = document.getElementById('imageUploadForm');
                const title = document.getElementById('imageTitle').value;
                const description = document.getElementById('imageDescription').value;
                const tagsInput = document.getElementById('imageTags').value;
  
                if (title && description && tagsInput) {
                    const tags = tagsInput.split(',').map(tag => tag.trim());
                    const modal = this.closest('.modal-overlay');
                    const metadata = {
                        image_cid: imageCid,
                        title: title,
                        description: description,
                        tags: tags,
                        uploader: loggedInUsername || 'unknown_user',
                        timestamp: new Date().toISOString(),
                        version_name: 'v1',
                        version_number: 1,
                        fork_of: null
                    };
  
                    hive_keychain.requestCustomJson(
                        loggedInUsername,
                        'safecase_image',
                        'Posting',
                        JSON.stringify(metadata),
                        'Store Image Metadata on Hive',
                        function(response) {
                            if (response.success) {
                                displayUploadedImage(metadata);
                                closeModal(modal);
                                showNotification('Success', 'Image metadata successfully stored on Hive!');
                            } else {
                                console.error('Failed to store image metadata on Hive:', response.message);
                                showNotification('Error', 'Failed to store image metadata on Hive: ' + response.message);
                            }
                        }
                    );
                } else {
                    showNotification('Error', 'Please fill in all required fields.');
                }
            });
  
            document.getElementById('cancel-upload').addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                closeModal(modal);
            });
        } catch (error) {
            showNotification('Error', 'Failed to load image. Please check the IPFS CID and try again.');
        }
    } else {
        showNotification('Error', 'No IPFS CID provided.');
    }
  }
  
  // Function to display the uploaded image
  function displayUploadedImage(metadata) {
    const gallery = document.getElementById('imageGallery');
    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-card';
    
    const imageUrl = `https://ipfs.io/ipfs/${metadata.image_cid}`;
    
    imageContainer.innerHTML = `
        <div class="image-container">
            <img src="${imageUrl}" alt="${metadata.title}" class="uploaded-image">
            <div class="image-loading">Loading image...</div>
        </div>
        <h2>${metadata.title}</h2>
        <p>${metadata.description}</p>
        <div class="tags">
            ${metadata.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}
        </div>
        <div class="metadata">
            <span>Uploaded by: ${metadata.uploader}</span>
            <span>Version: ${metadata.version_name}</span>
        </div>
        <div class="actions">
            <button class="vote-btn" onclick="vote('${metadata.image_cid}')">Vote</button>
            <button class="delete-btn" onclick="deleteImage('${metadata.image_cid}')">Delete</button>
        </div>
        <p class="votes">Votes: 0</p>
    `;
    
    // Handle image loading in gallery
    const img = imageContainer.querySelector('.uploaded-image');
    const loadingDiv = imageContainer.querySelector('.image-loading');
    
    img.onload = () => {
        loadingDiv.style.display = 'none';
        img.style.display = 'block';
    };
    
    img.onerror = () => {
        loadingDiv.textContent = 'Failed to load image';
        img.style.display = 'none';
    };
    
    gallery.insertBefore(imageContainer, gallery.firstChild);
  }
  
  // Function to show notification
  function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${title.toLowerCase()}`;
    notification.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
  
  // Event listener for the upload button
  document.getElementById('upload-btn').addEventListener('click', handleNewImageUpload);