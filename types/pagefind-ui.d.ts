declare module '@pagefind/default-ui' {
  export class PagefindUI {
    constructor(options: { element: string | HTMLElement; showSubResults?: boolean; resetStyles?: boolean });
    open(): void;
    close(): void;
  }
}
