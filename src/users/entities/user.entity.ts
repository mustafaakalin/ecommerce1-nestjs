import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
  AfterLoad,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Exclude, Expose, classToPlain } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { ApiHideProperty } from '@nestjs/swagger';

/**
 * User Entity
 * Represents a user in the system with all associated data
 * Includes security features and performance optimizations
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  @Index('idx_username')
  userName: string;

  @Column({ length: 255, unique: true })
  @Index('idx_email')
  email: string;

  @Column({ nullable: true, type: 'timestamp' })
  emailVerifiedAt: Date;

  @Column({ length: 255 })
  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  password: string;

  @Column({ length: 100 })
  surname: string;

  @Column({ length: 20, nullable: true })
  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  identityNo: string;

  @Column({ nullable: true, length: 255 })
  avatarImage: string;

  // Social media fields - grouped together for better organization
  @Column({ nullable: true, length: 100, name: 'social_instagram' })
  socialInstagram: string;

  @Column({
    nullable: true,
    length: 100,
    name: 'social_instagram_broadcast_channel',
  })
  socialInstagramBroadcastChannel: string;

  @Column({ nullable: true, length: 100, name: 'social_facebook' })
  socialFacebook: string;

  @Column({ nullable: true, length: 100, name: 'social_facebook_group' })
  socialFacebookGroup: string;

  @Column({ nullable: true, length: 100, name: 'social_facebook_page' })
  socialFacebookPage: string;

  @Column({ nullable: true, length: 100, name: 'social_youtube' })
  socialYoutube: string;

  @Column({ nullable: true, length: 100, name: 'social_tiktok' })
  socialTiktok: string;

  @Column({ nullable: true, length: 100, name: 'social_linkedin' })
  socialLinkedin: string;

  @Column({ nullable: true, length: 100, name: 'social_x' })
  socialX: string;

  @Column({ nullable: true, length: 20, name: 'social_whatsapp_tel_no' })
  socialWhatsappTelNo: string;

  @Column({ nullable: true, length: 100, name: 'social_whatsapp_group' })
  socialWhatsappGroup: string;

  @Column({ nullable: true, length: 100, name: 'social_whatsapp_channel' })
  socialWhatsappChannel: string;

  @Column({ nullable: true, length: 100, name: 'social_telegram_username' })
  socialTelegramUsername: string;

  @Column({ nullable: true, length: 100, name: 'social_telegram_group' })
  socialTelegramGroup: string;

  @Column({ nullable: true, length: 100, name: 'social_telegram_channel' })
  socialTelegramChannel: string;

  @Column({ nullable: true, length: 100, name: 'social_reddit' })
  socialReddit: string;

  @Column({ nullable: true, length: 100, name: 'social_reddit_community' })
  socialRedditCommunity: string;

  @Column({ nullable: true, length: 20 })
  phoneNo: string;

  // OAuth fields
  @Column({ nullable: true, length: 100 })
  githubId: string;

  @Column({ nullable: true, length: 100 })
  googleId: string;

  @Column({ nullable: true, length: 100 })
  facebookId: string;

  @Column({ nullable: true, length: 100 })
  instagramId: string;

  // IP tracking - excluded from serialization for privacy
  @Column({ length: 45, nullable: true })
  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  registerIp: string;

  @Column({ length: 45, nullable: true })
  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  lastLoggedInIp: string;

  // Audit columns
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  // For tracking original password to avoid rehashing
  private tempPassword: string;

  @AfterLoad()
  private loadTempPassword(): void {
    // Store original password to compare later
    this.tempPassword = this.password;
  }

  @BeforeInsert()
  async hashPasswordOnInsert(): Promise<void> {
    await this.hashPasswordIfNeeded();
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate(): Promise<void> {
    // Only hash if password changed
    if (this.password && this.password !== this.tempPassword) {
      await this.hashPasswordIfNeeded();
    }
  }

  /**
   * Helper method to hash password using bcrypt
   * Centralized password hashing logic for better maintainability
   */
  private async hashPasswordIfNeeded(): Promise<void> {
    if (!this.password) return;

    try {
      const salt = await bcrypt.genSalt(12); // Increased rounds for better security
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Validates user password
   * @param password Plain text password to validate
   * @returns boolean indicating if password matches
   */
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Returns user profile without sensitive information
   * Provides a safe representation of the user for API responses
   */
  @Expose()
  toProfile() {
    const plainUser = classToPlain(this);
    return plainUser;
  }

  /**
   * Returns minimal user profile for public display
   * Contains only the most essential information
   */
  @Expose()
  toPublicProfile() {
    return {
      id: this.id,
      name: this.name,
      surname: this.surname,
      userName: this.userName,
      avatarImage: this.avatarImage,
    };
  }

  /**
   * Returns social media profiles grouped by platform
   * Makes it easier to work with social media data
   */
  @Expose()
  getSocialProfiles() {
    return {
      instagram: {
        profile: this.socialInstagram,
        broadcastChannel: this.socialInstagramBroadcastChannel,
      },
      facebook: {
        profile: this.socialFacebook,
        group: this.socialFacebookGroup,
        page: this.socialFacebookPage,
      },
      telegram: {
        username: this.socialTelegramUsername,
        group: this.socialTelegramGroup,
        channel: this.socialTelegramChannel,
      },
      whatsapp: {
        telNo: this.socialWhatsappTelNo,
        group: this.socialWhatsappGroup,
        channel: this.socialWhatsappChannel,
      },
      reddit: {
        profile: this.socialReddit,
        community: this.socialRedditCommunity,
      },
      other: {
        youtube: this.socialYoutube,
        tiktok: this.socialTiktok,
        linkedin: this.socialLinkedin,
        x: this.socialX,
      },
    };
  }
}

/**
 * User Entity Subscriber
 * Handles entity lifecycle events for additional security and logging
 */
@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  afterInsert(event: InsertEvent<User>) {
    console.log(`New user registered: ${event.entity.userName}`);
    // Could integrate with audit logging system here
  }

  afterUpdate(event: UpdateEvent<User>) {
    if (
      event.entity &&
      event.updatedColumns.find((col) => col.propertyName === 'password')
    ) {
      console.log(`Password updated for user: ${event.entity.userName}`);
      // Could trigger security notification here
    }
  }
}
