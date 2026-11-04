"use client";
import { useEffect, useState } from "react";

/** Começa com o horário do servidor (evita divergência na hidratação) e atualiza a cada segundo. */
export function useNow(serverNow: string): Date {
  const [now, setNow] = useState(() => new Date(serverNow));
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
