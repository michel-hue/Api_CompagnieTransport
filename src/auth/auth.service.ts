import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SupabaseService } from '../supabase/supabase.service';
import { FormatResponse } from '../utils/format_response';

@Injectable()
export class AuthService {
  private formatResponse = new FormatResponse();
  private readonly jwtSecret: string = process.env.JWT_SECRET ?? 'MYSECRETKEY';

  constructor(private supabaseService: SupabaseService) {}

  async verifyApiKey(apiKey: string): Promise<boolean> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('apikey')
      .select('expiredon')
      .eq('apikey', apiKey)
      .eq('status', 1)
      .single();

    if (error || !data) {
      this.formatResponse.setResponseErrorFromAPIKey();
      return false;
    }

    const isValid = new Date(data.expiredon) >= new Date();

    if (!isValid) {
      this.formatResponse.setResponseErrorFromAPIKeyExpired();
      return false;
    }

    return true;
  }

  async verifyToken(authorizationValue: string, request: any): Promise<any> {
    if (!authorizationValue || !authorizationValue.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        this.formatResponse.setResponseFromAuthorizationNotFound().message,
      );
    }

    const token = authorizationValue.split(' ')[1];

    try {
      const decoded: any = jwt.verify(token, this.jwtSecret);

      if (!decoded?.current_user) {
        throw new UnauthorizedException(
          this.formatResponse.setResponseErrorFromToken().message,
        );
      }

      const { expiredon, employeid } = decoded.current_user;

      if (new Date(expiredon) < new Date()) {
        throw new UnauthorizedException(
          this.formatResponse.setResponseFromAccessExpired().message,
        );
      }

      const isAccessBlocked: any[] = [];
      if (isAccessBlocked.length > 0) {
        throw new ForbiddenException(
          this.formatResponse.setResponseFromAccessBloqued().message,
        );
      }

      request.user = decoded.current_user;
      request.created_by = employeid;

      if (request.body) {
        switch (request.method) {
          case 'POST':
            request.body.createdby = employeid;
            break;
          case 'PUT':
            request.body.updatedby = employeid;
            break;
          case 'DELETE':
            request.params.deletedby = employeid;
            break;
        }
      }

      if (request.method === 'DELETE') {
        request.params.deletedby = employeid;
      }

      return decoded.current_user;

    } catch (err: any) {
      if (
        err instanceof UnauthorizedException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      throw new UnauthorizedException(
        this.formatResponse.setResponseErrorFromToken().message,
      );
    }
  }
}