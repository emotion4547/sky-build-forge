import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings<T = any>(key: string, defaultValue: T): { data: T; loading: boolean } {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSetting = async () => {
      const { data: setting, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();

      if (!error && setting?.value) {
        setData(setting.value as T);
      }
      setLoading(false);
    };

    fetchSetting();
  }, [key]);

  return { data, loading };
}
