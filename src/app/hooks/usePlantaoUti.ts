import { useCallback, useEffect, useState } from "react";
import type { UTI } from "../types";

function storageKey(userId: string) {
  return `fisioplantao_plantao_uti:${userId}`;
}

/**
 * UTI em que o usuário indica estar de plantão (sessão atual).
 * Persistido em sessionStorage por usuário.
 */
export function usePlantaoUti(
  userId: string | undefined,
  setoresPermitidos: UTI[]
): readonly [string, (id: string) => void] {
  const firstId = setoresPermitidos[0]?.id ?? "";

  const [plantaoUtiId, setPlantaoUtiIdState] = useState<string>(() => {
    if (!userId || setoresPermitidos.length === 0) return firstId;
    try {
      const raw = sessionStorage.getItem(storageKey(userId));
      if (raw && setoresPermitidos.some((u) => u.id === raw)) return raw;
    } catch {
      /* ignore */
    }
    return firstId;
  });

  useEffect(() => {
    if (setoresPermitidos.length === 0) {
      setPlantaoUtiIdState("");
      return;
    }
    const allowed = new Set(setoresPermitidos.map((u) => u.id));
    setPlantaoUtiIdState((current) => {
      if (current && allowed.has(current)) return current;
      return setoresPermitidos[0]!.id;
    });
  }, [setoresPermitidos]);

  const setPlantaoUtiId = useCallback(
    (id: string) => {
      setPlantaoUtiIdState(id);
      if (userId) {
        try {
          sessionStorage.setItem(storageKey(userId), id);
        } catch {
          /* ignore */
        }
      }
    },
    [userId]
  );

  return [plantaoUtiId || firstId, setPlantaoUtiId] as const;
}
