import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  name: string;
}

/**
 * Custom parameter decorator that extracts the authenticated user from
 * the Passport-populated `request.user` object.
 *
 * Usage:
 *   @CurrentUser() user: CurrentUserData          — full user object
 *   @CurrentUser('id') userId: string             — single field
 */
export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext): CurrentUserData | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserData;
    return data ? user[data] : user;
  },
);
