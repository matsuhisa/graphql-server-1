const fetch = require('node-fetch')

/*
 * credentialは、3つで構成される
 * client_id
 * client_secret
 * Code
*/

const requestGithubToken = credential => 
  fetch(`https://github.com/login/oauth/access_token`, 
    {
      method: 'post',
      headers: {
        'Content-type': 'applicaton/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credential)
    }
  )
  .then(res => res.json())
  .catch(error => {
    throw new Error(JSON.stringify(error))
  })

/*
 * github では tokenがある限りはユーザーに関する情報を取得できる
 */

const requestGithubUserAccount = token =>
  fetch(`https://api.github.com/user?access_token=${ token }`)
    .then(toJSON)
    .catch(throwError)

async function authorizeWithGithub(credential) {
  const { access_token } = await requestGithubToken(credential)
  const githubUser = await requestGithubUserAccount(access_token)
  return {
    ...githubUser, access_token
  }
}

module.exports = { authorizeWithGithub }