const fetch = require('node-fetch')

/*
 * credentialは、3つで構成される
 * client_id
 * client_secret
 * Code
*/

const requestGithubToken = credentials => 
  fetch(`https://github.com/login/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': `application/json`,
      'Accept': `application/json`
    },
    body: JSON.stringify(credentials)
  })
  .then(res => {
    console.table(res)
    return res.json()
  })
  .catch(error => {
    console.log('Error requestGithubToken')
    throw new Error(JSON.stringify(error))
  })

/*
 * github では tokenがある限りはユーザーに関する情報を取得できる
 */

const requestGithubUserAccount = token =>
  fetch(`https://api.github.com/user`, {
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`
    },
    redirect: 'follow'
  })
  .then(res => {
    console.table(res)
    return res.json()
  })
  .catch(error => {
    console.log('Error requestGithubUserAccount')
    throw new Error(JSON.stringify(error))
  })

async function authorizeWithGithub(credential) {
  console.table(credential)
  const { access_token } = await requestGithubToken(credential)
  console.log('<-- access_token')
  console.table(access_token)
  const githubUser = await requestGithubUserAccount(access_token)
  console.log('-----------')
  console.table(githubUser)
  return { ...githubUser, access_token }
}

module.exports = { authorizeWithGithub }