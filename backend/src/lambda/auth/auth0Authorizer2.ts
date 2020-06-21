import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';
import { AuthHelper } from '../../helpers/authHelper2';
import { JwtPayload } from '../../auth/JwtPayload2'



export const handler = async (event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {

  try {
    const authHeader = event.authorizationToken;
    const jwtToken = await verifyToken(authHeader);

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
};

const verifyToken = (authHeader: string): Promise<JwtPayload> => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = AuthHelper.getJWTToken(authHeader);
      const jwt = AuthHelper.decodeJWTToken(token);
      const signingKey = await AuthHelper.getSigningKey(jwt);
      const payload = AuthHelper.verifyToken(token, signingKey.getPublicKey());
      resolve(payload);
    } catch (error) {
      reject(error);
    }
  });
};