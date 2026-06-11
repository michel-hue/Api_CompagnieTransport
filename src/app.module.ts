import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { EmployeModule } from './components/employe/employe.module';

@Module({
  imports: [  ConfigModule.forRoot({
      isGlobal: true, 
    }),
     SupabaseModule, 
     AuthModule,
     EmployeModule,
 ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
