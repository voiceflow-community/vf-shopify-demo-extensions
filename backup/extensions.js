const SERVER_URL = 'http://localhost:3000'

export const ShopifyOrderListExtension = {
  name: 'ShopifyOrderList',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_shopifyOrderList' ||
    trace.payload.name === 'ext_shopifyOrderList',
  render: ({ trace, element }) => {
    const orders = trace.payload?.orders || []

    const orderListContainer = document.createElement('div')
    orderListContainer.className = 'vfrc-order-list-container'

    orderListContainer.innerHTML = `
      <style>
        .vfrc-message--extension-ShopifyOrderList {
          background-color: transparent !important;
          background: none !important;
        }
        .vfrc-order-list-container {
          font-family: Arial, sans-serif;
          max-width: 400px;
          margin: 0 auto;
        }
        .vfrc-order-list-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 16px;
        }
        .vfrc-order-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          cursor: pointer;
          position: relative;
        }
        .vfrc-order-item.selected {
          border-color: #007bff;
          background-color: #f0f8ff;
        }
        .vfrc-order-number {
          font-weight: bold;
          margin-bottom: 8px;
        }
        .vfrc-order-date {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        .vfrc-order-products {
          margin-bottom: 12px;
        }
        .vfrc-order-product {
          margin-bottom: 4px;
        }
        .vfrc-select-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 20px;
          height: 20px;
          border: 2px solid #007bff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vfrc-select-indicator::after {
          content: '';
          width: 12px;
          height: 12px;
          background-color: #007bff;
          border-radius: 50%;
          display: none;
        }
        .vfrc-order-item.selected .vfrc-select-indicator::after {
          display: block;
        }
        .vfrc-proceed-button {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 5px 8px;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-right: 8px;
        }
        .vfrc-proceed-button:hover {
          background-color: #0056b3;
        }
        .vfrc-cancel-button {
          background-color: #f0f0f0;
          border: none;
          border-radius: 8px;
          padding: 5px 8px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .vfrc-cancel-button:hover {
          background-color: #e0e0e0;
        }
        .vfrc-buttons-container {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }
      </style>
      <div class="vfrc-order-list-title">Select an Order to Return</div>
      ${orders
        .map(
          (order, index) => `
        <div class="vfrc-order-item" data-order-id="${order.id}">
          <div class="vfrc-order-number">Order #${index + 1}</div>
          <div class="vfrc-order-date">
            Ordered: ${order.orderedDate}<br>
            Delivered: ${order.deliveredDate}
          </div>
          <div class="vfrc-order-products">
            ${order.products
              .map(
                (product) => `
              <div class="vfrc-order-product">• ${product.name} (x${product.quantity})</div>
            `
              )
              .join('')}
          </div>
          <div class="vfrc-select-indicator"></div>
        </div>
      `
        )
        .join('')}
      <div class="vfrc-buttons-container">
        <button class="vfrc-proceed-button" disabled>Proceed with Selected Order</button>
        <button class="vfrc-cancel-button">Cancel</button>
      </div>
    `

    const orderItems = orderListContainer.querySelectorAll('.vfrc-order-item')
    const proceedButton = orderListContainer.querySelector(
      '.vfrc-proceed-button'
    )
    const cancelButton = orderListContainer.querySelector('.vfrc-cancel-button')

    let selectedOrderId = null

    orderItems.forEach((item) => {
      item.addEventListener('click', () => {
        orderItems.forEach((otherItem) =>
          otherItem.classList.remove('selected')
        )
        item.classList.add('selected')
        selectedOrderId = item.dataset.orderId
        proceedButton.disabled = false
      })
    })

    proceedButton.addEventListener('click', () => {
      if (selectedOrderId) {
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { selectedOrderId },
        })
      }
    })

    cancelButton.addEventListener('click', () => {
      window.voiceflow.chat.interact({
        type: 'cancel',
      })
    })

    element.appendChild(orderListContainer)
  },
}

export const QRCodeScannerExtension = {
  name: 'QRCodeScanner',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_qrCodeScanner' ||
    trace.payload.name === 'ext_qrCodeScanner',
  render: ({ trace, element }) => {
    const scannerContainer = document.createElement('div')
    scannerContainer.innerHTML = `
      <style>
        .vfrc-message--extension-QRCodeScanner {
          background-color: transparent !important;
          background: none !important;
        }
        .qr-scanner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        #qr-video {
          width: 100%;
          max-width: 400px;
          border-radius: 5px;
        }
        .qr-status {
          text-align: center;
          margin-top: 20px;
        }
        .qr-status svg {
          width: 48px;
          height: 48px;
        }
        .success { color: #007bff; }
        .error { color: #f44336; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .fade-out {
          animation: fadeOut 0.5s ease-in-out;
        }
      </style>
      <div class="qr-scanner-container">
        <video id="qr-video"></video>
        <div class="qr-status"></div>
      </div>
    `

    const video = scannerContainer.querySelector('#qr-video')
    const statusElement = scannerContainer.querySelector('.qr-status')

    let scanning = true
    let webcamStream = null
    let scanTimer = null

    const releaseWebcam = () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
        webcamStream = null
        video.srcObject = null
      }
    }

    const startScanning = async () => {
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        video.srcObject = webcamStream
        video.setAttribute('playsinline', true)
        video.play()
        requestAnimationFrame(tick)

        // Set up the 20-second timer
        scanTimer = setTimeout(() => {
          if (scanning) {
            scanning = false
            releaseWebcam()
            video.style.display = 'none'
            window.voiceflow.chat.interact({
              type: 'not found',
              payload: { qrCodeData: null },
            })

            // Fade out the entire container after 2.5 seconds
            setTimeout(() => {
              scannerContainer.classList.add('fade-out')
              setTimeout(() => {
                scannerContainer.style.display = 'none'
              }, 500) // Match this to the fadeOut animation duration
            }, 3000)
          }
        }, 15000) // 20 seconds
      } catch (err) {
        console.error('Error accessing webcam:', err)
        statusElement.innerHTML = `
          <div class="error fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>Error accessing your camera. Please make sure you've granted permission.</p>
          </div>
        `
        scanning = false
        releaseWebcam()
        video.style.display = 'none'
        window.voiceflow.chat.interact({
          type: 'no webcam',
          payload: { qrCodeData: null },
        })

        // Fade out the entire container after 2.5 seconds
        setTimeout(() => {
          scannerContainer.classList.add('fade-out')
          setTimeout(() => {
            scannerContainer.style.display = 'none'
          }, 500) // Match this to the fadeOut animation duration
        }, 2500)
      }
    }

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && scanning) {
        const canvas = document.createElement('canvas')
        canvas.height = video.videoHeight
        canvas.width = video.videoWidth
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        if (code) {
          console.log('Found QR code', code.data)
          scanning = false
          clearTimeout(scanTimer)
          releaseWebcam()
          video.style.display = 'none'
          statusElement.innerHTML = `
            <div class="success fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              <p>QR Code successfully scanned</p>
            </div>
          `
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: { qrCodeData: code.data },
          })

          // Fade out the entire container after 5 seconds
          setTimeout(() => {
            scannerContainer.classList.add('fade-out')
            setTimeout(() => {
              scannerContainer.style.display = 'none'
            }, 500) // Match this to the fadeOut animation duration
          }, 2500)
        } else {
          requestAnimationFrame(tick)
        }
      } else {
        requestAnimationFrame(tick)
      }
    }

    startScanning()
    element.appendChild(scannerContainer)

    // Clean up function
    return () => {
      releaseWebcam()
    }
  },
}

export const ProductUploadExtension = {
  name: 'ProductUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_productUpload' ||
    trace.payload.name === 'ext_productUpload',
  render: ({ trace, element }) => {
    const uploadContainer = document.createElement('div')
    uploadContainer.innerHTML = `
      <style>
        .vfrc-message--extension-ProductUpload {
          background-color: transparent !important;
          background: none !important;
        }
        .upload-container .upload-options {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 10px; // This adds space between the buttons
        }
        .upload-container .upload-option {
          margin-left: 0px;
          padding: 10px 15px; // Reduced padding to make buttons less tall
          background-color: #007bff !important; // Force blue background
          color: white !important; // Force white text
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: row; // Changed to row to put icon and text side by side
          align-items: center;
          justify-content: center;
          width: 78px; // Adjust width to account for gap
          text-align: center;
        }
        .upload-container .upload-option:hover {
          background-color: #0056b3 !important; // Force darker blue on hover
        }
        .upload-container .upload-option svg {
          width: 20px;
          height: 20px;
          margin-right: 8px; // Add space between icon and text
          fill: currentColor; // Ensure the SVG is white
        }
        .upload-container .upload-option-text {
          font-size: 12px;
        }
        .my-file-upload {
          border: 2px dashed rgba(46, 110, 225, 0.3);
          padding: 20px;
          text-align: center;
          cursor: pointer;
          display: none;
          transition: all 0.3s ease;
        }
        .my-file-upload:hover {
          background-color: rgba(46, 110, 225, 0.1);
        }
        #webcam-container {
          display: none;
        }
        #webcam-video {
          width: 100%;
          max-width: 400px;
          border-radius: 5px;
        }
        .webcam-error {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #666;
          background-color: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }
        .webcam-error svg {
          margin-right: 10px;
          fill: #666;
        }
        .webcam-error p {
          margin: 0;
        }
        #capture-button {
          margin-top: 10px;
          padding: 10px 20px;
          background-color: #007bff !important;
          color: white !important;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          font-size: 14px;
          width: auto;
          text-align: center;
        }
        #capture-button:hover {
          background-color: #0056b3;
        }
        .upload-status {
          text-align: center;
          margin-top: 20px;
        }
        .upload-status svg {
          width: 48px;
          height: 48px;
        }
        .success { color: #007bff; }
        .error { color: #f44336; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
      </style>
      <div class="upload-container">
        <div class="upload-options">
          <div class="upload-option" id="file-option" style="background-color: #007bff; color: white;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zm-1-4l-1.41-1.41L13 12.17V4h-2v8.17L8.41 9.59 7 11l5 5 5-5z"/></svg>
            <span class="upload-option-text">File</span>
          </div>
          <div class="upload-option" id="webcam-option" style="background-color: #007bff; color: white;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM15 16H5V8h10v8z"/></svg>
            <span class="upload-option-text">Webcam</span>
          </div>
        </div>
        <div class='my-file-upload'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
          <p>Drag and drop a file here or click to upload</p>
        </div>
        <input type='file' style='display: none;'>
        <div id="webcam-container">
          <video id="webcam-video" autoplay playsinline></video>
          <button id="capture-button">
            Capture Image
          </button>
        </div>
        <div class="upload-status"></div>
      </div>
    `

    const fileOption = uploadContainer.querySelector('#file-option')
    const webcamOption = uploadContainer.querySelector('#webcam-option')
    const fileUploadBox = uploadContainer.querySelector('.my-file-upload')
    const fileInput = uploadContainer.querySelector('input[type=file]')
    const webcamContainer = uploadContainer.querySelector('#webcam-container')
    const webcamVideo = uploadContainer.querySelector('#webcam-video')
    const captureButton = uploadContainer.querySelector('#capture-button')

    let webcamStream = null // Store the webcam stream

    webcamOption.addEventListener('click', async () => {
      fileUploadBox.style.display = 'none'
      webcamContainer.style.display = 'block'
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        webcamVideo.srcObject = webcamStream
      } catch (error) {
        console.error('Error accessing webcam:', error)
        webcamContainer.innerHTML = `<div class="webcam-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>Error accessing yourwebcam,</br>please use file upload instead.</div>`
      }
    })

    function releaseWebcam() {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
        webcamStream = null
        webcamVideo.srcObject = null
      }
    }

    fileOption.addEventListener('click', () => {
      releaseWebcam()
      fileUploadBox.style.display = 'block'
      webcamContainer.style.display = 'none'
    })

    captureButton.addEventListener('click', () => {
      const canvas = document.createElement('canvas')
      canvas.width = webcamVideo.videoWidth
      canvas.height = webcamVideo.videoHeight
      canvas.getContext('2d').drawImage(webcamVideo, 0, 0)
      canvas.toBlob((blob) => {
        const file = new File([blob], 'webcam-capture.jpg', {
          type: 'image/jpeg',
        })
        uploadFile(file)
      }, 'image/jpeg')
    })

    function uploadFile(file) {
      const uploadStatus = uploadContainer.querySelector('.upload-status')
      const uploadOptions = uploadContainer.querySelector('.upload-options')
      const fileUploadBox = uploadContainer.querySelector('.my-file-upload')
      const webcamContainer = uploadContainer.querySelector('#webcam-container')

      uploadStatus.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="spinner"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
        <p>Uploading...</p>
      `
      uploadStatus.classList.add('fade-in')

      // Hide upload options and webcam
      uploadOptions.style.display = 'none'
      fileUploadBox.style.display = 'none'
      webcamContainer.style.display = 'none'

      // Release webcam access
      releaseWebcam()

      var data = new FormData()
      data.append('file', file)

      fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: data,
      })
        .then((response) => {
          if (response.ok) {
            return response.json()
          } else {
            throw new Error('Upload failed: ' + response.statusText)
          }
        })
        .then((result) => {
          uploadStatus.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="success"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
            <p>Upload successful!</p>
          `
          console.log('File uploaded:', result.data.url)
          window.voiceflow.chat.interact({
            type: 'complete',
            payload: {
              file: result.data.url.replace(
                'https://tmpfiles.org/',
                'https://tmpfiles.org/dl/'
              ),
            },
          })
        })
        .catch((error) => {
          console.error(error)
          uploadStatus.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="error"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            <p>Error during upload</p>
          `
          // Show upload options again on error
          uploadOptions.style.display = 'flex'
        })
    }

    fileUploadBox.addEventListener('click', function () {
      fileInput.click()
    })

    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0]
      console.log('File selected:', file)
      uploadFile(file)
    })

    element.appendChild(uploadContainer)
  },
}

const TwilioVerify = {
  sendVerificationEmail: async (email) => {
    const response = await fetch(`${SERVER_URL}/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    console.log('TwilioVerify.sendVerificationEmail', data)
    if (!data.success) {
      if (data.maxAttemptsReached) {
        throw new Error(
          'Maximum verification attempts reached. Please try again later.'
        )
      }
      throw new Error(data.error || 'Failed to send verification email')
    }
    return data
  },

  checkVerificationCode: async (email, code, userId) => {
    const response = await fetch(`${SERVER_URL}/check-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, userId }),
    })
    const data = await response.json()
    if (!data.success) {
      if (data.maxAttemptsReached) {
        throw new Error(
          'Maximum verification attempts reached. Please try again later.'
        )
      }
      throw new Error(data.error || 'Failed to verify code')
    }
    return data.status === 'approved'
  },
}

export const EmailVerificationExtension = {
  name: 'EmailVerification',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_verify' || trace.payload.name === 'ext_verify',
  render: async ({ trace, element }) => {
    const email = trace.payload?.email || 'nicolas@gallagan.fr'

    // Extract user ID from Voiceflow session in local storage
    let userId = null
    try {
      const voiceflowSession = localStorage.getItem('voiceflow-session-xyz')
      if (voiceflowSession) {
        const sessionData = JSON.parse(voiceflowSession)
        userId = sessionData.userID
      }
    } catch (error) {
      console.error('Failed to extract user ID from Voiceflow session:', error)
    }

    const verificationContainer = document.createElement('div')

    verificationContainer.innerHTML = `
      <style>
        .vfrc-message--extension-EmailVerification {
          background-color: transparent !important;
          background: none !important;
        }
        .vfrc-email-verification {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 10px;
          max-width: 220px;
        }
        .vfrc-code-inputs {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          width: 100%;
        }
        .vfrc-code-input {
          width: 28px;
          height: 32px;
          text-align: center;
          font-size: 16px;
          margin: 0 2px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .vfrc-verification-message {
          margin-top: 10px;
          font-weight: bold;
          font-size: 12px;
          text-align: center;
        }
        .verify-error {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: #666;
          background-color: #f8f8f8;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          margin-top: 10px;
        }
        .verify-error svg {
          margin-right: 10px;
          fill: #666;
        }
        .verify-error p {
          margin: 0;
        }
      </style>
      <div class="vfrc-email-verification">
        <div class="vfrc-code-inputs">
          <input type="text" class="vfrc-code-input" maxlength="1">
          <input type="text" class="vfrc-code-input" maxlength="1">
          <input type="text" class="vfrc-code-input" maxlength="1">
          <input type="text" class="vfrc-code-input" maxlength="1">
          <input type="text" class="vfrc-code-input" maxlength="1">
          <input type="text" class="vfrc-code-input" maxlength="1">
        </div>
        <div class="vfrc-verification-message"></div>
      </div>
    `

    const codeInputs =
      verificationContainer.querySelectorAll('.vfrc-code-input')
    const verificationMessage = verificationContainer.querySelector(
      '.vfrc-verification-message'
    )

    const hideCodeInputs = () => {
      const codeInputsContainer =
        verificationContainer.querySelector('.vfrc-code-inputs')
      codeInputsContainer.style.display = 'none'
    }

    let remainingTries = 3
    let maxAttemptsReached = false

    // Send verification email automatically
    try {
      console.log('Sending verification email to', email)
      await TwilioVerify.sendVerificationEmail(email)
      verificationMessage.textContent = 'Verification code sent to your email.'
      codeInputs[0].focus()
    } catch (error) {
      if (error.message.includes('Maximum verification attempts reached')) {
        verificationMessage.innerHTML = `<div class="webcam-error">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg><p>Maximum attempts reached.</br>Please wait 5 minutes before trying again.</p></div>`
        verificationMessage.style.color = 'orange'
        hideCodeInputs()
      } else {
        verificationMessage.textContent = 'Failed to send verification email.'
        verificationMessage.style.color = 'red'
        hideCodeInputs()
      }
    }

    const checkVerificationCode = async () => {
      const code = Array.from(codeInputs)
        .map((input) => input.value)
        .join('')
      if (code.length === 6) {
        try {
          const isVerified = await TwilioVerify.checkVerificationCode(
            email,
            code,
            userId
          )
          if (isVerified) {
            verificationMessage.textContent = 'Email verified successfully!'
            verificationMessage.style.color = 'green'
            codeInputs.forEach((input) => (input.disabled = true))
            window.voiceflow.chat.interact({
              type: 'complete',
              //payload: { },
            })
          } else {
            remainingTries--
            if (remainingTries > 0) {
              verificationMessage.textContent = `Invalid code. ${remainingTries} ${
                remainingTries === 1 ? 'try' : 'tries'
              } remaining.`
              verificationMessage.style.color = 'orange'
              codeInputs.forEach((input) => {
                input.value = ''
                input.disabled = false
              })
              codeInputs[0].focus()
            } else {
              maxAttemptsReached = true
              verificationMessage.textContent =
                'Maximum attempts reached. Please try again later.'
              verificationMessage.style.color = 'red'
              codeInputs.forEach((input) => (input.disabled = true))
              window.voiceflow.chat.interact({
                type: 'complete',
                //payload: { },
              })
            }
          }
        } catch (error) {
          if (error.message.includes('Maximum verification attempts reached')) {
            maxAttemptsReached = true
            verificationMessage.innerHTML = `<div class="verify-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <p>Maximum attempts reached.<br/>Please wait 5 minutes before trying again.</p>
        </div>`
            codeInputs.forEach((input) => (input.disabled = true))
            window.voiceflow.chat.interact({
              type: 'complete',
              //payload: { maxAttemptsReached: true },
            })
          } else {
            verificationMessage.textContent =
              'Failed to verify code. Please try again.'
            verificationMessage.style.color = 'red'
            if (remainingTries > 0) {
              codeInputs.forEach((input) => {
                input.value = ''
                input.disabled = false
              })
              codeInputs[0].focus()
            } else {
              maxAttemptsReached = true
              verificationMessage.textContent =
                'Maximum attempts reached. Please try again later.'
              verificationMessage.style.color = 'red'
              codeInputs.forEach((input) => (input.disabled = true))
              window.voiceflow.chat.interact({
                type: 'complete',
                //payload: { maxAttemptsReached: true },
              })
            }
          }
          window.voiceflow.chat.interact({
            type: 'complete',
            //payload: { },
          })
        }
      }
    }

    const handleInput = (e, index) => {
      if (!maxAttemptsReached && remainingTries > 0) {
        if (e.target.value.length === 1 && index < codeInputs.length - 1) {
          codeInputs[index + 1].focus()
        }
        if (Array.from(codeInputs).every((input) => input.value.length === 1)) {
          checkVerificationCode()
        }
      }
    }

    const handleKeydown = (e, index) => {
      if (!maxAttemptsReached && remainingTries > 0) {
        if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
          codeInputs[index - 1].focus()
        }
      }
    }

    const handlePaste = (e) => {
      if (!maxAttemptsReached && remainingTries > 0) {
        e.preventDefault()
        const pastedText = (e.clipboardData || window.clipboardData).getData(
          'text'
        )
        const code = pastedText.replace(/\D/g, '').slice(0, 6)

        if (code.length === 6) {
          Array.from(codeInputs).forEach((input, index) => {
            input.value = code[index]
          })
          checkVerificationCode()
        }
      }
    }

    codeInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => handleInput(e, index))
      input.addEventListener('keydown', (e) => handleKeydown(e, index))
      input.addEventListener('paste', handlePaste)
    })

    element.appendChild(verificationContainer)
    codeInputs[0].focus()
  },
}
