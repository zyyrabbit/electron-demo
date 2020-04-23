export class IdGenerator {
  private readonly prefix: string
  private lastId: number = 0

  public constructor (prefix: string = '') {
    this.prefix = prefix
  }

  public nextId (): string {
    return this.prefix + (++this.lastId)
  }

  public nextRawId (): number {
    return ++this.lastId
  }
}


export const defaultGenerator = new IdGenerator('id#')
