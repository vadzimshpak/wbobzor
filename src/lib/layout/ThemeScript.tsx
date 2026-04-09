/** Синхронно до гидрации: убирает мигание темы при сохранённом выборе в localStorage. */
export function ThemeScript() {
  const code = `
(function(){
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
