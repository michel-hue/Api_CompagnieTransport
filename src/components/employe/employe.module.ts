import { Module } from "@nestjs/common";
import { EmployeService } from "./employe.service";
import { EmployeController } from "./employe.controller";
import { SupabaseModule } from "src/supabase/supabase.module";
import { AuthModule } from "src/auth/auth.module";


@Module({
  imports: [SupabaseModule, AuthModule],
  providers: [EmployeService],
  controllers: [EmployeController],
  exports: [EmployeService],
})
export class EmployeModule {}