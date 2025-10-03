// src/Pos.tsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
const API = "/api";

type Product = {
  id: string;
  name: string;
  barcode?: string;
  price: number;
  vat: number;
  stockQty?: number;
  sku?: string;
};

type CartItem = { product: Product; qty: number; price: number; vat: number };

export default function Pos() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [highlight, setHighlight] = useState<number>(-1);
  const [found, setFound] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [msg, setMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ---- TYPEAHEAD con debounce ----
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      setFound(null);
      setHighlight(-1);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API}/products`, {
          params: { q: query, limit: 10 },
        });
        const list: Product[] = Array.isArray(data) ? data : data?.items || [];

        // si son solo dígitos (lector de barras), prioriza match exacto
        const digits = query.replace(/\D+/g, "");
        if (digits && digits.length >= 8) {
          const exact = list.find((p) => p.barcode === digits);
          if (exact) {
            setFound(exact);
            setSuggestions([]);
            setHighlight(-1);
            return;
          }
        }

        setSuggestions(list);
        setFound(list[0] || null);
        setHighlight(list.length ? 0 : -1);
      } catch (e) {
        setSuggestions([]);
        setFound(null);
        setHighlight(-1);
      }
    }, 250); // 250ms

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const pick = (p: Product | null) => {
    setFound(p);
    setSuggestions([]);
    setHighlight(-1);
  };

  const add = () => {
    const p = found || suggestions[0];
    if (!p) return;
    setCart((c) => {
      const i = c.findIndex((x) => x.product.id === p.id);
      if (i >= 0) {
        const cc = [...c];
        cc[i].qty += 1;
        return cc;
      }
      return [...c, { product: p, qty: 1, price: p.price, vat: p.vat }];
    });
    setQuery("");
    setFound(null);
    setSuggestions([]);
    setHighlight(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) {
      if (e.key === "Enter") add();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (highlight + 1) % suggestions.length;
      setHighlight(next);
      setFound(suggestions[next]);
      scrollIntoView(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (highlight - 1 + suggestions.length) % suggestions.length;
      setHighlight(prev);
      setFound(suggestions[prev]);
      scrollIntoView(prev);
    } else if (e.key === "Enter") {
      e.preventDefault();
      add();
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setHighlight(-1);
    }
  };

  const scrollIntoView = (idx: number) => {
    const ul = listRef.current;
    if (!ul) return;
    const li = ul.children[idx] as HTMLElement | undefined;
    li?.scrollIntoView({ block: "nearest" });
  };

  const total = cart.reduce((a, i) => a + i.price * i.qty, 0);

  const cobrar = async () => {
    if (!cart.length) return;
    try {
      const payload = {
        items: cart.map((i) => ({
          productId: i.product.id,
          qty: i.qty,
          price: i.price,
          vat: i.vat,
        })),
        payments: [{ method: "cash", amount: total }],
      };
      const { data } = await axios.post(`${API}/sales`, payload);
      setMsg(
        `Venta OK #${data.saleId} - Total $${total.toFixed(2)}${
          data.lowStock?.length ? " — ALERTA stock bajo: " + data.lowStock.length : ""
        }`
      );
      setCart([]);
      setQuery("");
      setFound(null);
      setSuggestions([]);
      setHighlight(-1);
      inputRef.current?.focus();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || e.message || "Error al cobrar");
    }
  };

  return (
    <div>
      <h2>POS — Venta rápida</h2>

      {/* BUSCADOR */}
      <div style={{ position: "relative", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            ref={inputRef}
            placeholder="Escaneá código o escribí (Coc...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            style={{ width: "100%" }}
          />

          {/* SUGERENCIAS */}
          {suggestions.length > 0 && (
            <ul
              ref={listRef}
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                right: 0,
                background: "#1e1e1e",
                border: "1px solid #333",
                borderRadius: 6,
                padding: 0,
                margin: 0,
                listStyle: "none",
                maxHeight: 220,
                overflowY: "auto",
                zIndex: 10,
              }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  onMouseEnter={() => {
                    setHighlight(i);
                    setFound(s);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(s);
                    add();
                  }}
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    background: i === highlight ? "#2a2a2a" : "transparent",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span>
                    {s.name}
                    {s.sku ? ` · ${s.sku}` : ""} {s.barcode ? ` · ${s.barcode}` : ""}
                  </span>
                  <span>${s.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={() => (found || suggestions[0]) && add()}>Agregar</button>
      </div>

      {found && (
        <div style={{ marginTop: 8 }}>
          Encontrado: <b>{found.name}</b>
          {found.stockQty !== undefined ? ` (stock: ${found.stockQty})` : ""}
        </div>
      )}

      {/* CARRITO */}
      <h3 style={{ marginTop: 16 }}>Carrito</h3>
      <table width="100%">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cant</th>
            <th>Precio</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((i, idx) => (
            <tr key={i.product.id}>
              <td>{i.product.name}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={i.qty}
                  onChange={(e) => {
                    const v = Math.max(1, Number(e.target.value));
                    setCart((c) => {
                      const cc = [...c];
                      cc[idx].qty = v;
                      return cc;
                    });
                  }}
                  style={{ width: 60 }}
                />
              </td>
              <td>{i.price}</td>
              <td>{(i.price * i.qty).toFixed(2)}</td>
              <td>
                <button onClick={() => setCart((c) => c.filter((_, i2) => i2 !== idx))}>
                  Quitar
                </button>
              </td>
            </tr>
          ))}
          {!cart.length && (
            <tr>
              <td colSpan={5}>Vacío</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: 8 }}>
        <b>Total:</b> ${total.toFixed(2)}
      </div>

      <button onClick={cobrar} disabled={!cart.length} style={{ marginTop: 8 }}>
        Cobrar (Efectivo)
      </button>

      {msg && <div style={{ marginTop: 8, color: "#0af" }}>{msg}</div>}
    </div>
  );
}
