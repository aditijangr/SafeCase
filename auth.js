const express = require('express');
const router = express.Router();
const dhive = require('@hiveio/dhive');
const client = new dhive.Client('https://api.hive.blog');

// Endpoint to verify Hive Keychain authentication
router.post('/verify-login', async (req, res) => {
    console.log(req.body)
  const { username, signedMessage, signedBuffer } = req.body;

  // Validate that the required fields are present
  if (!username || !signedMessage || !signedBuffer) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  try {
    // Fetch user account information from Hive to get the public key
    console.log(username)
    const accounts = await client.database.getAccounts([username]);
    if (accounts.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found on Hive' });
    }

    // Retrieve the public posting key
    const publicKey = accounts[0].posting.key_auths[0][0];

    // Verify the signature using dhive
    const isVerified = dhive.Signature.fromString(signedBuffer)
    // const isVerified = dhive.Signature.toString(signedBuffer).recover(

      //   dhive.cryptoUtils.sha256(signedMessage), // Hash the original message
    //   dhive.PublicKey.fromString(publicKey)    // Compare it against the public key
    // );
    console.log(dhive.PublicKey.fromString(publicKey));
    
    console.log(dhive.cryptoUtils.sha256(signedBuffer));

    if (isVerified) {
      // If verified, authentication is successful
      return res.status(200).json({ success: true, message: 'Login successful', username });
    } else {
      // If verification fails, reject the authentication
      return res.status(401).json({ success: false, message: 'Authentication failed: Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying signature:', error);
    return res.status(500).json({ success: false, message: error});
  }
});

module.exports = router;
