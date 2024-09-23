const SERVER_URL = 'http://localhost:3210' // Update this to match your actual server URL

export const TwilioVerify = {
  sendVerificationEmail: async (email) => {
    const response = await fetch(`${SERVER_URL}/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Failed to send verification email')
    }
    return data
  },

  checkVerificationCode: async (email, code) => {
    const response = await fetch(`${SERVER_URL}/check-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    })
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.error || 'Failed to verify code')
    }
    return data.status === 'approved'
  },
}
