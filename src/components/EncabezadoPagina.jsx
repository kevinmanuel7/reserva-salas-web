export default function EncabezadoPagina({ titulo, descripcion }) {
  return (
    <header className="encabezado-pagina">
      <h1 className="h3">{titulo}</h1>
      {descripcion && <p>{descripcion}</p>}
    </header>
  );
}