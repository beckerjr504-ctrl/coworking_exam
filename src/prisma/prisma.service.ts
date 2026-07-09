import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const databaseUrl = process.env.DATABASE_URL;

        super({
            adapter: new PrismaPg({ connectionString: databaseUrl }),
        } as any);
    }

    async onModuleInit() {
        await this.$connect();
    }
}
