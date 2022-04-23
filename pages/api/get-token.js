const twilio = require('twilio')

export default async function GetToken(req, res) {
  const { identity, id } = req.body

  console.log(`[${id}] Getting token for ${identity}`)

  const token = new twilio.jwt.AccessToken(
    process.env.ACCOUNT_SID,
    process.env.API_KEY_SID,
    process.env.API_KEY_SECRET,
    { identity }
  )

  const grant = new twilio.jwt.AccessToken.VideoGrant({
    room: id,
  })
  token.addGrant(grant)

  res.json({ token: token.toJwt() })
}
