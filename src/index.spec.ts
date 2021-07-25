import { expect } from "chai";
import { describe, it } from "mocha";
import { CustomIndex, GetCustomIndexes } from ".";

@CustomIndex(`USING GIN (to_tsvector('english', document))`)
class Foo {
  document?: string;
}

describe("customIndex", () => {
  it("should attach custom index", async () => {
    expect(GetCustomIndexes(Foo)).to.exist.and.not.be.empty;
  });
});
