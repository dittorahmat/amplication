import { Strategy, StrategyOptions, Profile } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService, AuthUser } from './auth.service';
import { getEmail } from './github.util';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    options: StrategyOptions
  ) {
    super(options);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile
  ): Promise<AuthUser> {
    console.log({ accessToken });

    const email = await getEmail(accessToken);
    console.log({ email });
    const user = await this.authService.getAuthUser({
      account: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        OR: [{ githubId: profile.id }, { email: email }]
      }
    });
    console.log({ user });
    if (!user) {
      return this.authService.createGitHubUser(profile, email);
    }
    if (!user.account.githubId) {
      return this.authService.updateGitHubUser(user, profile);
    }
    return user;
  }
}
