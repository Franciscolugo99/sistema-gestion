export const decimalTransformer = {
  to: (value?: number | null) =>
    value === null || value === undefined ? null : value, // a DB (TypeORM ya lo guarda como decimal)
  from: (value?: string | null) =>
    value === null || value === undefined ? null : parseFloat(value), // de DB a JS number
};
