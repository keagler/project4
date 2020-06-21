import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

//import { JwtToken } from '../../auth/JwtToken'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDAzCCAeugAwIBAgIJOj+zmv0zK3rZMA0GCSqGSIb3DQEBCwUAMB8xHTAbBgNV
BAMTFGtlYWdsZXIuZXUuYXV0aDAuY29tMB4XDTIwMDUyNjE3MjQxMVoXDTM0MDIw
MjE3MjQxMVowHzEdMBsGA1UEAxMUa2VhZ2xlci5ldS5hdXRoMC5jb20wggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCu/4aIfdGMqdT4xGHqbv/+6l9p6zc4
5n/gPZv5A5Q99D9kqnXyQwZVST7WFJimSnHE+f3u/5oddS/E4EiABjzvtSrG6VOw
9nEKS1WOKKHmiI13AGMTTmSL9x8UiRBlh/vmd+NbcviTduBEALWGePIKu29ufMtJ
rg47aFzme+nTwqnlOaVMvrHqswyhid6zVxAG9BgGTn/VvrSFiqIRCikgf5U2G6Nf
9DALUWEJnoIwp4FhM48ICnRlhFclaMyI/6MVLRK7OAliTbdi4hN/YuBgh6rO0DV+
MApgNc9PT6cjA37jhkSURprH3iGG43woVIwL+H8iK3+U97klESmvEfo9AgMBAAGj
QjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFFYAikKkEdgRQen7uy8TiIHM
jw2iMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAT9TaDCy6RzW0
1bnDgDX29Ft4xXzVMeL6RM1NdHsKU0qPfOxiuc/emHJUSKgjYp10TuAxeb0dEbx/
EPVnwBozDzDvTfOEkcaAOmTFoc7oGuWAwkZkU0E/Ld8B7xsRvTE35QAmaAbu2dgV
HHs9f01C5Wgo+KoGfbCw8itxcTEQqXlw0TkHtOQReo9gWMJRFm6L5d9+PNgDcaF2
0fLid2nUMXYa4UGqDsERnnp1SdLo050Gsef0YKQ+rXWwAvD/uJQEN0t7AEXme+lm
hJqumYqGQ/xy5DjH1eBda+YwYsYkGt7LLjn4ZpF4CknbOmK/CLwdgI6Lj14iaBPU
HnaEZWbmOQ==
-----END CERTIFICATE-----`

const jwksUrl = 'https://keagler.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  console.log('Authorizinggggg a user')
  console.log('public cert:',cert)
  logger.info('Authorizinggggg a user', event.authorizationToken)
  try {
    const jwtToken = await  verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

 async function verifyToken(authHeader: string): Promise<JwtPayload> {
  console.log('verifyTokennnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn')
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  if(!jwt){
    throw new Error('invalid token')
  }

  try {
    const response = await Axios.get(jwksUrl);
    console.log(response);
    var verifedToken = verify(token,response.data,{algorithms:['RS256']})

    console.log('verfied toekn',verifedToken)
    return  verifedToken as JwtPayload
  } catch (error) {
    console.error(error);
    return undefined
  }
}

/*
function verifyToken2(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
*/


function getToken(authHeader: string): string {
  console.log('getTokennnnnnnnnnnnnnnnnnnnnnnnnnnn')
  if (!authHeader) throw new Error('No authentication headerrrrrrrrrrrrrrrrrrrrr')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
