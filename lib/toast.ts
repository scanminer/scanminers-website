let listeners: ((msg: string, type?: "success" | "error") => void)[] = [];

export function onToast(cb: (msg: string, type?: "success" | "error") => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function toast(msg: string, type?: "success" | "error") {
  for (const l of listeners) l(msg, type);
}
