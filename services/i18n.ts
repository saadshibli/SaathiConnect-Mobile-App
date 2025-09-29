import { I18n } from "i18n-js";
import * as Localization from "expo-localization";

// Import all locale JSON files
import en from "../locales/en.json";
import hi from "../locales/hi.json";
import mr from "../locales/mr.json";
import bn from "../locales/bn.json";
import ta from "../locales/ta.json";
import te from "../locales/te.json";
import kn from "../locales/kn.json";
import ml from "../locales/ml.json";
import gu from "../locales/gu.json";
import pa from "../locales/pa.json";
import or from "../locales/or.json";
import ur from "../locales/ur.json";

// Add all imported languages to the translations object
const i18n = new I18n({
  en,
  hi,
  mr,
  bn,
  ta,
  te,
  kn,
  ml,
  gu,
  pa,
  or,
  ur,
});

i18n.locale = Localization.getLocales()[0].languageCode || "en";
i18n.enableFallback = true;

export default i18n;
