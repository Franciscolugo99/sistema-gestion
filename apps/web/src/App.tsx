import { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  id: string;
  sku?: string;
  name: string;
  barcode?: string;
  unit: string;
  cost: number;
  price: number;
  vat: number;
  is_active?: boolean;
}

const API = "http://localhost:3000";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Partial<Product>>({
    sku: "",
    name: "",
    barcode: "",
    unit: "UN",
    cost: 0,
    price: 0,
    vat: 21,
  });
  const [error, setError] = useState<string>("");

  const load = async () => {
    const { data } = await axios.get<Product[]>(`${API}/products`);
    setProducts(data);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "cost" || name === "price" || name === "vat"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!form.name || !form.name.trim()) {
        setError("El nombre es obligatorio.");
        return;
      }
      console.log("POST /products payload:", form);
      await axios.post(`${API}/products`, {
        sku: form.sku || undefined,
        name: form.name.trim(),
        barcode: form.barcode || undefined,
        unit: form.unit || "UN",
        cost: Number(form.cost ?? 0),
        price: Number(form.price ?? 0),
        vat: Number(form.vat ?? 21),
      });
      // Limpio y recargo listado
      setForm({ sku: "", name: "", barcode: "", unit: "UN", cost: 0, price: 0, vat: 21 });
      await load();
    } catch (err: any) {
      console.error("Error al crear producto:", err);
      setError(err?.response?.data?.message ?? "No se pudo guardar. Revisá la consola.");
    }
  };

  const finalPrice = (Number(form.price ?? 0) * (1 + Number(form.vat ?? 0) / 100)).toFixed(2);

  return (
    <div style={{ padding: "2rem", color: "white", background: "#111", minHeight: "100vh" }}>
      <h1>Sistema de Gestión — Productos</h1>

      {/* Formulario con labels */}
      <form onSubmit={handleSubmit}
            style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(8, 1fr)", marginBottom: 18 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>SKU</span>
          <input name="sku" placeholder="Ej: P001" value={form.sku ?? ""} onChange={handleChange} />
        </label>
        <label style={{ display: "grid", gap: 6, gridColumn: "span 2" }}>
          <span>Nombre *</span>
          <input name="name" placeholder="Ej: Coca Cola 1L" value={form.name ?? ""} onChange={handleChange} required />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Código de barras</span>
          <input name="barcode" placeholder="Ej: 7791234567890" value={form.barcode ?? ""} onChange={handleChange} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Unidad</span>
          <input name="unit" placeholder="UN / KG / LT" value={form.unit ?? "UN"} onChange={handleChange} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Costo</span>
          <input type="number" step="0.01" min="0" name="cost" placeholder="0.00"
                 value={Number(form.cost ?? 0)} onChange={handleChange} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Precio</span>
          <input type="number" step="0.01" min="0" name="price" placeholder="0.00"
                 value={Number(form.price ?? 0)} onChange={handleChange} />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span>IVA %</span>
          <select name="vat" value={Number(form.vat ?? 21)} onChange={handleChange}>
            <option value={10.5}>10.5%</option>
            <option value={21}>21%</option>
            <option value={27}>27%</option>
          </select>
        </label>
        <div style={{ display: "flex", alignItems: "end" }}>
          <button type="submit" style={{ width: "100%" }}>Agregar</button>
        </div>
      </form>

      {/* Preview precio final */}
      <div style={{ marginBottom: 16, color: "#ccc" }}>
        Precio final (con IVA): <b>${finalPrice}</b>
      </div>

      {error && (
        <div style={{ marginBottom: 12, color: "#ff8a8a" }}>
          {error}
        </div>
      )}

      {/* Listado */}
      <h2>Listado</h2>
      <table width="100%" cellPadding={8} style={{ borderCollapse: "collapse", background: "#1b1b1b" }}>
        <thead>
          <tr>
            <th align="left">SKU</th>
            <th align="left">Nombre</th>
            <th align="right">Costo</th>
            <th align="right">Precio</th>
            <th align="right">IVA</th>
            <th align="right">Precio Final</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan={6} style={{ color: "#888" }}>Sin productos todavía.</td></tr>
          ) : (
            products.map((p) => (
              <tr key={p.id} style={{ borderTop: "1px solid #333" }}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td align="right">{p.cost}</td>
                <td align="right">{p.price}</td>
                <td align="right">{p.vat}%</td>
                <td align="right">{(p.price * (1 + p.vat / 100)).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

