import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from 'src/utils/supabase.provider';

@Global()
@Module({
  providers: [
    SupabaseService,
    {
      provide: SUPABASE_CLIENT,
      useFactory: () => {
        return createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!, 
        );
      },
    },
  ],
  exports: [SupabaseService, SUPABASE_CLIENT],
})
export class SupabaseModule {}