import crypto from 'crypto';

export function encrypt(data: any, key: string): string {
    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    
    // Create a 32-byte key from the base64 input
    const keyBuffer = Buffer.from(key, 'base64');
    // Ensure key is exactly 32 bytes
    const key32 = Buffer.alloc(32);
    keyBuffer.copy(key32);
    
    const cipher = crypto.createCipheriv(algorithm, key32, iv);
    let encrypted = cipher.update(JSON.stringify(data));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
} 