/*
 * @Description: class name 操作库
 * @Date: 2020-01-14 10:21:14
 * @Author: Lemon
 * @LastEditors  : Lemon
 * @LastEditTime : 2020-01-14 10:44:59
 */
export function addClass(node: any, cls:string){
  node.className += ' '+cls
}

export function removeClass(node: any, cls:string){
  if(node.className == ''){
    return
  }
  const aNames = node.className.split(' ')
  const newName: Array<string> = []
  aNames.forEach(item => {
    if(item !== cls){
      newName.push(item)
    }
  });
  node.className = newName.join(' ')
}
