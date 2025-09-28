import { cn } from "../lib/utils";

describe('cn function', () => {
  it('should merge class names correctly', () => {
    expect(cn("px-2", "py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
  });

  it('should handle conditional class names', () => {
    expect(cn("px-2", true && "py-1", false && "bg-red-500")).toBe("px-2 py-1");
  });

  it('should override conflicting class names', () => {
    expect(cn("px-2", "p-4")).toBe("p-4");
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe("");
  });
});
