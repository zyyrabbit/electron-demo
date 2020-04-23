/*
 * @Description: 函数节流
 * @Date: 2020-01-07 16:21:03
 * @Author: Lemon
 * @LastEditors  : Lemon
 * @LastEditTime : 2020-01-07 18:31:52
 */
export default function throttle(fn,wait){
    var pre = Date.now();
    return function(){
        var context = this;
        var args = arguments;
        var now = Date.now();
        if( now - pre >= wait){
            fn.apply(context,args);
            pre = Date.now();
        }
    }
}