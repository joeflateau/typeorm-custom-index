import { createHash } from "crypto";
import { Connection, EntityMetadata, Index } from "typeorm";

const customIndexSymbol = Symbol("custom-index");

export function CustomIndex(expression: string) {
  const name = `IDX_${sha1(expression).substr(0, 26)}`;
  const index = Index(name, { synchronize: false });
  return function (cls: any) {
    index(cls);
    cls[customIndexSymbol] = cls[customIndexSymbol] ?? [];
    cls[customIndexSymbol].push(new CustomIndexMeta(name, expression));
  };
}

class CustomIndexMeta {
  constructor(public name: string, public expression: string) {}
  async createIfNotExists(connection: Connection, meta: EntityMetadata) {
    await connection.query(
      `CREATE INDEX IF NOT EXISTS "${this.name}" ON "${meta.tableName}" ${this.expression}`
    );
  }
}

export function GetCustomIndexes(cls: Function) {
  const indexes: ReadonlyArray<CustomIndexMeta> | undefined = (cls as any)[
    customIndexSymbol
  ];
  return indexes;
}

export async function CreateIndexesIfNotExists(connection: Connection) {
  for (const meta of connection.entityMetadatas) {
    if (typeof meta.target === "function") {
      const indexes = GetCustomIndexes(meta.target);
      if (indexes != null) {
        for (const index of indexes) {
          await index.createIfNotExists(connection, meta);
        }
      }
    }
  }
}

function sha1(value: string) {
  return createHash("sha1").update(value).digest("hex");
}
