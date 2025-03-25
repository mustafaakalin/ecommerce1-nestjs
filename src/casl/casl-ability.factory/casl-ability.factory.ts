import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { Action } from "../enums/action.enum";
import { PrismaAbility, Subjects } '@casl/prisma';
import { User } from '@prisma/client';

type Subjects = typeof subjects;


export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
defineAbility(user: User) {
    const { can, cannot, build } = new AbilityBuilder<PrismaAbility>(PrismaAbility);

    switch (user.role.name) {
      case 'developer':
        can('manage', 'all'); // Full access
        break;
      case 'shopkeeper':
        can('read', 'User'); // Can read users
        can('update', 'User', { role: { name: 'customer' } }); // Can update customers
        break;
      case 'staff':
        can('read', 'User'); // Can read users
        break;
      case 'customer':
        can('read', 'User', { id: user.id }); // Can only read their own profile
        break;
    }

    return build();
  }

}
