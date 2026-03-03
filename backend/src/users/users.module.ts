import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';

@Module({
  providers: [UsersResolver],
  exports: [],
})
export class UsersModule {}
