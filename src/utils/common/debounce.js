/*
 * @Description: 函数防抖
 * @Date: 2020-01-07 16:21:03
 * @Author: Lemon
 * @LastEditors  : Lemon
 * @LastEditTime : 2020-01-07 17:55:59
 */
export default function debounce (func, wait) {
    var timer = null;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(func, wait);
    };
  };