import { supabase } from "../lib/supabase";


export async function getMeliponariosRequest() {
  const {
    data,
    error,
  } = await supabase
    .from("meliponarios")
    .select("*")
    .limit(50);


  if (error) {
    console.error(
      "Error obteniendo meliponarios:",
      error
    );

    throw error;
  }


  console.log(
    "MELIPONARIOS API:",
    data
  );


  return data ?? [];
}