// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Pos from "./Pos";

interface Product {
  id: string;
  sku?: string;
  name: string;
  barcode?: string;
  unit: string;
  cost: number;
  price: number;
  vat: number; // % (ej: 21)
  is_active?: boolean;
}

const API = "/api"; // usa el proxy de Vite

export default function App() {
  // ======= STATE =======
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [view, setView] = useState<"productos" | "pos">("productos");
  const [lowCount, setLowCount] = useState<number>(0);

  const loadLowStock = async () => {
  try {
    const { data } = await axios.get(`/api/products/low-stock?limit=200`);
    const list = Array.isArray(data) ? data : data?.items || [];
    setLowCount(list.length || data?.total || 0);
  } catch {
    setLowCount(0);
  }
};
  // ======= EFFECTS =======
  useEffect(() => {
    load();
    loadLowStock();   // 👈 llamada inicial para traer alertas
  }, []);

  // form: si tiene id -> modo edición
  const [form, setForm] = useState<Partial<Product>>({
    sku: "",
    name: "",
    barcode: "",
    unit: "UN",
    cost: 0,
    price: 0,
    vat: 21,
  });

  // ======= HELPERS =======
  const isEditing = Boolean(form.id);
  const isValid =
    (form.name || "").trim().length > 0 &&
    (form.cost ?? 0) >= 0 &&
    (form.price ?? 0) >= 0 &&
    (form.vat ?? 0) >= 0;

  const precioFinal = useMemo(() => {
    const price = Number(form.price ?? 0);
    const vat = Number(form.vat ?? 0);
    return price * (1 + vat / 100);
  }, [form.price, form.vat]);

  const resetForm = () =>
    setForm({
      sku: "",
      name: "",
      barcode: "",
      unit: "UN",
      cost: 0,
      price: 0,
      vat: 21,
      id: undefined,
    });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // normalizamos numéricos
    if (["cost", "price", "vat"].includes(name)) {
      const num = value === "" ? "" : Number(value);
      setForm((f) => ({ ...f, [name]: (num as unknown) as number }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // ======= API =======
  const pickArray = (payload: any) => {
    const candidates = [
      payload,
      payload?.data,
      payload?.items,
      payload?.results,
      payload?.rows,
      payload?.records,
      payload?.data?.items,
      payload?.data?.results,
      payload?.data?.rows,
    ];
    return candidates.find(Array.isArray) ?? [];
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await axios.get(`${API}/products`, { validateStatus: () => true });
      console.log("[GET /products]", resp.status, resp.data);
      if (resp.status >= 400) throw new Error(`GET /products devolvió ${resp.status}`);
      const list = pickArray(resp.data);
      setProducts(list as Product[]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error al cargar productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    const clean = (s?: string | null) => {
      const v = (s ?? "").toString().trim();
      return v === "" ? undefined : v;
    };
    const cleanBarcode = (s?: string | null) => {
      const digits = (s ?? "").replace(/\D+/g, "");
      return digits === "" ? undefined : digits;
    };

    const payload = {
      sku: clean(form.sku),
      name: clean(form.name)!,
      barcode: cleanBarcode(form.barcode),
      unit: clean(form.unit) ?? "UN",
      cost: form.cost === undefined || form.cost === null ? 0 : Number(form.cost),
      price: form.price === undefined || form.price === null ? 0 : Number(form.price),
      vat: form.vat === undefined || form.vat === null ? 0 : Number(form.vat),
    };

    try {
      if (isEditing && form.id) {
        await axios.patch(`${API}/products/${form.id}`, payload); // ← PATCH (tu API)
      } else {
        await axios.post(`${API}/products`, payload);
      }
      await load();
      resetForm();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al guardar";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      id: p.id,
      sku: p.sku ?? "",
      name: p.name,
      barcode: p.barcode ?? "",
      unit: p.unit ?? "UN",
      cost: p.cost ?? 0,
      price: p.price ?? 0,
      vat: p.vat ?? 21,
      // is_active intencionalmente no se envía en save()
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;
    setLoading(true);
    setError("");
    try {
      await axios.delete(`${API}/products/${id}`);
      await load();
      if (form.id === id) resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? err?.message ?? "Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  // ======= EFFECTS =======
  useEffect(() => {
    load();
  }, []);

  // ======= UI =======
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
{/* NAV para cambiar de vista + badge de stock bajo */}
<div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
  <button onClick={() => setView("productos")} disabled={view === "productos"}>
    Productos
  </button>
  <button onClick={() => setView("pos")} disabled={view === "pos"}>
    POS (Ventas)
  </button>

  <div style={{ marginLeft: "auto" }}>
    <button onClick={loadLowStock} title="Actualizar alertas">
      Stock bajo{lowCount ? ` (${lowCount})` : ""}
    </button>
  </div>
</div>

      {view === "productos" && (
        <>
          <h1 style={{ fontSize: 42, marginBottom: 16 }}>Sistema de Gestión — Productos</h1>

          <form
            onSubmit={save}
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "1fr 2fr 2fr 1fr 1fr 1fr 1fr",
              alignItems: "end",
            }}
          >
            <div>
              <label>SKU</label>
              <input name="sku" value={form.sku ?? ""} onChange={onChange} placeholder="Ej: P001" />
            </div>

            <div>
              <label>Nombre *</label>
              <input
                name="name"
                value={form.name ?? ""}
                onChange={onChange}
                placeholder="Ej: Coca Cola 1L"
                required
              />
            </div>

            <div>
              <label>Código de barras</label>
              <input
                name="barcode"
                value={form.barcode ?? ""}
                onChange={onChange}
                placeholder="Ej: 7791234567890"
              />
            </div>

            <div>
              <label>Unidad</label>
              <input name="unit" value={form.unit ?? "UN"} onChange={onChange} />
            </div>

            <div>
              <label>Costo</label>
              <input
                name="cost"
                type="number"
                step="0.01"
                value={form.cost ?? 0}
                onChange={onChange}
              />
            </div>

            <div>
              <label>Precio</label>
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price ?? 0}
                onChange={onChange}
              />
            </div>

            <div>
              <label>IVA %</label>
              <select name="vat" value={form.vat ?? 21} onChange={onChange}>
                <option value={0}>0%</option>
                <option value={10.5}>10.5%</option>
                <option value={21}>21%</option>
                <option value={27}>27%</option>
              </select>
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={!isValid || loading}>
                {isEditing ? "Guardar cambios" : "Agregar"}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} disabled={loading}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          <div style={{ marginTop: 8, marginBottom: 16 }}>
            <strong>Precio final (con IVA): </strong>${precioFinal.toFixed(2)}
          </div>

          {error && (
            <div style={{ margin: "12px 0", color: "#ff6b6b" }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <h2 style={{ marginTop: 24 }}>Listado</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={th}>SKU</th>
                  <th style={th}>Nombre</th>
                  <th style={th}>Costo</th>
                  <th style={th}>Precio</th>
                  <th style={th}>IVA</th>
                  <th style={th}>Precio Final</th>
                  <th style={th} />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const finalPrice = (p.price ?? 0) * (1 + (p.vat ?? 0) / 100);
                  return (
                    <tr key={p.id}>
                      <td style={td}>{p.sku}</td>
                      <td style={td}>{p.name}</td>
                      <td style={td}>{p.cost}</td>
                      <td style={td}>{p.price}</td>
                      <td style={td}>{p.vat}%</td>
                      <td style={td}>{finalPrice.toFixed(2)}</td>
                      <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                        <button onClick={() => handleEdit(p)} disabled={loading} style={{ marginRight: 8 }}>
                          Editar
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={loading}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && !loading && (
                  <tr>
                    <td style={td} colSpan={7}>
                      Sin productos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === "pos" && <Pos />}
    </div>
  );
}

// ======= estilos mínimos inline para la tabla (podés reemplazar por tu CSS) =======
const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid #333",
  fontWeight: 600,
};

const td: React.CSSProperties = {
  padding: "10px 8px",
  borderBottom: "1px solid #222",
};
