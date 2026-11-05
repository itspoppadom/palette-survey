// =====================================================================
//  Palette survey - configuration
//  Edit this file to reuse the survey for other palettes or projects.
// =====================================================================

window.SURVEY_CONFIG = {
  // The Google Apps Script web-app URL is NOT kept here. It lives in
  // secrets.js (git-ignored). See README.md. If secrets.js is missing or
  // empty, the survey still works but only offers answers as a download.
  SCRIPT_URL: (window.SURVEY_SECRETS && window.SURVEY_SECRETS.SCRIPT_URL) || "",

  title: "Which chart colours work for you?",
  owner: "Dominic Cameron",
  project: "CM4125 Data Visualisation coursework - Of Pets, Penalties & Pouring Rain",

  // Names of the 5 lines in each line chart (used for "which look alike?").
  series: ["Dog", "Cat", "Fish", "Indoor bird", "Small animal"],

  // Palettes are shown in a random order as "Palette A, B, C, D" so names
  // don't bias the answers. The real names are revealed after submitting.
  palettes: [
    {
      id: "brand",
      name: "Dons & Pets (Aberdeen FC red + Pets and Care teal)",
      image: "images/palette-brand.png",
      cat: ["#2197BE", "#D99A00", "#005F8A", "#8E44AD", "#2E9E5B"],
      wdl: ["#C8102E", "#BDBDBD", "#005F8A"],
      seq: ["#EEF7FA", "#2197BE", "#08374B"]
    },
    {
      id: "okabe",
      name: "Okabe-Ito",
      image: "images/palette-okabe.png",
      cat: ["#0072B2", "#E69F00", "#009E73", "#D55E00", "#56B4E9"],
      wdl: ["#0072B2", "#BDBDBD", "#E69F00"],
      seq: ["#EEF4FA", "#0072B2", "#00304D"]
    },
    {
      id: "ibm",
      name: "IBM Design colour-blind palette",
      image: "images/palette-ibm.png",
      cat: ["#648FFF", "#FE6100", "#785EF0", "#DC267F", "#FFB000"],
      wdl: ["#648FFF", "#BDBDBD", "#FE6100"],
      seq: ["#F2EFFE", "#785EF0", "#2B1A7A"]
    },
    {
      id: "tol",
      name: "Paul Tol \"Bright\"",
      image: "images/palette-tol.png",
      cat: ["#4477AA", "#CCBB44", "#228833", "#EE6677", "#66CCEE"],
      wdl: ["#4477AA", "#BBBBBB", "#EE6677"],
      seq: ["#FFFFE5", "#FE9929", "#662506"]
    }
  ]
};
