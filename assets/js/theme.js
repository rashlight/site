(() => {
  let doc = document,
    storage = localStorage,
    themeKey = "theme",
    themeName = storage.getItem(themeKey) ?? (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"),
    themeIcons = doc.querySelectorAll(".icon-switch-theme"),
    changeThemeIcons = () =>
      themeIcons.forEach((e) => (e.src = "/img/" + (themeName < "l" ? "half-moon" : "sun-light") + ".svg"));

  changeThemeIcons();
  window.toggleTheme = () => {
    themeName = themeName < "l" ? "light" : "dark";
    storage.setItem(themeKey, themeName);
    doc.documentElement.dataset.theme = themeName;
    changeThemeIcons();
  };

  window.addEventListener("beforeunload", function () {
    console.log('bruh')
    doc.body.classList.add("fadeout");
  });
})();
