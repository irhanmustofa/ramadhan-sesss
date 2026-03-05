import { useEffect, useState } from "react";

export default function CitySelector({
  cityOptions,
  selectedCityId: propSelectedCityId,
  onChange,
  placeholder = "Pilih Kota...",
}) {
  const [localSelectedId, setLocalSelectedId] = useState("");

  // Sync dengan props
  useEffect(() => {
    if (propSelectedCityId) {
      setLocalSelectedId(propSelectedCityId.toString());
    }
  }, [propSelectedCityId]);

  const handleChange = (e) => {
    const newCityId = e.target.value;
    setLocalSelectedId(newCityId);
    if (onChange) onChange(e);
  };

  // ✅ SELALU tampilkan dropdown (jangan return null)
  const value = localSelectedId || propSelectedCityId || "";

  return (
    <select
      value={value}
      onChange={handleChange}
      className="w-full px-3 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#F472B6]/50 focus:border-[#F472B6] transition"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {cityOptions?.length > 0 ? (
        cityOptions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.lokasi}
          </option>
        ))
      ) : (
        <option disabled>Memuat kota...</option>
      )}
    </select>
  );
}
