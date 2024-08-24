import { useState, useEffect, useCallback } from "react";

export const fetchAPI = async (url: string, options?: RequestInit) => { // función asíncrona que gestiona peticiones a una api
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {                   // Es una función asíncrona definida dentro de useFetch mediante useCallback para que no se redefina en cada renderizado si url u options no cambian.
    setLoading(true);                                           // Se activa el estado de carga
    setError(null);                                             // Se resetea el error 

    try {
      const result = await fetchAPI(url, options);              // Se llama a fetchAPI para hacer la petición y obtener los datos
      setData(result.data);                                     // Si es exitosa, se guarda la información en data.
    } catch (err) {
      setError((err as Error).message);                         // Si falla, se guarda el mensaje de error en error.
    } finally {
      setLoading(false);                                        // Finalmente, se desactiva el estado de carga 
    }
  }, [url, options]);

  useEffect(() => {                                             // Se ejecuta fetchData cuando url u options cambian.
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };          // El hook retorna un objeto con la data, el estado de carga y el refetch que permite repetir la petición cuando la url cambia.
};