import supabase from "../../lib/supabase";

export default async function DataPage() {
  const { data, error } = await supabase.from("your_table").select("*");

  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
