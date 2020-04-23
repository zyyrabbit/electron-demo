export function sleep(millisecond: number): Promise<any>{
    return new Promise((resolve) => {
      setTimeout(resolve, millisecond);
    })
  }

export function timeout(millisecond: number , message: string = '超时'): Promise<Error> {
  console.log('timeout')
    let e = new Error(message)
    e.name = 'timeout'
    return new Promise((resolve,reject) => {
      try {
        setTimeout(
          () => reject(e), millisecond);
      } catch (error) {
        reject()
      }
    })
  }

interface UntilOptions {
  condition: Function
  timeoutMillisecond?:number
  millisecond?: number
  flag?: string
}

export async function until(untilOptions: UntilOptions){
  // let time = 0
  const { condition, timeoutMillisecond =　3 *　60 * 1000, millisecond = 1000, flag = 'true' } = untilOptions
  async function* gen(condition: Function){
    console.log('until start');
    // yield await timeout(timeoutMillisecond)
    const startTime = Date.now()
  
    while((!Boolean(flag) === await condition()) && (startTime + timeoutMillisecond > Date.now())){
      // time += 100
      yield await sleep(millisecond)
    }
    if((startTime +timeoutMillisecond) < Date.now()) yield Promise.reject(new Error('操作超時'))
  }
  
  // @ts-ignore
  for await (let t of gen(condition)){}
}

// @todo 无法取消
export async function startIntervel(timeout: number, callback:Function | Function[]){
  async function* gen(callback: Function | Function[], ...arg:any[]){
    while(true){
      if(Array.isArray(callback)){
        await Promise.all(callback.map(c => c()))
      } else{
        await callback()
      }

      yield await sleep(timeout)
    }
  }
  // @todo 周期内返回返回结果的问题
  for await (let t of gen(callback)){}
}
