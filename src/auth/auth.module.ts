import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';

import { SupabaseModule } from 'src/supabase/supabase.module';


@Module({
   imports: [
    JwtModule.register({
      secret: process.env.SUPABASE_JWT_SECRET,
      signOptions: { expiresIn: '3600s' },
    }),SupabaseModule
  ],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard], 
})
export class AuthModule {}