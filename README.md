# Voiceflow Shopify Demo Extensions

This repository contains a set of custom extensions for enhancing the Voiceflow chat widget, specifically tailored for Shopify-related functionalities.

## Getting Started

### Prerequisites

- Bun runtime

### Installing Bun

Bun is a fast all-in-one JavaScript runtime. To install Bun, run the following command:

```
curl -fsSL https://bun.sh/install | bash
```

For more information and alternative installation methods, visit the [official Bun installation guide](https://bun.sh/docs/installation).


### Installation

1. Clone this repository
2. Install dependencies:
   ```
   bun install
   ```
3. Copy the `.env.template` file to `.env` and fill in the required environment variables:
   ```
   cp .env.template .env
   ```

### Running the Server

To start the server, run:

```
bun start
```

The server will start on the port specified in your `.env` file (default is 3002).

### Testing the Chat Widget Locally

Open your browser and go to `http://localhost:3000` (or whatever port you've specified in your `.env` file).

This will serve the `index.html` file and allow you to view and interact with the chat widget in your local environment. The server will handle serving both the HTML file and the necessary scripts and styles for the extensions.

Note: Make sure you've set up your `.env` file correctly, including the `VOICEFLOW_PROJECT_ID`, for the chat widget to function properly.


## Available Extensions

1. **GiftCardDisplayExtension**: Displays a gift card with a specified amount and code.
2. **WaitingAnimationExtension**: Shows a waiting animation with customizable text and delay.
3. **DoneAnimationExtension**: Triggers a "done" action to signal the completion of a task.
4. **ShopifyOrderListExtension**: Displays a list of Shopify orders with selectable items.
5. **QRCodeScannerExtension**: Provides a QR code scanner using the device's camera.
6. **ProductUploadExtension**: Allows product upload using file upload or webcam capture.
7. **EmailVerificationExtension**: Handles email verification by sending a code and verifying user input.
8. **ReturnRequestExtension**: Handles return requests for a Shopify order.
9. **DemoUploadExtension**: Upload a webcam capture to your agent.

## Using the Extensions with the Chat Widget

To use these extensions in your Voiceflow chat widget, include the following snippet code:


```html
<script src="https://cdn.jsdelivr.net/npm/jsqr@1.3.1/dist/jsQR.min.js"></script>
    <script type="module">
      import { DemoUploadExtension, EmailVerificationExtension, ProductUploadExtension, QRCodeScannerExtension, ShopifyOrderListExtension, ReturnRequestExtension, WaitingAnimationExtension, DoneAnimationExtension, GiftCardDisplayExtension } from 'SERVER_URL/scripts/extensions.js';
      (function (d, t) {
        var v = d.createElement(t),
          s = d.getElementsByTagName(t)[0];
        v.onload = function () {
          window.voiceflow.chat.load({
            verify: { projectID: 'YOUR_PROJECT_ID' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'development',
            user: {
              name: 'Demo User',
            },
            autostart: true,
            allowDangerousHTML: true,
            assistant: {
              stylesheet: "SERVER_URL/styles/widget.css",
              extensions: [
                DemoUploadExtension,
                EmailVerificationExtension,
                ProductUploadExtension,
                QRCodeScannerExtension,
                ShopifyOrderListExtension,
                ReturnRequestExtension,
                WaitingAnimationExtension,
                GiftCardDisplayExtension,
                DoneAnimationExtension
              ],
            },
          });
        };
        v.src = 'https://cdn.voiceflow.com/widget/bundle.mjs';
        v.type = 'text/javascript';
        s.parentNode.insertBefore(v, s);
      })(document, 'script');
    </script>
```
_**YOUR_PROJECT_ID** and **YOUR_SERVER_URL** are automatically populated with the values from your .env file when you load index.html from the server._

To use the chat widget with the extensions on your frontend, you need to:

Replace `YOUR_PROJECT_ID` with your actual Voiceflow project ID.

Replace `YOUR_SERVER_URL` with your actual Voiceflow project ID.



## Environment Variables

Rename `.env.template` to `.env` and fill in the following variables:

- `PORT`: The port number for the server (default: 3208)
- `SERVER_URL`: The URL of your server (default: http://localhost:3000)
- `VOICEFLOW_API_KEY`: Your Voiceflow API key
- `VOICEFLOW_VERSION`: Your Voiceflow project version
- `VOICEFLOW_PROJECT_ID`: Your Voiceflow project ID
- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_VERIFY_SERVICE_SID`: Your Twilio Verify service SID

## Server Endpoints

The server provides the following endpoints:

1. `/scripts/extensions.js`: Serves the extensions JavaScript file
2. `/styles/widget.css`: Serves the custom CSS for the chat widget
3. `/send-verification`: Handles sending verification emails
4. `/check-verification`: Handles checking verification codes

For more details on the server implementation, refer to the `server.ts` file.

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=voiceflow-community_vf-shopify-demo-extensions&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=voiceflow-community_vf-shopify-demo-extensions)
