// Global site data — replaces the Jekyll `_config.yml` scalars that templates
// reference as `site.*`. Eleventy does not expose eleventy.config.js values to
// templates, so the values Liquid needs live here.
module.exports = () => ({
  title: "Maskarada",
  email: "teatr.maskarada@gmail.com",
  description:
    "Teatr i Wypożyczalnia Kostiumów Karnawałowych Maskarada zapewnią Twojemu " +
    "dziecku nalepszą rozrywkę połączoną z edukacją teatralną. Przynosimy uśmiech " +
    "już od 10 lat!",
  url: "http://www.maskarada.waw.pl",
  baseurl: "",
  // Jekyll exposed `site.time` (build time); reproduce it here.
  time: new Date(),
  cloudinary: { cloud_name: "maskarada" },
});
