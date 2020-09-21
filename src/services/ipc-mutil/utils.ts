export function getRandomString (len: number = 16): string {
  let str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key: string[] = [];
  for (let i = 0; i < len; i++) {
    key.push(str.charAt(getRandomInt(str.length - 1)));
  }
  return key.join('');
}

/**
 * 获取整数随机数
 * @param min
 * @param max
 * @returns {*}
 */
export function getRandomInt (min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


export class IdGenerator {
  private readonly prefix: string
  private lastId: number = 0

  public constructor (prefix: string = '') {
    this.prefix = prefix;
  }

  public nextId (): string {
    return this.prefix + (++this.lastId);
  }

  public nextRawId (): number {
    return ++this.lastId;
  }
}
