import { useState, useRef, useCallback } from 'react';

export default <T>(initialValue: T[]) => {
  // 复杂类型 key 存储器
  const keyMap = useRef(new WeakMap());
  const counterRef = useRef(0);
  // 简单类型 key 存储器
  const keyList = useRef<number[]>([]);

  // 内部方法
  const setKey = useCallback((obj: T, index?: number) => {
    counterRef.current += 1;
    try {
      keyMap.current.set(obj as Record<string, any>, counterRef.current);
    } catch (e) {
      // 设置 基本类型的 key
      if (index || index === 0) {
        keyList.current.splice(index, 0, counterRef.current);
      }
    }
  }, []);

  // 内部方法
  const replaceKey = useCallback((prevObj: T, newObj: T) => {
    try {
      const prevKey = keyMap.current.get(prevObj as Record<string, any>);
      keyMap.current.set(newObj as Record<string, any>, prevKey);
    } catch (e) {
      // 基本类型 key 无需修改顺序
    }
  }, []);

  const [list, setList] = useState(() => {
    initialValue.forEach((ele, index) => {
      setKey(ele, index);
    });
    return initialValue || [];
  });

  const insert = (index: number, obj: T) => {
    setList(l => {
      const temp = [...l];
      temp.splice(index, 0, obj);
      setKey(obj, index);
      return temp;
    });
  };

  const getKey = (index: number) => {
    try {
      const obj = list[index] || {};
      return keyMap.current.get(obj) || keyList.current[index];
    } catch (e) {
      return undefined;
      // return normalMap.current[(list[index]).toString()];
    }
  };

  const merge = (index: number, obj: T[]) => {
    setList(l => {
      const head = l.slice(0, index);
      const tail = l.slice(index);

      obj.forEach((ele, i) => {
        setKey(ele, index + i);
      });

      return head.concat(obj).concat(tail);
    });
  };

  const replace = (index: number, obj: T) => {
    setList(l => {
      const temp = [...l];
      replaceKey(temp[index], obj);
      temp[index] = obj;
      return temp;
    });
  };

  const remove = (index: number) => {
    setList(l => {
      const head = l.slice(0, index);
      const tail = l.slice(index + 1);

      // remove keys if necessary
      try {
        const keyHead = keyList.current.slice(0, index);
        const keyTail = keyList.current.slice(index + 1);
        keyList.current = keyHead.concat(keyTail);
      } catch (e) {
        Promise.reject(e);
      }

      return head.concat(tail);
    });
  };

  const move = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) {
      return;
    }
    setList(l => {
      const newList = [...l];
      const temp = newList.filter((_: {}, index: number) => index !== oldIndex);
      temp.splice(newIndex, 0, newList[oldIndex]);

      // move keys if necessary
      try {
        const keyTemp = keyList.current.filter((_: {}, index: number) => index !== oldIndex);
        keyTemp.splice(newIndex, 0, keyList.current[oldIndex]);
        keyList.current = keyTemp;
      } catch (e) {
        Promise.reject(e);
      }

      return temp;
    });
  };

  const push = (obj: T) => {
    setList(l => {
      setKey(obj, 0);
      return l.concat([obj]);
    });
  };

  const pop = () => {
    // remove keys if necessary
    try {
      keyList.current = keyList.current.slice(0, keyList.current.length - 1);
    } catch (e) {
      Promise.reject(e);
    }

    setList(l => l.slice(0, l.length - 1));
  };

  const unshift = (obj: T) => {
    setList(l => {
      setKey(obj, 0);
      return [obj].concat(l);
    });
  };

  const shift = () => {
    // remove keys if necessary
    try {
      keyList.current = keyList.current.slice(1, keyList.current.length);
    } catch (e) {
      Promise.reject(e);
    }
    setList(l => l.slice(1, l.length));
  };

  return {
    list,
    insert,
    merge,
    replace,
    remove,
    getKey,
    move,
    push,
    pop,
    unshift,
    shift,
  };
};
