const SERVER_URL = 'http://localhost:3000'

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

    // Send verification email automatically
    try {
      console.log('Sending verification email to', email)
      await TwilioVerify.sendVerificationEmail(email)
      verificationMessage.textContent = 'Verification code sent to your email.'
      codeInputs[0].focus()
    } catch (error) {
      if (error.message.includes('Maximum verification attempts reached')) {
        verificationMessage.innerHTML =
          'Maximum attempts reached. Please wait 5 minutes before trying again.'
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
            codeInputs.forEach((input) => (input.disabled = true))
            window.voiceflow.chat.interact({
              type: 'complete',
              //payload: { },
            })
          } else {
            remainingTries--
            if (remainingTries > 0) {
              verificationMessage.textContent = `Invalid code. ${remainingTries} tries remaining.`
              codeInputs.forEach((input) => {
                input.value = ''
                input.disabled = false
              })
              codeInputs[0].focus()
            } else {
              verificationMessage.textContent =
                'Verification failed. Please try again later.'
              codeInputs.forEach((input) => (input.disabled = true))
              window.voiceflow.chat.interact({
                type: 'complete',
                //payload: { },
              })
            }
          }
        } catch (error) {
          verificationMessage.textContent = 'Failed to verify code.'
          codeInputs.forEach((input) => {
            input.value = ''
            input.disabled = false
          })
          codeInputs[0].focus()
        }
      }
    }

    const handleInput = (e, index) => {
      if (e.target.value.length === 1 && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus()
      }
      if (Array.from(codeInputs).every((input) => input.value.length === 1)) {
        checkVerificationCode()
      }
    }

    const handleKeydown = (e, index) => {
      if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
        codeInputs[index - 1].focus()
      }
    }

    const handlePaste = (e) => {
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

    codeInputs.forEach((input, index) => {
      input.addEventListener('input', (e) => handleInput(e, index))
      input.addEventListener('keydown', (e) => handleKeydown(e, index))
      input.addEventListener('paste', handlePaste)
    })

    element.appendChild(verificationContainer)
    codeInputs[0].focus()
  },
}
