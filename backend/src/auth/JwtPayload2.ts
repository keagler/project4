import { JwtHeader } from 'jsonwebtoken';

/**
 * Interface representing a JWT token
 */
interface Jwt {
    header: JwtHeader;
    payload: JwtPayload;
}

/**
 * A payload of a JWT token
 */
interface JwtPayload {
    iss: string;
    sub: string;
    iat: number;
    exp: number;
}

export {
    Jwt,
    JwtPayload
};
