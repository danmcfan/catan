class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new AssertionError(message);
  }
}
