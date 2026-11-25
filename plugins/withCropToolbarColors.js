// Colores de la pantalla de recorte de expo-image-picker en Android.
// Por defecto la barra superior es transparente con íconos negros (o blancos en modo oscuro);
// con edge-to-edge queda encima de la foto o del fondo negro y en algunos teléfonos
// no se ven los botones (recortar / girar / listo). Aquí se fija una barra opaca
// morada con íconos blancos, igual en modo claro y oscuro.
const { withAndroidColors, withAndroidColorsNight, AndroidConfig } = require("expo/config-plugins");

const COLORS = {
  expoCropToolbarColor: "#6B31E8",
  expoCropToolbarIconColor: "#FFFFFF",
  expoCropToolbarActionTextColor: "#FFFFFF",
  expoCropBackButtonIconColor: "#FFFFFF",
  expoCropBackgroundColor: "#000000",
};

const apply = (colors) => {
  let out = colors;
  for (const [name, value] of Object.entries(COLORS)) {
    out = AndroidConfig.Colors.assignColorValue(out, { name, value });
  }
  return out;
};

module.exports = function withCropToolbarColors(config) {
  config = withAndroidColors(config, (c) => {
    c.modResults = apply(c.modResults);
    return c;
  });
  config = withAndroidColorsNight(config, (c) => {
    c.modResults = apply(c.modResults);
    return c;
  });
  return config;
};
