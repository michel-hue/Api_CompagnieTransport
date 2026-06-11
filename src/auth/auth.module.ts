import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { SupabaseModule } from "src/supabase/supabase.module";


@Module({
  imports: [

    SupabaseModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET ?? "MYSECRETKEY",
      signOptions: { expiresIn: "24h", algorithm: "HS256" },
    }),
  ],
  providers: [
    AuthService,
    AuthGuard,

  ],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}