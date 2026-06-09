import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FormatResponse } from '../utils/format_response';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private formatResponse = new FormatResponse();

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_ANON_KEY');

    if (!url || !key) {
      throw new Error(
        this.formatResponse.setResponseError(
          1,
          'Variables SUPABASE_URL et SUPABASE_ANON_KEY manquantes dans le .env',
        ).message,
      );
    }

    this.client = createClient(url, key);
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}