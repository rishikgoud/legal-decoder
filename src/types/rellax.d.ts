declare module 'rellax' {
  class Rellax {
    constructor(el?: string | Element, options?: object);
    destroy(): void;
    refresh(): void;
  }
  export default Rellax;
}
