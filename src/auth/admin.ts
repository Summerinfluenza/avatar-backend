// admin.service.ts

import {  Logger } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { UserService } from './user.service';

export class AdminManager {
    
    private readonly logger = new Logger(AdminManager.name);

    public readonly pw: string;
    private readonly dev: boolean;
    private disableadmin = true;
    private static _adminExist;
    
    constructor(
        private userService: UserService,
        
    ) {
        this.pw = process.env.ADMIN_PASSWORD ?? null;
        this.dev = process.env.DEV === 'true';

        if (this.pw !== null && this.pw.length > 1) {
            if (this.pw.length < 11 && !this.dev) {
                this.logger.warn(
                    'ADMIN PASSWORD must be at least 12 chars, admin acces not enabled! Sign in to create an admin account.',
                );
            } else {
                this.disableadmin = false;
                AdminManager._adminExist = true;
            }
        }
    }

    async getAdmin(): Promise<UserDocument | null> {
        if (this.disableadmin) {
            return null;
        }
        const admin =
            (await this.userService.getUser({ email: 'admin' })) ?? null;

        if (admin == null && !this.disableadmin) {
            this.logger.verbose('creating admin user');
            return this.createAdmin();
        }

        return admin;
    }

    async updateAdmin(admin: User, newPW: string) {
        if (this.disableadmin) return null;
        return this.userService.updateByEmail(admin.email, {
            password: await this.userService.hash(newPW),
        });
    }

    async createAdmin(): Promise<UserDocument | null> {
        if (this.disableadmin) return null;

        return this.userService.createUser({
            email: 'admin',
            password: this.pw,
        });
    }

    public static get adminExist() {
        return AdminManager._adminExist;
    }
}
