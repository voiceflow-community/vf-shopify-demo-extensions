const SERVER_URL = 'AUTO_POPULATED'
window.vf_done = false

export const DemoUploadExtension = {
  name: 'DemoUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_demoUpload',
  render: ({ trace, element }) => {
    const uploadContainer = document.createElement('div')
    uploadContainer.innerHTML = `
      <style>
        .vfrc-message--extension-DemoUpload {
          background-color: transparent !important;
          background: none !important;
        }
        .upload-container .upload-options {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 10px;
        }
        .upload-container .upload-option {
          /* margin-left: 0px; */
          margin-top: 15px;
          padding: 10px 15px;
          background-color: white !important;
          color: #CF0A2C !important;
          border: 1px solid #CF0A2C;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 90px;
          text-align: center;
        }
        .upload-container .upload-option:hover {
          color: white !important;
          background-color: #CF0A2C !important;
        }
        .upload-container .upload-option svg {
          width: 20px;
          height: 20px;
          margin-right: 8px;
          fill: currentColor;
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
          background-color: white !important;
          color: #CF0A2C !important;
          border: 1px solid #CF0A2C;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          font-size: 14px;
          width: auto;
          text-align: center;
        }
        #capture-button:hover {
          background-color: #CF0A2C !important;
          color: white !important;
        }
        .upload-status {
          text-align: center;
          margin-top: 20px;
        }
        .upload-status svg {
          width: 48px;
          height: 48px;
        }
        .success { color: #CF0A2C; }
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
        <div id="webcam-container">
          <video id="webcam-video" autoplay playsinline></video>
          <button id="capture-button">
            Capture Image
          </button>
        </div>
        <div class="upload-status"></div>
      </div>
    `

    const webcamContainer = uploadContainer.querySelector('#webcam-container')
    const webcamVideo = uploadContainer.querySelector('#webcam-video')
    const captureButton = uploadContainer.querySelector('#capture-button')

    let webcamStream = null
    async function startWebcam() {
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
    </svg>Error accessing your webcam,</br>please use file upload instead.</div>`
      }
    }
    startWebcam()
    function releaseWebcam() {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
        webcamStream = null
        webcamVideo.srcObject = null
      }
    }

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
      const webcamContainer = uploadContainer.querySelector('#webcam-container')

      uploadStatus.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="spinner"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
        <p>Uploading...</p>
      `
      uploadStatus.classList.add('fade-in')
      webcamContainer.style.display = 'none'

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
          window.voiceflow.chat.interact({
            type: 'error',
          })
        })
    }

    element.appendChild(uploadContainer)
  },
}

// This extension displays a gift card with a specified amount and code
export const GiftCardDisplayExtension = {
  name: 'GiftCardDisplay',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_giftCardDisplay',
  render: ({ trace, element }) => {
    const amount = trace.payload.amount || '20'
    const code = (trace.payload.code || 'G9FD5FEG8HDC8A94').toUpperCase()
    const formattedCode = code.match(/.{1,4}/g).join(' ')

    const giftCardContainer = document.createElement('div')
    giftCardContainer.innerHTML = `
      <style>
        .vfrc-message--extension-GiftCardDisplay {
          background-color: transparent !important;
          background: none !important;
        }
        .gift-card-container {
          font-family: Arial, sans-serif;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #fff;
          text-align: center;
          position: relative;
        }
        .gift-card-image {
          width: 100%;
          max-width: 400px;
          border-radius: 8px;
          position: relative;
        }
        .gift-card-amount {
          width: 100%;
          max-width: 350px;
          font-size: 50px;
          font-weight: bold;
          color: #fff;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        .gift-card-code {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          background-color: none;
          padding: 10px;
          border-radius: 4px;
          display: inline-block;
        }
        .copy-button {
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: #CF0A2C !important;
          background-color: #fff !important;
          border: 1px solid #CF0A2C !important;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .copy-button:hover {
          background-color: #CF0A2C !important;
          color: #fff !important;
        }
      </style>
      <div class="gift-card-container">
      <div class="gift-card-image">
        <img src="https://s3.amazonaws.com/com.voiceflow.studio/share/card/card.jpg" alt="Gift Card" class="gift-card-image">
        <div class="gift-card-amount">$${amount}</div>
        </div>
        <div class="gift-card-code" id="gift-card-code">${formattedCode}</div>
        <button class="copy-button" id="copy-button">Copy Code</button>
      </div>
    `

    const copyButton = giftCardContainer.querySelector('#copy-button')
    const giftCardCode = giftCardContainer.querySelector('#gift-card-code')

    copyButton.addEventListener('click', () => {
      navigator.clipboard.writeText(giftCardCode.textContent).then(() => {
        alert('Gift card code copied to clipboard!')
      })
    })

    element.appendChild(giftCardContainer)
  },
}

// This extension shows a waiting animation with customizable text and delay
// Also checking for the vf_done value to stop/hide the animation if it's true
export const WaitingAnimationExtension = {
  name: 'WaitingAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_waitingAnimation',
  render: async ({ trace, element }) => {
    window.vf_done = true
    await new Promise((resolve) => setTimeout(resolve, 250))

    const text = trace.payload?.text || 'Please wait...'
    const delay = trace.payload?.delay || 3000

    const waitingContainer = document.createElement('div')
    waitingContainer.innerHTML = `
      <style>
        .vfrc-message--extension-WaitingAnimation {
          background-color: transparent !important;
          background: none !important;
        }
        .waiting-animation-container {
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #fffc;
          display: flex;
          align-items: center;
        }
        .waiting-text {
          display: inline-block;
          margin-left: 10px;
        }
        .waiting-letter {
          display: inline-block;
          animation: shine 1s linear infinite;
        }
        @keyframes shine {
          0%, 100% { color: #fffc; }
          50% { color: #000; }
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #fffc;
          border-top: 2px solid #CF0A2C;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      <div class="waiting-animation-container">
        <div class="spinner"></div>
        <span class="waiting-text">${text
          .split('')
          .map((letter, index) =>
            letter === ' '
              ? ' '
              : `<span class="waiting-letter" style="animation-delay: ${
                  index * (1000 / text.length)
                }ms">${letter}</span>`
          )
          .join('')}</span>
      </div>
    `

    element.appendChild(waitingContainer)

    window.voiceflow.chat.interact({
      type: 'continue',
    })

    let intervalCleared = false
    window.vf_done = false

    const checkDoneInterval = setInterval(() => {
      if (window.vf_done) {
        clearInterval(checkDoneInterval)
        waitingContainer.style.display = 'none'
        window.vf_done = false
      }
    }, 100)

    setTimeout(() => {
      if (!intervalCleared) {
        clearInterval(checkDoneInterval)
        waitingContainer.style.display = 'none'
      }
    }, delay)
  },
}

// This extension triggers a "done" action,
// typically used to signal the completion of a task
// and hide a previous WaitingAnimation
export const DoneAnimationExtension = {
  name: 'DoneAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_doneAnimation',
  render: async ({ trace, element }) => {
    window.vf_done = true
    await new Promise((resolve) => setTimeout(resolve, 250))

    window.voiceflow.chat.interact({
      type: 'continue',
    })
  },
}

// This extension displays a list of Shopify orders with selectable items
export const ShopifyOrderListExtension = {
  name: 'ShopifyOrderList',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_shopifyOrderList',
  render: ({ trace, element }) => {
    const orders = trace.payload.orders || []
    const orderIds = trace.payload.orderIds || []

    const numericOrderIds = orderIds.map((id) => Number(id))

    const filteredOrders = numericOrderIds.length
      ? orders.filter((order) => numericOrderIds.includes(order.id))
      : orders

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
      return date.toLocaleDateString('en-US', options)
    }

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
          border-color: #CF0A2C;
          background-color: #fff;
        }
        .vfrc-order-number {
          font-weight: bold;
          margin-bottom: 8px;
        }
        .vfrc-order-date {
          font-size: 15px;
          color: #666;
          margin-bottom: 8px;
        }
        .vfrc-order-products {
          margin-bottom: 12px;
        }
        .vfrc-order-product {
          font-size: 14px;
          font-weight: 300;
          margin-bottom: 4px;
        }
        .vfrc-select-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 20px;
          height: 20px;
          border: 2px solid #CF0A2C;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vfrc-select-indicator::after {
          content: '';
          width: 12px;
          height: 12px;
          background-color: #CF0A2C;
          border-radius: 50%;
          display: none;
        }
        .vfrc-order-item.selected .vfrc-select-indicator::after {
          display: block;
        }

      </style>
      ${filteredOrders
        .map(
          (order, index) => `
        <div class="vfrc-order-item" data-order-id="${order.id}">
          <div class="vfrc-order-number">Order ${order.name}</div>
          <div class="vfrc-order-date">
          ${formatDate(order.processed_at)}
            </b><br>
            Total: <b>${order.total_price_set.presentment_money.amount} ${
            order.total_price_set.presentment_money.currency_code
          }
          </div>
          <div class="vfrc-order-products">
            ${order.line_items
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
    `

    const orderItems = orderListContainer.querySelectorAll('.vfrc-order-item')

    let selectedOrderId = null

    orderItems.forEach((item) => {
      item.addEventListener('click', () => {
        orderItems.forEach((otherItem) =>
          otherItem.classList.remove('selected')
        )
        item.classList.add('selected')
        selectedOrderId = item.dataset.orderId
        if (selectedOrderId) {
          window.voiceflow.chat.interact({
            type: 'selected',
            payload: { selectedOrderId },
          })
        }
      })
    })

    element.appendChild(orderListContainer)
  },
}

// This extension provides a QR code scanner using the device's camera
export const QRCodeScannerExtension = {
  name: 'QRCodeScanner',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_qrCodeScanner',
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
        .success { color: #CF0A2C; }
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

          setTimeout(() => {
            scannerContainer.classList.add('fade-out')
            setTimeout(() => {
              scannerContainer.style.display = 'none'
            }, 500)
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
// This extension provides a product upload feature using a file upload or webcam capture
export const ProductUploadExtension = {
  name: 'ProductUpload',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_productUpload',
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
          gap: 10px;
        }
        .upload-container .upload-option {
          /* margin-left: 0px; */
          margin-top: 15px;
          padding: 10px 15px;
          background-color: white !important;
          color: #CF0A2C !important;
          border: 1px solid #CF0A2C;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          width: 90px;
          text-align: center;
        }
        .upload-container .upload-option:hover {
          color: white !important;
          background-color: #CF0A2C !important;
        }
        .upload-container .upload-option svg {
          width: 20px;
          height: 20px;
          margin-right: 8px;
          fill: currentColor;
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
          background-color: white !important;
          color: #CF0A2C !important;
          border: 1px solid #CF0A2C;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          font-size: 14px;
          width: auto;
          text-align: center;
        }
        #capture-button:hover {
          background-color: #CF0A2C !important;
          color: white !important;
        }
        .upload-status {
          text-align: center;
          margin-top: 20px;
        }
        .upload-status svg {
          width: 48px;
          height: 48px;
        }
        .success { color: #CF0A2C; }
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
          <div class="upload-option" id="file-option" style="background-color: #CF0A2C; color: white;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zm-1-4l-1.41-1.41L13 12.17V4h-2v8.17L8.41 9.59 7 11l5 5 5-5z"/></svg>
            <span class="upload-option-text">File</span>
          </div>
          <div class="upload-option" id="webcam-option" style="background-color: #CF0A2C; color: white;">
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

    let webcamStream = null

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
    </svg>Error accessing your webcam,</br>please use file upload instead.</div>`
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
      uploadOptions.style.display = 'none'
      fileUploadBox.style.display = 'none'
      webcamContainer.style.display = 'none'

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
          window.voiceflow.chat.interact({
            type: 'error',
          })
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

// This extension handles email verification by sending a code and verifying user input
export const EmailVerificationExtension = {
  name: 'EmailVerification',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_verify',
  render: async ({ trace, element }) => {
    const email = trace.payload?.email || null

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
          margin-left: auto;
          margin-right: auto;
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
          border: 1px solid #ddd;
          border-radius: 4px;
        }
          .vfrc-code-input:focus {
          border-color: #CF0A2C;
          outline: none;
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
          color: #CF0A2C;
          background-color: none;
          border: 1px solid #CF0A2C;
          border-radius: 8px;
          padding: 10px;
          margin-top: 10px;
        }
        .verify-error svg {
          margin-right: 10px;
          fill: #CF0A2C;
        }
        .verify-error p {
          margin: 0;
          color: #CF0A2C;
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
      const response = await fetch(`${SERVER_URL}/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!data.success) {
        if (data.maxAttemptsReached) {
          throw new Error(
            'Maximum verification attempts reached. Please try again later.'
          )
        }
        throw new Error(data.error || 'Failed to send verification email')
      }
      verificationMessage.textContent = 'Verification code sent to your email.'
      codeInputs[0].focus()
    } catch (error) {
      if (error.message.includes('Maximum verification attempts reached')) {
        verificationMessage.innerHTML = `<div class="verify-error">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg><p>Maximum attempts reached.</br>Please wait 5 minutes before trying again.</p></div>`
        hideCodeInputs()
      } else {
        verificationMessage.innerHTML = `<div class="verify-error">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg><p>Failed to send verification email.</p></div>`
        hideCodeInputs()
      }
    }

    const checkVerificationCode = async () => {
      const code = Array.from(codeInputs)
        .map((input) => input.value)
        .join('')
      if (code.length === 6) {
        try {
          const response = await fetch(`${SERVER_URL}/check-verification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code, userId }),
          })
          const data = await response.json()
          if (data.success && data.status === 'approved') {
            codeInputs.forEach((input) => (input.disabled = true))
            window.voiceflow.chat.interact({
              type: 'verified',
            })
            verificationContainer.style.display = 'none'
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
              verificationMessage.innerHTML = `<div class="verify-error">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg><p>Maximum attempts reached.</br>Please wait 5 minutes before trying again.</p></div>`
              codeInputs.forEach((input) => (input.disabled = true))
              window.voiceflow.chat.interact({
                type: 'max attempts',
              })
              hideCodeInputs()
            }
          }
        } catch (error) {
          verificationMessage.innerHTML = `<div class="verify-error">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg><p>Failed to verify code. Please try again.</p></div>`
          if (remainingTries > 0) {
            codeInputs.forEach((input) => {
              input.value = ''
              input.disabled = false
            })
            codeInputs[0].focus()
          } else {
            maxAttemptsReached = true
            verificationMessage.innerHTML = `<div class="verify-error">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg><p>Maximum attempts reached.</br>Please wait 5 minutes before trying again.</p></div>`
            codeInputs.forEach((input) => (input.disabled = true))
            window.voiceflow.chat.interact({
              type: 'max attempts',
            })
            hideCodeInputs()
          }
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

// This extension handles return requests for a Shopify order
export const ReturnRequestExtension = {
  name: 'ReturnRequest',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_returnRequest',
  render: ({ trace, element }) => {
    const { order_id, items } = trace.payload
    const defaultImageURL =
      'https://0e3db0-b3.myshopify.com/cdn/shop/files/NewBalance_M1000V1.png?v=1726826154&width=120'

    const returnRequestContainer = document.createElement('div')
    returnRequestContainer.innerHTML = `
      <style>
        .vfrc-message--extension-ReturnRequest {
          background-color: transparent !important;
          background: none !important;
        }
        .return-request-container {
          font-family: Arial, sans-serif;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #fff;
        }
        .return-request-container.disabled {
          pointer-events: none;
          opacity: 0.6;
        }
        .return-request-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .order-number {
          font-size: 16px;
          margin-bottom: 20px;
        }
        .return-item {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        .return-item:last-child {
          border-bottom: none;
        }
          .item-content {
          display: flex;
          align-items: flex-start;
        }
        .item-image {
          width: 70px;
          height: 50px;
          background-color: #fff;
          margin-right: 15px;
          background-size: cover;
          background-position: center;
          border-radius: 8%;
          object-fit: cover;
        }
        .item-details {
          flex-grow: 1;
        }
        .item-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .item-code, .item-price {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        .item-price {
          font-weight: bold;
        }
        .item-checkbox {
          margin-left: 10px;
          margin-top: 5px;
        }
        .item-checkbox input[type="checkbox"] {
          appearance: none;
          width: 20px;
          height: 20px;
          border: 2px solid #999;
          border-radius: 50%;
          outline: none;
          cursor: pointer;
        }
        .item-checkbox input[type="checkbox"]:checked {
          background-color: #CF0A2C;
          border-color: #CF0A2C;
        }
        .item-checkbox input[type="checkbox"]:checked::after {
          content: '✓';
          display: block;
          text-align: center;
          color: white;
          font-size: 14px;
          line-height: 20px;
        }
        .refund-reason {
          margin-top: 10px;
          display: none;
          width: 100%;
        }
        .refund-reason input {
          width: 100%;
          padding: 8px;
          border: 1px solid #eee;
          border-radius: 4px;
          font-size: 12px;
          box-sizing: border-box;
        }
        .refund-reason input:focus {
          border-color: #CF0A2C !important;
          outline: none !important;
          /* box-shadow: 0 0 0 1px rgba(207, 10, 44, 0.25) !important; */
        }
        .submit-button, .cancel-button {
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          color: #CF0A2C !important;
          background-color: #fff !important;
          border: 1px solid #CF0A2C !important;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }
          .submit-button:hover {
          background-color: #CF0A2C !important;
          color: #fff !important;
        }
        .cancel-button:hover {
          background-color: #CF0A2C !important;
          color: #fff !important;
        }
        .error-message {
          color: #CF0A2C;
          font-size: 12px;
          margin-top: 5px;
        }
      </style>
      <div class="return-request-container">
        <div class="return-request-title">Return Request</div>
        <div class="order-number">Order Number: ${order_id}</div>
        ${items
          .map(
            (item, index) => `
          <div class="return-item">
            <div class="item-content">
              <div class="item-image" style="background-image: url('${
                item.imageUrl || defaultImageURL
              }');"></div>
              <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-code">Product Code: ${item.product_id}</div>
                <div class="item-price">${item.currency} ${Number(
              item.price
            ).toFixed(2)}</div>
              </div>
              <div class="item-checkbox">
                <input type="checkbox" id="item-${index}" ${
              item.selected ? 'checked' : ''
            }>
              </div>
            </div>
            <div class="refund-reason" id="refund-reason-${index}" ${
              item.selected ? 'style="display: block;"' : ''
            }>
              <input type="text" placeholder="Please provide a reason for the return" value="${
                item.reason || ''
              }">
            <div class="error-message" id="error-${index}" style="display: none;">Reason is required</div>
            </div>
          </div>
        `
          )
          .join('')}
        <button class="submit-button">Submit</button>
        <button class="cancel-button">Cancel</button>
      </div>
    `

    const checkboxes = returnRequestContainer.querySelectorAll(
      'input[type="checkbox"]'
    )
    const refundReasons =
      returnRequestContainer.querySelectorAll('.refund-reason')
    const submitButton = returnRequestContainer.querySelector('.submit-button')
    const cancelButton = returnRequestContainer.querySelector('.cancel-button')

    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('change', () => {
        refundReasons[index].style.display = checkbox.checked ? 'block' : 'none'
      })
    })

    submitButton.addEventListener('click', () => {
      let isValid = true
      const selectedItems = Array.from(checkboxes)
        .map((checkbox, index) => {
          const reasonInput = refundReasons[index].querySelector('input')
          const errorMessage =
            refundReasons[index].querySelector('.error-message')

          if (checkbox.checked) {
            if (!reasonInput.value.trim()) {
              reasonInput.classList.add('error')
              errorMessage.style.display = 'block'
              isValid = false
            } else {
              reasonInput.classList.remove('error')
              errorMessage.style.display = 'none'
            }
            return {
              ...items[index],
              selected: true,
              reason: reasonInput.value,
            }
          }
          return null
        })
        .filter(Boolean)

      if (isValid) {
        returnRequestContainer.classList.add('disabled')
        const inputs = returnRequestContainer.querySelectorAll('input, button')
        inputs.forEach((input) => (input.disabled = true))

        submitButton.disabled = true
        cancelButton.disabled = true

        window.voiceflow.chat.interact({
          type: 'submitted',
          payload: { selectedItems },
        })
      }
    })

    cancelButton.addEventListener('click', () => {
      window.voiceflow.chat.interact({
        type: 'cancelled',
      })
    })

    element.appendChild(returnRequestContainer)
  },
}
