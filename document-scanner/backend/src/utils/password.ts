import crypto from 'crypto';

/**
 * Password utility for hashing and verification using PBKDF2 with SHA-256
 */
export class PasswordUtil {
  private static readonly ITERATIONS = 10000;
  private static readonly KEY_LENGTH = 64; // 64 bytes = 512 bits
  private static readonly DIGEST = 'sha256';
  private static readonly SALT_LENGTH = 32; // 32 bytes = 256 bits

  /**
   * Generate a random salt
   * @returns Salt as a hex string
   */
  public static generateSalt(): string {
    return crypto.randomBytes(this.SALT_LENGTH).toString('hex');
  }

  /**
   * Hash a password with PBKDF2 using the provided salt
   * @param password Plain text password
   * @param salt Salt as a hex string
   * @returns Password hash as a hex string
   */
  public static hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      this.DIGEST
    ).toString('hex');
  }

  /**
   * Verify a password against a hash and salt
   * @param password Plain text password to verify
   * @param hash Stored password hash
   * @param salt Stored salt
   * @returns True if the password matches, false otherwise
   */
  public static verifyPassword(
    password: string,
    hash: string,
    salt: string
  ): boolean {
    const generatedHash = this.hashPassword(password, salt);
    return crypto.timingSafeEqual(
      Buffer.from(generatedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );
  }
}
